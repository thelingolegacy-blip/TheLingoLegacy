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
  assets: new Set(),
};

for (const match of configText.matchAll(/"binding"\s*:\s*"([A-Za-z_][A-Za-z0-9_]*)"/g)) {
  declared.assets.add(match[1]);
}

const storageReferences = [];
const patterns = [
  { type: 'd1', regex: /\benv\.([A-Za-z_][A-Za-z0-9_]*)\.(?:prepare|batch|exec)\s*\(/g },
  { type: 'kv', regex: /\benv\.([A-Za-z_][A-Za-z0-9_]*)\.(?:get|put|delete|list)\s*\(/g },
  { type: 'r2', regex: /\benv\.([A-Za-z_][A-Za-z0-9_]*)\.(?:get|put|delete|list|head)\s*\(/g },
];

// D1/KV/R2 calls are structurally similar in JavaScript, so classify known
// storage binding names from Wrangler sections before evaluating references.
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

// Evaluate env method calls against the binding classes explicitly declared
// in Wrangler. If no storage binding is referenced, the gate passes without
// inventing D1/KV/R2 identifiers.
for (const { type, regex } of patterns) {
  for (const match of workerText.matchAll(regex)) {
    const name = match[1];
    if (name === 'ASSETS' || name === 'env') continue;
    storageReferences.push({ type, binding: name, declared: declared[type].has(name) });
  }
}

const missingBindings = storageReferences.filter((ref) => !ref.declared);
const uniqueReferences = [...new Map(storageReferences.map((ref) => [`${ref.type}:${ref.binding}`, ref])).values()];

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
  },
  activeStorageReferences: uniqueReferences,
  missingBindings,
  note: missingBindings.length
    ? 'Every active D1/KV/R2/service API reference must have a corresponding Wrangler binding declaration.'
    : uniqueReferences.length
      ? 'All active storage/service references have corresponding Wrangler declarations.'
      : 'No active D1/KV/R2/service APIs are referenced by the Worker; no resource IDs are fabricated.'
};

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exit(1);
