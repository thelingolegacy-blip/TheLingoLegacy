import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const verifier = fileURLToPath(new URL('./verify-firebase-hosting.mjs', import.meta.url));

function runVerifier(publicDir = 'build/web', createEntrypoint = true) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-firebase-hosting-'));
  fs.writeFileSync(path.join(root, 'firebase.json'), JSON.stringify({ hosting: { public: publicDir } }));
  if (createEntrypoint) {
    const target = path.resolve(root, publicDir);
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(path.join(target, 'index.html'), '<!doctype html><title>Flutter</title>');
  }
  const result = spawnSync(process.execPath, [verifier], { cwd: root, encoding: 'utf8' });
  fs.rmSync(root, { recursive: true, force: true });
  return result;
}

test('accepts only the generated Flutter web artifact directory', () => {
  const result = runVerifier();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /FIREBASE_HOSTING_PUBLISH_BOUNDARY=PASS/);
});

test('rejects publishing the repository root', () => {
  const result = runVerifier('.');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /only build\/web/);
});

test('rejects path traversal outside the repository', () => {
  const result = runVerifier('../outside');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /only build\/web/);
});

test('rejects missing Flutter web entrypoint', () => {
  const result = runVerifier('build/web', false);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /missing build\/web\/index.html/);
});
