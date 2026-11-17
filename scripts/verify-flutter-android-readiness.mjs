import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const requiredFiles = [
  'android/gradlew',
  'android/gradle/wrapper/gradle-wrapper.jar',
  'android/gradle/wrapper/gradle-wrapper.properties',
  'android/settings.gradle',
  'android/build.gradle',
  'android/app/build.gradle',
  'android/app/src/main/AndroidManifest.xml',
];
const blockers = [];
const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) blockers.push(`Android Gradle scaffold is incomplete: ${missing.join(', ')}`);

const pubspecPath = path.join(root, 'pubspec.yaml');
const gradlePath = path.join(root, 'android/app/build.gradle');
if (!fs.existsSync(pubspecPath)) {
  blockers.push('pubspec.yaml is missing');
} else if (!fs.existsSync(gradlePath)) {
  blockers.push('android/app/build.gradle is missing; cannot verify Android SDK compatibility');
} else {
  const pubspec = fs.readFileSync(pubspecPath, 'utf8');
  const gradle = fs.readFileSync(gradlePath, 'utf8');
  const firebaseCore = pubspec.match(/^\s*firebase_core:\s*\^?(\d+)\./m);
  const minSdk = gradle.match(/\bminSdk(?:Version)?\s*(?:=\s*)?(\d+)/);
  if (!firebaseCore) {
    blockers.push('firebase_core version cannot be determined from pubspec.yaml');
  } else if (Number(firebaseCore[1]) >= 5) {
    if (!minSdk) blockers.push('Android minSdk cannot be determined');
    else if (Number(minSdk[1]) < 24) {
      blockers.push(`Firebase Core 5.x requires Android minSdk 24; project declares minSdk ${minSdk[1]}`);
    }
  }
  if (!/com\.android\.application/.test(gradle)) {
    blockers.push('Android app Gradle file does not declare the Android application plugin');
  }
  if (!/dev\.flutter\.flutter-gradle-plugin|flutter\.gradle/.test(gradle)) {
    blockers.push('Android app Gradle file does not apply the Flutter Gradle plugin');
  }
}

if (blockers.length) {
  console.error('FLUTTER_ANDROID_READINESS=BLOCKED');
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}
console.log('FLUTTER_ANDROID_READINESS=PASS');
