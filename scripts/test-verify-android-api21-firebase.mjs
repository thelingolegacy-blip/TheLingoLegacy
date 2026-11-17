import test from 'node:test';
import assert from 'node:assert/strict';
import { FIREBASE_ANDROID_API21_VERSIONS, verifyAndroidApi21FirebaseContract } from './verify-android-api21-firebase.mjs';

const pubspec = Object.entries(FIREBASE_ANDROID_API21_VERSIONS)
  .map(([name, version]) => `  ${name}: ${version}`)
  .join('\\n');
const gradle = `android {\\n  defaultConfig {\\n    minSdk 21\\n  }\\n}\\n`;

test('accepts the pinned Firebase set with Android minSdk 21', () => {
  assert.deepEqual(verifyAndroidApi21FirebaseContract(pubspec, gradle), { ok: true, errors: [] });
});

test('rejects Firebase Core 5.x', () => {
  const result = verifyAndroidApi21FirebaseContract(pubspec.replace('firebase_core: 2.32.0', 'firebase_core: 5.0.0'), gradle);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /firebase_core must be pinned exactly/);
});

test('rejects Firebase Auth 5.x', () => {
  const result = verifyAndroidApi21FirebaseContract(pubspec.replace('firebase_auth: 4.20.0', 'firebase_auth: 5.0.0'), gradle);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /firebase_auth must be pinned exactly/);
});

test('rejects a raised Android minimum', () => {
  const result = verifyAndroidApi21FirebaseContract(pubspec, gradle.replace('minSdk 21', 'minSdk 24'));
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /minSdk must remain 21/);
});

test('rejects floating dependency constraints', () => {
  const result = verifyAndroidApi21FirebaseContract(pubspec.replace('firebase_database: 10.5.7', 'firebase_database: ^10.5.7'), gradle);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /firebase_database must be pinned exactly/);
});

test('rejects duplicate minSdk declarations', () => {
  const result = verifyAndroidApi21FirebaseContract(pubspec, gradle.replace('minSdk 21', 'minSdk 21\\n    minSdkVersion 21'));
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /exactly one explicit numeric Android minSdk/);
});
