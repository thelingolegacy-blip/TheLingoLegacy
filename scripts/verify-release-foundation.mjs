import fs from 'node:fs';

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const matrix = readJson('release/platform-matrix.json');
const publishers = readJson('release/publisher-connection-register.json');
const signing = readJson('release/signing-policy.json');
const manifest = readJson('release/release-manifest-template.json');

const errors = [];
const blockers = [];
if (matrix.schemaVersion !== '1.0' || !Array.isArray(matrix.targetLanes) || !Array.isArray(matrix.portfolio)) errors.push('platform matrix schema invalid');
if (publishers.status !== 'NO_PUBLISHER_CONNECTIONS_VERIFIED' || !Array.isArray(publishers.publishers)) errors.push('publisher register schema invalid');
if (signing.controls?.privateKeysInGit !== false || signing.controls?.buildWorkersMayAccessPrivateKeys !== false) errors.push('signing policy must prohibit repository keys and build-worker key access');
if (manifest.promotion?.authorized !== false) errors.push('release manifest must default to no promotion');

for (const lane of matrix.targetLanes) if (!lane.id || !lane.platform || !lane.status) errors.push('platform lane missing required fields');
for (const publisher of publishers.publishers) if (publisher.status !== 'OUTSTANDING') errors.push(`unexpected publisher state: ${publisher.id}`);

const firebaseOptions = fs.readFileSync('lib/firebase_options.dart', 'utf8');
if (/YOUR_[A-Z0-9_]+/.test(firebaseOptions)) blockers.push('Firebase client configuration still contains placeholder values');
const firebaseConfig = readJson('firebase.json');
if (firebaseConfig.database?.rules !== 'database.rules.json') errors.push('Firebase Realtime Database rules must be explicitly configured');
if (!fs.existsSync('database.rules.json')) errors.push('explicit Realtime Database rules file is missing');
else {
  const databaseRules = readJson('database.rules.json').rules;
  if (databaseRules?.['.read'] !== false || databaseRules?.['.write'] !== false) errors.push('Realtime Database rules must remain default-deny until reviewed');
}
if (firebaseConfig.hosting?.public !== 'build/web') blockers.push('Firebase Hosting must serve only the generated Flutter web output');
if (!fs.existsSync('firestore.rules')) errors.push('explicit Firestore rules file is missing');
else if (!/allow read, write: if false/.test(fs.readFileSync('firestore.rules', 'utf8'))) errors.push('Firestore rules must remain default-deny until reviewed');

const androidGradle = fs.readFileSync('android/app/build.gradle', 'utf8');
if (/signingConfig\s+signingConfigs\.debug/.test(androidGradle)) errors.push('Android release must not use debug signing');
if (!/signingConfig\s+signingConfigs\.release/.test(androidGradle)) errors.push('Android release must use the protected release signing config');
const androidSigningEnv = ['ANDROID_UPLOAD_KEYSTORE_PATH', 'ANDROID_UPLOAD_STORE_PASSWORD', 'ANDROID_UPLOAD_KEY_ALIAS', 'ANDROID_UPLOAD_KEY_PASSWORD'];
if (androidSigningEnv.some((name) => !process.env[name])) blockers.push('Android protected upload-signing environment is not provisioned in this workflow');
if (fs.existsSync('ios/Runner.xcodeproj/project.pbxproj.stub')) blockers.push('iOS Xcode project is still a stub; hosted macOS scaffold/build check is required');

const report = {
  schemaVersion: '1.0',
  repository: process.env.GITHUB_REPOSITORY || 'local',
  commit: process.env.GITHUB_SHA || 'unknown',
  runId: process.env.GITHUB_RUN_ID || 'local',
  result: errors.length ? 'FAIL' : blockers.length ? 'PASS_WITH_RELEASE_BLOCKERS' : 'PASS',
  errors,
  blockers,
  releasePromotionAuthorized: false,
  timestampUtc: new Date().toISOString()
};
fs.mkdirSync('release-evidence', { recursive: true });
fs.writeFileSync('release-evidence/foundation-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
