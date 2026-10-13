import fs from 'node:fs';
import path from 'node:path';

const output = process.argv[2] || 'release/evidence/prototype-quality/evidence.json';
const env = process.env;
const required = ['GITHUB_REPOSITORY', 'GITHUB_SHA', 'GITHUB_RUN_ID', 'GITHUB_RUN_ATTEMPT', 'GITHUB_WORKFLOW', 'GITHUB_REF'];
const missing = required.filter((key) => !env[key]);
if (missing.length) {
  console.error(JSON.stringify({ status: 'INVALID', missingRequiredEnvironment: missing }));
  process.exit(1);
}

const evidence = {
  schemaVersion: 1,
  evidenceType: 'prototype-quality-run-correlation',
  status: 'RUN_METADATA_CAPTURED_TEST_OUTCOME_REQUIRES_GITHUB_JOB_RECORDS',
  capturedAt: new Date().toISOString(),
  repository: env.GITHUB_REPOSITORY,
  commitSha: env.GITHUB_SHA,
  ref: env.GITHUB_REF,
  workflow: env.GITHUB_WORKFLOW,
  workflowRunId: env.GITHUB_RUN_ID,
  runAttempt: Number(env.GITHUB_RUN_ATTEMPT),
  runUrl: `${env.GITHUB_SERVER_URL || 'https://github.com'}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`,
  eventName: env.GITHUB_EVENT_NAME || null,
  runner: {
    os: env.RUNNER_OS || null,
    arch: env.RUNNER_ARCH || null,
    environment: env.RUNNER_ENVIRONMENT || null,
    name: env.RUNNER_NAME || null,
  },
  controls: {
    deploymentPerformed: false,
    productionMutationPerformed: false,
    productionPromotionAuthorized: false,
    g02AcceptanceGranted: false,
  },
  acceptanceNote: 'This file correlates run metadata only. Confirm job conclusion, instantiated steps, retrievable logs, artifact integrity, and exact commit through GitHub before accepting test results.',
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify({ status: 'PASS', output, commitSha: evidence.commitSha, workflowRunId: evidence.workflowRunId, runAttempt: evidence.runAttempt }, null, 2));
