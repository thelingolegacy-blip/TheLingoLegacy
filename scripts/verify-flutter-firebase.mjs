import fs from 'node:fs';

const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const projectId = firebaseRc?.projects?.default;
const optionsSource = fs.readFileSync('lib/firebase_options.dart', 'utf8');
const appSource = fs.readFileSync('lib/main.dart', 'utf8');

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
const found = placeholders.filter((value) => optionsSource.includes(value));
const guarded = optionsSource.includes('static bool get isConfigured') &&
  appSource.includes('if (DefaultFirebaseOptions.isConfigured)');

if (!projectId) {
  throw new Error('Firebase project alias is missing; keep Firebase integration disabled until an approved staging identity is configured.');
}

if (found.length) {
  if (!guarded) {
    throw new Error('Firebase credentials are placeholders but app startup is not guarded against unconfigured Firebase.');
  }
  console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
  console.log('FIREBASE_INTEGRATION=DISABLED_PLACEHOLDER_CREDENTIALS');
  console.log('No Firebase project connection or production credential use is enabled.');
} else {
  if (projectId === 'lingo-legacy-production') {
    throw new Error('Refusing to validate production Firebase credentials in the non-production recovery workflow; configure a dedicated staging project.');
  }
  if (!optionsSource.includes(`projectId: '${projectId}'`)) {
    throw new Error('Firebase options projectId does not match the configured Firebase alias.');
  }
  console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
  console.log('FIREBASE_INTEGRATION=STAGING_CONFIGURED');
  console.log(`FIREBASE_PROJECT_ID=${projectId}`);
}