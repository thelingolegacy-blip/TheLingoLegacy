'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..', '..');
const registry = JSON.parse(readFileSync(join(root, 'config', 'ops', 'resource-registry.json'), 'utf8'));
const html = readFileSync(join(__dirname, 'index.html'), 'utf8');
const worker = readFileSync(join(root, 'worker.js'), 'utf8');

test('registry has unique IDs and all dependency references resolve', () => {
  const ids = registry.resources.map(resource => resource.id);
  assert.equal(new Set(ids).size, ids.length, 'Resource IDs must be unique');
  const known = new Set(ids);
  for (const resource of registry.resources) {
    for (const dependency of resource.dependencies || []) {
      assert.equal(known.has(dependency), true, `${resource.id} references missing dependency ${dependency}`);
    }
  }
});

test('console explicitly identifies the registry as a dated snapshot', () => {
  assert.match(html, /snapshot/i);
  assert.match(html, /provider sync not connected/i);
  assert.match(html, /generatedAt/);
});

test('console is read-only and never requests external provider APIs', () => {
  assert.doesNotMatch(html, /method\s*=\s*["']post/i);
  assert.doesNotMatch(html, /https?:\/\//i);
  assert.doesNotMatch(html, /secretValue|secret_value|credentialValue|credential_value/i);
});

test('console contains all three operating centers', () => {
  for (const center of ['Main Hub', 'Resource Center', 'Release Center']) {
    assert.match(html, new RegExp(center, 'i'));
  }
});

test('resource records are keyboard-operable from the table', () => {
  assert.match(html, /tabindex=["']0["']/i);
  assert.match(html, /addEventListener\(['"]keydown['"]/i);
  assert.match(html, /event\.key\s*===\s*['"]Enter['"]/);
});

test('public Worker blocks the EMS preview route before static asset fallback', () => {
  const guard = worker.indexOf("if (pathname.startsWith('/ops/ems-console'))");
  const assetFallback = worker.indexOf('const assetResponse = await env.ASSETS.fetch(request);');
  assert.ok(guard >= 0, 'EMS console route must fail closed until Cloudflare Access is implemented');
  assert.ok(assetFallback > guard, 'EMS console guard must run before public static asset fallback');
  assert.match(worker.slice(guard, assetFallback), /EMS_CONSOLE_PREVIEW_DISABLED/);
});

test('public Worker denies internal operations and planning assets before static fallback', () => {
  assert.match(worker, /pathname\.startsWith\(['"]\/ops\/['"]\)/);
  assert.match(worker, /pathname\.startsWith\(['"]\/config\/ops\/['"]\)/);
  assert.match(worker, /pathname\.startsWith\(['"]\/docs\/ops\/['"]\)/);
  assert.match(worker, /pathname\.startsWith\(['"]\/docs\/superpowers\/['"]\)/);
  assert.match(worker, /INTERNAL_ASSET_PATH_DISABLED/);
});
