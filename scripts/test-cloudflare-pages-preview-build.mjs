import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = fs.readFileSync(path.join(root, 'scripts/cloudflare-pages-preview-build.sh'), 'utf8');

test('Android readiness is reported independently and cannot abort the web preview', () => {
  assert.match(script, /if node scripts\/verify-flutter-android-readiness\.mjs; then[\s\S]*?LINGO_ANDROID_READINESS=PASS[\s\S]*?else[\s\S]*?LINGO_ANDROID_READINESS=BLOCKED_PREVIEW_ONLY[\s\S]*?fi/);
  assert.doesNotMatch(script, /^node scripts\/verify-flutter-android-readiness\.mjs$/m);
});

test('web validation and web build remain required after the Android readiness report', () => {
  const android = script.indexOf('LINGO_STAGE=android_readiness');
  const firebase = script.indexOf('LINGO_STAGE=firebase_contract');
  const web = script.indexOf('flutter build web --release --target=lib/main.dart');
  assert.ok(android >= 0 && firebase > android && web > firebase);
  assert.match(script, /node --test scripts\/test-build-firebase-public\.mjs/);
  assert.match(script, /node scripts\/build-firebase-public\.mjs/);
});

test('the script never produces an Android APK or deploys Firebase Hosting', () => {
  assert.doesNotMatch(script, /flutter build apk|firebase deploy|firebase hosting:channel:deploy/);
  assert.match(script, /LINGO_FIREBASE_HOSTING=QUARANTINED/);
});
