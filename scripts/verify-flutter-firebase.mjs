import fs from 'node:fs';

const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const projectId = firebaseRc?.projects?.default;
if (projectId !== 'lingo-legacy-production') {
  throw new Error(`Firebase project mismatch: expected lingo-legacy-production, got ${projectId || 'missing'}`);
}

const source = fs.readFileSync('lib/firebase_options.dart', 'utf8');
const requiredDefines = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_WEB_API_KEY',
  'FIREBASE_WEB_APP_ID',
  'FIREBASE_ANDROID_API_KEY',
  'FIREBASE_ANDROID_APP_ID',
  'FIREBASE_IOS_API_KEY',
  'FIREBASE_IOS_APP_ID',
  'FIREBASE_MACOS_API_KEY',
  'FIREBASE_MACOS_APP_ID',
];
const missingWiring = requiredDefines.filter((name) => !source.includes(name));
if (missingWiring.length) {
  throw new Error(`Flutter Firebase build defines are not wired: ${missingWiring.join(', ')}`);
}

const requiredRuntimeValues = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_WEB_API_KEY',
  'FIREBASE_WEB_APP_ID',
  'FIREBASE_ANDROID_API_KEY',
  'FIREBASE_ANDROID_APP_ID',
  'FIREBASE_IOS_API_KEY',
  'FIREBASE_IOS_APP_ID',
  'FIREBASE_MACOS_API_KEY',
  'FIREBASE_MACOS_APP_ID',
];
const missingValues = requiredRuntimeValues.filter((name) => !process.env[name]?.trim());
if (process.env.REQUIRE_FIREBASE_CONFIG === 'true' && missingValues.length) {
  throw new Error(`Missing required Firebase GitHub Actions secrets/environment values: ${missingValues.join(', ')}`);
}

console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
console.log(`FIREBASE_PROJECT_ID=${projectId}`);
if (missingValues.length) {
  console.log(`FIREBASE_ACTIVATION=BLOCKED; missing configuration values: ${missingValues.join(', ')}`);
} else {
  console.log('FIREBASE_ACTIVATION=CONFIGURED_FOR_BUILD');
}
