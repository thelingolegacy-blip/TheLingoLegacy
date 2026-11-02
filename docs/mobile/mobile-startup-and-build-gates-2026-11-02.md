# Mobile startup and build gates — 2026-11-02

## Startup recovery

Firebase initialization is no longer allowed to prevent the Flutter shell from starting when platform configuration is absent or invalid. The app now starts in an explicitly labeled preview-only mode if Firebase initialization fails. In that mode, account, cloud sync, and other Firebase-backed features remain unavailable; the UI does not claim otherwise.

## CI development builds

The new GitHub Actions workflow creates clean Android and iOS native scaffolding in disposable CI workspaces, replaces only the ephemeral runner's incomplete native directories, preserves the checked-out Dart source and pubspec, then runs Flutter dependency resolution, static analysis, widget tests, a web build, an Android debug APK build, and an unsigned iOS simulator compile. It uploads short-retention development artifacts.

The workflow does not commit generated native scaffolds, sign a release, publish to Firebase Hosting, or submit to app stores.

## Verified blockers before production release

- `lib/firebase_options.dart` contains placeholder app IDs and API-key values for web, Android, iOS, and macOS.
- The checked-in Android application Gradle file configures the release build type to use the debug signing configuration.
- The iOS project folder contains only stub files, not a complete Xcode project.
- The Android platform directory lacks the standard Flutter Gradle settings/wrapper scaffolding in the audited default-branch inventory.
- Apple Developer and Google Play Console enrollment and signing assets have not been verified through connected tools.

## Required secure owner actions

1. Register and verify Firebase web, Android, and iOS apps in the intended Firebase project; provide generated client configuration through a secure, approved process.
2. Confirm Android application ID and iOS bundle ID against their Firebase registrations and store records.
3. Create protected Android release-signing configuration using a secure keystore workflow. Never use debug signing for a release.
4. Complete Apple signing, provisioning, capabilities, privacy declarations, and App Store Connect access using the owner-controlled developer account.
5. Complete Google Play Console access, app signing, data safety, content rating, privacy, and store metadata.
6. Run real-device functional, accessibility, security, media, and account-lifecycle tests.
7. Obtain independent acceptance and explicit production promotion approval.

## Acceptance semantics

A green CI run means only that the development build steps completed. Android debug APK, unsigned iOS simulator app, and web build are not production store artifacts. Firebase placeholder configuration is not runtime readiness. No store submission or production release is implied.
