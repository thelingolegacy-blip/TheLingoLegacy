# Cross-stack execution plan — 2026-11-08

**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `hardening/flutter-firebase-cloudflare-2026-11-08`  
**Related PR:** #504 — Hardening: Flutter Firebase and Cloudflare release boundaries  
**Disposition:** Implementation plan and evidence register. This document does not authorize production promotion.

## Architecture ownership

- **Canonical web frontend:** Next.js / React / TypeScript in the web repository. Preserve this working web surface; do not replace it with Flutter Web without a separately reviewed migration.
- **Mobile application:** Flutter / Dart in this repository. Flutter is the mobile application shell and can share domain contracts with the web frontend.
- **Identity and application services:** Firebase Authentication and Firebase services only after the real project, app registrations, provider settings, App Check, and rules are verified.
- **Backend trust boundary:** Cloudflare Workers and/or Firebase server-side functions may host trusted APIs. Clients never authorize their own rewards, balances, game outcomes, eligibility, entitlements, or administrative actions.
- **Source and delivery:** GitHub is source of truth; Cloudflare is canonical public web delivery. Firebase Hosting is limited to the explicit Flutter artifact path if retained. Vercel is not an assumed production deploy target.
- **Observability:** Datadog for infrastructure/service observability; PostHog for product analytics; Crashlytics for supported mobile crash reporting. Avoid collecting sensitive credentials, payment data, or unnecessary personal data.

## Current source facts reviewed

- `pubspec.yaml` includes Flutter, Firebase Core, Realtime Database, Auth, Storage, Analytics, Provider, HTTP, and supporting packages.
- `lib/main.dart` initializes Firebase only when complete client configuration is available and otherwise renders a preview shell.
- `lib/firebase_options.dart` reads platform client configuration from build-time Dart defines; no service-account key belongs in a Flutter client.
- `firebase.json` publishes only `build/web`; this is intentionally separate from the canonical Cloudflare website.
- `android/app/build.gradle` currently uses application ID `com.thelingolegacy.app`, min SDK 21, target SDK 34, version 1.0.0+1, and has no production signing configuration.
- `.firebaserc` selects `lingo-legacy-production`; the existence, ownership, platform registrations, Auth settings, App Check, rules, Functions and billing configuration have not been verified through a Firebase account connection.
- Flutter Firebase integrity workflow includes Node contract tests, Flutter dependency resolution, analysis, tests, web build, Android debug build, and strict configuration validation.
- On the reviewed PR head, GitHub Actions runs failed before job creation (zero jobs); no Flutter SDK step executed. Vercel reported a build-rate-limit failure. Neither is a passing release signal.

## Parallel workstreams

### A. GitHub CI and repository controls
1. Restore Actions job startup and confirm runner labels/capacity, repository Actions permissions, concurrency limits, and workflow policy.
2. Run the Flutter integrity workflow on the PR head.
3. Capture complete job logs and artifacts; distinguish startup failures from workflow/test failures.
4. Add main-branch protection, required CI, independent review, and force-push/deletion restrictions through authorized repository settings.
5. Do not merge PR #504 until checks and independent review are satisfied.

### B. Flutter application quality
1. Run `flutter pub get`, `flutter analyze`, `flutter test`, web build, and Android debug build.
2. Verify supported SDK constraints, plugin versions, platform identifiers, app startup, error handling, and preview-mode behavior.
3. Add widget tests for preview status, navigation destinations, and Firebase initialization success/failure.
4. Add integration tests using Firebase Emulator Suite or isolated demo projects; no production user data.
5. Configure production signing only through owner-controlled secure signing infrastructure; never commit keystores or signing passwords.

