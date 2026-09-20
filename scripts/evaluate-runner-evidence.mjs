import fs from 'node:fs';
import crypto from 'node:crypto';
import { correlationResult } from './correlate-runner-evidence.mjs';

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function validTimestamp(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function evaluateLayer(present, valid, correlated) {
  return { present, valid, correlated, pass: present && valid && correlated };
}

function evaluateEvidenceSignature(bundle, expectedSha) {
  const correlation = correlationResult(
    bundle?.run,
    bundle?.job,
    bundle?.steps,
    bundle?.runner,
    bundle?.logs,
    bundle?.workflow,
    expectedSha
  );

  const runnerPresent = Boolean(bundle?.runner);
  const runnerValid =
    Number(bundle?.runner?.id) > 0 &&
    nonEmpty(bundle?.runner?.name) &&
    bundle?.runner?.os === 'Linux' &&
    nonEmpty(bundle?.runner?.arch) &&
    nonEmpty(bundle?.runner?.temp) &&
    nonEmpty(bundle?.runner?.workspace) &&
    nonEmpty(bundle?.runner?.toolCache) &&
    validTimestamp(bundle?.runner?.allocatedAt);

  const stepsPresent = Array.isArray(bundle?.steps) && bundle.steps.length > 0;
  const stepsValid = stepsPresent && bundle.steps.every(step =>
    nonEmpty(step?.stepId) &&
    nonEmpty(step?.name) &&
    validTimestamp(step?.startedAt) &&
    validTimestamp(step?.completedAt) &&
    Number.isFinite(Number(step?.durationMs)) &&
    Number(step?.durationMs) >= 0 &&
    Number.isInteger(Number(step?.exitCode)) &&
    (step?.status === 'SUCCESS' || step?.status === 'FAILURE') &&
    (nonEmpty(step?.logs?.stdout) || nonEmpty(step?.logs?.stderr))
  );

  const verifierPresent = bundle?.verifier?.invoked === true;
  const verifierValid =
    bundle?.verifier?.exitCode === 0 &&
    bundle?.verifier?.gate === 'PASS';

  const logsPresent = bundle?.logs?.available === true;
  const logsValid = logsPresent;

  const workflowPresent = Boolean(bundle?.workflow);
  const workflowValid =
    bundle?.workflow?.status === 'completed' &&
    bundle?.workflow?.conclusion === 'success';

  const commitPresent = Boolean(bundle?.commit?.sha) && nonEmpty(expectedSha);
  const commitValid =
    bundle?.commit?.sha === expectedSha &&
    bundle?.run?.headSha === expectedSha &&
    bundle?.workflow?.headSha === expectedSha &&
    bundle?.syntheticEvidence === false;

  const layers = {
    runnerIdentity: evaluateLayer(
      runnerPresent,
      runnerValid,
      correlation.runnerJob
    ),
    executedSteps: evaluateLayer(
      stepsPresent,
      stepsValid,
      correlation.jobSteps
    ),
    verifierInvocation: evaluateLayer(
      verifierPresent,
      verifierValid,
      correlation.stepsLogs
    ),
    logEvidence: evaluateLayer(
      logsPresent,
      logsValid,
      correlation.stepsLogs
    ),
    workflowConclusion: evaluateLayer(
      workflowPresent,
      workflowValid,
      correlation.workflowJob
    ),
    commitIntegrity: evaluateLayer(
      commitPresent,
      commitValid,
      correlation.commitMatch
    )
  };

  const failures = Object.entries(layers)
    .filter(([, layer]) => !layer.pass)
    .map(([name]) => name);

  const verdict = {
    schemaVersion: '1.0.0',
    evaluatedCommit: expectedSha,
    evidence: failures.length === 0 ? 'PRESENT' : 'INCOMPLETE',
    verification: failures.length === 0 ? 'PASS' : 'BLOCKED',
    acceptance: 'BLOCKED',
    contractAuth: 'BLOCKED',
    promotion: 'BLOCKED',
    lkg: 'PROTECTED',
    layers,
    correlation,
    failures,
    syntheticEvidence: bundle?.syntheticEvidence === true,
    authoritativeEvidence: bundle?.authoritativeEvidence === true,
    productionMutation: 'NOT_PERFORMED'
  };

  if (failures.length === 0 && bundle?.authoritativeEvidence !== true) {
    verdict.failures.push('authoritativeEvidence');
    verdict.evidence = 'INCOMPLETE';
    verdict.verification = 'BLOCKED';
  }

  const digestInput = JSON.stringify(verdict);
  verdict.digest = crypto.createHash('sha256').update(digestInput, 'utf8').digest('hex');
  return verdict;
}

if (process.argv[1]?.endsWith('evaluate-runner-evidence.mjs')) {
  const inputPath = process.argv[2];
  const expectedSha = process.argv[3];
  if (!inputPath || !expectedSha) {
    console.error('usage: node scripts/evaluate-runner-evidence.mjs <bundle.json> <expected-sha>');
    process.exit(2);
  }
  const bundle = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(JSON.stringify(evaluateEvidenceSignature(bundle, expectedSha), null, 2));
}

export { evaluateEvidenceSignature };
