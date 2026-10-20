import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const validator = fileURLToPath(new URL('./verify-asset-publication-scope.mjs', import.meta.url));
const requiredExclusions = [
  '.github/', '.git/', '.wrangler/', 'config/', 'docs/', 'ops/', 'scripts/',
  'tests/', 'node_modules/', '.env*', '*.env', '*.md', '*.mjs', '*.cjs',
  '*.sh', '*.py', '*.yml', '*.yaml', '*.toml', '*.jsonc', '*.lock', '*.map',
  'worker.js', 'wrangler.jsonc', 'android/', 'ios/', 'lib/', 'infra/', 'cloudflare/',
  'diagnostics/', 'integration-os/', 'admin-command-center/', 'economy-command-center/',
  '.firebaserc', '.gitignore', '.gitattributes', '.npmrc', '.pypirc', '.dev.vars*',
  '.DS_Store', 'package.json', 'package-lock.json', 'pnpm-workspace.yaml',
  'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb', 'Cargo.toml', 'go.mod',
  'requirements.txt', 'pyproject.toml', 'Gemfile', 'Gemfile.lock',
  'firebase-adminsdk*.json', 'service-account*.json', '*-service-account.json',
  'credentials*.json', 'secrets*.json', '*.pem', '*.key', '*.crt', '*.p12', '*.pfx',
  '*.tfstate', '*.tfstate.*', '*.tfvars', '*.tfvars.json', '*.log', '*.bak',
  '*.orig', '*.swp', '*.swo', '*~', '*.sqlite', '*.db',
  'firebase.json', 'firebase.client.json', 'firebase-worker.js', 'gateway-router.js',
  'pubspec.yaml', '_headers', '_redirects'
];
const publicFiles = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest'];

function makeRoot(entries = requiredExclusions, routes = ['/', '/studio-os/']) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-asset-scope-'));
  fs.mkdirSync(path.join(root, 'config/release'), { recursive: true });
  fs.writeFileSync(path.join(root, 'wrangler.jsonc'), JSON.stringify({ assets: { directory: '.' } }));
  fs.writeFileSync(path.join(root, '.assetsignore'), entries.join('\n') + '\n');
  fs.writeFileSync(path.join(root, 'config/release/lingo-legacy-v1.0.0-rc.json'), JSON.stringify({ includedSurfaces: routes }));
  return root;
}

function runValidator(root) {
  return spawnSync(process.execPath, [validator, root], { encoding: 'utf8' });
}

test('valid publication exclusions pass and public entrypoints remain included', (t) => {
  const root = makeRoot();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /"ok": true/);
});

test('missing sensitive root-file exclusion fails closed', (t) => {
  const root = makeRoot(requiredExclusions.filter((entry) => entry !== '.firebaserc'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing required exclusion: \.firebaserc/);
});

test('excluded release-manifest route fails closed after slash normalization', (t) => {
  const root = makeRoot(requiredExclusions, ['/', '/admin-command-center/']);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /conflicts with release-manifest route/);
  assert.match(result.stderr, /admin-command-center/);
});

test('excluding a required public entrypoint fails closed', (t) => {
  const root = makeRoot([...requiredExclusions, 'index.html']);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must not exclude required public file: index\.html/);
});
