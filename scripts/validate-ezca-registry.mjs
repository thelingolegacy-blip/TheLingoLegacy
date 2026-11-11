import { readFile } from 'node:fs/promises';

const files = [
  'infrastructure/registry/repositories.json',
  'infrastructure/registry/engines.json',
  'infrastructure/registry/workers.json',
  'infrastructure/registry/environments.json',
  'infrastructure/registry/quotas.json',
  'infrastructure/registry/firestore-collections.json',
  'infrastructure/registry/dependencies.json',
  'infrastructure/registry/reconciliation-status.json',
];

const parsed = {};
for (const file of files) {
  parsed[file] = JSON.parse(await readFile(file, 'utf8'));
  console.log(`PASS JSON parse: ${file}`);
}

const repositories = parsed[files[0]];
const engines = parsed[files[1]];
const workers = parsed[files[2]];
if (repositories.inventory_count !== 38 || repositories.repositories.length !== 38) {
  throw new Error('Repository inventory count mismatch');
}
if (engines.packages.length !== 12) throw new Error('Expected exactly 12 shared engines');
if (workers.workers.length !== 7) throw new Error('Expected exactly 7 observed Workers');
if (!repositories.repositories.some((r) => r.status === 'CANONICAL' && r.full_name.endsWith('/TheLingoLegacy'))) {
  throw new Error('Canonical repository declaration missing');
}
if (!workers.workers.some((w) => w.name === 'thelingolegacyv-5' && w.environment === 'production')) {
  throw new Error('Canonical production Worker declaration missing');
}
if (parsed[files[7]].production_promotion !== 'BLOCKED') {
  throw new Error('Production promotion must remain blocked in this registry state');
}
console.log('PASS EZCA registry invariants');
