# Flutter/Firebase candidate reconciliation — 2026-11-20

## PR #613 versus PR #614

The two candidates overlap on 37 exact paths and differ materially in key shared files:

| File | PR #613 | PR #614 | Review |
|---|---|---|---|
| `pubspec.yaml` | Dart SDK >=3.6.0 | Dart SDK >=3.12.0 | Reconcile against pinned Flutter 3.50.0/Dart 3.14.0 and chosen toolchain contract |
| `pubspec.lock` | Blob `865608559a001e37f48b102352c81c47d139d2a7` | Blob `d6f194dd6eb309e707e7956cf3548812b22f7221` | Different dependency resolution; regenerate once from final manifest/toolchain |
| Flutter/Firebase workflow | 3,103 bytes | 7,243 bytes | #614 adds publication-boundary and more comprehensive tests/build gates |
| `android/app/build.gradle.kts` | Kotlin DSL block but no app-level Kotlin Android plugin | Applies `org.jetbrains.kotlin.android` | #613 likely fails to resolve `kotlin { }` extension; retain #614 plugin application |
| `lib/firebase_options.dart` | `isConfigured` requires every platform to be configured | `isConfiguredFor(currentPlatform)` validates active platform only | #613 prevents Firebase startup on a configured platform while other platform placeholders remain; retain #614 per-platform check |
| `lib/main.dart` | Earlier layout | Narrow-screen sizing adjustment | Reconcile with device/browser tests |

Both branches keep Firebase options as placeholders and no production project/credentials. Preserve the non-production fail-closed boundary.

## Current #614 Android wrapper gate

At current PR #614 head `66be1f6369f9a8bf3fd8b6c7aeca1a0ce768a666`:
- `verify-flutter-android-readiness.mjs` requires `android/gradlew`, `android/gradlew.bat`, and `android/gradle/wrapper/gradle-wrapper.jar`.
- All three files are absent from the branch.
- `cloudflare-pages-preview-build.sh` generates only a temporary web scaffold; it does not generate Android wrapper files.
- The workflow skips `flutter build apk` if readiness fails, then the final `Enforce Android build readiness` step exits 1.

Thus current #614 Android readiness is blocked until the wrapper is generated/committed or the workflow is redesigned to generate and verify it before the gate. The PR description's earlier 6/6 readiness result refers to an older commit and does not establish current-head readiness.

## Candidate recommendation

- Retain #614's Firebase generated-output quarantine, active-platform Firebase guard, Kotlin plugin application, and richer readiness/build checks as the stronger safety baseline.
- Port only independently reviewed #613-only changes after comparing exact files and tests.
- Reconcile the root SDK constraint and regenerate a single lockfile using pinned Flutter/Dart.
- Decide explicitly whether Android wrapper artifacts are committed or generated in CI; the validator and workflow must agree.
- Pin all third-party actions to verified immutable SHAs and maintain a zero-secrets, least-privilege workflow.
- Re-run root/Oasis Flutter analyze/tests, web build, Android readiness/APK, and Firebase publication tests on the exact consolidated SHA. No current-head acceptance is available while Actions admission fails.

Comments:
- #613: 7051354229
- #614: 7051354930
- Master #612: 7051356690

No code changes were made to #613/#614 in this review. No merge, rebase, build, test, Firebase project selection, Hosting publication, or production operation occurred.
