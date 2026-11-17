# Flutter web preview dependency diagnostic

## Previous FlutterFire interop failure

An earlier Cloudflare preview failed compiling Firebase Auth Web with
`firebase_auth_web 5.8.13` and unresolved JavaScript interop types/helpers.
The failure was in the resolved FlutterFire web dependency graph, not the
application entrypoint.

## Dependency upgrade and asset repair

Deployment `76500ff9-e0c1-4ff5-a383-db3f4a6109e2` used Flutter framework
`ab2912035e160d9cad6306df307576da6128ebdb` (Flutter 3.50.0 / Dart 3.14.0).
An ephemeral `flutter pub upgrade --major-versions` resolved:

- `firebase_core 5.2.0`
- `firebase_auth 7.1.0`; `firebase_auth_web 6.4.0`
- `firebase_database 13.1.0`
- `firebase_storage 14.1.0`; `firebase_storage_web 3.12.0`
- `firebase_analytics 13.1.0`

This moved past the earlier JS interop errors. The old checkout then failed on
nonexistent `assets/images/`, `assets/icons/`, `assets/sounds/`, and Inter
font paths. The current recovery branch removed those unused declarations.

## Successful current-head previews

- Deployment `98a6e679-3d0c-4ad5-ba2e-3c5c5da15f16`, commit
  `d105f408f75e7ec38310ae923aec821f24b35bf1`: Flutter web release build
  succeeded; 39 assets uploaded.
- Deployment `bca75879-2393-4ab5-9b78-2ce97ac565d4`, commit
  `152063c90543aa94a7a4fd2f5fd56fe090da357a`: follow-up current-head
  preview succeeded.
- Deployment `f38c8e18-1dd9-4fe0-8024-36e2e081d495`, commit
  `69db1b4bd87d99695aa769434755e1681f4fdc56`: web build succeeded, but it
  used the prior Pages command snapshot and did not execute analyzer/tests.

Two widget tests cover the flagship hub render and account preview-only
disclosure. A later preview analyzer run found that repository-wide
`flutter analyze` incorrectly included the separate nested Oasis game
package, resolving its `flutter_map`, `geolocator` and `latlong2`
imports against the root app's dependency graph. The check is now scoped to
`flutter analyze lib test` for the root app, then runs `flutter pub get` and
`flutter analyze lib` in `studio-sites/games/oasis-platform/flutter` using
that package's own `pubspec.yaml`. The root widget test imports `Size`
directly from `dart:ui`, avoiding a deprecated Material umbrella import.

The current Pages build command now runs, in order: root dependency upgrade,
root scoped analyze, root widget tests, nested Oasis dependency resolution and
analysis, root web release build, then base64 dependency-evidence output.
No completed result for this corrected scope has been captured yet.

## Reproducible lockfile capture

After successful analyze/test/web build, the preview command emits
base64-encoded `pubspec.yaml` and `pubspec.lock` in deployment logs. This
will allow the actual generated dependency resolution to be reviewed and
committed; no lockfile has yet been retrieved or committed.

## Remaining acceptance

1. Complete the corrected preview with root analyzer, widget-test and nested
   Oasis analyzer output.
2. Retrieve and review the generated `pubspec.yaml` and `pubspec.lock`;
   commit them only after verifying constraints and transitive dependencies.
3. Run `flutter pub get --enforce-lockfile`, `flutter analyze`,
   `flutter test`, web release build and Android debug build against the
   committed lockfile.
4. Review any Dart/API migrations caused by major Firebase package upgrades.
5. Verify genuine Firebase app registrations/options and runtime connectivity
   separately. Current Firebase options contain placeholders and cannot
   establish a working Firebase runtime.
6. Never enable Firebase production hosting or Cloudflare production deploys
   as part of this diagnostic.

Cloudflare Pages remains preview-only, production deployments disabled, and
the recovery branch is the only allowed preview branch.
