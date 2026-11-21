# PR #613 / #614 selective reconciliation plan — 2026-11-20

**Scope:** Source-only comparison of the two current recovery candidates. This document is a reconciliation decision record, not a merge instruction or test result.

## Current comparison

- PR #613: 43 changed paths; 1,929 additions / 88 deletions.
- PR #614: 41 changed paths; 2,733 additions / 95 deletions.
- Shared paths: **37**.
- Shared paths with byte-identical patch text: **23**.
- Shared paths with differing patch text: **14**.
- PR #613-only paths: **6**.
- PR #614-only paths: **3**.
- Both PRs are still drafts. No merge was performed.

## Recommended reconciliation strategy

Use PR #614 as the preferred security/publication-boundary baseline for selective reconciliation, not as an automatically accepted or mergeable bundle. Preserve PR #613-only recovery evidence and its read-only hosted-runner probe as separate, reviewable additions. Do not wholesale merge either branch.

### Preserve from PR #614 unless later tests identify a defect

1. Firebase Hosting is bound to `build/firebase-public`, with an empty/quarantined allowlist and a generated noindex 404. Do not restore root-directory publication or populate the allowlist as part of this recovery.
2. `scripts/cloudflare-pages-preview-build.sh` creates a temporary web scaffold outside the repository checkout. This is safer than running `flutter create .` in-place because it avoids rewriting the repository's pubspec and invalidating the committed lockfile.
3. Workflow third-party actions are pinned to immutable commit SHAs and checkout uses `persist-credentials: false`.
4. `DefaultFirebaseOptions.isConfiguredFor(FirebaseOptions)` validates the active platform independently and checks project ID as well as API key, app ID and sender ID. This avoids requiring every platform to be configured before any one valid platform can initialize.
5. Android Gradle Kotlin DSL explicitly applies `org.jetbrains.kotlin.android` and keeps `minSdk = 21`.
6. Keep the separate Firebase options tests, Cloudflare preview isolation test and Oasis lockfile as candidates for the final consolidated change, subject to reproducibility checks.

### Selectively port from PR #613

1. The read-only GitHub-hosted startup probe in `.github/workflows/actions-startup-probe.yml` is a useful isolated diagnostic candidate. It requests read-only `contents` and `actions` permissions and targets `ubuntu-latest`, not G02. Keep it separate from product build acceptance; a startup probe pass cannot certify Flutter, Firebase, Android or G02.
2. Preserve the API-21 compatibility decision and source references in `docs/android-api21-firebase-compatibility.md`, after independently checking the cited version matrix and changelogs.
3. Preserve the Cloudflare preview history/diagnostic documents as provenance only. Verify deployment IDs, commit SHAs, build stages and logs before using any historical success as current acceptance evidence.
4. Keep the stronger 360x800 narrow-screen regression coverage if the selected final widget suite does not already cover an equivalent or narrower viewport.

## Fourteen differing shared paths — disposition

| Path | Reconciliation decision |
|---|---|
| `.github/workflows/flutter-firebase-integrity.yml` | Prefer #614's immutable action pins, explicit permissions, concurrency, separate root/Oasis tests, Firebase publication-boundary checks and evidence upload. Retain the wider path coverage from #613 where needed. Keep Firebase staging check visibly BLOCKED when no approved staging identity exists. |
| `android/.gitignore` | Reconcile with the actual wrapper-generation model. Do not ignore a wrapper that the acceptance validator requires to be checked in unless the wrapper is deliberately generated and verified in a clean build workspace. |
| `android/app/build.gradle.kts` | Prefer #614's explicit Kotlin Android plugin. Preserve namespace/application ID and API 21. Verify plugin versions in settings and run a real Gradle build. |
| `lib/firebase_options.dart` | Prefer #614's per-platform validation, including non-empty and non-placeholder project ID. Test all supported platforms and unsupported-platform behavior. |
| `lib/main.dart` | Preserve guarded Firebase initialization and the shared preview UI. Resolve the grid extent to one tested responsive value; retain narrow-device overflow coverage. |
| `pubspec.lock` | Do not choose by branch age or diff size. Reproduce with Flutter 3.50.0 and `flutter pub get --enforce-lockfile`; commit only actual solver output. |
| `pubspec.yaml` | Reconcile direct dependency pins and SDK constraints with the selected lockfile. Never run a major-version upgrade to make the lockfile pass. |
| `scripts/build-firebase-public.mjs` | Compare full implementation and tests; retain the stricter traversal, hidden-file, credential-extension, duplicate, symlink and allowlist boundary checks. |
| `scripts/test-build-firebase-public.mjs` | Merge the complete negative-case matrix; ensure tests cover traversal, symlink, duplicate, hidden/config/secret files, empty allowlist and output exactness. |
| `scripts/test-verify-flutter-android-readiness.mjs` | Retain strict tests, but align them with the actual generated-wrapper workflow so the test does not confuse a generated ephemeral wrapper with a required committed binary. |
| `scripts/test-verify-flutter-firebase.mjs` | Merge all fail-closed cases and the valid staging case; also test the no-staging placeholder/disconnected path if that is the selected contract. |
| `scripts/verify-flutter-android-readiness.mjs` | Resolve the wrapper contradiction below before treating this as a release gate. |
| `scripts/verify-flutter-firebase.mjs` | Prefer explicit staging identity, production rejection and a clearly separated disconnected-placeholder mode. Contract test must match the selected behavior exactly. |
| `test/widget_test.dart` | Consolidate desktop, 360x800/375x812 mobile, preview-only account disclosure and Firebase-disconnected assertions without duplicate brittle tests. |

