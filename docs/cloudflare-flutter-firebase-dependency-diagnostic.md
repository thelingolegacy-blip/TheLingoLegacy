# Flutter web preview dependency diagnostic

The second Cloudflare preview build generated the missing web platform scaffold
successfully, then failed compiling Firebase Auth Web.

Observed failure:
- Package: `firebase_auth_web 5.8.13`
- Error: `Type 'PromiseJsImpl' not found` in
  `lib/src/interop/auth_interop.dart`
- The failure is in the resolved FlutterFire web dependency graph, not the
  application entrypoint.
- The repository's `pubspec.yaml` uses older major-version constraints for
  Firebase Core/Auth/Database/Storage/Analytics and has no committed
  `pubspec.lock` on `main`, so the build currently resolves a moving
  dependency graph.

A preview-only diagnostic was configured to run
`flutter pub upgrade --major-versions` after generating web support. This is
an experiment to identify whether a current compatible FlutterFire dependency
set resolves the compiler failure. It is not yet an approved or reproducible
production dependency update.

Acceptance:
1. Inspect the exact resolved package versions and full build output.
2. If compilation passes, capture the generated `pubspec.yaml` and
   `pubspec.lock` changes from the preview build if retrievable, then reproduce
   them in a reviewed source branch.
3. Run Flutter analyze, unit/widget tests, web build and Android debug build
   against the reviewed, locked dependency set.
4. Verify genuine Firebase app options and runtime connectivity separately.
5. Never use fabricated Firebase values or enable production deployment.

Cloudflare Pages remains preview-only, production deployments disabled, and
the recovery branch is the only allowed preview branch.
