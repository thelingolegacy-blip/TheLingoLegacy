import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const verifier = fileURLToPath(new URL('./verify-release-config-consistency.mjs', import.meta.url));
const rootFiles = {
  'wrangler.jsonc': JSON.stringify({
    name: 'thelingolegacyv-5',
    main: 'worker.js',
    compatibility_date: '2026-09-01',
    routes: [
      { pattern: 'thelingolegacy.com/*', zone_name: 'thelingolegacy.com' },
      { pattern: 'www.thelingolegacy.com/*', zone_name: 'thelingolegacy.com' }
    ],
    assets: { directory: '.', binding: 'ASSETS' }
  }, null, 2),
  'worker.js': [
    "'x-content-type-options': 'nosniff'",
    "'x-frame-options': 'DENY'",
    "'referrer-policy': 'strict-origin-when-cross-origin'",
    "'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()'",
    "'strict-transport-security': 'max-age=63072000; includeSubDomains; preload'",
    ` 'content-security-policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests"`,
    "'cross-origin-opener-policy': 'same-origin'",
    "'x-dns-prefetch-control': 'off'"
  ].join('\n'),
  '_headers': [
    'X-Content-Type-Options: nosniff',
    'X-Frame-Options: DENY',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
    "Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests",
    'Cross-Origin-Opener-Policy: same-origin',
    'X-DNS-Prefetch-Control: off'
  ].join('\n'),
  'README.md': 'Worker thelingolegacyv-5 compatibility date 2026-09-01; Studio Worker lingo-legacy-studio-build compatibility date 2026-10-04; not the apex/www production Worker',
  'cloudflare/wrangler.toml': 'name = "lingo-legacy-studio-build"\\nmain = "cloudflare/studio-worker.js"\\ncompatibility_date = "2026-10-04"',
  '.github/workflows/studio-surface-integrity.yml': 'npx --yes wrangler@4 deploy --dry-run --config cloudflare/wrangler.toml',
  'scripts/sanitize-cloudflare-only-surface.mjs': `const report = { mode: 'read-only' }; console.log(JSON.stringify(report));`,
  'scripts/run-static-gates.mjs': `scripts/test-sanitize-cloudflare-only-surface.mjs\\nid: 'verify-cloudflare-only-surface'` ,
  'config/release/promotion-policy.json': JSON.stringify({ noLegacyHostingExecutionPath: true, promotionSequence: ['cloudflare-only-runtime', 'cloudflare-only-static-surface'] }),
  'scripts/generate-release-certificate.mjs': `const critical = new Set(['cloudflare-only-runtime', 'cloudflare-only-static-surface']);`,
  'config/production/launch-foundation.json': JSON.stringify({ observability: { performanceMonitoring: 'Cloudflare deployment metadata; deployment status alone is not acceptance evidence' } }),
  'config/casino/master.json': JSON.stringify({ principles: { deployment: 'static-first Cloudflare Worker delivery', storagePlan: { relational: 'planned only; unverified', cache: 'planned only; unverified' } } }),
  '.github/workflows/production-promotion.yml': 'runs-on: [self-hosted, linux, x64, lingo-g02]\nif: ${{ false }}',
  '.github/workflows/lingo-autorepair-deploy.yml': 'runs-on: [self-hosted, linux, x64, lingo-g02]\nif: ${{ false }}',
  '.github/workflows/g02-sentinel.yml': 'runs-on: [self-hosted, linux, x64, lingo-g02]',
  'SYSTEM-ACTIVATION-AUTHORITY.md': 'SUPERSEDED HISTORICAL RECORD — NOT AN ACTIVE AUTHORIZATION',
  '.github/workflows/docker-image.yml': 'docker build --file ops/github-runner/Dockerfile ops/github-runner',
  'docker/README.md': 'application image intentionally not defined; does not publish an image',
  '.circleci/config.yml': 'workflows:\\n  validate-non-main:\\n    jobs: []\\n          filters:\\n            branches:\\n              ignore: main',
  '.gitlab-ci.yml': 'PRODUCTION_DEPLOYMENT=NOT_AUTHORIZED G02_ACCEPTANCE=NOT_EVALUATED',
  'Jenkinsfile': 'PRODUCTION_DEPLOYMENT=NOT_AUTHORIZED KUBERNETES_DEPLOYMENT=NOT_AUTHORIZED',
  'ops/github-runner/Dockerfile': 'COPY entrypoint.sh /entrypoint.sh',
  'ops/github-runner/entrypoint.sh': '#!/usr/bin/env bash'
};

function run({ mutate = null } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-config-consistency-'));
  for (const [relative, content] of Object.entries(rootFiles)) {
    const full = path.join(root, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content + '\n');
  }
  if (mutate) mutate(root);
  const result = spawnSync(process.execPath, [verifier], { cwd: root, encoding: 'utf8', timeout: 10000 });
  fs.rmSync(root, { recursive: true, force: true });
  return result;
}

test('configuration consistency passes when Worker, headers, workflow, and instructions agree', () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'PASS');
  assert.deepEqual(report.failures, []);
});

test('configuration consistency fails closed on compatibility-date drift and header mismatch', () => {
  const result = run({ mutate(root) {
    const configPath = path.join(root, 'wrangler.jsonc');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.compatibility_date = '2026-07-27';
    fs.writeFileSync(configPath, JSON.stringify(config));
    const headerPath = path.join(root, '_headers');
    fs.writeFileSync(headerPath, fs.readFileSync(headerPath, 'utf8').replace('X-Frame-Options: DENY', 'X-Frame-Options: SAMEORIGIN'));
  }});
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'FAIL');
  assert.ok(report.failures.includes('compatibility-date'));
  assert.ok(report.failures.includes('assets-frame-policy'));
});
