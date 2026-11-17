# Flutter preview build pipeline

The Cloudflare Pages project `lingo-flutter-firebase-preview` is a preview-only validation target. Production deployments are disabled.

## Reproducible SDK identity

The preview build fetches the official Flutter `3.50.0` release tag with Git tag metadata, checks out that exact tag, and verifies `git describe --tags --exact-match` before invoking Flutter. A raw shallow commit checkout without the release tag was previously reported by Pub as SDK `0.0.0-unknown`, causing dependency resolution to fail even though the SDK framework revision was correct. Do not use that tagless checkout.

## Validation sequence

- Verify the Flutter SDK release identity and Dart version.
- Generate only the web platform scaffold with `flutter create . --platforms web --no-pub`; this does not run dependency upgrades.
- Run the API-21 Firebase contract test suite and validator before dependency resolution.
- Run the Firebase readiness validator; placeholder credentials must remain disconnected in recovery.
- Resolve root dependencies with `flutter pub get`; never use `flutter pub upgrade --major-versions`.
- Run root analysis and widget tests, Oasis analysis and catalog tests, then a Flutter web release build.
- Capture actual Pub solver output for review. Commit `pubspec.lock` only from a successful run and never hand-author it.

## Acceptance boundary

A successful web preview does not prove Android APK readiness. Android Gradle wrapper/settings/root files and MainActivity still need to be completed in source, then a real `flutter build apk --debug` must pass with `minSdk 21`. Firebase-backed services remain disabled until a dedicated staging Firebase project and platform app credentials are approved.
