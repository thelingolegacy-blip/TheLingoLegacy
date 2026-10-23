import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const verifier = fileURLToPath(new URL('./verify-legacy-gateway-security.mjs', import.meta.url));
const safeSource = [
  "Token verification is not configured",
  "Authentication provider is not configured.",
  "verified: false, error: 'Identity verification is not configured.'",
  "parsedOrigin.protocol === 'https:' && firstParty",
  "'Vary': 'Origin'",
].join('\n');

function run(source) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-gateway-security-'));
  fs.writeFileSync(path.join(root, 'gateway-router.js'), source);
  const result = spawnSync(process.execPath, [verifier], {
    cwd: root,
    encoding: 'utf8',
    timeout: 10000,
  });
  fs.rmSync(root, { recursive: true, force: true });
  return result;
}

test('legacy gateway security guard accepts fail-closed auth and scoped CORS', () => {
  const result = run(safeSource);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'PASS');
  assert.deepEqual(report.failures, []);
});

test('legacy gateway security guard rejects placeholder auth and wildcard CORS', () => {
  const result = run(safeSource + "\nreturn { valid: true, token };\ntoken: 'placeholder';\nhttps://*.thelingolegacy.com");
  assert.equal(result.status, 1);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'FAIL');
  assert.ok(report.failures.length >= 3);
});
