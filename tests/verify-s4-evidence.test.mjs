import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

function run(root) {
  return execFileSync(process.execPath, ['scripts/verify-s4-evidence.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, S4_EVIDENCE_ROOT: root },
    encoding: 'utf8'
  });
}

function seed(root, overrides = {}) {
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, '.lkg_release_authorization.json'), JSON.stringify({
    releaseVersion:'v-staging',
    commitSha:'a'.repeat(40),
    buildDigest:'sha256:'+'b'.repeat(64),
    signature:'c'.repeat(64),
    createdAt:new Date().toISOString(),
    ...overrides.auth
  }));
  fs.writeFileSync(path.join(root, '.lkg_journal.json'), JSON.stringify({
    phase:'ROLLED_BACK',
    authorization:{releaseVersion:'v-staging',commitSha:'a'.repeat(40),buildDigest:'sha256:'+'b'.repeat(64),signatureVerified:true},
    baselines:{workerVersionId:'w1',firebaseHostingVersionId:'f1',cloudRunRevision:'r1',capturedAt:new Date().toISOString()},
    ...overrides.journal
  }));
  fs.writeFileSync(path.join(root, 'staging-forced-failure.log'),
    'ROLLBACK_REQUIRED\nROLLING_BACK\nWorker rollback\nCloud Run rollback\nFirebase clone rollback\nROLLBACK COMPLETE\nROLLED_BACK\n');
  fs.writeFileSync(path.join(root, 'staging-clean-activation.log'),
    'POST_MUTATION_VERIFY\nPROMOTED\nPOST_PROMOTION_VERIFY\nACTIVATED\n');
}

test('accepts complete structural S4 bundle', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's4-'));
  seed(root);
  const out = run(root);
  assert.match(out, /"status": "PASS"/);
});

test('blocks truncated authorization signature', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's4-'));
  seed(root, {auth:{signature:'deadbeef'}});
  assert.throws(() => run(root));
});

test('blocks missing rollback markers', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's4-'));
  seed(root);
  fs.writeFileSync(path.join(root, 'staging-forced-failure.log'), 'ROLLING_BACK\n');
  assert.throws(() => run(root));
});

test('blocks nonterminal journal state', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's4-'));
  seed(root, {journal:{phase:'MUTATING'}});
  assert.throws(() => run(root));
});
