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
  'infrastructure/registry/worker-bindings.json',
  'infrastructure/registry/firebase-projects.json',
];

const parsed = {};
for (const file of files) {
  parsed[file] = JSON.parse(await readFile(file, 'utf8'));
  console.log(`PASS JSON parse: ${file}`);
}

const repositories = parsed[files[0]];
const engines = parsed[files[1]];
const workers = parsed[files[2]];
const reconciliation = parsed['infrastructure/registry/reconciliation-status.json'];
const workerBindings = parsed['infrastructure/registry/worker-bindings.json'];
const firebaseProjects = parsed['infrastructure/registry/firebase-projects.json'];
if (repositories.inventory_count !== 38 || repositories.repositories.length !== 38) {
  throw new Error('Repository inventory count mismatch');
}
if (engines.packages.length !== 12) throw new Error('Expected exactly 12 shared engines');
if (workers.workers.length !== 10) throw new Error('Expected exactly 10 observed Worker scripts');
const workerNames = workers.workers.map((worker) => worker.name);
if (new Set(workerNames).size !== workerNames.length) throw new Error('Worker registry contains duplicate script names');
if (workers.route_inventory?.observed_routes !== 27 || workers.route_inventory?.route_ids_and_assignments?.length !== 27) {
  throw new Error('Expected 27 observed Worker routes with complete route ID mapping');
}
if (workerBindings.workers_checked !== 10 || workerBindings.workers?.length !== 10) {
  throw new Error('Expected current binding observations for all 10 Worker scripts');
}
const bindingWorkerNames = workerBindings.workers.map((worker) => worker.name);
if (new Set(bindingWorkerNames).size !== bindingWorkerNames.length) {
  throw new Error('Worker binding inventory contains duplicate script names');
}
if (workerNames.some((name) => !bindingWorkerNames.includes(name)) || bindingWorkerNames.some((name) => !workerNames.includes(name))) {
  throw new Error('Worker binding inventory must exactly cover the Worker script registry');
}
if (firebaseProjects.projects?.length !== 3 || firebaseProjects.deployment_verification !== 'NOT_VERIFIED') {
  throw new Error('Firebase project inventory must remain explicit and unverified until live target verification');
}
if (reconciliation.production_promotion !== 'BLOCKED' || reconciliation.g02 !== 'FAIL_UNVERIFIED') {
  throw new Error('Release safety gates must remain fail-closed');
}
if (!repositories.repositories.some((r) => r.status === 'CANONICAL' && r.full_name.endsWith('/TheLingoLegacy'))) {
  throw new Error('Canonical repository declaration missing');
}
if (!workers.workers.some((w) => w.name === 'thelingolegacyv-5' && w.environment === 'production')) {
  throw new Error('Canonical production Worker declaration missing');
}
if (parsed[files[7]].production_promotion !== 'BLOCKED') {
  throw new Error('Production promotion must remain blocked in this registry state');
}

const repositoryStatusByName = new Map(
  repositories.repositories.map((repository) => [repository.full_name.toLowerCase(), repository.status]),
);
for (const assignment of parsed[files[6]].repository_assignments) {
  const expectedStatus = repositoryStatusByName.get(assignment.repository.toLowerCase());
  if (!expectedStatus) {
    throw new Error(`Dependency assignment references an unmapped repository: ${assignment.repository}`);
  }
  if (assignment.repository_status !== expectedStatus) {
    throw new Error(`Repository disposition mismatch for ${assignment.repository}: expected ${expectedStatus}, got ${assignment.repository_status}`);
  }
}
console.log('PASS EZCA registry invariants');
