import fs from 'node:fs';

const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const expectedProjectId = firebaseRc?.projects?.default;
const configuredProjectId = process.env.FIREBASE_PROJECT_ID;

if (expectedProjectId !== 'lingo-legacy-production') {
  throw new Error(`Firebase project contract mismatch: expected lingo-legacy-production, got ${expectedProjectId || 'missing'}`);
}
if (configuredProjectId !== expectedProjectId) {
  throw new Error('FIREBASE_PROJECT_ID build variable is missing or does not match the selected Firebase project.');
}

const requiredVariables = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_WEB_API_KEY',
  'FIREBASE_WEB_APP_ID',
  'FIREBASE_ANDROID_API_KEY',
  'FIREBASE_ANDROID_APP_ID',
  'FIREBASE_ANDROID_PACKAGE_NAME',
  'FIREBASE_IOS_API_KEY',
  'FIREBASE_IOS_APP_ID',
  'FIREBASE_IOS_BUNDLE_ID',
  'FIREBASE_MACOS_API_KEY',
  'FIREBASE_MACOS_APP_ID',
  'FIREBASE_MACOS_BUNDLE_ID',
];
const isConfigured = (value) => typeof value === 'string'
  && value.trim().length > 0
  && !value.trim().startsWith('YOUR_')
  && !value.includes('<')
  && !value.includes('>');

const missing = requiredVariables.filter((name) => !isConfigured(process.env[name]));
if (missing.length) {
  throw new Error(`Firebase client build configuration is incomplete. Missing repository variables: ${missing.join(', ')}`);
}

const source = fs.readFileSync('lib/firebase_options.dart', 'utf8');
if (!source.includes("String.fromEnvironment('FIREBASE_PROJECT_ID')")
  || !source.includes("String.fromEnvironment('FIREBASE_WEB_API_KEY')")) {
  throw new Error('Flutter Firebase options must use explicit build-time configuration.');
}
const androidGradle = fs.readFileSync('android/app/build.gradle', 'utf8');
const androidPackage = androidGradle.match(/applicationId\s+[\"']([^\"']+)[\"']/)?.[1];
if (!androidPackage || process.env.FIREBASE_ANDROID_PACKAGE_NAME !== androidPackage) {
  throw new Error('FIREBASE_ANDROID_PACKAGE_NAME must match the Flutter Android applicationId.');
}
if (process.env.FIREBASE_IOS_BUNDLE_ID !== 'com.thelingolegacy.app'
  || process.env.FIREBASE_MACOS_BUNDLE_ID !== 'com.thelingolegacy.app') {
  throw new Error('Firebase iOS/macOS bundle IDs must match the generated native application identifier com.thelingolegacy.app.');
}
if (fs.existsSync('firebase.client.json')) {
  throw new Error('Remove firebase.client.json; use build-time variables and the example template instead.');
}

console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
console.log('FIREBASE_PROJECT_ID_MATCH=PASS');
console.log('FIREBASE_CLIENT_CONFIGURATION=COMPLETE');