## Critical unresolved contradiction — Android wrapper

The current #614 Android readiness validator requires all of these to exist in the checked-out tree: `gradle-wrapper.jar`, `gradlew`, and `gradlew.bat`. The current candidate branch does not contain them. The #613 `android/.gitignore` explicitly ignores all three. #613's workflow attempts to generate the Android scaffold in-place using `flutter create . --platforms=android --no-pub`; #614's preview script deliberately generates only the web scaffold in a temporary directory and does not create Android wrapper files.

Therefore:
- The current #614 Android readiness gate will correctly report BLOCKED against its current checkout; no APK build has been demonstrated by the present source.
- Do not claim Android readiness PASS based only on source scaffold, wrapper properties, or prior preview notes.
- Preferred next experiment: generate the Android wrapper/scaffold using the exact pinned Flutter 3.50.0 SDK in a disposable clean checkout or temporary project; copy only the intended, version-matched generated wrapper artifacts if that is the agreed repository policy; verify their provenance and executable bits; then run the readiness validator and `flutter build apk --debug`.
- Do not fabricate a JAR, hand-author wrapper scripts, or run `flutter create .` against a working or credentialed checkout without a reviewed overwrite diff.

## Other acceptance caveats

- #614's workflow intentionally continues through non-Firebase checks when staging Firebase is not configured, but Firebase integration must remain visibly BLOCKED and initialization disabled. A passing static quarantine check is not a Firebase runtime integration pass.
- #613's workflow uses mutable action tags and an in-place Android scaffold-generation step. Do not port those workflow mechanics unchanged.
- A passing Cloudflare Pages preview proves only the exact preview build/deployment at its recorded commit. It does not prove GitHub Actions admission, Android APK readiness, Firebase connectivity, production routing, or release readiness.
- Root and Oasis lockfiles must be separately reproduced and verified; do not hand-author either.
- iOS remains incomplete/stubbed; Android source inspection does not certify iOS.
- No candidate currently supplies the missing GitHub Actions admission evidence or G02 runner evidence.

## Next safe sequence

1. Preserve both drafts and all current source commits.
2. Build a temporary comparison branch from the agreed parent; apply only the selected file-level changes above.
3. Run source-level syntax checks and unit tests in a disposable unprivileged environment with no provider credentials.
4. Reproduce both lockfiles with the pinned SDK and enforce-lockfile mode.
5. Generate and verify Android wrapper artifacts in an isolated checkout; run an actual debug APK build.
6. Run the preview-only web build and verify exact commit, stages, logs, artifact hashes and browser smoke.
7. Obtain independent review of Firebase publication, Android, workflow permissions and dependency provenance.
8. Keep PR draft/unmerged until hosted Actions admission and all required evidence are available.

## Safety disposition

- #613 and #614 remain OPEN / DRAFT / UNMERGED.
- Firebase project identity remains unapproved; Firebase runtime remains disconnected.
- Firebase Hosting allowlist remains empty and publication remains quarantined.
- Android API 21 is preserved; APK readiness remains UNVERIFIED.
- G02 remains FAIL / UNVERIFIED; G03–G11 remain blocked.
- Production and last-known-good remain PROTECTED HOLD.
- No merge, workflow dispatch, runner activation, provider mutation, DNS/Worker change, Firebase publication, payment activation, signing-key creation, backup deletion or paid spend was performed.
