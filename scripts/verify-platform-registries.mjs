import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const errors = [];
function load(relativePath) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    errors.push(`${relativePath}: missing`);
    return null;
  }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) {
    errors.push(`${relativePath}: invalid JSON: ${error.message}`);
    return null;
  }
}
function validateRegistry(registry, key, label) {
  const rawItems = registry?.[key];
  if (!Array.isArray(rawItems)) errors.push(label + ': ' + key + ' must be an array');
  const items = Array.isArray(rawItems) ? rawItems : [];
  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(label + ': entries must be objects');
      continue;
    }
    if (typeof item.id !== 'string' || !item.id.trim() || ids.has(item.id)) errors.push(label + ': missing or duplicate ID ' + (item.id || '(empty)'));
    if (typeof item.id === 'string' && item.id.trim()) ids.add(item.id);
    if (item.enabled !== false || item.state !== 'staged') errors.push(label + ' ' + (item.id || '(unknown)') + ': must remain staged and disabled');
    if (!item.version && key === 'engines') errors.push(label + ' ' + (item.id || '(unknown)') + ': version missing');
  }
  if (registry?.enabled !== false || registry?.state !== 'staged') errors.push(label + ': top-level registry must remain staged and disabled');
  if (registry?.releaseGate !== 'G02') errors.push(label + ': releaseGate must remain G02');
  return { items, ids };
}

const engines = load('config/platform/engine-registry.json');
const worlds = load('config/worlds/world-registry.json');
const e = validateRegistry(engines, 'engines', 'engine registry');
const w = validateRegistry(worlds, 'worlds', 'world registry');
for (const id of ['lingo-core-runtime', 'lingoslots-engine', 'lingoarcade-engine', 'lingoworld-engine', 'lingo-experience-engine']) {
  if (!e.ids.has(id)) errors.push(`engine registry missing canonical engine: ${id}`);
}
for (const id of ['loyalty-lane-world', 'money-mile', 'power-blocks', 'desire-district', 'escape-avenue', 'rock-and-roll-row', 'intelligence-lab']) {
  if (!w.ids.has(id)) errors.push(`world registry missing canonical world: ${id}`);
}
for (const world of w.items) {
  if (!world || typeof world !== 'object' || Array.isArray(world)) continue;
  if (typeof world.engine !== 'string' || !e.ids.has(world.engine)) errors.push(`world ${world.id || '(unknown)'}: references unknown engine ${world.engine ?? '(missing)'}`);
  if (typeof world.assetNamespace !== 'string' || !world.assetNamespace.trim() || typeof world.accessPolicy !== 'string' || !world.accessPolicy.trim()) {
    errors.push(`world ${world.id || '(unknown)'}: assetNamespace/accessPolicy contract missing`);
  }
}
if (errors.length) {
  console.error(JSON.stringify({ ok: false, gate: 'PLATFORM_REGISTRY', errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  ok: true,
  gate: 'PLATFORM_REGISTRY',
  engineCount: e.items.length,
  worldCount: w.items.length,
  state: 'staged',
  enabled: false,
  note: 'Registry validation does not certify runtime implementation or publish world assets.',
}, null, 2));
