import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const verifier = fileURLToPath(new URL('./verify-flutter-firebase.mjs', import.meta.url));
const validEnvironment = {
  FIREBASE_PROJECT_ID: 'lingo-legacy-production',
  FIREBASE_MESSAGING_SENDER_ID: '123456789',
  FIREBASE_AUTH_DOMAIN: 'lingo-legacy-production.firebaseapp.com',
  FIREBASE_DATABASE_URL: 'https://lingo-legacy-production-default-rtdb.firebaseio.com',
  FIREBASE_STORAGE_BUCKET: 'lingo-legacy-production.appspot.com',
  FIREBASE_WEB_API_KEY: 'test-web-api-key',
  FIREBASE_WEB_APP_ID: '1:123456789:web:abcdef',
  FIREBASE_ANDROID_API_KEY: 'test-android-api-key',
  FIREBASE_ANDROID_APP_ID: '1:123456789:android:abcdef',
  FIREBASE_ANDROID_PACKAGE_NAME: 'com.thelingolegacy.app',
  FIREBASE_IOS_API_KEY: 'test-ios-api-key',
  FIREBASE_IOS_APP_ID: '1:123456789:ios:abcdef',
  FIREBASE_IOS_BUNDLE_ID: 'com.thelingolegacy.app',
  FIREBASE_MACOS_API_KEY: 'test-macos-api-key',
  FIREBASE_MACOS_APP_ID: '1:123456789:ios:fedcba',
  FIREBASE_MACOS_BUNDLE_ID: 'com.thelingolegacy.app',
};

function runVerifier(overrides = {}, addLegacyConfig = false) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-firebase-contract-'));
  fs.mkdirSync(path.join(root, 'lib'), { recursive: true });
  fs.mkdirSync(path.join(root, 'android', 'app'), { recursive: true });
  fs.writeFileSync(path.join(root, '.firebaserc'), JSON.stringify({ projects: { default: 'lingo-legacy-production' } }));
  fs.writeFileSync(path.join(root, 'lib', 'firebase_options.dart'), "String.fromEnvironment('FIREBASE_PROJECT_ID'); String.fromEnvironment('FIREBASE_WEB_API_KEY');");
  fs.writeFileSync(path.join(root, 'android', 'app', 'build.gradle'), 'applicationId "com.thelingolegacy.app"');
  if (addLegacyConfig) fs.writeFileSync(path.join(root, 'firebase.client.json'), '{}');
  const result = spawnSync(process.execPath, [verifier], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...validEnvironment, ...overrides },
  });
  fs.rmSync(root, { recursive: true, force: true });
  return result;
}

test('accepts complete Firebase configuration aligned with native app IDs', () => {
  const result = runVerifier();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /FLUTTER_FIREBASE_CONTRACT=PASS/);
});

test('fails closed when a required Firebase repository variable is missing', () => {
  const result = runVerifier({ FIREBASE_WEB_APP_ID: '' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /FIREBASE_WEB_APP_ID/);
});

test('rejects Android package ID drift', () => {
  const result = runVerifier({ FIREBASE_ANDROID_PACKAGE_NAME: 'com.example.wrong' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /applicationId/);
});

test('rejects an unexpected project ID', () => {
  const result = runVerifier({ FIREBASE_PROJECT_ID: 'another-project' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /does not match the selected Firebase project/);
});

test('rejects the retired generated client config file', () => {
  const result = runVerifier({}, true);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Remove firebase.client.json/);
});
