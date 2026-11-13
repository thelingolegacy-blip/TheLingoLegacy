import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateMatrix } from './platform-surface-os-validator-lib.mjs';

const fixture = JSON.parse(fs.readFileSync('config/platform-surface-os-matrix.json', 'utf8'));

test('canonical matrix satisfies all platform, service, division and product contracts', () => {
  assert.deepEqual(validateMatrix(fixture), []);
});

test('missing Firebase service is rejected', () => {
  const matrix = structuredClone(fixture);
  matrix.shared_services = matrix.shared_services.filter((item) => item.id !== 'firebase');
  assert.ok(validateMatrix(matrix).some((failure) => failure.includes('missing shared service: firebase')));
});

test('empty shared-service list is rejected', () => {
  const matrix = structuredClone(fixture);
  matrix.shared_services = [];
  assert.ok(validateMatrix(matrix).some((failure) => failure.includes('missing shared service: github')));
});

test('duplicate platform identifiers are rejected', () => {
  const matrix = structuredClone(fixture);
  matrix.platforms.push(structuredClone(matrix.platforms[0]));
  assert.ok(validateMatrix(matrix).some((failure) => failure.includes('duplicate id: web')));
});

test('unknown product platform target is rejected', () => {
  const matrix = structuredClone(fixture);
  matrix.product_surfaces[0].platform_targets.push('unknown-platform');
  assert.ok(validateMatrix(matrix).some((failure) => failure.includes('unknown platform unknown-platform')));
});

test('unverified Firebase activation cannot be silently removed from evidence', () => {
  const matrix = structuredClone(fixture);
  const firebase = matrix.shared_services.find((item) => item.id === 'firebase');
  delete firebase.blockers;
  assert.ok(validateMatrix(matrix).some((failure) => failure.includes('Firebase must carry evidence')));
});

test('all 25 catalogued web routes are required', () => {
  const matrix = structuredClone(fixture);
  matrix.web_pages.pop();
  assert.ok(validateMatrix(matrix).some((failure) => failure.includes('web_pages must contain all 25')));
});

test('all 7 AppDeploy catalog entries are required', () => {
  const matrix = structuredClone(fixture);
  matrix.appdeploy_surfaces = [];
  assert.ok(validateMatrix(matrix).some((failure) => failure.includes('appdeploy_surfaces must contain all 7')));
});
