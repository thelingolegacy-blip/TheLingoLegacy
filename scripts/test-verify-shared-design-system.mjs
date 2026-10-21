import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const validator = fileURLToPath(new URL('./verify-shared-design-system.mjs', import.meta.url));
const canonicalIds = ['home', 'wallet', 'games', 'shop', 'studio', 'profile', 'rewards'];

function makeRoot(iconValue, { omitIcons = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-design-validator-'));
  fs.mkdirSync(path.join(root, 'config/design'), { recursive: true });
  fs.mkdirSync(path.join(root, 'config/icons'), { recursive: true });
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(root, 'icons'), { recursive: true });
  fs.writeFileSync(path.join(root, 'config/design/design-tokens.json'), JSON.stringify({
    colors: { obsidian: '#050507', gold: '#f7c84b', royalPurple: '#6b2dff', cyan: '#56efff' },
    spacing: { minimumTouchTargetPx: 48 },
    motion: { reducedMotion: 'honor-prefers-reduced-motion' }
  }));
  const registry = {};
  if (!omitIcons) registry.icons = iconValue;
  fs.writeFileSync(path.join(root, 'config/icons/icon-registry.json'), JSON.stringify(registry));
  fs.writeFileSync(path.join(root, 'assets/lingo-design-tokens.css'), [
    '--lingo-color-obsidian', '--lingo-color-gold', '--lingo-color-royal-purple',
    '--lingo-color-cyan', '--lingo-touch-target-min', '--lingo-motion-standard',
    'prefers-reduced-motion: reduce'
  ].join('\n'));
  for (const id of canonicalIds) fs.writeFileSync(path.join(root, 'icons', id + '.svg'), '<svg></svg>');
  return root;
}

function runValidator(root) {
  return spawnSync(process.execPath, [validator, root], { encoding: 'utf8' });
}

const validIcons = canonicalIds.map((id) => ({ id, path: '/icons/' + id + '.svg', status: 'repo-present' }));

test('valid shared tokens and canonical icon registry pass', (t) => {
  const root = makeRoot(validIcons);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /"ok": true/);
});

test('missing icon list fails with a clear validation error', (t) => {
  const root = makeRoot(undefined, { omitIcons: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /icons must be an array/);
  assert.doesNotMatch(result.stderr, /TypeError|not iterable/);
});

test('non-array icon registry fails with a clear validation error', (t) => {
  const root = makeRoot({ unexpected: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /icons must be an array/);
  assert.doesNotMatch(result.stderr, /TypeError|not iterable/);
});

test('missing touch-target value fails closed instead of passing a NaN comparison', (t) => {
  const root = makeRoot(validIcons);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'config/design/design-tokens.json'), JSON.stringify({
    colors: { obsidian: '#050507', gold: '#f7c84b', royalPurple: '#6b2dff', cyan: '#56efff' },
    spacing: {},
    motion: { reducedMotion: 'honor-prefers-reduced-motion' }
  }));
  const result = runValidator(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /minimumTouchTargetPx must be a finite number of at least 48/);
  assert.doesNotMatch(result.stderr, /TypeError/);
});
