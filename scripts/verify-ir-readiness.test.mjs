import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { verifyReadinessManifest, REQUIRED_IR_ITEMS } from './verify-ir-readiness.mjs';

const commitSha = 'a'.repeat(40);
const nowMs = Date.parse('2026-10-16T15:00:00.000Z');

async function fixture(t, overrides = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'lingo-ir-gate-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const evidenceDir = path.join(root, 'artifacts');
  await mkdir(evidenceDir);
  const bytes = Buffer.from('independent test evidence\n');
  const evidencePath = path.join(evidenceDir, 'sample.txt');
  await writeFile(evidencePath, bytes);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const items = Object.fromEntries(REQUIRED_IR_ITEMS.map((id) => [id, {
    status: 'PASS',
    reviewerAcceptance: { reviewer: 'independent-reviewer', acceptedAt: '2026-10-16T14:00:00.000Z' },
    evidence: [{ path: 'artifacts/sample.txt', sha256 }]
  }]));
  const manifest = {
    schemaVersion: '1.0',
    source: { repository: 'thelingolegacy-blip/TheLingoLegacy', commitSha },
    generatedAt: '2026-10-16T14:30:00.000Z',
    items,
    ...overrides
  };
  const manifestPath = path.join(root, 'ir-evidence.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return { root, manifest, manifestPath, evidencePath, sha256 };
}

test('accepts complete, fresh, exact-commit evidence with verified artifact hashes', async (t) => {
  const f = await fixture(t);
  const result = await verifyReadinessManifest(f.manifestPath, commitSha, { nowMs });
  assert.equal(result.ok, true, result.failures.join('\n'));
});

test('blocks missing manifest', async (t) => {
  const f = await fixture(t);
  const result = await verifyReadinessManifest(path.join(f.root, 'missing.json'), commitSha, { nowMs });
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /Cannot read valid JSON manifest/);
});

test('blocks stale evidence', async (t) => {
  const f = await fixture(t, { generatedAt: '2026-10-14T00:00:00.000Z' });
  const result = await verifyReadinessManifest(f.manifestPath, commitSha, { nowMs });
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /manifest is stale/);
});

test('blocks source commit mismatch', async (t) => {
  const f = await fixture(t);
  const result = await verifyReadinessManifest(f.manifestPath, 'b'.repeat(40), { nowMs });
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /does not match the exact source commit/);
});

test('blocks any non-PASS audit item', async (t) => {
  const f = await fixture(t);
  f.manifest.items['IR-04'].status = 'UNVERIFIED';
  await writeFile(f.manifestPath, JSON.stringify(f.manifest));
  const result = await verifyReadinessManifest(f.manifestPath, commitSha, { nowMs });
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /IR-04 status must be PASS/);
});

test('blocks missing audit item', async (t) => {
  const f = await fixture(t);
  delete f.manifest.items['IR-02'];
  await writeFile(f.manifestPath, JSON.stringify(f.manifest));
  const result = await verifyReadinessManifest(f.manifestPath, commitSha, { nowMs });
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /IR-02 is missing/);
});

test('blocks altered evidence artifact bytes', async (t) => {
  const f = await fixture(t);
  await writeFile(f.evidencePath, 'altered evidence\n');
  const result = await verifyReadinessManifest(f.manifestPath, commitSha, { nowMs });
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /SHA-256 does not match artifact bytes/);
});

test('blocks absent reviewer acceptance', async (t) => {
  const f = await fixture(t);
  f.manifest.items['IR-01'].reviewerAcceptance = null;
  await writeFile(f.manifestPath, JSON.stringify(f.manifest));
  const result = await verifyReadinessManifest(f.manifestPath, commitSha, { nowMs });
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /requires a named reviewer acceptance/);
});
