import fs from 'node:fs';
import os from 'node:os';

function requiredString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function readIfPresent(path) {
  if (!path || !fs.existsSync(path)) return '';
  return fs.readFileSync(path, 'utf8');
}

function collectEvidence() {
  const now = new Date().toISOString();
  const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
  const temp = process.env.RUNNER_TEMP || os.tmpdir();
  const toolCache = process.env.RUNNER_TOOL_CACHE || '';
  const verifierOutcome = process.env.CONSTELLATION_VERIFIER_OUTCOME || '';
  const verifierStdoutPath = process.env.CONSTELLATION_VERIFIER_STDOUT_PATH || '';
  const verifierStderrPath = process.env.CONSTELLATION_VERIFIER_STDERR_PATH || '';
  const verifierMetaPath = process.env.CONSTELLATION_VERIFIER_META_PATH || '';
  const verifierMeta = verifierMetaPath && fs.existsSync(verifierMetaPath)
    ? JSON.parse(fs.readFileSync(verifierMetaPath, 'utf8'))
    : null;

  const verifierStdout = readIfPresent(verifierStdoutPath);
  const verifierStderr = readIfPresent(verifierStderrPath);
  const stepStartedAt = verifierMeta?.startedAt || '';
  const stepCompletedAt = verifierMeta?.completedAt || '';
  const durationMs = Number(verifierMeta?.durationMs);
  const exitCode = Number.isInteger(verifierMeta?.exitCode) ? verifierMeta.exitCode : null;
  const hasActualLogs = requiredString(verifierStdout) || requiredString(verifierStderr);

  const steps = [{
    stepId: 'verifier',
    jobName: process.env.GITHUB_JOB || '',
    name: 'Constellation contract gate',
    startedAt: stepStartedAt,
    completedAt: stepCompletedAt,
    durationMs: Number.isFinite(durationMs) && durationMs >= 0 ? durationMs : -1,
    exitCode,
    status: exitCode === 0 ? 'SUCCESS' : 'FAILURE',
    logs: { stdout: verifierStdout, stderr: verifierStderr }
  }];

  return {
    schemaVersion: '1.0.0',
    capturedAt: now,
    run: {
      id: Number(process.env.GITHUB_RUN_ID || 0),
      headSha: process.env.GITHUB_SHA || ''
    },
    job: {
      jobName: process.env.GITHUB_JOB || '',
      runId: Number(process.env.GITHUB_RUN_ID || 0),
      workspace
    },
    runner: {
      id: Number(process.env.RUNNER_ID || 0),
      name: process.env.RUNNER_NAME || '',
      os: process.env.RUNNER_OS || '',
      arch: process.env.RUNNER_ARCH || '',
      temp,
      workspace,
      toolCache,
      allocatedAt: process.env.CONSTELLATION_RUNNER_ALLOCATED_AT || now,
      releasedAt: null
    },
    workflow: {
      runId: Number(process.env.GITHUB_RUN_ID || 0),
      jobName: process.env.GITHUB_JOB || '',
      headSha: process.env.GITHUB_SHA || '',
      status: 'in_progress',
      conclusion: null,
      startedAt: process.env.CONSTELLATION_JOB_STARTED_AT || now,
      completedAt: null,
      durationMs: null
    },
    steps,
    logs: {
      available: hasActualLogs,
      source: hasActualLogs ? 'captured-verifier-files' : 'missing'
    },
    verifier: {
      invoked: process.env.CONSTELLATION_VERIFIER_INVOKED === 'true',
      exitCode,
      gate: exitCode === 0 && verifierOutcome === 'success' ? 'PASS' : 'FAIL'
    },
    syntheticEvidence: false,
    collection: {
      environmentCaptured: true,
      runtimeEnvFields: {
        workspace: requiredString(workspace),
        temp: requiredString(temp),
        toolCache: requiredString(toolCache)
      },
      actualLogCapture: hasActualLogs,
      actualExitCodeCapture: exitCode !== null,
      actualTimestampCapture: Boolean(stepStartedAt && stepCompletedAt)
    }
  };
}

const outputPath = process.argv[2] || process.env.CONSTELLATION_EVIDENCE_PATH || 'constellation-evidence.json';
const evidence = collectEvidence();
fs.writeFileSync(outputPath, JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({
  collector: 'runner-evidence',
  status: 'CAPTURED',
  outputPath,
  runnerId: evidence.runner.id,
  runnerName: evidence.runner.name,
  runnerOs: evidence.runner.os,
  runnerArch: evidence.runner.arch,
  actualLogCapture: evidence.collection.actualLogCapture,
  actualExitCodeCapture: evidence.collection.actualExitCodeCapture,
  actualTimestampCapture: evidence.collection.actualTimestampCapture
}, null, 2));

export { collectEvidence };
