import fs from 'node:fs';

const files = [
  'config/constellation/constellation-os.json',
  'worker.js',
  'wrangler.jsonc',
  'config/production.json',
  'config/release/promotion-policy.json',
];

const failures = [];
for (const file of files) {
  if (!fs.existsSync(file)) failures.push(`missing ${file}`);
}

const c = JSON.parse(fs.readFileSync('config/constellation/constellation-os.json','utf8'));
const required = [
  ['sourceAuthority','github'],
  ['productionAuthority','cloudflare'],
  ['mode','staged-fail-closed'],
  ['lastKnownGood','protected'],
];

for (const [key, expected] of required) {
  if (c[key] !== expected) failures.push(`${key} must be ${expected}`);
}

if (c.secrets?.neverCommitValues !== true) failures.push('secret contract must prohibit committed values');
if (c.acceptance?.noSyntheticEvidence !== true) failures.push('synthetic evidence must remain prohibited');
if (c.deployment?.runnerGate?.required !== true) failures.push('runner gate must remain required');
if (!c.deployment?.productionPromotionRequires?.includes('runner_gate_pass')) failures.push('runner gate must precede promotion');
if (!c.routing?.reservedPaths?.includes('/recovery')) failures.push('/recovery route must remain reserved');
if (!c.routing?.reservedPaths?.includes('/dup')) failures.push('/dup route must remain reserved');

const production = JSON.parse(fs.readFileSync('config/production.json','utf8'));
if (production.activation?.failClosed !== true) failures.push('production activation failClosed must remain true');
if (production.activation?.allowManualActivation !== false) failures.push('manual activation must remain disabled');

const policy = JSON.parse(fs.readFileSync('config/release/promotion-policy.json','utf8'));
if (policy.failurePolicy !== 'FAIL_CLOSED') failures.push('promotion failure policy must remain FAIL_CLOSED');
if (policy.evidenceRequiredForCertification !== true) failures.push('certification must require evidence');

const result = {
  gate:'constellation-contract',
  status: failures.length ? 'FAIL' : 'PASS',
  productionMutation:'NOT_PERFORMED',
  failures
};
console.log(JSON.stringify(result,null,2));
if (failures.length) process.exit(1);
