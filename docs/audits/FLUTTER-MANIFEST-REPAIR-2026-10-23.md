# Flutter Manifest Repair — 2026-10-23

**Branch:** `fix/flutter-pubspec-missing-assets-2026-10-23`  
**Base:** `main`  
**Scope:** Isolated source patch; no production mutation.

## Evidence

The root `pubspec.yaml` declared these Flutter assets:
- `assets/images/`
- `assets/icons/`
- `assets/sounds/`
- `assets/fonts/Inter-Regular.ttf`
- `assets/fonts/Inter-Bold.ttf`

Read-only GitHub Contents API checks returned NOT_FOUND for all four declared directories. The root `assets/` directory contains web-facing CSS/JS/SVG files and an `assets/studio/` directory, but not the declared Flutter asset directories. A source inspection of `lib/main.dart` found no `Image.asset`, `AssetImage`, `rootBundle`, audio asset, or custom font references.

## Patch

Removed the nonexistent, unused asset and font declarations from `pubspec.yaml`. Retained the Flutter SDK declaration, dependency declarations, and Material Design setting. This avoids declaring package assets that are not present in version control. When real Flutter image/audio/font assets are restored and used by the app, re-add their exact tracked paths alongside their implementation.

## Validation and limits

- Source-path inspection: completed through repository API.
- Flutter `pub get`, `flutter analyze`, `flutter test`, web build and Android build: **NOT RUN**; no local Flutter SDK execution environment was established in this session, and repository Actions are known to have startup failures.
- Firebase initialization readiness: **BLOCKED** separately. `lib/firebase_options.dart` and `firebase.client.json` contain placeholder API keys/app IDs, and `scripts/verify-flutter-firebase.mjs` explicitly fails while placeholders remain. No credentials were invented or changed.
- Release status: this patch is not merged or deployed. G02 remains BLOCKED and production remains PROTECTED HOLD.

## Acceptance

Review the manifest diff, restore/confirm the intended Flutter assets if they exist in another authoritative source, then run the Flutter dependency/analyzer/test/build checks against this exact commit in a working Flutter environment. Treat Firebase readiness as a separate gate requiring owner-supplied valid public Firebase app configuration and security-rule verification.
