import assert from 'node:assert/strict';
import { evaluateEvidenceSignature } from '../scripts/evaluate-runner-evidence.mjs';

const sha = 'abc123';
const valid = {
  runner: { id: 42, name: 'GitHub Actions 1', os: 'Linux', arch: 'X64' },
  executed_step_count: 3,
  verifier_invoked: true,
  verifier_exit_code: 0,
  verifier_gate: 'PASS',
  logs_present: true,
  workflow_conclusion: 'success',
  commit_sha: sha,
  synthetic_evidence: false
};

const pass = evaluateEvidenceSignature(valid, sha);
assert.equal(pass.evidence, 'PRESENT');
assert.equal(pass.verification, 'PASS');
assert.equal(pass.acceptance, 'PASS');
assert.equal(pass.contractAuth, 'READY');
assert.equal(pass.promotion, 'BLOCKED');
assert.equal(pass.lkg, 'PROTECTED');
assert.deepEqual(pass.failures, []);

const missingRunner = { ...valid, runner: { ...valid.runner, id: 0 } };
const fail = evaluateEvidenceSignature(missingRunner, sha);
assert.equal(fail.evidence, 'INCOMPLETE');
assert.equal(fail.verification, 'BLOCKED');
assert.equal(fail.acceptance, 'BLOCKED');
assert.equal(fail.contractAuth, 'BLOCKED');
assert.equal(fail.promotion, 'BLOCKED');
assert.equal(fail.lkg, 'PROTECTED');
assert.ok(fail.failures.includes('runner.id'));

console.log(JSON.stringify({ test: 'runner-evidence-evaluator', status: 'PASS' }, null, 2));
