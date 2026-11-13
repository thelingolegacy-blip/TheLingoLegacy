# Platform completion blockers — 2026-11-09

This record separates repository evidence from external prerequisites. It does not certify a release.

## Confirmed repository facts

- `.firebaserc` selects Firebase project ID `lingo-legacy-production`. This is a project reference, not proof that the project is accessible, that platform apps are registered, or that credentials are valid.
- `lib/firebase_options.dart` still contains placeholder API keys and app IDs for web, Android, iOS, and macOS. Windows and Linux Firebase options are unsupported.
- A least-privilege Firestore rules file exists for the Oasis game at `studio-sites/games/oasis-platform/firebase-functions/firestore.rules`. It is scoped to that game and does not constitute global rules for every LINGO product.
- The root `firebase.json` contains Hosting configuration. It does not establish that Firebase Hosting is the canonical production edge; Cloudflare remains the observed public delivery layer.
- Android has an app-level manifest and Gradle file, but the inspected tree does not contain a complete Gradle wrapper/root build setup or a Kotlin `MainActivity`.
- iOS contains `.stub` files, not a complete Xcode project. macOS, Windows, and Linux Flutter runner projects were not present in the inspected tree.
- The Android app-level Gradle file previously assigned the debug signing config to release builds. The readiness-hardening change replaces that unsafe default with environment-driven release signing and a packaging guard.
- AppDeploy reports the seven catalogued apps as deployed-ready. This is provider status, not proof that every feature is healthy. The AppDeploy account reported exhausted credits; the Hello LINGO media monitor is disabled for that reason. Kotton's Code image-load errors and LINGO Travel historical frontend errors remain recorded.
- GitHub Actions startup failure with no instantiated jobs remains an external CI execution blocker. It is not evidence that the workflow's commands passed or failed.

## Work that can be completed in source control

- Preserve manual advancement independent of G02/Fallgate.
- Prevent Android release builds from silently using debug signing.
- Keep credentials out of Git and load release signing only from protected environment variables.
- Keep all platform certification states non-certified until real build/install/smoke-test evidence is attached.

## External prerequisites that cannot be fabricated in source

1. Authorized access to Firebase project `lingo-legacy-production`, confirmation of ownership/billing, and platform app registrations.
2. Generated FlutterFire options for each registered app; no placeholder values may be used for live builds.
3. Security review and deployment of appropriate rules for each product's actual data model, plus Auth, App Check, Storage rules, audit events, backup and restore tests.
4. Flutter SDK and complete platform runners; Android SDK/Gradle wrapper; macOS + Xcode for Apple targets; Windows and Linux toolchains for desktop targets.
5. Protected Android keystore and Apple signing/provisioning assets supplied through secure CI secrets, never committed to source.
6. Smart-TV browser/device remote-control QA and native TV packaging only if native TV apps are in scope.
7. Canonical Unity project(s), licensed assets, platform modules, builds and device QA for Unity targets.
8. AppDeploy credits or an approved alternative deployment path to repair the affected app assets and rerun deployment QA.
9. A working hosted GitHub Actions runner or another auditable CI execution path with run/job/commit/artifact correlation.

## Release rule

A source change is not a platform installation. A provider deployment state is not a feature certification. Do not merge, promote, or activate production based on placeholders, static page probes, synthetic test fixtures, or missing CI evidence. Record real build logs, device identity, app version, commit SHA, test result and artifact hash for each certified target.
