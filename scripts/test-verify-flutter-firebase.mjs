import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./verify-flutter-firebase.mjs', import.meta.url));

function fixture({ projects = {}, options = 'projectId: "lingo-staging-test"; apiKey: "TEST_ONLY_API_KEY"; appId: "TEST_ONLY_APP_ID";' } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-firebase-contract-'));
  fs.mkdirSync(path.join(root, 'lib'), { recursive: true });
  fs.writeFileSync(path.join(root, '.firebaserc'), JSON.stringify({ projects }));
  fs.writeFileSync(path.join(root, 'lib/firebase_options.dart'), options);
  fs.copyFileSync(script, path.join(root, 'verify-flutter-firebase.mjs'));
  return root;
}

function run(root, stagingId) {
  const env = { ...process.env };
  if (stagingId === undefined) delete env.LINGO_FIREBASE_STAGING_PROJECT_ID;
  else env.LINGO_FIREBASE_STAGING_PROJECT_ID = stagingId;
  return spawnSync(process.execPath, [path.join(root, 'verify-flutter-firebase.mjs')], {
    cwd: root,
    encoding: 'utf8',
    env,
  });
}

test('missing staging identity fails closed', (t) => {
  const root = fixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /staging identity has not been approved/);
});

test('production default alias is rejected', (t) => {
  const root = fixture({ projects: { default: 'lingo-legacy-production', staging: 'lingo-staging-test' } });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root, 'lingo-staging-test');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /default Firebase project alias is forbidden/);
  assert.match(result.stderr, /production Firebase project must not appear/);
});

test('production project ID in Firebase options is rejected', (t) => {
  const root = fixture({
    projects: { staging: 'lingo-staging-test' },
    options: 'projectId: "lingo-legacy-production"; apiKey: "TEST_ONLY_API_KEY";',
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root, 'lingo-staging-test');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Firebase options still reference the production project/);
});

test('staging alias must match the approved environment identity', (t) => {
  const root = fixture({ projects: { staging: 'different-staging-project' } });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root, 'lingo-staging-test');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /staging alias must exactly match/);
});

test('Firebase options project IDs must match the approved staging identity', (t) => {
  const root = fixture({
    projects: { staging: 'lingo-staging-test' },
    options: 'projectId: "different-staging-project"; apiKey: "TEST_ONLY_API_KEY";',
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root, 'lingo-staging-test');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Every Firebase options projectId must exactly match/);
});

test('placeholder Firebase options are rejected', (t) => {
  const root = fixture({
    projects: { staging: 'lingo-staging-test' },
    options: 'projectId: "lingo-staging-test"; apiKey: "YOUR_WEB_API_KEY"; appId: "YOUR_WEB_APP_ID";',
  });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root, 'lingo-staging-test');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Firebase configuration placeholders remain/);
});

test('valid staging identity and non-placeholder options pass', (t) => {
  const root = fixture({ projects: { staging: 'lingo-staging-test' } });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root, 'lingo-staging-test');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /FLUTTER_FIREBASE_CONTRACT=PASS/);
  assert.match(result.stdout, /FIREBASE_TARGET=staging/);
});
