import fs from 'node:fs';
import path from 'node:path';

const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const expectedProjectId = 'lingo-legacy-production';
const projectId = firebaseRc?.projects?.default;
if (projectId !== expectedProjectId) {
  throw new Error('Firebase project mismatch: expected the canonical project ID.');
}

const source = fs.readFileSync('lib/firebase_options.dart', 'utf8');
const requiredDefines = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_WEB_API_KEY',
  'FIREBASE_WEB_APP_ID',
  'FIREBASE_ANDROID_API_KEY',
  'FIREBASE_ANDROID_APP_ID',
  'FIREBASE_IOS_API_KEY',
  'FIREBASE_IOS_APP_ID',
  'FIREBASE_IOS_BUNDLE_ID',
  'FIREBASE_MACOS_API_KEY',
  'FIREBASE_MACOS_APP_ID',
  'FIREBASE_MACOS_BUNDLE_ID',
];
if (source.includes('YOUR_')) throw new Error('Firebase source still contains placeholder configuration.');
for (const key of requiredDefines) {
  if (!source.includes(`String.fromEnvironment('${key}')`)) {
    throw new Error(`Firebase compile-time define is not consumed by the Flutter app: ${key}`);
  }
}

const raw = process.env.FIREBASE_OPTIONS_JSON;
if (!raw) throw new Error('FIREBASE_OPTIONS_JSON is missing; configure the canonical Firebase app options before CI builds.');
let options;
try { options = JSON.parse(raw); } catch { throw new Error('FIREBASE_OPTIONS_JSON is not valid JSON.'); }
if (options.FIREBASE_PROJECT_ID !== expectedProjectId) {
  throw new Error('Firebase runtime options do not target the canonical project.');
}
for (const key of requiredDefines) {
  if (typeof options[key] !== 'string' || !options[key].trim() || options[key].startsWith('YOUR_')) {
    throw new Error(`Firebase runtime option is missing or invalid: ${key}`);
  }
}
const outputPath = process.env.FIREBASE_DART_DEFINES_PATH;
if (!outputPath || !path.isAbsolute(outputPath)) {
  throw new Error('FIREBASE_DART_DEFINES_PATH must be an absolute temporary path.');
}
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(options), { mode: 0o600, flag: 'w' });
console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
console.log('FIREBASE_PROJECT_ID=' + expectedProjectId);
console.log('FIREBASE_DART_DEFINES_FILE=STAGED_TEMPORARILY');