### C. Firebase project readiness
1. Verify project `lingo-legacy-production` exists and the owner has appropriate project-level access.
2. Inventory Web, Android, iOS and macOS app registrations; reconcile exact IDs with source.
3. Configure approved Auth providers and authorized domains.
4. Enable and test App Check where supported.
5. Review Firestore/Realtime Database and Storage rules against explicit data ownership and role models.
6. Add emulator-backed rules tests and authenticated account lifecycle tests.
7. Confirm Functions deployment region, service identities, quotas, billing alerts, backups and recovery.
8. Store only non-secret client configuration as repository variables; keep admin/service credentials in secret managers and out of client builds.

### D. Backend API and game integrity
1. Publish versioned API contracts for identity, profiles, game sessions, inventory, rewards and community.
2. Verify Firebase ID tokens server-side; enforce issuer, audience, expiry, revocation strategy, and role/ownership checks.
3. Make game outcomes and reward grants server-authoritative, idempotent, auditable and replay-resistant.
4. Add request validation, rate limits, abuse controls, structured logs, health checks and error budgets.
5. Use staging-only test data and prove isolation from production before any deployment.
6. Do not bind existing production D1/Firebase resources or migrate data by assumption.

### E. Frontend integration
1. Preserve the current Next.js/React/TypeScript canonical website.
2. Share typed API schemas and design tokens with Flutter where practical; do not duplicate business rules in clients.
3. Verify account, profile, game launch, community and support flows against authenticated staging APIs.
4. Add responsive, accessibility, browser, and mobile-device acceptance checks.
5. Treat unavailable services as clearly labeled preview states, not simulated successful accounts or transactions.

### F. Cloudflare delivery and security
1. Reconcile the 18 Worker-owned production routes and three explicit route exceptions with the live route inventory.
2. Test the staging Worker and rate limiting using the staging D1 database only.
3. Replace isolate-local rate-limit state with a shared, durable mechanism and prove behavior across isolates.
4. Verify Access policies individually; do not remove shared policies globally.
5. Review bindings, secrets, environment separation, observability redaction, cache behavior, rollback and health checks.
6. No production route, DNS, Worker code, binding, D1 row or secret mutation without an explicit change plan and verified rollback.

### G. Observability and product analytics
1. Define service-level indicators for availability, latency, errors, queue/job health and game API correctness.
2. Add Datadog monitors only after ownership, thresholds, routing and notification targets are agreed.
3. Add PostHog event taxonomy with data minimization, consent/privacy review and exclusion of sensitive values.
4. Validate Crashlytics collection and release symbol/source-map handling for supported platforms.
5. Exercise one controlled staging incident and confirm alert, diagnosis, recovery and post-incident evidence.

## Release gates

A release candidate is not ready until all are true:

- Required CI jobs start and pass on the exact candidate commit.
- Flutter analysis, tests, web build and Android build pass.
- Firebase project and app registrations are verified; Auth, App Check, database and Storage rules are tested.
- Backend token validation, authorization, idempotency, abuse controls and audit logs pass.
- Web/mobile end-to-end and accessibility acceptance pass in staging.
- Cloudflare route inventory, shared rate limiting, bindings and rollback are verified.
- Observability alerts are tested without exposing sensitive data.
- Independent review is recorded and the release owner explicitly approves promotion.

## Current blockers / external dependencies

- GitHub Actions startup failures with zero jobs; account/repository runner settings are not exposed by the current connected GitHub actions.
- Main branch currently reported unprotected; branch-protection settings are not exposed by the current connected GitHub actions.
- Firebase account/project configuration is not accessible in this session.
- Cloudflare account configuration is not accessible in this session for live staging/production changes.
- Production backend binding architecture and the Durable Object/shared rate-limit rollout require verified staging tests.
- Vercel rate limiting is not proof of Cloudflare failure and should not drive an unreviewed hosting migration.

## Execution discipline

- Run independent read-only inspections and isolated tests in parallel.
- Serialize writes to the same file, branch ref, database migration stream, or production resource.
- Record exact commit, environment, command, result, timestamp, and artifact for every test.
- Keep planned, authorized, connected, tested, and production-enabled as separate statuses.
- Do not claim completion without observable evidence.
- Preserve last-known-good production behavior and rollback capability.
