import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sourceRunner = fileURLToPath(new URL('./run-static-gates.mjs', import.meta.url));
const sourceRoot = path.resolve(path.dirname(sourceRunner), '..');
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
  'test-verify-release-config-consistency.mjs',
  'test-sanitize-cloudflare-only-surface.mjs',
  'verify-landing-page-architecture.mjs',
  'test-verify-landing-page-architecture.mjs'
];

const fixtureWorker = [
  "'x-content-type-options': 'nosniff'",
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
  "canonical.hostname = String(env.CANONICAL_DOMAIN",
  "'x-frame-options': 'DENY'",
  "'referrer-policy': 'strict-origin-when-cross-origin'",
  "'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()'",
  "'strict-transport-security': 'max-age=63072000; includeSubDomains; preload'",
  ` 'content-security-policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests"`,
  "'cross-origin-opener-policy': 'same-origin'",
  "'x-dns-prefetch-control': 'off'",
].join('\n');

function makeWorkspace({ failOne = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-static-gates-'));
  const scripts = path.join(root, 'scripts');
  fs.mkdirSync(scripts, { recursive: true });
  fs.copyFileSync(sourceRunner, path.join(scripts, 'run-static-gates.mjs'));
  for (const name of scriptNames) {
    const target = path.join(scripts, name);
    if (name === 'verify-landing-page-architecture.mjs' || name === 'test-verify-landing-page-architecture.mjs') {
      fs.copyFileSync(path.join(sourceRoot, 'scripts', name), target);
      continue;
    }
    const content = failOne && name === 'verify-platform-registries.mjs'
      ? 'process.exit(17);\\n'
      : 'console.log("fixture check");\\n';
    fs.writeFileSync(target, content);
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
    assets: { directory: '.', binding: 'ASSETS' },
  }, null, 2));
  fs.writeFileSync(path.join(root, '_headers'), "X-Content-Type-Options: nosniff\\\nX-Frame-Options: DENY\\\nReferrer-Policy: strict-origin-when-cross-origin\\\nPermissions-Policy: camera=(), microphone=(), geolocation=(), payment=()\\\nStrict-Transport-Security: max-age=63072000; includeSubDomains; preload\\\nContent-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests\\\nCross-Origin-Opener-Policy: same-origin\\\nX-DNS-Prefetch-Control: off\\\n");
  fs.writeFileSync(path.join(root, 'README.md'), 'Worker thelingolegacyv-5 compatibility date 2026-09-01\n');
  fs.writeFileSync(path.join(root, 'SYSTEM-ACTIVATION-AUTHORITY.md'), 'SUPERSEDED HISTORICAL RECORD — NOT AN ACTIVE AUTHORIZATION\n');
  fs.mkdirSync(path.join(root, '.github/workflows'), { recursive: true });
  fs.writeFileSync(path.join(root, '.github/workflows/production-promotion.yml'), 'runs-on: [self-hosted, linux, x64, lingo-g02]\nif: ${{ false }}\n');
  fs.writeFileSync(path.join(root, '.github/workflows/g02-self-hosted-sentinel.yml'), 'runs-on: [self-hosted, linux, x64, lingo-g02]\n');
  const contractPath = path.join(root, 'config/landing-page-contract.json');
  fs.mkdirSync(path.dirname(contractPath), { recursive: true });
  fs.copyFileSync(path.join(sourceRoot, 'config/landing-page-contract.json'), contractPath);
  const releasePath = path.join(root, 'config/release/lingo-legacy-v1.0.0-rc.json');
  fs.mkdirSync(path.dirname(releasePath), { recursive: true });
  fs.writeFileSync(releasePath, JSON.stringify({ includedSurfaces: ['/'] }));
  fs.writeFileSync(path.join(root, 'index.html'), '<!doctype html><html><head><title>The Lingo Legacy Home</title><meta name="description" content="A sufficiently detailed description of the Lingo Legacy website and its core destinations."><link rel="canonical" href="https://thelingolegacy.com/"></head><body><nav></nav><main><h1>Build the Legacy</h1></main></body></html>');
  fs.writeFileSync(path.join(root, '404.html'), '<!doctype html><title>Not found</title>');
  fs.writeFileSync(path.join(root, 'manifest.webmanifest'), '{}');
  fs.writeFileSync(path.join(root, '.assetsignore'), '# fixture; public entrypoints remain publishable\\n');
  fs.writeFileSync(path.join(root, 'robots.txt'), 'User-agent: *\\nAllow: /\\nSitemap: https://thelingolegacy.com/sitemap.xml\\n');
  const requiredRoutes = ['/thats-my-lingo/', '/universe/', '/loyalty-lane-apparel/', '/trust-compliance/', '/privacy/', '/terms/', '/contact/'];
  fs.writeFileSync(path.join(root, 'sitemap.xml'), '<?xml version="1.0"?><urlset>' + requiredRoutes.map((route) => `<url><loc>https://thelingolegacy.com${route}</loc></url>`).join('') + '</urlset>');
  for (const route of requiredRoutes) {
    const dir = path.join(root, route.replace(/^\\/+|\\/+$/g, ''));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><title>Route fixture</title>');
  }
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
  assert.deepEqual(report.summary, { total: 42, passed: 42, failed: 0 });
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
  assert.ok(fs.existsSync(path.join(root, 'static-gate-test-cloudflare-surface-readonly.log')));
  assert.ok(fs.existsSync(path.join(root, 'static-gate-test-landing-page-architecture.log')));
  assert.ok(fs.existsSync(path.join(root, 'static-gate-verify-landing-page-architecture.log')));
});

test('a failed validator does not suppress later checks and makes the stack fail closed', (t) => {
  const root = makeWorkspace({ failOne: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runStack(root);
  assert.equal(result.status, 1);
  const report = JSON.parse(fs.readFileSync(path.join(root, 'static-gate-results.json'), 'utf8'));
  assert.deepEqual(report.summary, { total: 42, passed: 41, failed: 1 });
  assert.equal(report.checks.find((check) => check.id === 'verify-platform-registries').conclusion, 'FAIL');
  assert.equal(report.checks.find((check) => check.id === 'validate-static-site').conclusion, 'PASS');
  assert.ok(fs.existsSync(path.join(root, 'static-gate-validate-static-site.log')));
});
