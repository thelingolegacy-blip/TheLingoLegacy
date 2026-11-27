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
  const platformArg = process.argv.find((argument) => argument.startsWith('--platform='));
  const platform = platformArg?.split('=')[1];
  const platformDefines = {
    web: ['LINGO_FIREBASE_WEB_API_KEY', 'LINGO_FIREBASE_WEB_APP_ID'],
    android: ['LINGO_FIREBASE_ANDROID_API_KEY', 'LINGO_FIREBASE_ANDROID_APP_ID'],
    ios: ['LINGO_FIREBASE_IOS_API_KEY', 'LINGO_FIREBASE_IOS_APP_ID'],
    macos: ['LINGO_FIREBASE_MACOS_API_KEY', 'LINGO_FIREBASE_MACOS_APP_ID'],
  };
  if (!platform || !Object.hasOwn(platformDefines, platform)) {
    throw new Error('Strict runtime verification requires --platform=web|android|ios|macos.');
  }
  const runtimeDefines = [
    'LINGO_FIREBASE_MESSAGING_SENDER_ID',
    ...platformDefines[platform],
  ];
  const missing = runtimeDefines.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Staging Firebase ${platform} build configuration is incomplete: ${missing.join(', ')}`);
  }
}

console.log('FLUTTER_FIREBASE_CONTRACT=PASS');
console.log(`FIREBASE_PROJECT_ID=${expectedProjectId}`);
console.log('FIREBASE_CONFIG_MODE=BUILD_TIME_STAGING_INJECTION');
