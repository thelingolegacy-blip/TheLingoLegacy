import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateEvidenceSignature } from '../scripts/evaluate-runner-evidence.mjs';

const sha = 'a'.repeat(40);

function validBundle() {
  return {
    run: { id: 100, headSha: sha },
    job: { jobName: 'contract', runId: 100, workspace: '/workspace' },
    runner: {
      id: 42,
      name: 'GitHub Actions runner',
      os: 'Linux',
      arch: 'X64',
      temp: '/tmp/runner',
      workspace: '/workspace',
      toolCache: '/opt/hostedtoolcache',
      allocatedAt: '2026-09-20T14:00:00.000Z',
      releasedAt: '2026-09-20T14:01:00.000Z'
    },
    steps: [{
      stepId: 'verify',
      jobName: 'contract',
      name: 'Verifier',
      startedAt: '2026-09-20T14:00:10.000Z',
      completedAt: '2026-09-20T14:00:20.000Z',
      durationMs: 10000,
      exitCode: 0,
      status: 'SUCCESS',
      logs: { stdout: 'VERIFIER_GATE=PASS', stderr: '' }
    }],
    verifier: { invoked: true, exitCode: 0, gate: 'PASS' },
    logs: { available: true },
    workflow: { runId: 100, jobName: 'contract', headSha: sha, status: 'completed', conclusion: 'success' },
    commit: { sha },
    expectedSha: sha,
    syntheticEvidence: false
  };
}

test('complete six-layer bundle passes but cannot authorize promotion', () => {
  const verdict = evaluateEvidenceSignature(validBundle(), sha);
  assert.equal(verdict.evidence, 'PRESENT');
  assert.equal(verdict.verification, 'PASS');
  assert.equal(verdict.acceptance, 'PASS');
  assert.equal(verdict.contractAuth, 'READY');
  assert.equal(verdict.promotion, 'BLOCKED');
  assert.equal(verdict.lkg, 'PROTECTED');
  assert.equal(verdict.productionMutation, 'NOT_PERFORMED');
  assert.deepEqual(verdict.failures, []);
  assert.match(verdict.digest, /^[a-f0-9]{64}$/);
});

const negativeCases = [
  ['runner.id', b => { b.runner.id = 0; }],
  ['runner.workspace', b => { b.runner.workspace = ''; }],
  ['runner.toolCache', b => { b.runner.toolCache = ''; }],
  ['executedSteps', b => { b.steps = []; }],
  ['step.timestamp', b => { b.steps[0].completedAt = ''; }],
  ['step.exitCode', b => { b.steps[0].exitCode = null; }],
  ['verifier', b => { b.verifier.gate = 'FAIL'; }],
  ['logs', b => { b.logs.available = false; }],
  ['workflow', b => { b.workflow.conclusion = 'failure'; }],
  ['runJobCorrelation', b => { b.job.runId = 999; }],
  ['jobStepCorrelation', b => { b.steps[0].jobName = 'wrong-job'; }],
  ['runnerJobCorrelation', b => { b.runner.workspace = '/wrong'; }],
  ['workflowJobCorrelation', b => { b.workflow.jobName = 'wrong-job'; }],
  ['commitIntegrity', b => { b.commit.sha = 'b'.repeat(40); }],
  ['syntheticEvidence', b => { b.syntheticEvidence = true; }]
];

for (const [name, mutate] of negativeCases) {
  test('rejects ' + name, () => {
    const bundle = validBundle();
    mutate(bundle);
    const verdict = evaluateEvidenceSignature(bundle, sha);
    assert.notEqual(verdict.evidence, 'PRESENT');
    assert.equal(verdict.verification, 'BLOCKED');
    assert.equal(verdict.promotion, 'BLOCKED');
    assert.equal(verdict.lkg, 'PROTECTED');
  });
}
