import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./build-firebase-public.mjs', import.meta.url));
const approvalRecord = {
  approvedBy: 'test-reviewer',
  approvedAt: '2026-11-17T00:00:00Z',
  changeReference: 'test-fixture',
};

function fixture(files = [], approval = approvalRecord) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-firebase-public-'));
  fs.mkdirSync(path.join(root, 'config/firebase'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  const manifest = {
    schemaVersion: '1.0',
    status: files.length ? 'REVIEWED' : 'QUARANTINED',
    files,
    ...(files.length && approval ? { approvalRecord: approval } : {}),
  };
  fs.writeFileSync(path.join(root, 'config/firebase/hosting-public-manifest.json'), JSON.stringify(manifest));
  fs.copyFileSync(script, path.join(root, 'scripts/build-firebase-public.mjs'));
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [path.join(root, 'scripts/build-firebase-public.mjs'), root], { encoding: 'utf8' });
}

test('quarantined manifest creates only a self-contained noindex 404 page', (t) => {
  const root = fixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  const output = path.join(root, 'build/firebase-public');
  assert.deepEqual(fs.readdirSync(output), ['404.html']);
  assert.match(fs.readFileSync(path.join(output, '404.html'), 'utf8'), /noindex,nofollow/);
});

test('publication manifest symlinks are rejected', (t) => {
  const root = fixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const manifestPath = path.join(root, 'config/firebase/hosting-public-manifest.json');
  const target = path.join(root, 'outside-manifest.json');
  fs.writeFileSync(target, JSON.stringify({ schemaVersion: '1.0', status: 'QUARANTINED', files: [] }));
  fs.rmSync(manifestPath);
  fs.symlinkSync(target, manifestPath);
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must not contain symlinks/);
});

test('manifest rejects traversal and hidden paths', (t) => {
  for (const file of ['../README.md', '.env', 'docs/../README.md']) {
    const root = fixture([file]);
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const result = run(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /invalid manifest path|forbidden publication path/);
  }
});

test('manifest rejects symlinked files', (t) => {
  const root = fixture(['public.html']);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'target.html'), 'secret');
  fs.symlinkSync(path.join(root, 'target.html'), path.join(root, 'public.html'));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /symlink rejected/);
});

test('REVIEWED manifest is rejected even when it carries self-asserted approval metadata', (t) => {
  const root = fixture(['public.html']);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'public.html'), '<h1>Not publishable</h1>');
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /separately approved and verified publisher/);
  assert.equal(fs.existsSync(path.join(root, 'build/firebase-public')), false);
});

test('REVIEWED manifest is rejected when approval metadata is absent', (t) => {
  const root = fixture(['public.html'], null);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'public.html'), '<h1>Not publishable</h1>');
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /separately approved and verified publisher/);
});

test('manifest rejects duplicate allowlist entries', (t) => {
  const root = fixture(['public.html', 'public.html']);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'public.html'), '<h1>Approved</h1>');
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /duplicate manifest paths/);
});

test('manifest rejects source, configuration, map, and credential file types', (t) => {
  for (const file of ['app.js', 'types.d.ts', 'bundle.js.map', 'firebase.json', 'private.pem', 'nested/.env']) {
    const root = fixture([file]);
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const result = run(root);
    assert.equal(result.status, 1, file);
    assert.match(result.stderr, /forbidden publication path/, file);
  }
});

test('manifest rejects symlinked parent directories', (t) => {
  const root = fixture(['linked/public.html']);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'real'));
  fs.writeFileSync(path.join(root, 'real/public.html'), '<h1>Private</h1>');
  fs.symlinkSync(path.join(root, 'real'), path.join(root, 'linked'), 'dir');
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /symlink rejected/);
});

test('nested allowlist publishes only the exact nested file', (t) => {
  const root = fixture(['assets/approved.html']);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'assets'));
  fs.writeFileSync(path.join(root, 'assets/approved.html'), '<h1>Approved</h1>');
  fs.writeFileSync(path.join(root, 'assets/private.html'), '<h1>Private</h1>');
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  const output = path.join(root, 'build/firebase-public');
  assert.deepEqual(fs.readdirSync(path.join(output, 'assets')), ['approved.html']);
  assert.equal(fs.readFileSync(path.join(output, 'assets/approved.html'), 'utf8'), '<h1>Approved</h1>');
});

test('invalid manifest preserves the prior generated output', (t) => {
  const root = fixture(['../blocked.html']);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const output = path.join(root, 'build/firebase-public');
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'sentinel.txt'), 'preserve');
  const result = run(root);
  assert.equal(result.status, 1);
  assert.equal(fs.readFileSync(path.join(output, 'sentinel.txt'), 'utf8'), 'preserve');
});

test('manifest refuses a symlinked build parent without modifying its target', (t) => {
  const root = fixture();
  const external = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-firebase-outside-'));
  t.after(() => {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(external, { recursive: true, force: true });
  });
  fs.writeFileSync(path.join(external, 'sentinel.txt'), 'preserve');
  fs.symlinkSync(external, path.join(root, 'build'), 'dir');
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /build directory must be a real directory/);
  assert.equal(fs.readFileSync(path.join(external, 'sentinel.txt'), 'utf8'), 'preserve');
});
