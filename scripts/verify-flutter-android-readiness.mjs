import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const requiredFiles = [
  'android/gradle/wrapper/gradle-wrapper.properties',
  'android/gradle/wrapper/gradle-wrapper.jar',
  'android/gradlew',
  'android/gradlew.bat',
  'android/settings.gradle.kts',
  'android/build.gradle.kts',
  'android/app/build.gradle.kts',
  'android/app/src/main/AndroidManifest.xml',
  'android/app/src/main/kotlin/com/thelingolegacy/app/MainActivity.kt',
  'android/app/src/main/res/values/styles.xml',
  'android/app/src/main/res/values-night/styles.xml',
];
const blockers = [];
const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) blockers.push('Android Gradle scaffold is incomplete: ' + missing.join(', '));
if (fs.existsSync(path.join(root, 'android/gradlew'))) {
  const wrapperScript = fs.readFileSync(path.join(root, 'android/gradlew'), 'utf8');
  const mode = fs.statSync(path.join(root, 'android/gradlew')).mode;
  if ((mode & 0o111) === 0) blockers.push('android/gradlew must be committed with its executable bit set');
  if (!wrapperScript.includes('org.gradle.wrapper.GradleWrapperMain')) {
    blockers.push('android/gradlew does not contain the expected Gradle wrapper entry point');
  }
}
if (fs.existsSync(path.join(root, 'android/gradlew.bat'))) {
  const wrapperScript = fs.readFileSync(path.join(root, 'android/gradlew.bat'), 'utf8');
  if (!wrapperScript.includes('org.gradle.wrapper.GradleWrapperMain')) {
    blockers.push('android/gradlew.bat does not contain the expected Gradle wrapper entry point');
  }
}
if (fs.existsSync(path.join(root, 'android/gradle/wrapper/gradle-wrapper.jar'))) {
  const wrapperJar = fs.readFileSync(path.join(root, 'android/gradle/wrapper/gradle-wrapper.jar'));
  if (wrapperJar.length < 4096 || wrapperJar[0] !== 0x50 || wrapperJar[1] !== 0x4b) {
    blockers.push('Gradle wrapper JAR is missing, truncated, or not a ZIP/JAR archive');
  }
}

const pubspecPath = path.join(root, 'pubspec.yaml');
const gradlePath = path.join(root, 'android/app/build.gradle.kts');
if (!fs.existsSync(pubspecPath)) {
  blockers.push('pubspec.yaml is missing');
} else {
  const pubspec = fs.readFileSync(pubspecPath, 'utf8');
  const pins = {
    firebase_core: '2.32.0',
    firebase_auth: '4.20.0',
    firebase_database: '10.5.7',
    firebase_storage: '11.7.7',
    firebase_analytics: '10.10.7',
  };
  for (const [name, expected] of Object.entries(pins)) {
    const matches = [...pubspec.matchAll(new RegExp('^\\s{2}' + name + ':\\s*([^\\s#]+)', 'gm'))];
    if (matches.length !== 1 || matches[0][1] !== expected) {
      blockers.push(name + ' must be pinned exactly to ' + expected + '; found ' + (matches.map((m) => m[1]).join(', ') || 'no declaration'));
    }
  }
}
if (!fs.existsSync(gradlePath)) {
  blockers.push('android/app/build.gradle.kts is missing; cannot verify Android compatibility');
} else {
  const gradle = fs.readFileSync(gradlePath, 'utf8');
  const minSdk = gradle.match(/\bminSdk\s*=\s*(\d+)/);
  if (!minSdk || Number(minSdk[1]) !== 21) blockers.push('Android minSdk must remain exactly 21; found ' + (minSdk?.[1] ?? 'no explicit value'));
  if (!gradle.includes('id("com.android.application")')) blockers.push('Android application Gradle plugin is missing');
  if (!gradle.includes('id("org.jetbrains.kotlin.android")') && !gradle.includes('id("kotlin-android")')) {
    blockers.push('Kotlin Android Gradle plugin is missing');
  }
  if (!gradle.includes('id("dev.flutter.flutter-gradle-plugin")')) blockers.push('Flutter Gradle plugin is missing');
  if (!gradle.includes('namespace = "com.thelingolegacy.app"')) blockers.push('Android namespace does not match com.thelingolegacy.app');
  if (!gradle.includes('applicationId = "com.thelingolegacy.app"')) blockers.push('Android applicationId does not match com.thelingolegacy.app');
}
if (blockers.length) {
  console.error('FLUTTER_ANDROID_READINESS=BLOCKED');
  for (const blocker of blockers) console.error('- ' + blocker);
  process.exit(1);
}
console.log('FLUTTER_ANDROID_READINESS=PASS');
console.log('ANDROID_MIN_SDK=21');
console.log('FIREBASE_ANDROID_COMPATIBILITY=PINNED');
console.log('GRADLE_WRAPPER=TRACKED_AND_PRESENT');
