import { readFileSync, existsSync } from 'node:fs';

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
    const matches = [...pubspec.matchAll(new RegExp('^\\s{2}' + name + ':\\s*([^\\s#]+)', 'gm'))];
    if (matches.length !== 1) {
      errors.push('Expected exactly one ' + name + ' dependency declaration; found ' + matches.length + '.');
      continue;
    }
    if (matches[0][1] !== expected) {
      errors.push(name + ' must be pinned exactly to ' + expected + '; found ' + matches[0][1] + '.');
    }
  }

  // Accept both the legacy Groovy DSL and the official Flutter Kotlin DSL scaffold.
  const minSdkMatches = [
    ...gradle.matchAll(/^\\s*minSdk(?:Version)?\\s*(?:=\\s*)?(\\d+)\\s*$/gm),
  ];
  if (minSdkMatches.length !== 1) {
    errors.push('Expected exactly one explicit numeric Android minSdk declaration; found ' + minSdkMatches.length + '.');
  } else if (Number(minSdkMatches[0][1]) !== 21) {
    errors.push('Android minSdk must remain 21; found ' + minSdkMatches[0][1] + '.');
  }

  return { ok: errors.length === 0, errors };
}

export function verifyAndroidApi21FirebaseFiles() {
  const pubspec = readFileSync('pubspec.yaml', 'utf8');
  const gradlePath = existsSync('android/app/build.gradle.kts')
    ? 'android/app/build.gradle.kts'
    : 'android/app/build.gradle';
  const gradle = readFileSync(gradlePath, 'utf8');
  return verifyAndroidApi21FirebaseContract(pubspec, gradle);
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const result = verifyAndroidApi21FirebaseFiles();
  if (!result.ok) {
    for (const error of result.errors) console.error('ERROR: ' + error);
    process.exitCode = 1;
  } else {
    console.log('Android API 21 Firebase dependency contract passed.');
  }
}
