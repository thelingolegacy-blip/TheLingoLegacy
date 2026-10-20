import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const validator = fileURLToPath(new URL('./verify-platform-registries.mjs', import.meta.url));
const engineIds = ['lingo-core-runtime', 'lingoslots-engine', 'lingoarcade-engine', 'lingoworld-engine', 'lingo-experience-engine'];
const worldIds = ['loyalty-lane-world', 'money-mile', 'power-blocks', 'desire-district', 'escape-avenue', 'rock-and-roll-row', 'intelligence-lab'];

function makeRoot({ engines = engineIds.map((id) => ({ id, version: '1.0.0', state: 'staged', enabled: false })), worlds = worldIds.map((id) => ({ id, engine: 'lingoworld-engine', state: 'staged', enabled: false, assetNamespace: 'worlds/' + id, accessPolicy: 'feature-flag' })), omitEngines = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-platform-validator-'));
  fs.mkdirSync(path.join(root, 'config/platform'), { recursive: true });
  fs.mkdirSync(path.join(root, 'config/worlds'), { recursive: true });
  const engineRegistry = { state: 'staged', enabled: false, releaseGate: 'G02' };
  if (!omitEngines) engineRegistry.engines = engines;
  fs.writeFileSync(path.join(root, 'config/platform/engine-registry.json'), JSON.stringify(engineRegistry));
  fs.writeFileSync(path.join(root, 'config/worlds/world-registry.json'), JSON.stringify({ state: 'staged', enabled: false, releaseGate: 'G02', worlds }));
  return root;
}

function runValidator(root) {
  return spawnSync(process.execPath, [validator, root], { encoding: 'utf8' });
}

test('canonical staged engine and world registries pass', (t) => {
  const root = makeRoot();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /"engineCount": 5/);
  assert.match(result.stdout, /"worldCount": 7/);
});

test('missing engine list fails with a clear validation error', (t) => {
  const root = makeRoot({ omitEngines: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /engines must be an array/);
  assert.doesNotMatch(result.stderr, /TypeError|not iterable/);
});

test('non-array engine list fails with a clear validation error', (t) => {
  const root = makeRoot({ engines: { unexpected: true } });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /engines must be an array/);
  assert.doesNotMatch(result.stderr, /TypeError|not iterable/);
});

test('unknown world engine reference fails closed', (t) => {
  const worlds = worldIds.map((id) => ({ id, engine: 'missing-engine', state: 'staged', enabled: false, assetNamespace: 'worlds/' + id, accessPolicy: 'feature-flag' }));
  const root = makeRoot({ worlds });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /references unknown engine missing-engine/);
});

test('null world entries fail with a validation error, not a TypeError', (t) => {
  const worlds = [null, ...worldIds.slice(1).map((id) => ({ id, engine: 'lingoworld-engine', state: 'staged', enabled: false, assetNamespace: 'worlds/' + id, accessPolicy: 'feature-flag' }))];
  const root = makeRoot({ worlds });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /world registry: entries must be objects/);
  assert.doesNotMatch(result.stderr, /TypeError/);
});
