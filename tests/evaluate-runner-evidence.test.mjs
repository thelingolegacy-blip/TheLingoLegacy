import assert from 'node:assert/strict';
import { evaluateEvidenceSignature } from '../scripts/evaluate-runner-evidence.mjs';

const sha = 'a'.repeat(40);

function complete() {
  return {
    run: { id: 100, headSha: sha },
    job: { jobName: 'contract', runId: 100, workspace: '/workspace' },
    runner: { id: 42, name: 'GitHub Actions', os: 'Linux', arch: 'X64', temp: '/tmp', workspace: '/workspace', toolCache: '/opt/toolcache', allocatedAt: '2026-09-20T14:00:00.000Z' },
    steps: [{ stepId: 'verify', jobName: 'contract', name: 'Verifier', startedAt: '2026-09-20T14:00:00.000Z', completedAt: '2026-09-20T14:00:01.000Z', durationMs: 1000, exitCode: 0, status: 'SUCCESS', logs: { stdout: 'PASS', stderr: '' } }],
    verifier: { invoked: true, exitCode: 0, gate: 'PASS' },
    logs: { available: true },
    workflow: { runId: 100, jobName: 'contract', headSha: sha, status: 'completed', conclusion: 'success' },
    commit: { sha },
    syntheticEvidence: false,
    authoritativeEvidence: true
  };
}

const pass = evaluateEvidenceSignature(complete(), sha);
assert.equal(pass.evidence, 'PRESENT');
assert.equal(pass.verification, 'PASS');
assert.equal(pass.acceptance, 'PASS');
assert.equal(pass.contractAuth, 'READY');
assert.equal(pass.promotion, 'BLOCKED');
assert.equal(pass.lkg, 'PROTECTED');
assert.equal(pass.productionMutation, 'NOT_PERFORMED');
assert.deepEqual(pass.failures, []);

const missingRunner = complete();
missingRunner.runner.id = 0;
const fail = evaluateEvidenceSignature(missingRunner, sha);
assert.equal(fail.evidence, 'INCOMPLETE');
assert.equal(fail.verification, 'BLOCKED');
assert.equal(fail.promotion, 'BLOCKED');
assert.equal(fail.lkg, 'PROTECTED');
assert.ok(fail.failures.includes('runnerIdentity'));

console.log(JSON.stringify({ test: 'runner-evidence-evaluator', status: 'PASS' }, null, 2));
