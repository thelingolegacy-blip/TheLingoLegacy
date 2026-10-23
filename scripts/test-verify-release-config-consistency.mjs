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
    "'x-frame-options': 'DENY'",
    "'referrer-policy': 'strict-origin-when-cross-origin'",
    "'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()'",
    "'strict-transport-security': 'max-age=63072000; includeSubDomains; preload'"
  ].join('\n'),
  '_headers': [
    'X-Frame-Options: DENY',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload'
  ].join('\n'),
  'README.md': 'Worker thelingolegacyv-5 compatibility date 2026-09-01',
  '.github/workflows/production-promotion.yml': 'runs-on: [self-hosted, linux, x64, lingo-g02]\nif: ${{ false }}',
  '.github/workflows/g02-sentinel.yml': 'runs-on: [self-hosted, linux, x64, lingo-g02]',
  'SYSTEM-ACTIVATION-AUTHORITY.md': 'SUPERSEDED HISTORICAL RECORD — NOT AN ACTIVE AUTHORIZATION'
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
