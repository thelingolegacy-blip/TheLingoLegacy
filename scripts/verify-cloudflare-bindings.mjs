import fs from 'node:fs';

const configPath = 'wrangler.jsonc';
const workerPath = 'worker.js';

const configText = fs.readFileSync(configPath, 'utf8');
const workerText = fs.readFileSync(workerPath, 'utf8');

const bindingNames = new Set();
const bindingPatterns = [
  /"binding"\s*:\s*"([A-Za-z_][A-Za-z0-9_]*)"/g,
  /"binding"\s*:\s*'([A-Za-z_][A-Za-z0-9_]*)'/g,
];
for (const pattern of bindingPatterns) {
  for (const match of configText.matchAll(pattern)) bindingNames.add(match[1]);
}

const envReferences = new Set();
for (const match of workerText.matchAll(/\benv\.([A-Za-z_][A-Za-z0-9_]*)\b/g)) envReferences.add(match[1]);

const runtimeBindingReferences = [...envReferences].filter((name) => name !== 'ASSETS');
const missingBindings = runtimeBindingReferences.filter((name) => !bindingNames.has(name));

const result = {
  gate: 'cloudflare-binding-contract',
  status: missingBindings.length ? 'FAIL' : 'PASS',
  config: configPath,
  worker: workerPath,
  declaredBindings: [...bindingNames].sort(),
  runtimeEnvReferences: [...runtimeBindingReferences].sort(),
  missingBindings,
  note: missingBindings.length
    ? 'Every active Worker env binding reference must be declared in Wrangler configuration.'
    : runtimeBindingReferences.length
      ? 'All active Worker env binding references have a corresponding Wrangler binding declaration.'
      : 'No active D1/KV/R2-style env bindings are referenced by the Worker; no resource IDs are fabricated.'
};

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exit(1);
