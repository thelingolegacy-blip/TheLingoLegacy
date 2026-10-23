import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const verifier = fileURLToPath(new URL('./sanitize-cloudflare-only-surface.mjs', import.meta.url));

function run(source) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cloudflare-surface-readonly-'));
  const file = path.join(root, 'index.html');
  fs.writeFileSync(file, source);
  const result = spawnSync(process.execPath, [verifier], { cwd: root, encoding: 'utf8', timeout: 10000 });
  const after = fs.readFileSync(file, 'utf8');
  fs.rmSync(root, { recursive: true, force: true });
  return { result, after };
}

test('Cloudflare-only surface gate passes clean HTML without modifying it', () => {
  const source = '<!doctype html><html><body>Cloudflare Worker</body></html>';
  const { result, after } = run(source);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(after, source);
  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, 'read-only');
  assert.equal(report.changed, 0);
  assert.equal(report.status, 'PASS');
});

test('Cloudflare-only surface gate fails on retired analytics without modifying source', () => {
  const source = '<!doctype html><script defer src="/_vercel/insights/script.js"></script>';
  const { result, after } = run(source);
  assert.equal(result.status, 1);
  assert.equal(after, source);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'FAIL');
  assert.equal(report.failures.length, 1);
});
