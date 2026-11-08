# Source Inventory Correction and Additional Findings — 2026-10-23

This addendum supersedes any earlier matrix wording that implied the root Flutter manifest was absent or that no LINGOassister implementation exists. It records the repository inspection performed after the initial matrix was committed.

## Confirmed source inventory

- Root Flutter package exists: `pubspec.yaml`; app entrypoint `lib/main.dart`; Firebase options `lib/firebase_options.dart`; Android and iOS project directories are present.
- Root CI workflow `.github/workflows/flutter-firebase-integrity.yml` requires `lib/firebase_options.dart`, runs a Firebase project contract verifier, then attempts dependency resolution, analysis, tests, web build and Android debug build.
- Existing deterministic agent core exists under `lingoassister/`: `README.md`, `repair-engine.mjs`, and `repair-engine.test.mjs`. Its documentation says it is a pure logic foundation; it does not execute commands, connect to providers, persist incidents durably, or deploy. LINGOassister is therefore **partially implemented**, not wholly absent; a connected runtime/orchestrator remains unverified.
- `scripts/verify-flutter-firebase.mjs` rejects placeholders in Firebase configuration.
- `lib/firebase_options.dart` contains placeholder API keys/app IDs for Web, Android, iOS and macOS. `firebase.client.json` also contains placeholder values. Firebase configuration acceptance is therefore **BLOCKED** until valid project-specific public app configuration is supplied and rules/access controls are independently checked.
- `.firebaserc` identifies `lingo-legacy-production` as the default Firebase project.
- `firebase.json` configures Firebase Hosting with public root `.`. Because the README identifies Cloudflare Workers as the intended production authority and Firebase is not established as the production host, do not run a Firebase deploy as a workaround. Before any future Firebase Hosting use, review publication scope; a repository-root public directory could expose files that should not be hosted even if dotfiles and node_modules are ignored.
- No root `functions/` or `firebase/` directory was found in the inspected root listing; no root `tests/` directory was found. This is not proof that there is no backend code elsewhere in the repository or another repository.
- The declared Flutter assets `assets/images/`, `assets/icons/`, `assets/sounds/`, `assets/fonts/Inter-Regular.ttf`, and `assets/fonts/Inter-Bold.ttf` do not exist in the inspected repository tree. The root Flutter `lib/main.dart` has no references to `Image.asset`, `AssetImage`, `rootBundle`, audio assets, or custom font declarations.

## Isolated patch opened

A separate branch, `fix/flutter-pubspec-missing-assets-2026-10-23`, removes the unused/missing Flutter asset and font declarations from `pubspec.yaml` and adds `docs/audits/FLUTTER-MANIFEST-REPAIR-2026-10-23.md`. The change is a reversible manifest correction, not a claim of a successful Flutter build.

## Still unverified

- Flutter SDK version and `pub get`, analyzer, unit/widget tests, web build, Android build and iOS build results.
- Firebase project app configuration validity, enabled Auth providers, RTDB/Firestore rules, Storage rules, App Check, IAM, backups, PITR and restore.
- A production-grade durable incident store, authenticated GitHub/Cloudflare evidence adapters, authorized-action adapter, and scheduled agent orchestrator for LINGOassister.
- Exact correspondence between source SHA and deployed Cloudflare Worker version.
- Live application/API, keyboard accessibility, contrast and security-header acceptance on the exact intended staging commit.

## Disposition

G02 remains BLOCKED. Production remains PROTECTED HOLD. No Firebase, Cloudflare, DNS, runner, secret, payment or production configuration was mutated. No test/build pass is claimed.
