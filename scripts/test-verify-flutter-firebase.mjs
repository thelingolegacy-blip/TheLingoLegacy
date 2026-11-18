import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./verify-flutter-firebase.mjs', import.meta.url));
const placeholderOptions = "projectId: 'lingo-staging-not-configured'; apiKey: 'YOUR_WEB_API_KEY'; appId: 'YOUR_WEB_APP_ID';";
const stagingOptions = "projectId: 'lingo-staging-test'; apiKey: 'test-key'; appId: 'test-app';";

function fixture({ projects = {}, options = placeholderOptions, guarded = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-firebase-contract-'));
  fs.mkdirSync(path.join(root, 'lib'), { recursive: true });
  fs.writeFileSync(path.join(root, '.firebaserc'), JSON.stringify({ projects }));
  fs.writeFileSync(path.join(root, 'lib/firebase_options.dart'), options);
  fs.writeFileSync(path.join(root, 'lib/main.dart'), guarded ? 'if (DefaultFirebaseOptions.isConfigured) { initializeFirebase(); }' : 'initializeFirebase();');
  fs.copyFileSync(script, path.join(root, 'verify-flutter-firebase.mjs'));
  return root;
}

function run(root, stagingId) {
  const env = { ...process.env };
  if (stagingId === undefined) delete env.LINGO_FIREBASE_STAGING_PROJECT_ID;
  else env.LINGO_FIREBASE_STAGING_PROJECT_ID = stagingId;
  return spawnSync(process.execPath, [path.join(root, 'verify-flutter-firebase.mjs')], { cwd: root, encoding: 'utf8', env });
}

test('guarded placeholder configuration passes with no Firebase alias or project connection', (t) => {
  const root = fixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /DISABLED_PLACEHOLDER_CREDENTIALS/);
});

test('unguarded placeholder configuration fails closed', (t) => {
  const root = fixture({ guarded: false });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /runtime initialization guard/);
});

test('production default alias is rejected', (t) => {
  const root = fixture({ projects: { default: 'lingo-legacy-production' } });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /default Firebase project alias is forbidden/);
});

test('production project ID in options is rejected', (t) => {
  const root = fixture({ options: placeholderOptions.replaceAll('lingo-staging-not-configured', 'lingo-legacy-production') });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /production project/);
});

test('approved staging identity must match alias and every platform project ID', (t) => {
  const root = fixture({ projects: { staging: 'lingo-staging-test' }, options: stagingOptions });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root, 'lingo-staging-test');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /FIREBASE_TARGET=staging/);
});

test('staging configuration without explicit identity fails closed', (t) => {
  const root = fixture({ projects: { staging: 'lingo-staging-test' }, options: stagingOptions });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /aliases must remain empty/);
});

test('staging alias mismatch is rejected', (t) => {
  const root = fixture({ projects: { staging: 'other-staging' }, options: stagingOptions });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root, 'lingo-staging-test');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /staging alias must exactly match/);
});

test('production cannot be selected as the staging identity', (t) => {
  const root = fixture({ projects: { staging: 'lingo-legacy-production' }, options: stagingOptions.replaceAll('lingo-staging-test', 'lingo-legacy-production') });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root, 'lingo-legacy-production');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /production project cannot be used/);
});
