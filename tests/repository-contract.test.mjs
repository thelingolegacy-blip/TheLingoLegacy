import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Cloudflare Worker entrypoint and asset binding remain explicit', () => {
  const config = JSON.parse(read('wrangler.jsonc'));
  assert.equal(config.main, 'worker.js');
  assert.equal(config.assets?.binding, 'ASSETS');
  assert.equal(config.workers_dev, false);
  assert.ok(config.routes.some((route) => route.pattern === 'thelingolegacy.com/*'));
  assert.ok(config.routes.some((route) => route.pattern === 'www.thelingolegacy.com/*'));
});

test('runtime exposes the minimum documented health and platform routes', () => {
  const worker = read('worker.js');
  for (const route of [
    `url.pathname === '/healthz'`,
    `url.pathname === '/api/v1/platform/status'`,
    `url.pathname === '/api/v1/site/context'`,
    `url.pathname.startsWith('/api/')`,
  ]) {
    assert.ok(worker.includes(route), `worker.js must retain route contract: ${route}`);
  }
});

test('public asset manifest excludes source, automation, and operational tooling', () => {
  const ignore = read('.assetsignore');
  for (const pattern of ['/worker.js', '/wrangler.jsonc', '/.github/**', '/ops/**', '/scripts/**', '/tests/**', '/.env*', '/.dev.vars*']) {
    assert.ok(ignore.split(/\r?\n/).some((line) => line.trim() === pattern), `.assetsignore must exclude ${pattern}`);
  }
});

test('runtime delegates static asset delivery through the declared binding', () => {
  const worker = read('worker.js');
  assert.ok(worker.includes('env.ASSETS.fetch(request)'));
});

test('G02 release controls remain fail-closed and do not target production', () => {
  const readme = read('README.md');
  assert.match(readme, /G02\s*=\s*FAIL\s*\/\s*UNVERIFIED/i);
  assert.match(readme, /FAIL-CLOSED\s*=\s*ACTIVE/i);
  assert.match(readme, /MUTATION FREEZE\s*=\s*ACTIVE/i);
  const workflow = read('.github/workflows/runner-dispatch-diagnostic.yml');
  assert.match(workflow, /runs-on:\s*\[self-hosted, linux, x64, lingo-g02\]/);
});


test('deployment preflight executes read-only and accepts current configuration', () => {
  const result = spawnSync(process.execPath, ['scripts/deployment-preflight.mjs'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.gate, 'cloudflare-deployment-preflight');
  assert.equal(report.status, 'PASS');
  assert.equal(report.mode, 'read-only');
  assert.equal(report.deploymentPerformed, false);
  assert.equal(report.productionMutationPerformed, false);
});
