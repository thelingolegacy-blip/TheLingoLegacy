# Mobile build recovery — 2026-11-02

## Scope and safety

This change adds an isolated GitHub-hosted development-build pipeline. It does not deploy to Firebase Hosting, upload to App Store Connect or Google Play, sign a release, alter production infrastructure, or authorize promotion.

The current Flutter source declares Android, iOS, web, and macOS Firebase options, but all platform keys and app IDs remain placeholders. The checked-in Android application Gradle file uses debug signing for its release build type. The iOS project directory contains only stub files rather than a usable Xcode project. The Android directory also lacks the standard Flutter Gradle wrapper/settings scaffold in the default-branch inventory.

## Pipeline behavior

The workflow regenerates Android/iOS native scaffolding inside ephemeral CI workspaces using the Flutter CLI, then:

- resolves Flutter dependencies;
- runs static analysis;
- compiles the web release output as a development artifact only;
- compiles an Android debug APK, not a Play Store release;
- compiles an unsigned iOS simulator app, not an App Store archive;
- uploads short-retention artifacts for inspection.

The generated native platform scaffolding is not committed back to the repository by this workflow. This prevents generated project files from silently replacing owner-controlled signing, bundle identifiers, entitlements, capabilities, or native configuration.

## Explicit release blockers

1. Register the intended Firebase apps in the correct Firebase project and securely supply the generated platform configuration through the approved secret/configuration workflow. Do not commit API keys or service credentials.
2. Replace placeholder values in `lib/firebase_options.dart` with generated, verified Firebase app configuration. Verify Android application ID and iOS bundle ID against provider registrations.
3. Add Android Play release signing through protected GitHub Actions secrets or a secure signing service. Never use the debug keystore for release.
4. Complete the full iOS Xcode project, bundle identifier, capabilities, privacy manifests, provisioning profile, and Apple signing through the authorized Apple Developer account.
5. Confirm privacy policy, data safety disclosures, age rating, export compliance, app content, screenshots, store metadata, and support URLs before submission.
6. Run real device tests for login, navigation, media playback, offline/error behavior, accessibility, and account/data deletion.
7. Obtain independent acceptance and explicit production promotion authorization.

## Acceptance semantics

- Workflow success means only that the CI environment completed the named development build steps.
- An Android debug APK is not a production AAB and is not Play Store signed.
- An unsigned iOS simulator app is not an App Store archive.
- A web build is not proof of Firebase Hosting configuration or live publication.
- Placeholder Firebase options may allow compilation but do not establish runtime Firebase initialization.
- No artifact from this workflow may be represented as production-ready until all release blockers are resolved and independently verified.
