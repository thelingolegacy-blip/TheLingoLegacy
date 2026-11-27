import { validateWorldDefinition } from './world.mjs';

const MAX_ACTORS = 64;
const MAX_COMMANDS = 4096;
const COMMAND_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

function assertWorldMatchesState(world, state) {
  const validation = validateWorldDefinition(world);
  if (!validation.valid) throw new TypeError('world is invalid: ' + validation.errors.join('; '));
  if (!state || state.worldId !== world.worldId || state.worldVersion !== world.worldVersion || state.worldHash !== world.worldHash) {
    throw new TypeError('simulation state does not match the supplied world');
  }
  if (!Number.isInteger(state.tick) || state.tick < 0) throw new TypeError('simulation tick is invalid');
}

function assertPosition(world, x, y) {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= world.dimensions.width || y >= world.dimensions.height) {
    throw new RangeError('position is outside world bounds');
  }
  if (!world.map[y][x].walkable) throw new RangeError('destination tile is not walkable');
}

export function createSimulationState(world, actors = []) {
  const validation = validateWorldDefinition(world);
  if (!validation.valid) throw new TypeError('world is invalid: ' + validation.errors.join('; '));
  if (!Array.isArray(actors) || actors.length > MAX_ACTORS) throw new RangeError('actors must be an array of at most 64 entries');

  const ids = new Set();
  const occupiedPositions = new Set();
  const entities = actors.map(actor => {
    if (!actor || typeof actor.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(actor.id)) {
      throw new TypeError('actor id must be lowercase kebab-case');
    }
    if (ids.has(actor.id)) throw new TypeError('actor IDs must be unique');
    ids.add(actor.id);
    assertPosition(world, actor.x, actor.y);
    const position = actor.x + ',' + actor.y;
    if (occupiedPositions.has(position)) throw new TypeError('actors cannot occupy the same tile');
    occupiedPositions.add(position);
    return { id: actor.id, x: actor.x, y: actor.y, status: 'active' };
  });

  return {
    schemaVersion: '1.0.0',
    worldId: world.worldId,
    worldVersion: world.worldVersion,
    worldHash: world.worldHash,
    tick: 0,
    entities,
    appliedCommandIds: [],
  };
}

export function applySimulationCommand(state, world, command) {
  assertWorldMatchesState(world, state);
  if (!command || typeof command !== 'object') throw new TypeError('command must be an object');
  if (typeof command.commandId !== 'string' || !COMMAND_ID_PATTERN.test(command.commandId)) {
    throw new TypeError('commandId must be 1–128 safe characters');
  }
  if (!Array.isArray(state.appliedCommandIds) || !Array.isArray(state.entities)) {
    throw new TypeError('simulation state is malformed');
  }

  if (state.appliedCommandIds.includes(command.commandId)) {
    return { state, events: [], duplicate: true };
  }
  if (state.appliedCommandIds.length >= MAX_COMMANDS) throw new RangeError('session command history limit reached');
  if (command.tick !== state.tick + 1) throw new RangeError('command tick must advance exactly one simulation step');
  if (command.type !== 'move') throw new TypeError('unsupported command type');

  const actor = state.entities.find(entity => entity.id === command.actorId);
  if (!actor || actor.status !== 'active') throw new TypeError('active actor was not found');
  assertPosition(world, command.to && command.to.x, command.to && command.to.y);
  const occupant = state.entities.find(entity => entity.id !== actor.id && entity.status === 'active' && entity.x === command.to.x && entity.y === command.to.y);
  if (occupant) throw new RangeError('destination tile is occupied');
  const distance = Math.abs(command.to.x - actor.x) + Math.abs(command.to.y - actor.y);
  if (distance !== 1) throw new RangeError('move command must target one orthogonally adjacent tile');

  const from = { x: actor.x, y: actor.y };
  const to = { x: command.to.x, y: command.to.y };
  const entities = state.entities.map(entity => entity.id === actor.id ? { ...entity, x: to.x, y: to.y } : entity);
  const nextState = {
    ...state,
    tick: command.tick,
    entities,
    appliedCommandIds: state.appliedCommandIds.concat(command.commandId),
  };
  const event = {
    eventId: command.commandId + ':accepted',
    commandId: command.commandId,
    tick: command.tick,
    type: 'entity.moved',
    actorId: actor.id,
    from,
    to,
  };
  return { state: nextState, events: [event], duplicate: false };
}
