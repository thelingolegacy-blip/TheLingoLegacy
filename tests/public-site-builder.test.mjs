import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { normalizeRoute, validatePublicContract, validateHtmlReferences, buildPublicDist } from '../scripts/build-public-dist.mjs';

const base = {
  contract: 'LINGO_PUBLIC_SITE_ROUTES',
  canonicalOrigin: 'https://thelingolegacy.com',
  approvedRoutes: [{ path: '/', source: 'index.html', status: 'approved' }],
  assetFiles: [],
  excludedRoutePrefixes: ['/admin-', '/api/']
};

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-public-builder-'));
  const out = path.join(root, 'dist-public');
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'index.html'), '<!doctype html><a href="/studio-hub/">Hub</a>');
  return { root, out };
}

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
  const result = validatePublicContract({ ...base, approvedRoutes: [{ ...base.approvedRoutes[0] }], assetFiles: ['assets/mark.svg'] });
  assert.deepEqual(result.routes, ['/']);
  assert.deepEqual(result.assets, ['assets/mark.svg']);
});

test('rejects local links outside the approved route and asset sets', () => {
  assert.throws(
    () => validateHtmlReferences('<a href="/admin-command-center/">ops</a>', '/', 'https://thelingolegacy.com', ['/'], []),
    /Unapproved local destination/
  );
});

test('accepts only approved routes and explicitly listed assets', () => {
  assert.doesNotThrow(() => validateHtmlReferences(
    '<a href="/studio-hub/">hub</a><img src="/assets/mark.svg">',
    '/',
    'https://thelingolegacy.com',
    ['/', '/studio-hub/'],
    ['assets/mark.svg']
  ));
});

test('builds an isolated dist containing only approved pages and assets', (t) => {
  const { root, out } = fixture(t);
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(root, 'assets/mark.svg'), '<svg/>');
  fs.writeFileSync(path.join(root, 'private.txt'), 'must not ship');
  fs.writeFileSync(path.join(root, 'index.html'), '<img src="/assets/mark.svg">');
  const result = buildPublicDist(root, out, { ...base, assetFiles: ['assets/mark.svg'] });
  assert.deepEqual(result.routes, ['/']);
  assert.deepEqual(result.assets, ['assets/mark.svg']);
  assert.equal(fs.readFileSync(path.join(out, 'index.html'), 'utf8'), '<img src="/assets/mark.svg">');
  assert.equal(fs.readFileSync(path.join(out, 'assets/mark.svg'), 'utf8'), '<svg/>');
  assert.equal(fs.existsSync(path.join(out, 'private.txt')), false);
  assert.match(fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8'), /https:\/\/thelingolegacy\.com\//);
  assert.match(fs.readFileSync(path.join(out, 'robots.txt'), 'utf8'), /Disallow: \/admin-/);
});

test('validates all local references before replacing an existing output', (t) => {
  const { root, out } = fixture(t);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'keep.txt'), 'existing output');
  assert.throws(() => buildPublicDist(root, out, base), /Unapproved local destination/);
  assert.equal(fs.readFileSync(path.join(out, 'keep.txt'), 'utf8'), 'existing output');
});

test('rejects a symlink as an approved page source', (t) => {
  const { root, out } = fixture(t);
  const target = path.join(root, 'real.html');
  fs.writeFileSync(target, '<p>private</p>');
  fs.rmSync(path.join(root, 'index.html'));
  fs.symlinkSync(target, path.join(root, 'index.html'));
  assert.throws(() => buildPublicDist(root, out, { ...base, approvedRoutes: [{ path: '/', source: 'index.html', status: 'approved' }] }), /Expected regular file/);
});
