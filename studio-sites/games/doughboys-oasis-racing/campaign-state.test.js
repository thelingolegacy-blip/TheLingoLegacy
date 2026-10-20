const test = require('node:test');
const assert = require('node:assert/strict');
const { createCampaignState, applyCampaignEvent, saveCampaignState, loadCampaignState, STORAGE_KEY } = require('./campaign-state.js');

function event(state, id, type, payload = {}) {
  return applyCampaignEvent(state, { id, type, payload });
}
function unlockMoneyMile(state) {
  state = event(state, 'story:fragment:1', 'waterline_fragment_found', { fragmentId: 'waterline-marker' }).state;
  return event(state, 'story:irrigation:1', 'irrigation_repaired', { mechanismId: 'irrigation-gate' }).state;
}

test('delivery rewards are applied once and unlock the first race at threshold', () => {
  let state = unlockMoneyMile(createCampaignState());
  const first = event(state, 'job:delivery:001', 'delivery_completed');
  assert.equal(first.applied, true);
  assert.equal(first.state.cash, 800);
  assert.equal(first.state.reputation, 20);
  assert.ok(first.state.unlockedRaces.includes('mini-street-race-1'));
  const duplicate = event(first.state, 'job:delivery:001', 'delivery_completed');
  assert.equal(duplicate.applied, false);
  assert.equal(duplicate.reason, 'duplicate-event');
  assert.equal(duplicate.state.cash, 800);
});

test('races unlock sequentially and championship moves the story to Nexus revelation', () => {
  let state = event(unlockMoneyMile(createCampaignState()), 'job:delivery:001', 'delivery_completed').state;
  for (let i = 1; i <= 3; i++) {
    const result = event(state, 'race:mini:' + i, 'race_won', { raceId: 'mini-street-race-' + i });
    assert.equal(result.applied, true);
    state = result.state;
  }
  assert.ok(state.unlockedRaces.includes('ultimate-oasis-race'));
  const final = event(state, 'race:ultimate:1', 'race_won', { raceId: 'ultimate-oasis-race' });
  assert.equal(final.state.championshipWon, true);
  assert.equal(final.state.chapter, 'nexus-revelation');
  assert.equal(final.state.crewPower, 5);
});

test('invalid race IDs and duplicate race victories cannot mint rewards', () => {
  const state = event(unlockMoneyMile(createCampaignState()), 'job:delivery:001', 'delivery_completed').state;
  const invalid = event(state, 'race:bad:1', 'race_won', { raceId: 'unlisted-race' });
  assert.equal(invalid.applied, false);
  assert.equal(invalid.reason, 'invalid-race');
  const first = event(state, 'race:mini:1', 'race_won', { raceId: 'mini-street-race-1' });
  const duplicate = event(first.state, 'race:mini:1b', 'race_won', { raceId: 'mini-street-race-1' });
  assert.equal(duplicate.applied, false);
  assert.equal(duplicate.reason, 'race-already-won');
});

test('territory influence is capped and story completion checks prerequisites', () => {
  let state = event(createCampaignState(), 'fragment:1', 'waterline_fragment_found', { fragmentId: 'fragment-a' }).state;
  const blocked = event(state, 'nexus:blocked', 'nexus_revealed');
  assert.equal(blocked.reason, 'story-prerequisites-missing');
  state = event(state, 'repair:1', 'irrigation_repaired', { mechanismId: 'irrigation-gate' }).state;
  const ready = event(state, 'nexus:ready', 'nexus_revealed');
  assert.equal(ready.state.chapter, 'complete');
  const influence = event(state, 'territory:1', 'territory_influence_gained', { territoryId: 'money-mile', amount: 150 });
  assert.equal(influence.state.territoryInfluence['money-mile'], 100);
});

test('save/load round-trips validated state and tolerates unavailable storage', () => {
  const memory = { value: null, getItem(k) { assert.equal(k, STORAGE_KEY); return this.value; }, setItem(k,v) { assert.equal(k, STORAGE_KEY); this.value = v; } };
  const state = event(createCampaignState(), 'fragment:1', 'waterline_fragment_found', { fragmentId: 'fragment-a' }).state;
  const saved = saveCampaignState(state, memory);
  assert.equal(saved.ok, true);
  assert.deepEqual(loadCampaignState(memory).discoveredMapFragments, ['fragment-a']);
  const unavailable = { getItem() { throw new Error('no storage'); }, setItem() { throw new Error('no storage'); } };
  assert.equal(saveCampaignState(state, unavailable).ok, false);
  assert.equal(loadCampaignState(unavailable).cash, 500);
});

test('story gates block delivery and racing until their prerequisites are met', () => {
  const fresh = createCampaignState();
  assert.equal(event(fresh, 'job:early:1', 'delivery_completed').reason, 'story-prerequisites-missing');
  assert.equal(event(fresh, 'race:early:1', 'race_won', { raceId: 'mini-street-race-1' }).reason, 'race-locked');
  const ready = unlockMoneyMile(fresh);
  const delivered = event(ready, 'job:delivery:1', 'delivery_completed').state;
  const firstRace = event(delivered, 'race:mini:1', 'race_won', { raceId: 'mini-street-race-1' }).state;
  assert.equal(event(firstRace, 'job:delivery:replay', 'delivery_completed').reason, 'mission-already-completed');
});
