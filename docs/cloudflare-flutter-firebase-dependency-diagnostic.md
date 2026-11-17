# Flutter web preview dependency diagnostic

## Previous FlutterFire interop failure

An earlier Cloudflare preview failed compiling Firebase Auth Web with
`firebase_auth_web 5.8.13` and unresolved JavaScript interop types/helpers.
The failure was in the resolved FlutterFire web dependency graph, not the
application entrypoint.

## Latest isolated diagnostic — 2026-11-17

Deployment: `76500ff9-e0c1-4ff5-a383-db3f4a6109e2`
Preview URL: https://76500ff9.lingo-flutter-firebase-preview.pages.dev
Build checkout commit: `1e82a172fcd436a4d3f22a93f640af3e837a3705`
Flutter framework: `ab2912035e160d9cad6306df307576da6128ebdb`
Flutter: `3.50.0`; Dart: `3.14.0`

The preview-only `flutter pub upgrade --major-versions` resolved the
following FlutterFire versions and moved past the prior JS interop errors:

- `firebase_core 5.2.0`
- `firebase_auth 7.1.0`; `firebase_auth_web 6.4.0`
- `firebase_database 13.1.0`
- `firebase_storage 14.1.0`; `firebase_storage_web 3.12.0`
- `firebase_analytics 13.1.0`

The build then failed on missing Flutter asset paths declared in the older
checkout's `pubspec.yaml`: `assets/images/`, `assets/icons/`,
`assets/sounds/`, and the Inter font files under `assets/fonts/`.
No such Flutter asset/font files exist in the repository tree, and the current
PR branch has already removed these unused declarations from `pubspec.yaml`.
Therefore this deployment tested an earlier branch commit and does not test
the current PR head.

## Successful current-head preview

- Deployment `98a6e679-3d0c-4ad5-ba2e-3c5c5da15f16`, commit
  `d105f408f75e7ec38310ae923aec821f24b35bf1`: Flutter web release build
  succeeded; 39 assets published to the isolated preview.
- Deployment `bca75879-2393-4ab5-9b78-2ce97ac565d4`, commit
  `152063c90543aa94a7a4fd2f5fd56fe090da357a`: follow-up current-head
  preview also succeeded.
- Deployment `f38c8e18-1dd9-4fe0-8024-36e2e081d495`, commit
  `69db1b4bd87d99695aa769434755e1681f4fdc56`: Flutter web build succeeded
  and the two new widget tests were committed in the source, but this
  deployment used the previous Pages build-command snapshot. Its logs do not
  show `flutter analyze` or `flutter test` execution.

Two widget tests now cover the flagship hub rendering and the account
preview-only disclosure. The Cloudflare preview build command has since been
updated to run `flutter analyze` and `flutter test --reporter expanded`
before the release web build. A new deployment against the current branch
head is required to collect those results; they are not yet verified.

## Dependency reproducibility and remaining acceptance

The ephemeral major-version upgrade still does not provide a reviewed,
committed lockfile. Do not infer that all Flutter packages are compatible from
the successful web compilation alone.

1. Run the updated preview command and capture analyzer and widget-test output.
2. Reproduce the resolved dependency set in source and commit a real
   `pubspec.lock`; do not fabricate a lockfile.
3. Run `flutter pub get --enforce-lockfile`, `flutter analyze`, unit/widget
   tests, web release build and Android debug build against that lockfile.
4. Review any Dart/API migrations caused by major Firebase package upgrades.
5. Verify genuine Firebase app registrations/options and runtime connectivity
   separately. Current Firebase options contain placeholders and cannot
   establish a working Firebase runtime.
6. Never enable Firebase production hosting or Cloudflare production deploys
   as part of this diagnostic.

Cloudflare Pages remains preview-only, production deployments disabled, and
the recovery branch is the only allowed preview branch.
