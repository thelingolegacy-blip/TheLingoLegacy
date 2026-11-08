import fs from 'node:fs';

const configPath = 'wrangler.jsonc';
const workerPath = 'worker.js';

const configText = fs.readFileSync(configPath, 'utf8');
const workerText = fs.readFileSync(workerPath, 'utf8');

const declared = {
  d1: new Set(),
  kv: new Set(),
  r2: new Set(),
  service: new Set(),
};

const sectionPatterns = [
  { type: 'd1', section: /"d1_databases"\s*:\s*\[([\s\S]*?)\]/i },
  { type: 'kv', section: /"kv_namespaces"\s*:\s*\[([\s\S]*?)\]/i },
  { type: 'r2', section: /"r2_buckets"\s*:\s*\[([\s\S]*?)\]/i },
  { type: 'service', section: /"services"\s*:\s*\[([\s\S]*?)\]/i },
];

for (const { type, section } of sectionPatterns) {
  const block = configText.match(section)?.[1] || '';
  for (const match of block.matchAll(/"binding"\s*:\s*"([A-Za-z_][A-Za-z0-9_]*)"/g)) declared[type].add(match[1]);
}

const allStorageBindings = new Set([
  ...declared.d1,
  ...declared.kv,
  ...declared.r2,
  ...declared.service,
]);

const storageReferences = new Set();
const storageMethod = /\benv\.([A-Za-z_][A-Za-z0-9_]*)\.(?:prepare|batch|exec|get|put|delete|list|head)\s*\(/g;
for (const match of workerText.matchAll(storageMethod)) {
  if (match[1] !== 'ASSETS') storageReferences.add(match[1]);
}

const missingBindings = [...storageReferences]
  .filter((binding) => !allStorageBindings.has(binding))
  .sort();

const durableBindings = new Set();
const durableBlock = configText.match(/"durable_objects"\\s*:\\s*\\{[\\s\\S]*?"bindings"\\s*:\\s*\\[([\\s\\S]*?)\\]/i)?.[1] || '';
for (const match of durableBlock.matchAll(/"name"\\s*:\\s*"([A-Za-z_][A-Za-z0-9_]*)"/g)) durableBindings.add(match[1]);
const hasDurableLimiter = durableBindings.has('BEACON_RATE_LIMITER')
  && configText.includes('"class_name": "BeaconRateLimiter"')
  && configText.includes('"new_sqlite_classes": [')
  && configText.includes('"BeaconRateLimiter"')
  && workerText.includes('export class BeaconRateLimiter')
  && workerText.includes('env.BEACON_RATE_LIMITER.idFromName')
  && workerText.includes('env.BEACON_RATE_LIMITER.get');
if (!hasDurableLimiter) missingBindings.push('BEACON_RATE_LIMITER (Durable Object binding/class/migration contract)');

const result = {
  gate: 'cloudflare-binding-contract',
  status: missingBindings.length ? 'FAIL' : 'PASS',
  config: configPath,
  worker: workerPath,
  declaredStorageBindings: {
    d1: [...declared.d1].sort(),
    kv: [...declared.kv].sort(),
    r2: [...declared.r2].sort(),
    services: [...declared.service].sort(),
    durableObjects: [...durableBindings].sort(),
  },
  activeStorageReferences: [...storageReferences].sort(),
  missingBindings,
  durableObjectLimiter: hasDurableLimiter ? 'DECLARED' : 'MISSING',
  note: missingBindings.length
    ? 'Every active storage/service reference and durable object contract must have a corresponding Wrangler declaration.'
    : 'All active storage/service references and the Beacon Durable Object contract are declared.'
};

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exit(1);
