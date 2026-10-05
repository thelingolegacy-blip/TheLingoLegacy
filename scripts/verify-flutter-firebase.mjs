import fs from 'node:fs';

const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const projectId = firebaseRc?.projects?.default;

if (projectId !== 'lingo-legacy-production') {
  throw new Error(`Firebase project mismatch: expected lingo-legacy-production, got ${projectId || 'missing'}`);
}

const source = fs.readFileSync('lib/firebase_options.dart', 'utf8');
const placeholders = [
  'YOUR_WEB_API_KEY',
  'YOUR_WEB_APP_ID',
  'YOUR_ANDROID_API_KEY',
  'YOUR_ANDROID_APP_ID',
  'YOUR_IOS_API_KEY',
  'YOUR_IOS_APP_ID',
  'YOUR_MESSAGING_SENDER_ID',
];

const found = placeholders.filter((value) => source.includes(value));
if (found.length) {
  throw new Error(`Firebase configuration placeholders remain: ${found.join(', ')}`);
}

console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
console.log(`FIREBASE_PROJECT_ID=${projectId}`);
