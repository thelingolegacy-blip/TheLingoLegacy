import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { verifyDetachedEvidence } from './verify-detached-evidence.mjs';

const nowMs = Date.parse('2026-10-16T16:00:00.000Z');
const sha = 'a'.repeat(40);
const workflowSha = 'b'.repeat(40);
const expected = {
  repository: 'thelingolegacy-blip/TheLingoLegacy',
  repositoryId: '1279436411',
  candidateSha: sha,
  workflowPath: '.github/workflows/ir06-detached-evidence-isolated.yml',
  workflowRef: 'refs/heads/main',
  workflowRevisionSha: workflowSha,
  runId: '123456789',
  runAttempt: '1'
};

async function fixture(t, changes = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'lingo-detached-evidence-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const summary = {
    schemaVersion: 'ir06-isolated-test-run/0.1',
    ...expected,
    nodeVersion: 'v22.16.0',
    testCommand: 'node --test scripts/verify-ir-readiness.test.mjs scripts/verify-detached-evidence.test.mjs',
    exitCode: 0,
    capturedAt: '2026-10-16T15:45:00Z',
    trustStatus: 'UNTRUSTED_CANDIDATE_JOB_NO_ATTESTATION',
    ...changes
  };
  await writeFile(path.join(root, 'run-summary.json'), JSON.stringify(summary, null, 2));
  await writeFile(path.join(root, 'test-stdout.log'), 'tests passed\n');
  await writeFile(path.join(root, 'test-stderr.log'), '');
  const names = ['run-summary.json', 'test-stdout.log', 'test-stderr.log'];
  const entries = [];
  for (const name of names) {
    const bytes = await readFile(path.join(root, name));
    entries.push(`${createHash('sha256').update(bytes).digest('hex')}  ${name}`);
  }
  await writeFile(path.join(root, 'SHA256SUMS'), entries.join('\n') + '\n');
  return { root, summary };
}

test('accepts exact identity and intact diagnostic bundle but never authorizes release', async (t) => {
  const f = await fixture(t);
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, true, result.failures.join('\n'));
  assert.equal(result.releaseAuthorized, false);
  assert.match(result.trustBoundary, /INDEPENDENT_SIGNATURE_AND_APPROVAL/);
});

test('blocks wrong candidate SHA (replay/substitution)', async (t) => {
  const f = await fixture(t);
  const result = await verifyDetachedEvidence(f.root, { ...expected, candidateSha: 'c'.repeat(40) }, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /candidateSha does not match/);
});

test('blocks wrong immutable repository ID', async (t) => {
  const f = await fixture(t, { repositoryId: '999999999' });
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /repositoryId does not match/);
});

test('blocks workflow identity substitution', async (t) => {
  const f = await fixture(t, { workflowPath: '.github/workflows/attacker.yml' });
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /workflowPath does not match/);
});

test('blocks workflow revision substitution', async (t) => {
  const f = await fixture(t, { workflowRevisionSha: 'c'.repeat(40) });
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /workflowRevisionSha does not match/);
});

test('blocks unsuccessful candidate test result', async (t) => {
  const f = await fixture(t, { exitCode: 1 });
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /exitCode must be integer 0/);
});

test('blocks stale evidence', async (t) => {
  const f = await fixture(t, { capturedAt: '2026-10-14T00:00:00Z' });
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /stale/);
});

test('blocks future-dated evidence', async (t) => {
  const f = await fixture(t, { capturedAt: '2026-10-16T16:10:00Z' });
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /future clock skew/);
});

test('blocks tampered artifact bytes', async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.root, 'test-stdout.log'), 'forged PASS\n');
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /SHA-256 mismatch/);
});

test('blocks unlisted or extra files', async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.root, 'extra.json'), '{}');
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /file set does not exactly match/);
});

test('blocks missing digest manifest', async (t) => {
  const f = await fixture(t);
  await rm(path.join(f.root, 'SHA256SUMS'));
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /Cannot read SHA256SUMS/);
});

test('blocks malformed digest paths', async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.root, 'SHA256SUMS'), `${'0'.repeat(64)}  ../outside.txt\n`);
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /malformed entry or unsafe path/);
});

test('blocks run-attempt replay', async (t) => {
  const f = await fixture(t, { runAttempt: '2' });
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /runAttempt does not match/);
});

test('blocks plaintext trust escalation', async (t) => {
  const f = await fixture(t, { trustStatus: 'ATTESTED_AND_APPROVED' });
  const result = await verifyDetachedEvidence(f.root, expected, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /explicitly marked untrusted/);
});

test('blocks malformed expected identity rather than guessing', async (t) => {
  const f = await fixture(t);
  const result = await verifyDetachedEvidence(f.root, { ...expected, workflowRevisionSha: 'not-a-sha' }, { nowMs });
  assert.equal(result.structurallyValid, false);
  assert.match(result.failures.join('\n'), /Expected workflow revision/);
});
