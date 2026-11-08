import fs from 'node:fs';

const firebaseRc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
const expectedProjectId = firebaseRc?.projects?.default;
const configuredProjectId = process.env.FIREBASE_PROJECT_ID;

if (!expectedProjectId) {
  throw new Error('Firebase project contract is missing projects.default in .firebaserc.');
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
];
const isConfigured = (value) => typeof value === 'string'
  && value.trim().length > 0
  && !value.trim().startsWith('YOUR_')
  && !value.includes('<')
  && !value.includes('>');

const source = fs.readFileSync('lib/firebase_options.dart', 'utf8');
if (!source.includes("String.fromEnvironment('FIREBASE_PROJECT_ID')")
  || !source.includes("String.fromEnvironment('FIREBASE_WEB_API_KEY')")) {
  throw new Error('Flutter Firebase options must use explicit build-time configuration.');
}

const androidGradlePath = fs.existsSync('android/app/build.gradle')
  ? 'android/app/build.gradle'
  : 'android/app/build.gradle.kts';
if (!fs.existsSync(androidGradlePath)) {
  throw new Error('Android native project is missing android/app/build.gradle or build.gradle.kts.');
}
const androidGradle = fs.readFileSync(androidGradlePath, 'utf8');
const androidPackage = androidGradle.match(/applicationId\\s+["']([^"']+)["']/)?.[1];
if (!androidPackage || process.env.FIREBASE_ANDROID_PACKAGE_NAME !== androidPackage) {
  throw new Error('FIREBASE_ANDROID_PACKAGE_NAME must match the Flutter Android applicationId.');
}

const optionalNativePlatforms = [
  {
    name: 'iOS',
    projectFile: 'ios/Runner.xcodeproj/project.pbxproj',
    variables: ['FIREBASE_IOS_API_KEY', 'FIREBASE_IOS_APP_ID', 'FIREBASE_IOS_BUNDLE_ID'],
    bundleVariable: 'FIREBASE_IOS_BUNDLE_ID',
  },
  {
    name: 'macOS',
    projectFile: 'macos/Runner.xcodeproj/project.pbxproj',
    variables: ['FIREBASE_MACOS_API_KEY', 'FIREBASE_MACOS_APP_ID', 'FIREBASE_MACOS_BUNDLE_ID'],
    bundleVariable: 'FIREBASE_MACOS_BUNDLE_ID',
  },
];

for (const platform of optionalNativePlatforms) {
  if (!fs.existsSync(platform.projectFile)) {
    console.log(`${platform.name.toUpperCase()}_NATIVE_PROJECT=NOT_PRESENT; platform Firebase app configuration is not required yet.`);
    continue;
  }
  const missing = platform.variables.filter((name) => !isConfigured(process.env[name]));
  if (missing.length) {
    throw new Error(`${platform.name} native project exists but Firebase configuration is incomplete: ${missing.join(', ')}`);
  }
  const project = fs.readFileSync(platform.projectFile, 'utf8');
  const bundleIds = [...new Set([...project.matchAll(/PRODUCT_BUNDLE_IDENTIFIER\\s*=\\s*([^;]+);/g)]
    .map((match) => match[1].trim().replace(/^['"]|['"]$/g, '')))];
  if (!bundleIds.length || bundleIds.some((bundleId) => bundleId !== process.env[platform.bundleVariable])) {
    throw new Error(`${platform.bundleVariable} must match every PRODUCT_BUNDLE_IDENTIFIER in ${platform.projectFile}.`);
  }
}

const missing = requiredVariables.filter((name) => !isConfigured(process.env[name]));
if (missing.length) {
  throw new Error(`Firebase client build configuration is incomplete. Missing repository variables: ${missing.join(', ')}`);
}
if (fs.existsSync('firebase.client.json')) {
  throw new Error('Remove firebase.client.json; use build-time variables and the example template instead.');
}

console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
console.log('FIREBASE_PROJECT_ID_MATCH=PASS');
console.log('FIREBASE_CLIENT_CONFIGURATION=COMPLETE_FOR_PRESENT_PLATFORMS');
