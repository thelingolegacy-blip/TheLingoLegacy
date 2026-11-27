import fs from 'node:fs';

const expectedProjectId = 'lingo-legacy-staging';
const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const projectId = firebaseRc?.projects?.default;

if (projectId !== expectedProjectId) {
  throw new Error(`Firebase project mismatch: expected ${expectedProjectId}, got ${projectId || 'missing'}`);
}

const source = fs.readFileSync('lib/firebase_options.dart', 'utf8');
const requiredDefines = [
  'LINGO_FIREBASE_MESSAGING_SENDER_ID',
  'LINGO_FIREBASE_WEB_API_KEY',
  'LINGO_FIREBASE_WEB_APP_ID',
  'LINGO_FIREBASE_ANDROID_API_KEY',
  'LINGO_FIREBASE_ANDROID_APP_ID',
  'LINGO_FIREBASE_IOS_API_KEY',
  'LINGO_FIREBASE_IOS_APP_ID',
  'LINGO_FIREBASE_MACOS_API_KEY',
  'LINGO_FIREBASE_MACOS_APP_ID',
];

if (source.includes('lingo-legacy-production')) {
  throw new Error('Production Firebase project ID must not appear in staging client options.');
}
if (source.includes('YOUR_')) {
  throw new Error('Firebase placeholder tokens remain in client options.');
}
for (const define of requiredDefines) {
  if (!source.includes(`String.fromEnvironment('${define}'`)) {
    throw new Error(`Missing compile-time Firebase define: ${define}`);
  }
}

if (process.argv.includes('--require-runtime-config')) {
  const missing = requiredDefines.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Staging Firebase build configuration is incomplete: ${missing.join(', ')}`);
  }
}

console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
console.log(`FIREBASE_PROJECT_ID=${expectedProjectId}`);
console.log('FIREBASE_CONFIG_MODE=BUILD_TIME_STAGING_INJECTION');
