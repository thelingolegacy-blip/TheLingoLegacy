# Firebase replacement baseline

Status: staged for review; not connected to or deployed to a Firebase project.

## Decision

Use Firebase Authentication and Cloud Firestore as the initial managed services. Keep the first integration narrow. Do not enable Storage, Realtime Database, Analytics, Messaging, Functions, App Check enforcement, or Hosting through this change; add services only when a reviewed product requirement and security design justify them.

## Included

- `firebase.json` declares Firestore rules and index files plus a local Firestore emulator port.
- `firestore.rules` denies all reads and writes until authenticated, tenant-scoped policies are implemented and tested.
- `firestore.indexes.json` is an explicit empty manifest.
- Flutter platform options use placeholders, including `YOUR_FIREBASE_PROJECT_ID`, rather than an unverified production-looking project identifier. The existing startup guard therefore keeps the app in offline preview mode.
- `.firebaserc` remains unbound to any project until the intended project and environment are confirmed.

## Flutter integration sequence

1. **Implemented in this branch:** compatible `firebase_auth` and `cloud_firestore` client dependencies are declared alongside `firebase_core`.
2. **Implemented in this branch:** a Firebase session gate, email/password sign-in and account creation, password reset, email-verification gate, session-aware sign-out, and safe offline-preview fallback.
3. **Implemented in this branch:** a tenant/product/resource-scoped Firestore reference factory. It is not an authorization system; Firestore rules remain deny-all and no protected data operation is enabled.
4. Generate real platform options for the confirmed development/staging Firebase project; never commit private service-account credentials.
5. Implement and review server-side identity/role/attribute authorization, approval records, audit events, session revocation, and tenant membership policies before enabling protected reads/writes.
6. Keep wallets, balances, rewards, and financial transactions server-authoritative. The client must never directly set trusted balances.
7. Test unauthenticated access, cross-tenant access, revoked sessions, least privilege, email verification, password reset, and offline/error behavior in the emulator and CI.

## Deliberately not included

- No Firebase project creation/deletion or remote data migration.
- No actual API keys, app IDs, service-account files, or production project identifiers.
- No Hosting deployment target or publish command; existing Hosting safeguards and Cloudflare route ownership must be reconciled separately.
- No live account or wallet writes.

## Activation gates

Confirm the intended Firebase project ID and environment ownership; register the actual Flutter app IDs; generate configuration using the approved FlutterFire workflow; validate emulator rules and CI; complete security review; and obtain explicit release approval before remote deployment. This branch is a reviewable replacement only. Merge and deployment remain blocked pending review and evidence.
\n## Current validation status\n\nThe latest commit has no completed GitHub Actions jobs or artifacts. The four associated workflow runs ended with `startup_failure`; therefore dependency resolution, Flutter analysis, tests, and emulator rules are not verified. A local Flutter/Dart toolchain was not available in the execution environment. Do not interpret a successful file write or pull request creation as a passing build.\n