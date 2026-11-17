import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./verify-flutter-android-readiness.mjs', import.meta.url));
function fixture({ minSdk = 24, firebaseCore = '5.2.0', complete = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-android-readiness-'));
  fs.mkdirSync(path.join(root, 'android/app/src/main'), { recursive: true });
  fs.mkdirSync(path.join(root, 'android/gradle/wrapper'), { recursive: true });
  fs.writeFileSync(path.join(root, 'pubspec.yaml'), `dependencies:\n  firebase_core: ^${firebaseCore}\n`);
  fs.writeFileSync(path.join(root, 'android/app/build.gradle'), `plugins { id "com.android.application"; id "dev.flutter.flutter-gradle-plugin" }\nandroid { defaultConfig { minSdk ${minSdk} } }\n`);
  fs.writeFileSync(path.join(root, 'android/app/src/main/AndroidManifest.xml'), '<manifest/>');
  const activity = path.join(root, 'android/app/src/main/kotlin/com/thelingolegacy/app/MainActivity.kt');
  fs.mkdirSync(path.dirname(activity), { recursive: true });
  fs.writeFileSync(activity, 'package com.thelingolegacy.app\\nclass MainActivity : FlutterActivity()\\n');
  if (complete) {
    for (const file of ['android/gradlew', 'android/gradle/wrapper/gradle-wrapper.jar', 'android/gradle/wrapper/gradle-wrapper.properties', 'android/settings.gradle', 'android/build.gradle']) {
      const full = path.join(root, file);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, 'test');
    }
  }
  return root;
}
function run(root) { return spawnSync(process.execPath, [script, root], { encoding: 'utf8' }); }

test('Android readiness passes only with complete scaffold and compatible minSdk', (t) => {
  const root = fixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /FLUTTER_ANDROID_READINESS=PASS/);
});

test('Firebase Core 5.x rejects minSdk below 24', (t) => {
  const root = fixture({ minSdk: 21 });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /requires Android minSdk 24/);
});

test('missing Android Gradle scaffold fails closed', (t) => {
  const root = fixture({ complete: false });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Gradle scaffold is incomplete/);
});

test('missing Flutter Gradle plugin fails closed', (t) => {
  const root = fixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'android/app/build.gradle'), 'plugins { id "com.android.application" }\nandroid { defaultConfig { minSdk 24 } }\n');
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /does not apply the Flutter Gradle plugin/);
});


test('missing native Flutter entry activity fails closed', (t) => {
  const root = fixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.rmSync(path.join(root, 'android/app/src/main/kotlin/com/thelingolegacy/app/MainActivity.kt'));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /MainActivity.kt/);
});
