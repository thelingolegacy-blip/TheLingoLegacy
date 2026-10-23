import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(process.cwd());
const checks = [
  ...[
    'scripts/run-static-gates.mjs',
    'scripts/verify-asset-publication-scope.mjs',
    'scripts/verify-shared-design-system.mjs',
    'scripts/verify-platform-registries.mjs',
    'scripts/verify-media-pipeline.mjs',
    'scripts/test-verify-asset-publication-scope.mjs',
    'scripts/test-verify-shared-design-system.mjs',
    'scripts/test-verify-platform-registries.mjs',
    'scripts/test-verify-media-pipeline.mjs',
    'scripts/sanitize-cloudflare-only-surface.mjs',
    'scripts/verify-cloudflare-bindings.mjs',
    'scripts/validate-static-site.mjs',
    'scripts/verify-dynamic-runtime.mjs',
    'scripts/test-verify-dynamic-runtime.mjs',
  ].map((file) => ({ id: 'syntax-' + path.basename(file, '.mjs'), command: process.execPath, args: ['--check', file] })),
  { id: 'pipeline-failure-propagation', command: 'bash', args: ['scripts/test-pipeline-failure-propagation.sh'] },
  { id: 'test-asset-publication-scope', command: process.execPath, args: ['--test', 'scripts/test-verify-asset-publication-scope.mjs'] },
  { id: 'test-shared-design-system', command: process.execPath, args: ['--test', 'scripts/test-verify-shared-design-system.mjs'] },
  { id: 'test-platform-registries', command: process.execPath, args: ['--test', 'scripts/test-verify-platform-registries.mjs'] },
  { id: 'test-media-pipeline', command: process.execPath, args: ['--test', 'scripts/test-verify-media-pipeline.mjs'] },
  { id: 'test-dynamic-runtime-contract', command: process.execPath, args: ['--test', 'scripts/test-verify-dynamic-runtime.mjs'] },
  { id: 'verify-asset-publication-scope', command: process.execPath, args: ['scripts/verify-asset-publication-scope.mjs'] },
  { id: 'verify-shared-design-system', command: process.execPath, args: ['scripts/verify-shared-design-system.mjs'] },
  { id: 'verify-platform-registries', command: process.execPath, args: ['scripts/verify-platform-registries.mjs'] },
  { id: 'verify-media-pipeline', command: process.execPath, args: ['scripts/verify-media-pipeline.mjs'] },
  { id: 'verify-dynamic-runtime', command: process.execPath, args: ['scripts/verify-dynamic-runtime.mjs'] },
  { id: 'sanitize-cloudflare-only-surface', command: process.execPath, args: ['scripts/sanitize-cloudflare-only-surface.mjs'] },
  { id: 'verify-cloudflare-bindings', command: process.execPath, args: ['scripts/verify-cloudflare-bindings.mjs'] },
  { id: 'validate-static-site', command: process.execPath, args: ['scripts/validate-static-site.mjs'] },
];

const results = [];
for (const check of checks) {
  let result;
  try {
    result = spawnSync(check.command, check.args, {
      cwd: root,
      encoding: 'utf8',
      timeout: 20000,
      maxBuffer: 4 * 1024 * 1024,
      env: process.env,
    });
  } catch (error) {
    result = { status: null, signal: null, stdout: '', stderr: '', error };
  }
  const output = [
    result.stdout || '',
    result.stderr || '',
    result.error ? `SPAWN_ERROR=${result.error.message}\n` : '',
    result.signal ? `SIGNAL=${result.signal}\n` : '',
  ].join('');
  const logPath = path.join(root, `static-gate-${check.id}.log`);
  fs.writeFileSync(logPath, output || '(no output)\n', { mode: 0o600 });
  results.push({
    id: check.id,
    command: check.command,
    args: check.args,
    exitCode: result.status,
    signal: result.signal || null,
    spawnError: result.error?.message || null,
    conclusion: result.status === 0 && !result.error ? 'PASS' : 'FAIL',
    log: path.basename(logPath),
  });
  console.log(`[${results[results.length - 1].conclusion}] ${check.id}`);
}

const failed = results.filter((result) => result.conclusion !== 'PASS');
const report = {
  schemaVersion: 1,
  gate: 'STATIC_CI_STACK',
  capturedAtUtc: new Date().toISOString(),
  commitSha: process.env.GITHUB_SHA || null,
  repository: process.env.GITHUB_REPOSITORY || null,
  workflowName: process.env.GITHUB_WORKFLOW || null,
  workflowRef: process.env.GITHUB_REF || null,
  eventName: process.env.GITHUB_EVENT_NAME || null,
  workflowRunId: process.env.GITHUB_RUN_ID || null,
  workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT || null,
  runnerName: process.env.RUNNER_NAME || null,
  runnerOs: process.env.RUNNER_OS || null,
  runnerArch: process.env.RUNNER_ARCH || null,
  summary: { total: results.length, passed: results.length - failed.length, failed: failed.length },
  checks: results,
  acceptanceNote: 'This static stack does not prove G02 runner acceptance, production provenance, deployment health, or authorization to promote.',
};
fs.writeFileSync(path.join(root, 'static-gate-results.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
console.log(JSON.stringify(report.summary, null, 2));
if (failed.length) process.exitCode = 1;
