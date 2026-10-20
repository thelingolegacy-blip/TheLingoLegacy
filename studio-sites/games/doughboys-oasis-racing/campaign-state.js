/* Doughboys Oasis campaign persistence boundary.
 * Guest-local prototype only. Never use browser storage as production authority.
 */
(function (root) {
  'use strict';
  const STORAGE_KEY = 'doughboys-oasis-campaign-v1';
  const SCHEMA_VERSION = 1;
  const DEFAULT_STATE = Object.freeze({
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    chapter: 'waterline',
    cash: 500,
    reputation: 0,
    crewPower: 1,
    vehicleCondition: 100,
    completedMissions: [],
    unlockedRaces: [],
    wonRaces: [],
    discoveredMapFragments: [],
    repairedMechanisms: [],
    territoryInfluence: {},
    allianceFlags: [],
    eventIds: [],
    championshipWon: false
  });
  const uniqueStrings = value => Array.isArray(value)
    ? [...new Set(value.filter(item => typeof item === 'string' && item.length <= 120))].slice(-500)
    : [];
  function normalize(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const nonNegativeInt = (value, fallback, max) =>
      Number.isSafeInteger(value) && value >= 0 && value <= max ? value : fallback;
    const territory = {};
    if (source.territoryInfluence && typeof source.territoryInfluence === 'object') {
      for (const [key, value] of Object.entries(source.territoryInfluence)) {
        if (/^[a-z0-9-]{1,60}$/i.test(key) && Number.isSafeInteger(value)) {
          territory[key] = Math.max(0, Math.min(100, value));
        }
      }
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      revision: nonNegativeInt(source.revision, 0, Number.MAX_SAFE_INTEGER),
      chapter: ['waterline','money-mile','crews-territory','ultimate-oasis-race','nexus-revelation','complete'].includes(source.chapter) ? source.chapter : DEFAULT_STATE.chapter,
      cash: nonNegativeInt(source.cash, DEFAULT_STATE.cash, 100000000),
      reputation: nonNegativeInt(source.reputation, 0, 100000000),
      crewPower: nonNegativeInt(source.crewPower, 1, 1000000),
      vehicleCondition: nonNegativeInt(source.vehicleCondition, 100, 100),
      completedMissions: uniqueStrings(source.completedMissions),
      unlockedRaces: uniqueStrings(source.unlockedRaces),
      wonRaces: uniqueStrings(source.wonRaces),
      discoveredMapFragments: uniqueStrings(source.discoveredMapFragments),
      repairedMechanisms: uniqueStrings(source.repairedMechanisms),
      territoryInfluence: territory,
      allianceFlags: uniqueStrings(source.allianceFlags),
      eventIds: uniqueStrings(source.eventIds),
      championshipWon: source.championshipWon === true
    };
  }
  function createCampaignState(seed) { return normalize(seed || DEFAULT_STATE); }
  function loadCampaignState(storage) {
    try {
      const raw = (storage || root.localStorage).getItem(STORAGE_KEY);
      return raw ? normalize(JSON.parse(raw)) : createCampaignState();
    } catch (_) {
      return createCampaignState();
    }
  }
  function saveCampaignState(state, storage) {
    const next = normalize(state);
    next.revision = Math.min(Number.MAX_SAFE_INTEGER, next.revision + 1);
    try {
      (storage || root.localStorage).setItem(STORAGE_KEY, JSON.stringify(next));
      return { ok: true, state: next };
    } catch (_) {
      return { ok: false, state: next, reason: 'storage-unavailable' };
    }
  }
  // Applies one idempotent campaign event. Rewards are virtual prototype values only.
  function applyCampaignEvent(current, event) {
    const state = normalize(current);
    if (!event || typeof event.id !== 'string' || !/^[a-z0-9:_-]{1,120}$/i.test(event.id)) {
      return { state, applied: false, reason: 'invalid-event-id' };
    }
    if (state.eventIds.includes(event.id)) return { state, applied: false, reason: 'duplicate-event' };
    const payload = event.payload && typeof event.payload === 'object' ? event.payload : {};
    switch (event.type) {
      case 'waterline_fragment_found':
        if (typeof payload.fragmentId === 'string') state.discoveredMapFragments = uniqueStrings([...state.discoveredMapFragments, payload.fragmentId]);
        state.chapter = 'waterline';
        break;
      case 'irrigation_repaired':
        if (typeof payload.mechanismId === 'string') state.repairedMechanisms = uniqueStrings([...state.repairedMechanisms, payload.mechanismId]);
        state.chapter = 'money-mile';
        state.completedMissions = uniqueStrings([...state.completedMissions, 'waterline-irrigation']);
        break;
      case 'delivery_completed':
        if (!state.repairedMechanisms.includes('irrigation-gate')) return { state, applied: false, reason: 'story-prerequisites-missing' };
        if (state.completedMissions.includes('money-mile-delivery')) return { state, applied: false, reason: 'mission-already-completed' };
        state.cash = Math.min(100000000, state.cash + 300);
        state.reputation = Math.min(100000000, state.reputation + 20);
        state.crewPower = Math.max(state.crewPower, 2);
        state.completedMissions = uniqueStrings([...state.completedMissions, 'money-mile-delivery']);
        state.chapter = 'money-mile';
        if (state.cash >= 750 && state.reputation >= 20) state.unlockedRaces = uniqueStrings([...state.unlockedRaces, 'mini-street-race-1']);
        break;
      case 'race_won': {
        const raceId = typeof payload.raceId === 'string' ? payload.raceId : '';
        if (!/^(mini-street-race-[1-3]|ultimate-oasis-race)$/.test(raceId)) return { state, applied: false, reason: 'invalid-race' };
        if (!state.unlockedRaces.includes(raceId)) return { state, applied: false, reason: 'race-locked' };
        if (state.wonRaces.includes(raceId)) return { state, applied: false, reason: 'race-already-won' };
        state.wonRaces = uniqueStrings([...state.wonRaces, raceId]);
        state.cash = Math.min(100000000, state.cash + (raceId === 'ultimate-oasis-race' ? 2500 : 350));
        state.reputation = Math.min(100000000, state.reputation + (raceId === 'ultimate-oasis-race' ? 80 : 10));
        if (raceId === 'ultimate-oasis-race') {
          state.championshipWon = true;
          state.crewPower = Math.max(state.crewPower, 5);
          state.chapter = 'nexus-revelation';
        } else {
          const nextIndex = Number(raceId.slice(-1)) + 1;
          if (nextIndex <= 3) state.unlockedRaces = uniqueStrings([...state.unlockedRaces, 'mini-street-race-' + nextIndex]);
          else state.unlockedRaces = uniqueStrings([...state.unlockedRaces, 'ultimate-oasis-race']);
          state.chapter = 'crews-territory';
        }
        break;
      }
      case 'territory_influence_gained': {
        const territoryId = payload.territoryId;
        if (typeof territoryId !== 'string' || !/^[a-z0-9-]{1,60}$/i.test(territoryId)) return { state, applied: false, reason: 'invalid-territory' };
        const amount = Number.isSafeInteger(payload.amount) ? Math.max(0, Math.min(100, payload.amount)) : 0;
        state.territoryInfluence[territoryId] = Math.min(100, (state.territoryInfluence[territoryId] || 0) + amount);
        state.chapter = 'crews-territory';
        break;
      }
      case 'nexus_revealed':
        if (state.discoveredMapFragments.length < 1 || state.repairedMechanisms.length < 1) return { state, applied: false, reason: 'story-prerequisites-missing' };
        state.chapter = 'complete';
        state.completedMissions = uniqueStrings([...state.completedMissions, 'nexus-revelation']);
        break;
      default:
        return { state, applied: false, reason: 'unknown-event-type' };
    }
    state.eventIds = uniqueStrings([...state.eventIds, event.id]);
    return { state, applied: true, state: normalize(state) };
  }
  const api = { STORAGE_KEY, SCHEMA_VERSION, createCampaignState, loadCampaignState, saveCampaignState, applyCampaignEvent };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.DoughboysOasisCampaign = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
