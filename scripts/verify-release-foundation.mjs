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
const androidGradle = fs.readFileSync('android/app/build.gradle', 'utf8');
if (/signingConfig\s+signingConfigs\.debug/.test(androidGradle)) blockers.push('Android release build still uses debug signing');
if (fs.existsSync('ios/Runner.xcodeproj/project.pbxproj.stub')) blockers.push('iOS Xcode project is still a stub');

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
