import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const verifierSource = fileURLToPath(new URL('./verify-release-acceptance.mjs', import.meta.url));
const matrixSource = fileURLToPath(new URL('../release/acceptance-gates.json', import.meta.url));
const baseline = JSON.parse(fs.readFileSync(matrixSource, 'utf8'));

function run(mutator) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-release-acceptance-'));
  fs.mkdirSync(path.join(root, 'release'), { recursive: true });
  fs.copyFileSync(verifierSource, path.join(root, 'verify-release-acceptance.mjs'));
  const matrix = structuredClone(baseline);
  mutator?.(matrix);
  fs.writeFileSync(path.join(root, 'release/acceptance-gates.json'), JSON.stringify(matrix, null, 2));
  const result = spawnSync(process.execPath, [path.join(root, 'verify-release-acceptance.mjs')], {
    cwd: root,
    encoding: 'utf8',
  });
  return { root, result };
}

test('release matrix requires server-authoritative RNG and shared AI rate limiting', (t) => {
  const { root, result } = run();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.equal(result.status, 0, result.stderr);
});

test('missing shared rate limit fails closed', (t) => {
  const { root, result } = run((matrix) => {
    const gate = matrix.gates.find(item => item.id === 'G09');
    gate.requiredEvidence = gate.requiredEvidence.filter(item => item !== 'shared_rate_limit');
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /G09 must require shared_rate_limit/);
});

test('missing server-authoritative RNG fails closed', (t) => {
  const { root, result } = run((matrix) => {
    const gate = matrix.gates.find(item => item.id === 'G07');
    gate.requiredEvidence = gate.requiredEvidence.filter(item => item !== 'server_authoritative_rng');
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /G07 must require server_authoritative_rng/);
});
