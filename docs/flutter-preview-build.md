# Flutter preview build pipeline

The Cloudflare Pages project `lingo-flutter-firebase-preview` is a preview-only validation target. Production deployments are disabled.

## Reproducibility

- Flutter SDK is fetched by its exact approved commit SHA with a depth-1 Git fetch.
- The build verifies the checked-out SDK SHA before invoking Flutter.
- Flutter platform scaffolding is generated with `flutter create . --platforms web --no-pub`; this does not run dependency upgrades.
- The API-21 Firebase contract test suite and validator run before dependency resolution.
- The Firebase readiness validator confirms that placeholder credentials remain disconnected and that production Firebase credentials are not used in this non-production recovery workflow.
- Root dependencies are resolved with `flutter pub get`; do not use `flutter pub upgrade --major-versions`.
- The pipeline runs root analysis and widget tests, Oasis Flutter analysis and catalog tests, and a Flutter web release build.
- The actual Pub solver output is captured for review. Commit `pubspec.lock` only from a successful run and never hand-author it.

## Acceptance boundary

A successful web preview does not prove Android APK readiness. Android Gradle wrapper/settings/root files and MainActivity still need to be completed in source, then a real `flutter build apk --debug` must pass with `minSdk 21`. Firebase-backed services remain disabled until a dedicated staging Firebase project and platform app credentials are approved.
