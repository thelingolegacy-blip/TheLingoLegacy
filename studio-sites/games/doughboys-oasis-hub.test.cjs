'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..', '..', '..');
const hubPath = join(__dirname, 'doughboys-oasis.html');

test('game floor exposes all four existing destinations', () => {
  assert.equal(existsSync(hubPath), true, 'Missing Doughboy’s Oasis game floor');
  const html = readFileSync(hubPath, 'utf8');
  const routes = [
    'doughboys-oasis-vertical-slice.html',
    'doughboys-oasis-racing/index.html',
    'doughboys-oasis-store.html',
    'doughboys-oasis-856-region.html'
  ];
  for (const route of routes) {
    assert.match(html, new RegExp(`href=["'][^"']*${route}["']`), `Missing launcher route ${route}`);
    assert.equal(existsSync(join(__dirname, route)), true, `Destination does not exist: ${route}`);
  }
});

test('game floor labels the economy as fictional local demo currency', () => {
  const html = readFileSync(hubPath, 'utf8');
  assert.match(html, /virtual currency/i);
  assert.match(html, /no cash value/i);
  assert.match(html, /no real payments/i);
});
