import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./verify-flutter-android-readiness.mjs', import.meta.url));
const pins = {
  firebase_core: '2.32.0',
  firebase_auth: '4.20.0',
  firebase_database: '10.5.7',
  firebase_storage: '11.7.7',
  firebase_analytics: '10.10.7',
};
function fixture({ minSdk = 21, overrides = {}, complete = true, flutterPlugin = true, activity = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-android-readiness-'));
  const write = (file, content = 'fixture') => {
    const full = path.join(root, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  };
  write('pubspec.yaml', 'dependencies:\n' + Object.entries({ ...pins, ...overrides }).map(([name, version]) => `  ${name}: ${version}`).join('\n') + '\n');
  write('android/app/build.gradle.kts', `plugins { id("com.android.application") ${flutterPlugin ? 'id("dev.flutter.flutter-gradle-plugin")' : ''} }\nandroid { namespace = "com.thelingolegacy.app"; defaultConfig { applicationId = "com.thelingolegacy.app"; minSdk = ${minSdk} } }\n`);
  if (complete) {
    write('android/gradle/wrapper/gradle-wrapper.properties');
    write('android/settings.gradle.kts');
    write('android/build.gradle.kts');
    write('android/app/src/main/AndroidManifest.xml');
    write('android/app/src/main/res/values/styles.xml');
    write('android/app/src/main/res/values-night/styles.xml');
  }
  if (activity) write('android/app/src/main/kotlin/com/thelingolegacy/app/MainActivity.kt');
  return root;
}
function run(root) { return spawnSync(process.execPath, [script, root], { encoding: 'utf8' }); }

test('Android readiness passes with tracked Flutter scaffold and API-21 Firebase pins', (t) => {
  const root = fixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /FLUTTER_ANDROID_READINESS=PASS/);
  assert.match(result.stdout, /ANDROID_MIN_SDK=21/);
});

test('Firebase Core 5.x is rejected by the API-21 compatibility contract', (t) => {
  const root = fixture({ overrides: { firebase_core: '5.0.0' } });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /firebase_core must be pinned exactly to 2.32.0/);
});

test('a raised Android minimum is rejected', (t) => {
  const root = fixture({ minSdk: 24 });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /minSdk must remain exactly 21/);
});

test('missing tracked Android Gradle scaffold fails closed', (t) => {
  const root = fixture({ complete: false });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Gradle scaffold is incomplete/);
});

test('missing Flutter Gradle plugin fails closed', (t) => {
  const root = fixture({ flutterPlugin: false });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Flutter Gradle plugin is missing/);
});

test('missing native Flutter entry activity fails closed', (t) => {
  const root = fixture({ activity: false });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /MainActivity.kt/);
});
