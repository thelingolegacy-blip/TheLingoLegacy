# Mobile startup and build gates — 2026-11-08

## Startup recovery

Firebase initialization no longer prevents the Flutter shell from starting when platform configuration is absent. The app now checks for complete build-time platform values before constructing Firebase options. If values are missing, the shell starts in explicitly labeled preview mode and Firebase-backed account/cloud-sync features remain unavailable. If initialization throws a Firebase exception, the app also remains in preview mode without exposing credential data.

## CI development builds

The mobile recovery workflow creates clean Android/iOS native scaffolding in disposable CI workspaces, then runs Flutter dependency resolution, static analysis, widget tests, a web build, an Android debug APK build, and an unsigned iOS simulator compile. It uploads short-retention development artifacts. Generated scaffolds are not committed by the workflow.

The Flutter/Firebase integrity workflow separately validates the build-time Firebase client contract. It runs code checks before the strict configuration gate so missing external Firebase variables do not hide Flutter code-quality failures.

## Verified blockers before production release

- Firebase Web, Android, iOS, and macOS client values remain unverified and must be supplied as GitHub repository variables.
- The existence, ownership, and app registrations of `lingo-legacy-production` have not been verified through Firebase access.
- Firebase Auth providers, App Check, database/storage rules, Functions, authorized domains, and live service connectivity remain unverified.
- Android release signing is intentionally not configured; release builds must not use the debug keystore.
- Apple signing, provisioning, App Store Connect access, Google Play enrollment, privacy declarations, and real-device QA remain outstanding.
- GitHub Actions currently fails before job creation, so none of the Flutter commands or build artifacts have been produced.

## Acceptance semantics

A green CI run means only that the development build steps completed. Android debug APK, unsigned iOS simulator app, and Flutter web output are not store-ready production artifacts. Firebase client initialization does not prove database authorization, backend readiness, or production acceptance. No store submission or production release is implied.
