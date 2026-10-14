import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const workflow = readFileSync('.github/workflows/production-promotion.yml', 'utf8');
const job = (name) => {
  const match = workflow.match(new RegExp('^  ' + name + ':\\n([\\s\\S]*?)(?=^  [a-zA-Z0-9_-]+:|(?![\\s\\S]))', 'm'));
  assert.ok(match, `job ${name} must exist`);
  return match[1];
};
const runnerGate = job('runner-gate');
const gates = job('gates');
const authorization = job('predeployment-authorization');
const deploy = job('cloudflare');
const acceptance = job('certificate');

assert.match(runnerGate, /runs-on: \[self-hosted, linux, x64, lingo-g02\]/);
assert.match(runnerGate, /RUNNER_ID.*runner\.id/s);
assert.match(runnerGate, /RUNNER_NAME.*runner\.name/s);
assert.match(gates, /needs: runner-gate/);
assert.match(gates, /test-production-promotion-contract\.mjs/);
assert.match(authorization, /needs: gates/);
assert.match(authorization, /PROMOTION_EVIDENCE_VERIFIED/);
assert.match(authorization, /ROLLBACK_TARGET_VERIFIED/);
assert.match(authorization, /PRE_DEPLOYMENT_AUTHORIZATION=PASS/);
assert.match(authorization, /Pre-deployment evidence digest mismatch/);
assert.match(deploy, /needs: \[gates, predeployment-authorization\]/);
assert.match(deploy, /environment: \$\{\{ inputs\.environment \}\}/);
assert.match(deploy, /Deploy to Cloudflare/);
assert.match(deploy, /Run and preserve live probes/);
assert.match(deploy, /Upload post-deployment evidence/);
assert.match(acceptance, /needs: \[gates, predeployment-authorization, cloudflare\]/);
assert.match(acceptance, /POST_DEPLOYMENT_ACCEPTANCE=PASS/);
assert.match(acceptance, /probes\.status !== 'PASS'/);
assert.match(acceptance, /manifest\.commitSha !== process\.env\.EXPECTED_COMMIT/);
assert.match(acceptance, /rollback\.status !== 'PASS'/);
assert.match(acceptance, /Pre-acceptance evidence digest mismatch/);
assert.match(acceptance, /refreshedDigest/);
assert.match(acceptance, /post-deployment/);
assert.match(acceptance, /live-probes\.json/);
assert.match(acceptance, /acceptedNames/);
assert.match(acceptance, /lingo-accepted-release-evidence-/);

// Fail closed: deployment must depend on pre-deployment authorization, and acceptance
// must depend on successful deployment. This test does not execute any deployment.
console.log('PRODUCTION_PROMOTION_CONTRACT_TEST=PASS');
console.log('DEPLOYMENT_REQUIRES_PREAUTHORIZATION=PASS');
console.log('ACCEPTANCE_REQUIRES_POSTDEPLOY_EVIDENCE=PASS');
