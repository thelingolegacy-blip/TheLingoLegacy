import fs from 'node:fs';

const file = process.argv[2] || 'config/production/evidence/release-evidence.json';

if (!fs.existsSync(file)) {
  console.error(`EVIDENCE FAIL: missing ${file}`);
  console.error('Copy config/production/evidence/release-evidence.template.json to release-evidence.json and populate it with real, non-secret evidence.');
  process.exit(1);
}

let evidence;
try {
  evidence = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (error) {
  console.error(`EVIDENCE FAIL: invalid JSON in ${file}`);
  console.error(error.message);
  process.exit(1);
}

const failures = [];
const required = (value, label) => {
  if (value === null || value === undefined || value === '' || value === 'unverified') failures.push(`${label} is not verified`);
};

required(evidence.schemaVersion, 'schemaVersion');
required(evidence.release?.gitCommit, 'release.gitCommit');
required(evidence.release?.cloudflareVersionId, 'release.cloudflareVersionId');
required(evidence.release?.deploymentTimestamp, 'release.deploymentTimestamp');

if (evidence.release?.deploymentProvider !== 'cloudflare') failures.push('release.deploymentProvider must be cloudflare');
if (evidence.release?.primaryDomain !== 'https://thelingolegacy.com') failures.push('release.primaryDomain must be https://thelingolegacy.com');

if (evidence.liveProbes?.status !== 'pass') failures.push('liveProbes.status must be pass');
const expectedRoutes = ['/', '/healthz', '/api/v1/runtime', '/api/v1/platform/manifest', '/api/v1/platform/status'];
for (const path of expectedRoutes) {
  const route = evidence.liveProbes?.routes?.find((item) => item?.path === path);
  if (!route || route.status !== 'pass') failures.push(`live probe ${path} must be pass`);
}

if (evidence.cloudflare?.status !== 'verified') failures.push('cloudflare.status must be verified');
if (evidence.cloudflare?.bindingsVerified !== true) failures.push('cloudflare.bindingsVerified must be true');

if (evidence.firebase?.status !== 'verified') failures.push('firebase.status must be verified before Firebase-backed production activation');
if (evidence.firebase?.bindingsVerified !== true) failures.push('firebase.bindingsVerified must be true');
for (const key of ['authSmokeTest', 'firestoreSmokeTest', 'storageSmokeTest']) {
  if (evidence.firebase?.[key] !== 'pass') failures.push(`firebase.${key} must be pass`);
}

if (evidence.rollback?.status !== 'verified') failures.push('rollback.status must be verified');
required(evidence.rollback?.sourceCommit, 'rollback.sourceCommit');
required(evidence.rollback?.cloudflareVersionId, 'rollback.cloudflareVersionId');

for (const [key, value] of Object.entries(evidence.applicationServices || {})) {
  if (value === 'unverified') console.warn(`WARN: application service ${key} remains unverified`);
}

for (const key of ['realMoneyGameplay', 'cashOut', 'harmfulBypass']) {
  if (evidence.safety?.[key] !== false) failures.push(`safety.${key} must remain false`);
}

if (evidence.secretsPolicy?.secretsCommitted !== false) failures.push('secretsPolicy.secretsCommitted must be false');
if (evidence.secretsPolicy?.secretMaterialIncluded !== false) failures.push('secretsPolicy.secretMaterialIncluded must be false');

if (failures.length) {
  console.error('PRODUCTION EVIDENCE: FAIL-CLOSED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PRODUCTION EVIDENCE: PASS');
console.log(`Release commit: ${evidence.release.gitCommit}`);
console.log(`Cloudflare version: ${evidence.release.cloudflareVersionId}`);
console.log(`Deployment timestamp: ${evidence.release.deploymentTimestamp}`);
console.log('All mandatory production evidence and safety gates are satisfied.');
