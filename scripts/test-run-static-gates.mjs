import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sourceRunner = fileURLToPath(new URL('./run-static-gates.mjs', import.meta.url));
const scriptNames = [
  'verify-asset-publication-scope.mjs',
  'verify-shared-design-system.mjs',
  'verify-platform-registries.mjs',
  'verify-media-pipeline.mjs',
  'test-verify-asset-publication-scope.mjs',
  'test-verify-shared-design-system.mjs',
  'test-verify-platform-registries.mjs',
  'test-verify-media-pipeline.mjs',
  'sanitize-cloudflare-only-surface.mjs',
  'verify-cloudflare-bindings.mjs',
  'validate-static-site.mjs',
  'verify-dynamic-runtime.mjs',
  'test-verify-dynamic-runtime.mjs',
  'verify-legacy-gateway-security.mjs',
  'test-verify-legacy-gateway-security.mjs',
  'verify-release-config-consistency.mjs',
  'test-verify-release-config-consistency.mjs'
];

const fixtureWorker = [
  "url.pathname === '/healthz'",
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
].join('\n');

function makeWorkspace({ failOne = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-static-gates-'));
  const scripts = path.join(root, 'scripts');
  fs.mkdirSync(scripts, { recursive: true });
  fs.copyFileSync(sourceRunner, path.join(scripts, 'run-static-gates.mjs'));
  for (const name of scriptNames) {
    const content = failOne && name === 'verify-platform-registries.mjs'
      ? 'process.exit(17);\n'
      : 'console.log("fixture check");\n';
    fs.writeFileSync(path.join(scripts, name), content);
  }
  fs.writeFileSync(path.join(scripts, 'test-pipeline-failure-propagation.sh'), '#!/usr/bin/env bash\nexit 0\n', { mode: 0o700 });
  fs.writeFileSync(path.join(root, 'worker.js'), fixtureWorker + '\n');
  fs.writeFileSync(path.join(root, 'wrangler.jsonc'), JSON.stringify({
    name: 'thelingolegacyv-5',
    main: 'worker.js',
    compatibility_date: '2026-09-01',
    routes: [
      { pattern: 'thelingolegacy.com/*', zone_name: 'thelingolegacy.com' },
      { pattern: 'www.thelingolegacy.com/*', zone_name: 'thelingolegacy.com' }
    ],
    assets: { binding: 'ASSETS' },
  }, null, 2));
  fs.writeFileSync(path.join(root, '_headers'), 'X-Frame-Options: DENY\\nReferrer-Policy: strict-origin-when-cross-origin\\nPermissions-Policy: camera=(), microphone=(), geolocation=(), payment=()\\nStrict-Transport-Security: max-age=63072000; includeSubDomains; preload\\n');
  fs.writeFileSync(path.join(root, 'README.md'), 'Worker thelingolegacyv-5 compatibility date 2026-09-01\\n');
  fs.writeFileSync(path.join(root, 'SYSTEM-ACTIVATION-AUTHORITY.md'), 'SUPERSEDED HISTORICAL RECORD — NOT AN ACTIVE AUTHORIZATION\\n');
  fs.mkdirSync(path.join(root, '.github/workflows'), { recursive: true });
  fs.writeFileSync(path.join(root, '.github/workflows/production-promotion.yml'), 'runs-on: [self-hosted, linux, x64, lingo-g02]\\nif: ${{ false }}\\n');
  fs.writeFileSync(path.join(root, '.github/workflows/g02-sentinel.yml'), 'runs-on: [self-hosted, linux, x64, lingo-g02]\\n');
  return root;
}

function runStack(root) {
  return spawnSync(process.execPath, [path.join(root, 'scripts/run-static-gates.mjs')], {
    cwd: root,
    encoding: 'utf8',
    timeout: 120000,
    env: { ...process.env, GITHUB_SHA: 'fixture-sha', GITHUB_RUN_ID: 'fixture-run', GITHUB_REPOSITORY: 'fixture/repo' }
  });
}

test('all static checks run and evidence is emitted when every fixture check passes', (t) => {
  const root = makeWorkspace();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runStack(root);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(fs.readFileSync(path.join(root, 'static-gate-results.json'), 'utf8'));
  assert.deepEqual(report.summary, { total: 36, passed: 36, failed: 0 });
  assert.equal(report.commitSha, 'fixture-sha');
  assert.equal(report.workflowRunId, 'fixture-run');
  assert.ok(fs.existsSync(path.join(root, 'static-gate-validate-static-site.log')));
  assert.ok(fs.existsSync(path.join(root, 'static-gate-syntax-sanitize-cloudflare-only-surface.log')));
  assert.ok(fs.existsSync(path.join(root, 'static-gate-syntax-verify-cloudflare-bindings.log')));
  assert.ok(fs.existsSync(path.join(root, 'static-gate-syntax-validate-static-site.log')));
  assert.ok(fs.existsSync(path.join(root, 'static-gate-verify-dynamic-runtime.log')));
  assert.ok(fs.existsSync(path.join(root, 'static-gate-test-dynamic-runtime-contract.log')));
  assert.ok(fs.existsSync(path.join(root, 'static-gate-verify-legacy-gateway-security.log')));
  assert.ok(fs.existsSync(path.join(root, 'static-gate-test-legacy-gateway-security.log')));
  assert.ok(fs.existsSync(path.join(root, 'static-gate-verify-release-config-consistency.log')));
  assert.ok(fs.existsSync(path.join(root, 'static-gate-test-release-config-consistency.log')));
});

test('a failed validator does not suppress later checks and makes the stack fail closed', (t) => {
  const root = makeWorkspace({ failOne: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runStack(root);
  assert.equal(result.status, 1);
  const report = JSON.parse(fs.readFileSync(path.join(root, 'static-gate-results.json'), 'utf8'));
  assert.deepEqual(report.summary, { total: 36, passed: 35, failed: 1 });
  assert.equal(report.checks.find((check) => check.id === 'verify-platform-registries').conclusion, 'FAIL');
  assert.equal(report.checks.find((check) => check.id === 'validate-static-site').conclusion, 'PASS');
  assert.ok(fs.existsSync(path.join(root, 'static-gate-validate-static-site.log')));
});
