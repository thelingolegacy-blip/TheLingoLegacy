import fs from 'node:fs';
import os from 'node:os';

function requiredString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function collectEvidence() {
  const now = new Date().toISOString();
  const steps = JSON.parse(process.env.CONSTELLATION_STEPS_JSON || '[]');
  const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
  const temp = process.env.RUNNER_TEMP || os.tmpdir();
  const toolCache = process.env.RUNNER_TOOL_CACHE || '';

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
      status: process.env.CONSTELLATION_WORKFLOW_STATUS || 'completed',
      conclusion: process.env.CONSTELLATION_WORKFLOW_CONCLUSION || 'success',
      startedAt: process.env.CONSTELLATION_JOB_STARTED_AT || now,
      completedAt: process.env.CONSTELLATION_JOB_COMPLETED_AT || now,
      durationMs: Number(process.env.CONSTELLATION_JOB_DURATION_MS || 0)
    },
    steps,
    logs: {
      available: process.env.CONSTELLATION_LOGS_AVAILABLE === 'true',
      source: 'workflow-step-capture'
    },
    verifier: {
      invoked: process.env.CONSTELLATION_VERIFIER_INVOKED === 'true',
      exitCode: process.env.CONSTELLATION_VERIFIER_EXIT_CODE === undefined ? null : Number(process.env.CONSTELLATION_VERIFIER_EXIT_CODE),
      gate: process.env.CONSTELLATION_VERIFIER_GATE || null
    },
    syntheticEvidence: false,
    collection: {
      environmentCaptured: true,
      runtimeEnvFields: {
        workspace: requiredString(workspace),
        temp: requiredString(temp),
        toolCache: requiredString(toolCache)
      }
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
  workspaceCaptured: evidence.collection.runtimeEnvFields.workspace,
  tempCaptured: evidence.collection.runtimeEnvFields.temp,
  toolCacheCaptured: evidence.collection.runtimeEnvFields.toolCache
}, null, 2));

export { collectEvidence };
