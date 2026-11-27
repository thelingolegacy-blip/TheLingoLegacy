# Flutter Firebase staging configuration

Status: SOURCE CONTRACT PREPARED — APP REGISTRATION AND RUNTIME BUILD NOT VERIFIED

## Isolation contract

- Firebase CLI default project: `lingo-legacy-staging` in `.firebaserc`.
- Flutter platform options are hard-bound to `lingo-legacy-staging`.
- Production project IDs and credentials must never be injected into this workflow.
- Firebase app identifiers are supplied at build time with Dart defines; no API keys or app IDs are committed to Git.
- Missing platform values cause Firebase initialization to fail explicitly rather than silently falling back to production or another project.

## Required staging app registrations

Before a staging app build can be accepted, verify that the staging Firebase project exists and has registered app clients for:
- Web
- Android package `com.thelingolegacy.app` (confirm the actual applicationId before release)
- iOS bundle `com.thelingolegacy.app`
- macOS (only if this platform remains in the supported release matrix)

Record each app's Firebase App ID and API key from the staging project console or an authorized Firebase CLI/API read. Do not infer or fabricate these values.

## Build-time define contract

The following values must be injected from the staging project configuration or protected CI variables:

- `LINGO_FIREBASE_MESSAGING_SENDER_ID`
- `LINGO_FIREBASE_WEB_API_KEY`
- `LINGO_FIREBASE_WEB_APP_ID`
- `LINGO_FIREBASE_ANDROID_API_KEY`
- `LINGO_FIREBASE_ANDROID_APP_ID`
- `LINGO_FIREBASE_IOS_API_KEY`
- `LINGO_FIREBASE_IOS_APP_ID`
- `LINGO_FIREBASE_MACOS_API_KEY`
- `LINGO_FIREBASE_MACOS_APP_ID`

Example shell invocation (values are placeholders here; never paste actual values into a committed file or log):

```sh
flutter build web \
  --dart-define=LINGO_FIREBASE_MESSAGING_SENDER_ID="$LINGO_FIREBASE_MESSAGING_SENDER_ID" \
  --dart-define=LINGO_FIREBASE_WEB_API_KEY="$LINGO_FIREBASE_WEB_API_KEY" \
  --dart-define=LINGO_FIREBASE_WEB_APP_ID="$LINGO_FIREBASE_WEB_APP_ID"
```

Android/iOS/macOS builds must receive the corresponding platform-specific API key and App ID defines plus the shared messaging sender ID. Run the strict verifier with the matching `--platform=android`, `--platform=ios`, or `--platform=macos` argument for those targets. A release build must run:

```sh
node scripts/verify-flutter-firebase.mjs --require-runtime-config --platform=web
```

The static CI contract check intentionally does not require app-registration values; it verifies staging isolation and the compile-time injection interface. It is not proof that a Firebase app is configured or that authentication/Firestore works.

## Verification gates

1. Verify the exact staging project ID and app registrations using authorized Firebase project inventory.
2. Confirm the Android applicationId and preserve `minSdk 21`.
3. Inject only staging values into the staging build environment.
4. Run the strict verifier with `--require-runtime-config`.
5. Run `flutter pub get`, Dart format, `flutter analyze --fatal-infos`, and `flutter test`.
6. Build each supported target with the staging defines.
7. Test Firebase initialization, sign-in, token refresh, Firestore default-deny rules, and cross-tenant isolation against staging/emulators.
8. Retain the exact commit, build logs, test results, and app configuration provenance.

No production Firebase project, credentials, data, or resources are changed by this runbook.
