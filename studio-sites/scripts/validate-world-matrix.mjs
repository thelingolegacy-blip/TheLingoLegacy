import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'assets/world-registry.json'), 'utf8'));
const errors = [];
const shared = ['LingoID','UniversalLegacyWallet','progressionAndRewards','assetRegistry','worldRouter','telemetryAndCorrelation','safetyAndPrivacy','releaseGovernance'];
const ids = new Set();
const namespaces = { assets:new Set(), audio:new Set(), telemetry:new Set() };
for (const service of shared) if (!registry.contract?.sharedServices?.includes(service)) errors.push('Shared service missing: ' + service);
for (const world of registry.worlds || []) {
  if (!world.id || !world.entity || !world.studio || !world.surfaceState || !world.route) { errors.push('Incomplete world: ' + (world.id || '(no id)')); continue; }
  if (ids.has(world.id)) errors.push('Duplicate world id: ' + world.id);
  ids.add(world.id);
  const visual = world.visualIdentity || {};
  for (const key of ['theme','palette','assetNamespace']) if (!visual[key]) errors.push(world.id + ': missing visualIdentity.' + key);
  for (const key of ['audioNamespace','worldTelemetryNamespace']) if (!world[key]) errors.push(world.id + ': missing ' + key);
  const namespaceGroups = { assets:visual.assetNamespace, audio:world.audioNamespace, telemetry:world.worldTelemetryNamespace };
  for (const [kind,namespace] of Object.entries(namespaceGroups)) {
    if (namespace && namespaces[kind].has(namespace)) errors.push(kind + ' namespace must be unique: ' + namespace);
    if (namespace) namespaces[kind].add(namespace);
  }
  if (world.surfaceState === 'external-unverified' && !/^https:\/\//.test(world.route)) errors.push(world.id + ': external route must use HTTPS.');
  if (world.surfaceState === 'planned' && world.sourcePath !== null) errors.push(world.id + ': planned world cannot claim an existing source path.');
  if (['preview-present','local-demo','local-prototype'].includes(world.surfaceState)) {
    if (!world.sourcePath || !fs.existsSync(path.join(root,world.sourcePath))) errors.push(world.id + ': source surface missing: ' + world.sourcePath);
  }
}
if ((registry.worlds || []).length < 15) errors.push('World registry does not cover the known entity portfolio.');
const require = createRequire(import.meta.url);
const engine = require('../lingoslots/game-engine.js');
for (const rows of [3,5]) {
  const lines = engine.paylinesFor(rows);
  if (lines.length !== (rows === 3 ? 20 : 25)) errors.push('Incorrect payline count for 5x' + rows);
  for (const [i,line] of lines.entries()) if (line.length !== 5 || line.some(row => !Number.isInteger(row) || row < 0 || row >= rows)) errors.push('Invalid 5x' + rows + ' payline ' + (i+1));
}
const test = spawnSync(process.execPath,[path.join(root,'lingoslots/game-engine.test.cjs')],{encoding:'utf8'});
if (test.status !== 0) errors.push('Game engine tests failed: ' + (test.stderr || test.stdout || 'unknown error').trim());
if (errors.length) { console.error('STUDIO WORLD MATRIX VALIDATION FAILED\n- ' + errors.join('\n- ')); process.exit(1); }
console.log('STUDIO_WORLD_REGISTRY=PASS worlds=' + registry.worlds.length);
console.log('WORLD_NAMESPACES=PASS');
console.log('LINGOSLOTS_LAYOUTS=PASS 5x3:20 paylines 5x5:25 paylines');
console.log('STUDIO_WORLD_MATRIX_VALIDATION=PASS');
