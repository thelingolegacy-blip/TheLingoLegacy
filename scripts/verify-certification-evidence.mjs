import fs from 'node:fs';

const requiredFiles = [
  'release/evidence/lingo-autorepair-report.json',
  'release/evidence/live-probes.json',
  'config/release/rollback-manifest.json'
];

const failures = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing required evidence: ${file}`);
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { failures.push(`invalid JSON: ${file}: ${error.message}`); return null; }
}

const repair = fs.existsSync(requiredFiles[0]) ? readJson(requiredFiles[0]) : null;
const probes = fs.existsSync(requiredFiles[1]) ? readJson(requiredFiles[1]) : null;
const rollback = fs.existsSync(requiredFiles[2]) ? readJson(requiredFiles[2]) : null;

if (repair && Array.isArray(repair.failures) && repair.failures.length) {
  failures.push(`auto-repair failures present: ${repair.failures.join('; ')}`);
}

if (!probes || probes.status !== 'PASS' || !Array.isArray(probes.probes) || probes.probes.length === 0) {
  failures.push('live probe evidence is not a complete PASS artifact');
} else {
  if (probes.base !== 'https://thelingolegacy.com') failures.push('live probe evidence base does not match canonical production domain');
  if (typeof probes.timestamp !== 'string' || Number.isNaN(Date.parse(probes.timestamp))) failures.push('live probe evidence timestamp is missing or invalid');
  for (const probe of probes.probes) {
    if (!probe || probe.status !== 'PASS') failures.push('live probe evidence contains a non-PASS probe');
    if (typeof probe.path !== 'string' || probe.path.trim() === '') failures.push('live probe evidence contains a probe without a path');
    if (!Number.isFinite(probe.actual)) failures.push('live probe evidence contains a probe without a numeric HTTP status');
  }
}

const fields = ['commitSha', 'artifactDigest', 'deploymentId', 'certificateId'];
if (rollback) {
  if (rollback.schemaVersion !== '1.0') failures.push('rollback manifest schemaVersion is not 1.0');
  for (const field of fields) {
    if (typeof rollback[field] !== 'string' || rollback[field].trim() === '') {
      failures.push(`rollback manifest field is not populated: ${field}`);
    }
  }
  if (rollback.selectionPolicy !== 'KNOWN_GOOD_ONLY') failures.push('rollback selection policy is not KNOWN_GOOD_ONLY');
  if (rollback.verificationRequired !== true) failures.push('rollback verification requirement is not enabled');
  if (rollback.liveProbeRequiredAfterRollback !== true) failures.push('post-rollback live probe requirement is not enabled');
  if (rollback.recoveryCertificateRequired !== true) failures.push('recovery certificate requirement is not enabled');
}

const result = {
  gate: 'certification-evidence',
  status: failures.length ? 'BLOCKED' : 'PASS',
  checkedAt: new Date().toISOString(),
  requiredFiles,
  failures
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
