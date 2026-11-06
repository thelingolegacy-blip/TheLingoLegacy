import fs from 'node:fs';

const EXPECTED_PROJECT_ID = 'lingo-legacy-production';
const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const projectId = firebaseRc?.projects?.default;
if (projectId !== EXPECTED_PROJECT_ID) {
  throw new Error(`Firebase project mismatch: expected ${EXPECTED_PROJECT_ID}, got ${projectId || 'missing'}`);
}

const clientConfig = JSON.parse(fs.readFileSync('firebase.client.json', 'utf8'));
if (clientConfig.projectId !== EXPECTED_PROJECT_ID) {
  throw new Error(`firebase.client.json project mismatch: expected ${EXPECTED_PROJECT_ID}, got ${clientConfig.projectId || 'missing'}`);
}
if (clientConfig.authDomain !== `${EXPECTED_PROJECT_ID}.firebaseapp.com`) {
  throw new Error('firebase.client.json authDomain does not match the authoritative project');
}
if (clientConfig.databaseURL !== `https://${EXPECTED_PROJECT_ID}-default-rtdb.firebaseio.com`) {
  throw new Error('firebase.client.json databaseURL does not match the authoritative project');
}
if (clientConfig.storageBucket !== `${EXPECTED_PROJECT_ID}.appspot.com`) {
  throw new Error('firebase.client.json storageBucket does not match the authoritative project');
}

const source = fs.readFileSync('lib/firebase_options.dart', 'utf8');
const platformProjectIds = [...source.matchAll(/projectId:\\s*'([^']+)'/g)].map((match) => match[1]);
if (platformProjectIds.length !== 4 || platformProjectIds.some((id) => id !== EXPECTED_PROJECT_ID)) {
  throw new Error(`Flutter platform project IDs must all equal ${EXPECTED_PROJECT_ID}; found ${platformProjectIds.join(', ') || 'none'}`);
}

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
if (found.length) {
  throw new Error(`Firebase configuration placeholders remain: ${found.join(', ')}`);
}
const clientPlaceholders = ['YOUR_FIREBASE_API_KEY', 'YOUR_MESSAGING_SENDER_ID', 'YOUR_APP_ID'];
const clientFound = clientPlaceholders.filter((value) => JSON.stringify(clientConfig).includes(value));
if (clientFound.length) {
  throw new Error(`Firebase client configuration placeholders remain: ${clientFound.join(', ')}`);
}

console.log('FLUTTER_FIREBASE_IDENTITY=PASS');
console.log('FLUTTER_FIREBASE_CREDENTIAL_COMPLETENESS=PASS');
console.log(`FIREBASE_PROJECT_ID=${EXPECTED_PROJECT_ID}`);
