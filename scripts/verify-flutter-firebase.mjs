import fs from 'node:fs';

const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const projectId = firebaseRc?.projects?.default;
const refName = process.env.GITHUB_REF_NAME || 'main';

if (projectId !== 'lingo-legacy-production') {
  throw new Error(`Default Firebase project changed unexpectedly: ${projectId || 'missing'}`);
}

const source = fs.readFileSync('lib/firebase_options.dart', 'utf8');
const placeholders = [
  'YOUR_WEB_API_KEY',
  'YOUR_WEB_APP_ID',
  'YOUR_ANDROID_API_KEY',
  'YOUR_ANDROID_APP_ID',
  'YOUR_IOS_API_KEY',
  'YOUR_IOS_APP_ID',
  'YOUR_MACOS_API_KEY',
  'YOUR_MACOS_APP_ID',
  'YOUR_MESSAGING_SENDER_ID',
];
const found = placeholders.filter((value) => source.includes(value));

if (refName === 'main') {
  if (found.length) {
    throw new Error(`Firebase production configuration placeholders remain: ${found.join(', ')}`);
  }
  console.log('FLUTTER_FIREBASE_PRODUCTION_CONTRACT=PASS');
  console.log(`FIREBASE_PROJECT_ID=${projectId}`);
  process.exit(0);
}

// Feature branches must not silently use the production project for staging work.
// The default alias remains unchanged; staging commands require an explicit project ID.
const stagingConfig = JSON.parse(fs.readFileSync('firebase.staging.json', 'utf8'));
const stagingRules = fs.readFileSync('firebase/staging/firestore.rules', 'utf8');
const pubspec = fs.readFileSync('pubspec.yaml', 'utf8');

if (!stagingConfig.firestore?.rules || !stagingRules.includes('allow read, write: if false;')) {
  throw new Error('Staging Firestore rules/configuration are missing the default-deny contract.');
}
if (!pubspec.includes('cloud_firestore: ^7.1.0')) {
  throw new Error('Cloud Firestore dependency is missing or not at the reviewed version.');
}
if (/"projectId"\s*:/.test(JSON.stringify(stagingConfig))) {
  throw new Error('Staging config must not embed a project ID; require an explicit staging --project argument.');
}

console.log('FLUTTER_FIREBASE_STAGING_SOURCE_CONTRACT=PASS');
console.log(`DEFAULT_FIREBASE_PROJECT_PRESERVED=${projectId}`);
console.log('STAGING_FIREBASE_PROJECT=NOT_PROVISIONED');
console.log(found.length
  ? 'STAGING_FIREBASE_APP_CONFIG=PLACEHOLDERS_EXPECTED_UNTIL_STAGING_PROJECT_EXISTS'
  : 'STAGING_FIREBASE_APP_CONFIG=PRESENT_REQUIRES_PROJECT_ID_REVIEW');
