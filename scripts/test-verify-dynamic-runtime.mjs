import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const verifier = fileURLToPath(new URL('./verify-dynamic-runtime.mjs', import.meta.url));
const requiredRoutes = [
  "url.pathname === '/healthz'",
  "url.pathname === '/api/health'",
  "url.pathname === '/api/metrics'",
  "url.pathname === '/api/checkout'",
  "url.pathname === '/api/rewards/claim'",
  "url.pathname === '/api/v1/runtime'",
  "url.pathname === '/api/v1/platform/manifest'",
  "url.pathname === '/api/v1/platform/status'",
  "url.pathname === '/api/v1/platform/gates'",
  "url.pathname === '/api/v1/platform/modules'",
  "url.pathname === '/api/v1/site/context'",
  "url.pathname.startsWith('/api/')",
  'renderDynamicHtml',
  'env.ASSETS.fetch(request)',
  "'x-frame-options': 'DENY'",
];

function runVerifier({ omitRoute = null } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-runtime-contract-'));
  const tokens = requiredRoutes.filter((token) => token !== omitRoute);
  fs.writeFileSync(path.join(root, 'worker.js'), tokens.join('\n') + '\n');
  fs.writeFileSync(path.join(root, 'wrangler.jsonc'), JSON.stringify({
    main: 'worker.js',
    assets: { binding: 'ASSETS' },
  }, null, 2));
  const result = spawnSync(process.execPath, [verifier], {
    cwd: root,
    encoding: 'utf8',
    timeout: 10000,
  });
  fs.rmSync(root, { recursive: true, force: true });
  return result;
}

test('dynamic runtime contract accepts all required API routes and worker bindings', () => {
  const result = runVerifier();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'PASS');
  assert.deepEqual(report.failures, []);
});

test('dynamic runtime contract fails closed when a required route is missing', () => {
  const result = runVerifier({ omitRoute: "url.pathname === '/api/v1/platform/gates'" });
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'FAIL');
  assert.ok(report.failures.some((failure) => failure.includes('/api/v1/platform/gates')));
});

test('dynamic runtime contract fails closed when a required legacy API route is missing', () => {
  const result = runVerifier({ omitRoute: "url.pathname === '/api/rewards/claim'" });
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'FAIL');
  assert.ok(report.failures.some((failure) => failure.includes('/api/rewards/claim')));
});
