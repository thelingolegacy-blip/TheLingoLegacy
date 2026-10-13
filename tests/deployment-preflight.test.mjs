import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('deployment preflight is read-only and checks canonical routing', () => {
  const source = read('scripts/deployment-preflight.mjs');
  assert.match(source, /mode: 'read-only'/);
  assert.match(source, /deploymentPerformed: false/);
  assert.match(source, /productionMutationPerformed: false/);
  assert.match(source, /thelingolegacy\.com\/\*/);
  assert.match(source, /www\.thelingolegacy\.com\/\*/);
});

test('preflight requires source exclusions when assets publish from repository root', () => {
  const source = read('scripts/deployment-preflight.mjs');
  assert.match(source, /asset directory drift/);
  assert.match(source, /\.assetsignore is required/);
  assert.match(source, /missing required exclusion/);
});

test('evidence writer cannot claim test acceptance or production authorization', () => {
  const source = read('scripts/write-quality-evidence.mjs');
  assert.match(source, /RUN_METADATA_CAPTURED_TEST_OUTCOME_REQUIRES_GITHUB_JOB_RECORDS/);
  assert.match(source, /productionPromotionAuthorized: false/);
  assert.match(source, /g02AcceptanceGranted: false/);
  assert.match(source, /deploymentPerformed: false/);
});
