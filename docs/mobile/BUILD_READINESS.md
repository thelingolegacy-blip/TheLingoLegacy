# Mobile build and Firebase readiness

**Current disposition: preview-only; not release-ready.**

## Firebase

- `.firebaserc` currently has no default project.
- `firebase.json` is empty.
- `lib/firebase_options.dart` still contains `YOUR_*` placeholders.
- The app may start in offline preview mode, but this does not connect Firebase Auth, Realtime Database, Storage, Analytics, or any production identity service.
- Do not replace placeholders with invented project IDs or credentials. Configure a dedicated staging Firebase project and obtain the real FlutterFire options before accepting backend integration.

## Android

- The app module previously selected the debug signing certificate for release builds. That has been removed.
- Release builds remain unsigned until a protected release keystore is provisioned through an approved secret-management path.
- The repository currently lacks the Android root Gradle build/settings files and Gradle wrapper. An Android APK/AAB build is not yet established.

## iOS

- An iOS project directory exists, but signing, provisioning, archive, and device-install verification remain outstanding.

## Acceptance still required

1. Provision a dedicated staging Firebase project and real platform configuration.
2. Run `flutter pub get`, `flutter analyze`, `flutter test`, and a web build.
3. Restore the complete Android Gradle wrapper/project structure and verify debug build.
4. Configure protected Android release signing; verify AAB signing and upload readiness.
5. Verify iOS signing/provisioning and physical-device build.
6. Exercise authentication, database, storage, analytics, privacy and offline behavior against staging.
