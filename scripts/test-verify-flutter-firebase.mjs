import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const verifier = path.join(here, 'verify-flutter-firebase.mjs');
const tempRoots = [];

function validOptions() {
  const platforms = ['web', 'android', 'ios', 'macos'];
  return platforms.map((platform) => '  static const FirebaseOptions ' + platform + ' = FirebaseOptions(\n' +
    "    apiKey: 'AIzaValid" + platform + "Key',\n" +
    "    appId: '1:123456789:web:" + platform + "hash',\n" +
    "    messagingSenderId: '123456789',\n" +
    "    projectId: 'lingo-legacy-production',\n" +
    '  );').join('\n\n');
}

function fixture(source = validOptions(), projectId = 'lingo-legacy-production') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lingo-firebase-contract-'));
  tempRoots.push(root);
  fs.mkdirSync(path.join(root, 'lib'));
  fs.writeFileSync(path.join(root, '.firebaserc'), JSON.stringify({ projects: { default: projectId } }));
  fs.writeFileSync(path.join(root, 'lib', 'firebase_options.dart'), source);
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [verifier], { cwd: root, encoding: 'utf8' });
}

after(() => {
  for (const root of tempRoots) fs.rmSync(root, { recursive: true, force: true });
});

test('accepts complete, non-placeholder configuration for all supported platforms', () => {
  const result = run(fixture());
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /FLUTTER_FIREBASE_CONTRACT=PASS/);
  assert.match(result.stdout, /FIREBASE_PLATFORM_CONFIGS=web,android,ios,macos/);
});

test('rejects placeholder values without printing configured API keys', () => {
  const source = validOptions().replace("apiKey: 'AIzaValidwebKey'", "apiKey: 'YOUR_WEB_API_KEY'");
  const result = run(fixture(source));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /YOUR_WEB_API_KEY/);
  assert.doesNotMatch(result.stdout + result.stderr, /AIzaValid/);
});

test('rejects a missing platform declaration', () => {
  const source = validOptions().replace(/  static const FirebaseOptions macos = FirebaseOptions\([\s\S]*?\);\n?/, '');
  const result = run(fixture(source));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing FirebaseOptions declaration for macos/);
});

test('rejects a platform project mismatch', () => {
  const source = validOptions().replace(
    "projectId: 'lingo-legacy-production',\n  );\n\n  static const FirebaseOptions android",
    "projectId: 'wrong-project',\n  );\n\n  static const FirebaseOptions android",
  );
  const result = run(fixture(source));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /web\.projectId does not match/);
});

test('rejects missing required platform fields', () => {
  const source = validOptions().replace("    appId: '1:123456789:web:androidhash',\n", '');
  const result = run(fixture(source));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /android\.appId is missing/);
});

test('rejects a wrong default Firebase project', () => {
  const result = run(fixture(validOptions(), 'other-project'));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /\.firebaserc must select lingo-legacy-production/);
});

test('rejects duplicate platform declarations', () => {
  const source = validOptions() + '\n\n' + validOptions().split('\n\n')[0];
  const result = run(fixture(source));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Duplicate FirebaseOptions declaration for web/);
});
