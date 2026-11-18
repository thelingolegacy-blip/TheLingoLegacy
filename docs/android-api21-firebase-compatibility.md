# Android API 21 Firebase compatibility contract

## Decision

The LINGO Android app retains `minSdk 21`. Do not raise this value as a dependency workaround.

## FlutterFire dependency set

The root `pubspec.yaml` pins the Firebase Flutter plugins to the FlutterFire 1.1.0 compatible release set:

| Plugin | Pinned version |
|---|---:|
| `firebase_core` | `2.32.0` |
| `firebase_auth` | `4.20.0` |
| `firebase_database` | `10.5.7` |
| `firebase_storage` | `11.7.7` |
| `firebase_analytics` | `10.10.7` |

This release set is documented in the FlutterFire compatibility matrix (Flutter BoM 1.1.0) and predates the native Firebase Android Auth 23.0.0 transition that raises Auth's minimum Android API to 23. It avoids the FlutterFire Firebase Core 5.x release, which requires Android API 24.

Sources:
- FlutterFire version matrix: https://github.com/firebase/flutterfire/blob/main/VERSIONS.md
- Firebase Core changelog: https://github.com/firebase/flutterfire/blob/main/packages/firebase_core/firebase_core/CHANGELOG.md
- Firebase Auth changelog: https://pub.dev/packages/firebase_auth/changelog

## Guardrails

- Keep `android/app/build.gradle` at `minSdk 21`.
- Do not allow Firebase plugin major upgrades to float across this compatibility boundary without reviewing their native Android SDK requirements.
- Keep these five Firebase plugin versions synchronized to a tested compatible set.
- Generate `pubspec.lock` with Flutter 3.50.0 and commit the actual Pub solver output. Never hand-author a lockfile.
- Run `flutter pub get`, `flutter analyze`, `flutter test`, and `flutter build apk --debug` in hosted CI before calling Android readiness verified.
- The Android Gradle wrapper/project scaffold must be completed before an APK build can pass.

## Firebase environment isolation

The checked-in Firebase options contain placeholder API keys/app IDs and the `.firebaserc` project alias map is empty; no Firebase project is selected. These are not valid app credentials. App startup checks `DefaultFirebaseOptions.isConfigured` and skips Firebase initialization while placeholders remain. The recovery workflow accepts this explicitly disconnected state only while that guard is present; it rejects a production default alias or production project credentials in the non-production recovery workflow. Firebase Hosting points only to `build/firebase-public`, whose allowlist is empty and whose publisher remains quarantined.

Do not replace placeholders with production credentials or activate Firebase from this recovery branch. A dedicated staging Firebase project and its platform-specific app credentials must be approved and configured first. Until then, Firebase-backed features remain disconnected.

## Verification status

Source constraints are pinned and the Android minimum remains 21. The current recovery workflow is configured to run, in order: Firebase configuration verifier tests and guard check; Android API-21 compatibility tests and verifier; ephemeral Android Gradle wrapper generation; Flutter dependency resolution; Flutter analysis; Flutter unit/widget tests; Flutter web release build; Flutter Android debug APK build; Firebase Hosting publisher tests and quarantined output generation; and a final Hosting public-directory configuration check.

### Required evidence when hosted runner admission is restored

1. Record the exact commit SHA and workflow run ID.
2. Confirm the job was instantiated on `ubuntu-latest`; retain all step logs.
3. Confirm Flutter reports version 3.50.0 and Dart version from that SDK.
4. Retain the Firebase verifier and Android API-21 contract test summaries.
5. Retain `flutter pub get` output and the generated `pubspec.lock` as a build artifact or commit only after normal solver output and review.
6. Retain `flutter analyze` and `flutter test` results.
7. Retain the web build output digest and Android debug APK digest; record APK package metadata and minimum SDK 21.
8. Confirm Hosting output contains only the quarantine 404 page while the allowlist is empty.
9. Confirm no Firebase project credentials, Hosting publication, or production deployment occurred.

The local Node contract suites passed 11/11 for the Hosting publisher and 8/8 for the Firebase configuration verifier using read-back source files in isolated scratch directories. These are local results only. No current-head Flutter analysis, Android APK build, hosted test execution, `pubspec.lock` generation, Firebase project connection, or Firebase publication is claimed.