import fs from 'node:fs';

const configPath = 'wrangler.jsonc';
const workerPath = 'worker.js';
const configText = fs.readFileSync(configPath, 'utf8');
const workerText = fs.readFileSync(workerPath, 'utf8');
const failures = [];

let config;
try {
  config = JSON.parse(configText);
} catch (error) {
  console.error(JSON.stringify({ gate: 'cloudflare-binding-contract', status: 'FAIL', error: String(error) }, null, 2));
  process.exit(1);
}

const declared = {
  d1: new Set((config.d1_databases || []).map((item) => item.binding).filter(Boolean)),
  kv: new Set((config.kv_namespaces || []).map((item) => item.binding).filter(Boolean)),
  r2: new Set((config.r2_buckets || []).map((item) => item.binding).filter(Boolean)),
  service: new Set((config.services || []).map((item) => item.binding).filter(Boolean)),
};
const allStorageBindings = new Set([
  ...declared.d1, ...declared.kv, ...declared.r2, ...declared.service,
]);
const storageReferences = new Set();
const storageMethod = /\benv\.([A-Za-z_][A-Za-z0-9_]*)\.(?:prepare|batch|exec|get|put|delete|list|head)\s*\(/g;
for (const match of workerText.matchAll(storageMethod)) {
  if (match[1] !== 'ASSETS') storageReferences.add(match[1]);
}
const missingStorageBindings = [...storageReferences]
  .filter((binding) => !allStorageBindings.has(binding))
  .sort();

const durableBindings = new Set((config.durable_objects?.bindings || []).map((item) => item.name).filter(Boolean));
const migrations = config.migrations || [];
const hasLimiterMigration = migrations.some((migration) =>
  Array.isArray(migration.new_sqlite_classes) && migration.new_sqlite_classes.includes('BeaconRateLimiter'));
const hasDurableLimiter = durableBindings.has('BEACON_RATE_LIMITER')
  && (config.durable_objects?.bindings || []).some((item) =>
    item.name === 'BEACON_RATE_LIMITER' && item.class_name === 'BeaconRateLimiter')
  && hasLimiterMigration
  && workerText.includes('export class BeaconRateLimiter')
  && workerText.includes('env.BEACON_RATE_LIMITER.idFromName')
  && workerText.includes('env.BEACON_RATE_LIMITER.get');

const missingBindings = [...missingStorageBindings];
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
    : 'All active storage/service references and the Beacon Durable Object contract are declared.',
};
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exit(1);
