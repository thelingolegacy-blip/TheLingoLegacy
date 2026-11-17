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

The checked-in Firebase options currently contain placeholder API keys/app IDs and the Firebase CLI alias still names the production project. These are not valid app credentials. App startup now checks `DefaultFirebaseOptions.isConfigured` and skips Firebase initialization while placeholders remain. The recovery workflow accepts this explicitly disconnected state only while that guard is present; it rejects configured production credentials in the non-production recovery workflow.

Do not replace placeholders with production credentials or activate Firebase from this recovery branch. A dedicated staging Firebase project and its platform-specific app credentials must be approved and configured first. Until then, Firebase-backed features remain disconnected.

## Verification status

Source constraints are pinned and the Android minimum remains 21. The latest Cloudflare preview run passed the six API-21 contract tests, root Flutter analysis, and root widget tests, but failed in the separate Oasis Flutter analysis due to a deprecated Material import. That import/dependency was repaired on the recovery branch and is pending the next preview build. No source-branch `pubspec.lock` or successful APK build is claimed.