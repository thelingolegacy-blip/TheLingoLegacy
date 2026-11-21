import test from 'node:test';
import assert from 'node:assert/strict';
import { generateWorld, validateWorldDefinition } from '../src/index.mjs';

function makeWorld(seed = 'destiny-seed-01') {
  return generateWorld({
    worldId: 'memory-forest',
    worldVersion: '1.0.0',
    seed,
    width: 16,
    height: 16,
    poiCount: 12,
  });
}

test('same seed and generator version produce the same world and fingerprint', () => {
  const first = makeWorld();
  const second = makeWorld();
  assert.deepEqual(first, second);
  assert.equal(first.worldHash, second.worldHash);
});

test('different seeds produce different world fingerprints', () => {
  assert.notEqual(makeWorld('seed-a').worldHash, makeWorld('seed-b').worldHash);
});

test('points of interest are unique, in bounds and placed on walkable tiles', () => {
  const world = makeWorld();
  const ids = new Set(world.pointsOfInterest.map(point => point.id));
  const positions = new Set(world.pointsOfInterest.map(point => point.x + ',' + point.y));
  assert.equal(ids.size, world.pointsOfInterest.length);
  assert.equal(positions.size, world.pointsOfInterest.length);
  for (const point of world.pointsOfInterest) {
    assert.ok(point.x >= 0 && point.x < world.dimensions.width);
    assert.ok(point.y >= 0 && point.y < world.dimensions.height);
    assert.equal(world.map[point.y][point.x].walkable, true);
  }
});

test('world validation detects content tampering through its fingerprint', () => {
  const world = makeWorld();
  const changed = structuredClone(world);
  changed.map[0][0].elevation = (changed.map[0][0].elevation + 1) % 5;
  const result = validateWorldDefinition(changed);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('worldHash does not match world content'));
});

test('water biome tiles are always non-walkable', () => {
  let world = null;
  let waterTile = null;
  for (let index = 0; index < 32 && !waterTile; index += 1) {
    world = makeWorld('water-validation-' + index);
    for (const row of world.map) {
      waterTile = row.find(tile => tile.biome === 'water');
      if (waterTile) break;
    }
  }
  assert.ok(waterTile, 'expected a water tile in the bounded seed sample');
  const changed = structuredClone(world);
  changed.map[waterTile.y][waterTile.x].walkable = true;
  const result = validateWorldDefinition(changed);
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('water tiles must be non-walkable'));
});

test('generator rejects invalid bounds and unbounded point counts', () => {
  assert.throws(() => generateWorld({ worldId: 'bad', worldVersion: '1.0.0', seed: 'x', width: 3, height: 8 }), /width/);
  assert.throws(() => generateWorld({ worldId: 'bad', worldVersion: '1.0.0', seed: 'x', width: 8, height: 8, poiCount: 300 }), /poiCount/);
});

test('generator rejects non-canonical identifiers and missing seeds', () => {
  assert.throws(() => generateWorld({ worldId: 'Memory Forest', worldVersion: '1.0.0', seed: 'x' }), /worldId/);
  assert.throws(() => generateWorld({ worldId: 'memory-forest', worldVersion: '1.0.0', seed: '' }), /seed/);
});
