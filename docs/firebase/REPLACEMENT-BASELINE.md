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

1. Add and pin compatible `firebase_auth` and `cloud_firestore` dependencies alongside `firebase_core`.
2. Generate real platform options for the confirmed development/staging Firebase project; never commit private service-account credentials.
3. Add an Auth repository and explicit signed-out, loading, authenticated, and error states. Do not treat local UI state as identity.
4. Add a Firestore repository that requires a verified Firebase ID token and server-enforced authorization; scope every read/write to tenant, product, resource, and operation.
5. Keep wallets, balances, rewards, and financial transactions server-authoritative. The client must never directly set trusted balances.
6. Implement role/attribute authorization, approval records, audit events, session revocation, and fail-closed behavior on trusted server endpoints before protected data is enabled.
7. Test unauthenticated access, cross-tenant access, revoked sessions, least privilege, and offline/error behavior in the emulator and CI.

## Deliberately not included

- No Firebase project creation/deletion or remote data migration.
- No actual API keys, app IDs, service-account files, or production project identifiers.
- No Hosting deployment target or publish command; existing Hosting safeguards and Cloudflare route ownership must be reconciled separately.
- No live account or wallet writes.

## Activation gates

Confirm the intended Firebase project ID and environment ownership; register the actual Flutter app IDs; generate configuration using the approved FlutterFire workflow; validate emulator rules and CI; complete security review; and obtain explicit release approval before remote deployment. This branch is a reviewable replacement only. Merge and deployment remain blocked pending review and evidence.
