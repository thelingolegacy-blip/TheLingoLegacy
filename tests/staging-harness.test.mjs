import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const scripts = [
  'scripts/staging-target-guard.sh',
  'scripts/run-forced-failure-staging.sh',
  'scripts/run-clean-staging-activation.sh'
];

for (const file of scripts) {
  test(file + ' exists and is fail-closed', () => {
    const s = fs.readFileSync(file, 'utf8');
    assert.ok(s.includes('set -euo pipefail'));
    assert.ok(s.includes('STAGING_ENV'));
    assert.ok(s.includes('STAGING_MUTATION_CONFIRM'));
  });
}

test('forced-failure harness requires explicit failure injection and rollback verification', () => {
  const s = fs.readFileSync('scripts/run-forced-failure-staging.sh', 'utf8');
  for (const marker of ['STAGING_FAILURE_INJECTION_CMD','ROLLBACK_REQUIRED','ROLLING_BACK','ROLLBACK COMPLETE','ROLLED_BACK']) {
    assert.ok(s.includes(marker), marker);
  }
});

test('clean harness verifies authorization before mutation and rolls back on failure', () => {
  const s = fs.readFileSync('scripts/run-clean-staging-activation.sh', 'utf8');
  assert.ok(s.includes('STAGING_VERIFY_AUTH_CMD'));
  assert.ok(s.includes('rollback_needed=1'));
  assert.ok(s.includes('POST_MUTATION_VERIFY'));
  assert.ok(s.includes('POST_PROMOTION_VERIFY'));
});
