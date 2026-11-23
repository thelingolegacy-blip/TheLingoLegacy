# Firebase replacement checklist

Scope: establish a clean, isolated Firebase development/staging target for the flagship LINGO application. Production remains protected.

## Known project boundaries

- [x] Production project ID recovered: `lingo-legacy-production`.
- [x] Intended non-production project ID recovered: `lingo-legacy-staging`.
- [x] Separate product project remains separate: `loyalty-lane-os`.
- [ ] Verify in Firebase Console or an authorized Firebase project listing that `lingo-legacy-staging` exists and belongs to the correct organization/account.
- [ ] Verify the operator has only the minimum required project permissions.
- [ ] Confirm the project is non-production and has no production data copied into it.

## Project and application setup

- [ ] Confirm or create the staging Firebase project only after ownership and billing posture are checked.
- [ ] Register only the required app IDs for each target platform (Android, iOS, web, and other platforms only if currently supported).
- [ ] Enable Firebase Authentication email/password provider in staging.
- [ ] Create the Cloud Firestore database in the intended region after data-residency review.
- [ ] Keep Firestore rules default-deny until tenant membership and server-side authorization policies are implemented and tested.
- [ ] Keep indexes explicit and reviewable.
- [ ] Do not enable Storage, Realtime Database, Analytics, Messaging, Functions, App Check enforcement, or Hosting in this first scope without a separate reviewed requirement.

## Configuration and secrets

- [ ] Generate FlutterFire options for staging app registrations using the approved FlutterFire workflow.
- [ ] Populate platform-specific public client configuration only in the appropriate environment configuration; never commit service-account private keys.
- [ ] Keep `.firebaserc` unbound or explicitly mapped to a non-production alias until staging ownership is verified.
- [ ] Add a CI environment named `staging` with narrowly scoped credentials only after repository secret access is reviewed.
- [ ] Ensure production credentials and project aliases cannot be selected by staging jobs.
- [ ] Ensure Cloudflare staging Worker runtime binding is `FIREBASE_PROJECT_ID=lingo-legacy-staging`; verify the live setting separately from the checked-in Wrangler file.
- [ ] Fail closed if the runtime project ID is absent, mismatched, or resolves to production.

## Rules, data, and authorization

- [ ] Implement server-side SAAAE: default-deny RBAC/ABAC, tenant/product/resource/operation scoping, token/session validation, revocation, approval records, and tamper-evident audit events.
- [ ] Define tenant membership and role claims from a trusted server-side authority; do not trust client-supplied tenant IDs or roles.
- [ ] Keep wallet balances, rewards, points, and financial transactions server-authoritative.
- [ ] Use synthetic staging data only; do not copy production personal or financial data.
- [ ] Test unauthenticated, cross-tenant, wrong-product, wrong-resource, revoked-session, and least-privilege access cases.
- [ ] Confirm Firestore rules deny all unauthorized reads and writes in emulator tests.

## Verification and release gates

- [ ] Run dependency resolution, formatting, static analysis, unit/widget tests, and Firestore emulator rule tests.
- [ ] Run a Wrangler dry-run and inspect the complete staging Worker bindings before any deployment.
- [ ] Verify CI runs have actual jobs, completed steps, logs, and artifacts; startup failure or an empty status is not a pass.
- [ ] Complete code review and security review.
- [ ] Obtain explicit approval for a staging deployment.
- [ ] After staging deployment, verify project ID, Worker version, routes, database bindings, logs, and negative authorization tests.
- [ ] Keep production deployment as a separate release with separate approval.

## Current verified status (2026-11-23)

- The intended staging ID is recorded as `lingo-legacy-staging`; its live existence and access have not been verified in Firebase.
- The Flutter PR has placeholder platform credentials and a default-deny Firestore rules file.
- A dedicated Wrangler staging source file was updated to use the staging ID; that source change does not prove the live Worker setting changed.
- No successful CI, Flutter build, emulator test, Firebase connection, or staging deployment is established by this checklist.
- No production project, data, route, or deployment was intentionally changed.
