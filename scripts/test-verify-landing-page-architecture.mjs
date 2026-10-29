import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const verifier = fileURLToPath(new URL('./verify-landing-page-architecture.mjs', import.meta.url));
const sourceRoot = path.resolve(path.dirname(verifier), '..');

function run(root) {
  return spawnSync(process.execPath, [verifier, root], { cwd: root, encoding: 'utf8', timeout: 10000 });
}

test('repository landing page infrastructure matches its contract', () => {
  const result = run(sourceRoot);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.gate, 'LANDING_PAGE_ARCHITECTURE');
  assert.equal(report.summary.failed, 0);
  assert.ok(report.summary.passed >= 25);
  const homepage = fs.readFileSync(path.join(sourceRoot, 'index.html'), 'utf8');
  assert.match(homepage, /id="destination-search"/);
  assert.match(homepage, /data-filter="games"/);
  assert.match(homepage, /data-route-status="unverified"/);
  assert.match(homepage, /Not yet verified live/);
  assert.match(homepage, /Preview results do not imply live availability/);
  assert.match(homepage, /search\.addEventListener\('input', refresh\)/);

});

test('missing public route and homepage destination fail closed', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-landing-contract-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const relative of [
    'config/landing-page-contract.json',
    'config/release/lingo-legacy-v1.0.0-rc.json',
    'wrangler.jsonc',
    'worker.js',
    '.assetsignore',
    'index.html',
    '404.html',
    'robots.txt',
    'sitemap.xml',
    'manifest.webmanifest',
    'wrangler.flagship-preview.toml',
    'cloudflare/flagship-root/preview-worker.js',
    'cloudflare/flagship-root/live-snapshot-2026-10-29.html',
    'thats-my-lingo/index.html',
    'universe/index.html',
    'loyalty-lane-apparel/index.html',
    'trust-compliance/index.html',
    'privacy/index.html',
    'terms/index.html',
    'contact/index.html',
  ]) {
    const source = path.join(sourceRoot, relative);
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (relative === 'config/landing-page-contract.json') {
      const contract = JSON.parse(fs.readFileSync(source, 'utf8'));
      contract.requiredLandingMetadata.minimumPrimaryRoutes.push('/missing-route/');
      fs.writeFileSync(target, JSON.stringify(contract));
    } else {
      fs.copyFileSync(source, target);
    }
  }
  const result = run(root);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  const report = JSON.parse(result.stdout);
  assert.ok(report.errors.some((error) => error.includes('sitemap-route--missing-route-')));
  assert.ok(report.errors.some((error) => error.includes('route-file--missing-route-')));

  const homepagePath = path.join(root, 'index.html');
  const homepage = fs.readFileSync(homepagePath, 'utf8');
  fs.writeFileSync(homepagePath, homepage.replace('href="/thats-my-lingo/"', 'href="/missing-game/"'));
  const homepageResult = run(root);
  assert.equal(homepageResult.status, 1, homepageResult.stdout + homepageResult.stderr);
  const homepageReport = JSON.parse(homepageResult.stdout);
  assert.ok(homepageReport.errors.includes('homepage-primary-destination'));
});
