import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRoute, validatePublicContract } from '../scripts/build-public-dist.mjs';

const base = {
  contract: 'LINGO_PUBLIC_SITE_ROUTES',
  approvedRoutes: [{ path: '/', source: 'index.html', status: 'approved' }],
  assetFiles: [],
  excludedRoutePrefixes: ['/admin-', '/api/']
};

test('normalizes a directory route', () => {
  assert.equal(normalizeRoute('/studio-hub'), '/studio-hub/');
});

test('rejects traversal and protocol-relative routes', () => {
  assert.throws(() => normalizeRoute('/../private/'), /Invalid public route/);
  assert.throws(() => normalizeRoute('//example.com/'), /Invalid public route/);
});

test('fails closed when no routes have been approved', () => {
  assert.throws(() => validatePublicContract({ ...base, approvedRoutes: [] }), /No approved public routes/);
});

test('requires an approved root route', () => {
  assert.throws(() => validatePublicContract({ ...base, approvedRoutes: [{ path: '/studio-hub/', source: 'studio-hub/index.html', status: 'approved' }] }), /must include the root route/);
});

test('rejects internal routes even if marked approved', () => {
  assert.throws(() => validatePublicContract({ ...base, approvedRoutes: [...base.approvedRoutes, { path: '/admin-command-center/', source: 'admin-command-center/index.html', status: 'approved' }] }), /Excluded internal route/);
});

test('accepts only explicitly approved route entries', () => {
  const result = validatePublicContract(base);
  assert.deepEqual(result.routes, ['/']);
});
