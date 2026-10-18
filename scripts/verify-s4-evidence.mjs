import fs from 'node:fs';
import crypto from 'node:crypto';

const root = process.env.S4_EVIDENCE_ROOT || 'release/evidence/staging-s4';
const required = [
  '.lkg_release_authorization.json',
  '.lkg_journal.json',
  'staging-forced-failure.log',
  'staging-clean-activation.log'
];

const failures = [];
const evidence = {};

function fail(message) { failures.push(message); }

function readJson(name) {
  const file = `${root}/${name}`;
  if (!fs.existsSync(file)) { fail(`missing evidence: ${file}`); return null; }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { fail(`invalid JSON: ${file}: ${e.message}`); return null; }
}

function readText(name) {
  const file = `${root}/${name}`;
  if (!fs.existsSync(file)) { fail(`missing evidence: ${file}`); return ''; }
  const text = fs.readFileSync(file, 'utf8');
  if (!text.trim()) fail(`empty evidence: ${file}`);
  return text;
}

for (const name of required) {
  if (!fs.existsSync(`${root}/${name}`)) fail(`missing required artifact: ${name}`);
}

const auth = readJson('.lkg_release_authorization.json');
const journal = readJson('.lkg_journal.json');
const forcedLog = readText('staging-forced-failure.log');
const cleanLog = readText('staging-clean-activation.log');

if (auth) {
  for (const field of ['releaseVersion', 'commitSha', 'buildDigest', 'signature', 'createdAt']) {
    if (typeof auth[field] !== 'string' || !auth[field].trim()) fail(`authorization field missing: ${field}`);
  }
  if (auth.commitSha && !/^[a-f0-9]{40}$/.test(auth.commitSha)) fail('authorization commitSha is not a 40-hex SHA');
  if (auth.signature && !/^[a-f0-9]{64}$/.test(auth.signature)) fail('authorization signature must be full 64-hex HMAC');
  if (auth.syntheticEvidence === true) fail('authorization explicitly marked synthetic');
}

if (journal) {
  const b = journal.baselines || {};
  for (const field of ['workerVersionId', 'firebaseHostingVersionId', 'cloudRunRevision', 'capturedAt']) {
    if (typeof b[field] !== 'string' || !b[field].trim()) fail(`journal baseline missing: ${field}`);
  }
  if (!journal.authorization?.signatureVerified) fail('journal authorization signatureVerified is not true');
  if (!journal.authorization?.releaseVersion || !journal.authorization?.commitSha || !journal.authorization?.buildDigest) {
    fail('journal authorization identity is incomplete');
  }
  if (journal.phase !== 'ROLLED_BACK' && journal.phase !== 'ACTIVATED') {
    fail(`journal terminal phase must be ROLLED_BACK or ACTIVATED, got ${journal.phase}`);
  }
}

const forcedRequired = [
  'ROLLBACK_REQUIRED',
  'ROLLING_BACK',
  'ROLLBACK COMPLETE',
  'ROLLED_BACK'
];
for (const marker of forcedRequired) {
  if (!forcedLog.includes(marker)) fail(`forced-failure evidence missing marker: ${marker}`);
}
if (!/(WORKER|Worker).*?(MUTATED|IN_PROGRESS|ROLLBACK)/is.test(forcedLog)) fail('forced-failure evidence lacks Worker rollback narrative');
if (!/Cloud Run.*rollback/is.test(forcedLog)) fail('forced-failure evidence lacks Cloud Run rollback narrative');
if (!/Firebase.*rollback|Firebase.*clone/is.test(forcedLog)) fail('forced-failure evidence lacks Firebase rollback narrative');

const cleanRequired = [
  'POST_MUTATION_VERIFY',
  'PROMOTED',
  'POST_PROMOTION_VERIFY',
  'ACTIVATED'
];
for (const marker of cleanRequired) {
  if (!cleanLog.includes(marker)) fail(`clean-activation evidence missing marker: ${marker}`);
}

if (auth && journal) {
  if (auth.releaseVersion !== journal.authorization.releaseVersion) fail('releaseVersion mismatch between authorization and journal');
  if (auth.commitSha !== journal.authorization.commitSha) fail('commitSha mismatch between authorization and journal');
  if (auth.buildDigest !== journal.authorization.buildDigest) fail('buildDigest mismatch between authorization and journal');
}

const result = {
  gate: 's4-evidence-boundary',
  status: failures.length ? 'BLOCKED' : 'PASS',
  productionMutation: 'NOT_PERFORMED_BY_THIS_VERIFIER',
  checkedAt: new Date().toISOString(),
  root,
  failures
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
