import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applySimulationCommand,
  createSimulationState,
  generateWorld,
} from '../src/index.mjs';

function makeWorld(seed = 'simulation-seed-01') {
  return generateWorld({
    worldId: 'simulation-world',
    worldVersion: '1.0.0',
    seed,
    width: 16,
    height: 16,
    poiCount: 8,
  });
}

function findWalkablePair(world) {
  for (let y = 0; y < world.dimensions.height; y += 1) {
    for (let x = 0; x < world.dimensions.width; x += 1) {
      if (!world.map[y][x].walkable) continue;
      const right = world.map[y][x + 1];
      if (right && right.walkable) return [{ x, y }, { x: x + 1, y }];
      const down = world.map[y + 1] && world.map[y + 1][x];
      if (down && down.walkable) return [{ x, y }, { x, y: y + 1 }];
    }
  }
  throw new Error('test world has no adjacent walkable tiles');
}

function findDistantWalkable(world, start) {
  for (let y = 0; y < world.dimensions.height; y += 1) {
    for (let x = 0; x < world.dimensions.width; x += 1) {
      if (!world.map[y][x].walkable) continue;
      if (Math.abs(x - start.x) + Math.abs(y - start.y) > 1) return { x, y };
    }
  }
  return null;
}

function findWalkableWaterPair(world) {
  for (let y = 0; y < world.dimensions.height; y += 1) {
    for (let x = 0; x < world.dimensions.width; x += 1) {
      if (!world.map[y][x].walkable) continue;
      const neighbors = [
        world.map[y][x + 1],
        world.map[y][x - 1],
        world.map[y + 1] && world.map[y + 1][x],
        world.map[y - 1] && world.map[y - 1][x],
      ];
      const water = neighbors.find(tile => tile && tile.biome === 'water');
      if (water) return [{ x, y }, { x: water.x, y: water.y }];
    }
  }
  return null;
}

test('fixed-tick movement returns an immutable state transition and event', () => {
  const world = makeWorld();
  const [start, destination] = findWalkablePair(world);
  const state = createSimulationState(world, [{ id: 'player-one', ...start }]);
  const result = applySimulationCommand(state, world, {
    commandId: 'move-0001',
    actorId: 'player-one',
    type: 'move',
    tick: 1,
    to: destination,
  });
  assert.equal(state.tick, 0);
  assert.equal(result.state.tick, 1);
  assert.deepEqual(result.state.entities[0] && { x: result.state.entities[0].x, y: result.state.entities[0].y }, destination);
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].type, 'entity.moved');
  assert.equal(result.duplicate, false);
});

test('duplicate command IDs are idempotent and cannot apply a second move', () => {
  const world = makeWorld();
  const [start, destination] = findWalkablePair(world);
  const state = createSimulationState(world, [{ id: 'player-one', ...start }]);
  const command = { commandId: 'move-0001', actorId: 'player-one', type: 'move', tick: 1, to: destination };
  const first = applySimulationCommand(state, world, command);
  const duplicate = applySimulationCommand(first.state, world, command);
  assert.equal(duplicate.state, first.state);
  assert.equal(duplicate.duplicate, true);
  assert.deepEqual(duplicate.events, []);
});

test('movement must advance exactly one tick and one adjacent tile', () => {
  const world = makeWorld();
  const [start, destination] = findWalkablePair(world);
  const state = createSimulationState(world, [{ id: 'player-one', ...start }]);
  assert.throws(() => applySimulationCommand(state, world, {
    commandId: 'move-late',
    actorId: 'player-one',
    type: 'move',
    tick: 2,
    to: destination,
  }), /exactly one simulation step/);
  const distant = findDistantWalkable(world, start);
  assert.ok(distant, 'test world must contain a non-adjacent walkable destination');
  assert.throws(() => applySimulationCommand(state, world, {
    commandId: 'move-teleport',
    actorId: 'player-one',
    type: 'move',
    tick: 1,
    to: distant,
  }), /orthogonally adjacent/);
});

test('actors cannot overlap and movement cannot enter an occupied tile', () => {
  const world = makeWorld();
  const [start, occupied] = findWalkablePair(world);
  assert.throws(() => createSimulationState(world, [
    { id: 'player-one', ...start },
    { id: 'player-two', ...start },
  ]), /same tile/);

  const state = createSimulationState(world, [
    { id: 'player-one', ...start },
    { id: 'player-two', ...occupied },
  ]);
  assert.throws(() => applySimulationCommand(state, world, {
    commandId: 'move-occupied',
    actorId: 'player-one',
    type: 'move',
    tick: 1,
    to: occupied,
  }), /destination tile is occupied/);
});

test('water tiles are not traversable', () => {
  let pair = null;
  let world = null;
  for (let index = 0; index < 32 && !pair; index += 1) {
    world = makeWorld('water-seed-' + index);
    pair = findWalkableWaterPair(world);
  }
  assert.ok(pair, 'expected a walkable tile adjacent to water in the bounded seed sample');
  const state = createSimulationState(world, [{ id: 'player-one', ...pair[0] }]);
  assert.throws(() => applySimulationCommand(state, world, {
    commandId: 'move-water',
    actorId: 'player-one',
    type: 'move',
    tick: 1,
    to: pair[1],
  }), /not walkable/);
});

test('simulation rejects a world mismatch and unknown actors', () => {
  const world = makeWorld();
  const [start, destination] = findWalkablePair(world);
  const state = createSimulationState(world, [{ id: 'player-one', ...start }]);
  const otherWorld = makeWorld('other-seed');
  assert.throws(() => applySimulationCommand(state, otherWorld, {
    commandId: 'move-0001', actorId: 'player-one', type: 'move', tick: 1, to: destination,
  }), /does not match/);
  assert.throws(() => applySimulationCommand(state, world, {
    commandId: 'move-0002', actorId: 'missing-player', type: 'move', tick: 1, to: destination,
  }), /actor was not found/);
});
