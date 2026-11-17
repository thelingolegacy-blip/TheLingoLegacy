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
the current PR head. The next preview must use the current branch head, not
reuse commit `1e82a17`.

The preview build remains an experiment: its ephemeral dependency upgrade did
not write a reviewed lockfile to Git, and no reproducible dependency update
has yet been accepted. Do not infer that all Flutter packages are compatible
from this one web compile attempt.

## Remaining acceptance

1. Re-run the isolated preview against the current recovery branch head and
   capture exact commit, toolchain, resolved dependency graph and full logs.
2. If web compilation passes, reproduce the resolved dependency set in source
   and commit a real `pubspec.lock`; do not fabricate a lockfile.
3. Run `flutter pub get --enforce-lockfile`, `flutter analyze`, unit/widget
   tests, web release build and Android debug build against that lockfile.
4. Review any required Dart/API migrations caused by major Firebase package
   upgrades.
5. Verify genuine Firebase app registrations/options and runtime connectivity
   separately. Current Firebase options contain placeholders and cannot
   establish a working Firebase runtime.
6. Never enable Firebase production hosting or Cloudflare production deploys
   as part of this diagnostic.

Cloudflare Pages remains preview-only, production deployments disabled, and
the recovery branch is the only allowed preview branch.
