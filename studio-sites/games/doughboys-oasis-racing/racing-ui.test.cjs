'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const html = readFileSync(join(__dirname, 'index.html'), 'utf8');

test('every racing DOM selector resolves exactly once', () => {
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
  const counts = new Map();
  for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
  const selectors = [...html.matchAll(/\$\(['"]([^'"]+)['"]\)/g)].map(match => match[1]);
  const missing = [...new Set(selectors.filter(id => !counts.has(id)))];
  const duplicate = [...counts].filter(([, count]) => count !== 1).map(([id]) => id);
  assert.deepEqual(missing, [], `Missing DOM IDs: ${missing.join(', ')}`);
  assert.deepEqual(duplicate, [], `Duplicate DOM IDs: ${duplicate.join(', ')}`);
});

test('mission progression panel exposes every state element consumed by ui()', () => {
  for (const id of ['jobState', 'inviteState', 'qualState', 'qualProgress', 'finalState']) {
    assert.match(html, new RegExp(`\\bid=["']${id}["']`), `Missing mission element ${id}`);
  }
});
