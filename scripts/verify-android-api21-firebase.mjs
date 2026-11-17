import { readFileSync } from 'node:fs';

export const FIREBASE_ANDROID_API21_VERSIONS = Object.freeze({
  firebase_core: '2.32.0',
  firebase_auth: '4.20.0',
  firebase_database: '10.5.7',
  firebase_storage: '11.7.7',
  firebase_analytics: '10.10.7',
});

export function verifyAndroidApi21FirebaseContract(pubspec, gradle) {
  const errors = [];
  for (const [name, expected] of Object.entries(FIREBASE_ANDROID_API21_VERSIONS)) {
    const matches = [...pubspec.matchAll(new RegExp('^\\\\s{2}' + name + ':\\\\s*([^\\\\s#]+)', 'gm'))];
    if (matches.length !== 1) {
      errors.push(`Expected exactly one ${name} dependency declaration; found ${matches.length}.`);
      continue;
    }
    if (matches[0][1] !== expected) {
      errors.push(`${name} must be pinned exactly to ${expected}; found ${matches[0][1]}.`);
    }
  }

  const minSdkMatches = [...gradle.matchAll(/^\\s*minSdk(?:Version)?\\s+(\\d+)\\s*$/gm)];
  if (minSdkMatches.length !== 1) {
    errors.push(`Expected exactly one explicit numeric Android minSdk declaration; found ${minSdkMatches.length}.`);
  } else if (Number(minSdkMatches[0][1]) !== 21) {
    errors.push(`Android minSdk must remain 21; found ${minSdkMatches[1][1]}.`);
  }

  if (/firebase_core:\\s*5\\./m.test(pubspec)) {
    errors.push('Firebase Core 5.x is not permitted by the Android API 21 compatibility contract.');
  }
  if (/firebase_auth:\\s*5\\./m.test(pubspec)) {
    errors.push('Firebase Auth 5.x is not permitted by the Android API 21 compatibility contract.');
  }

  return { ok: errors.length === 0, errors };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const pubspec = readFileSync('pubspec.yaml', 'utf8');
  const gradle = readFileSync('android/app/build.gradle', 'utf8');
  const result = verifyAndroidApi21FirebaseContract(pubspec, gradle);
  if (!result.ok) {
    for (const error of result.errors) console.error(`ERROR: ${error}`);
    process.exitCode = 1;
  } else {
    console.log('Android API 21 Firebase dependency contract passed.');
  }
}
