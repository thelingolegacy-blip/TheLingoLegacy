# LINGO Recovery Route Framework

This branch is an isolated recovery scaffold. It does not alter the production Worker, DNS, Access policies, Firebase resources, or cache.

## Current authority

- Production apex and www routes remain attached to the existing `thelingolegacy` Worker.
- The `nextjs-lingolegacy` D1-backed Worker remains excluded from any new public route until authorization checks are reviewed and tested.
- The Firebase client config in the repository contains placeholder values. Do not deploy the Flutter app to Firebase until the actual project/app config is verified.
- No Firebase or Flutter CLI is connected to this remote repository session, so no build or Firebase deploy is claimed.
- The GitHub runner-dispatch gate remains separate; a workflow file existing is not proof that a job executed.

## Proposed safe recovery path

1. Keep the canonical production route untouched.
2. Use a dedicated `workers.dev` sandbox without custom-domain routes, database bindings, or secrets.
3. Verify a health endpoint and browser-origin response from an independent network.
4. Resolve Firebase project/client configuration from the Firebase Console; do not commit service-account keys or secret values.
5. Run `flutter pub get`, `flutter analyze`, and `flutter build web --release` on a verified host.
6. Audit Firebase Auth, Realtime Database/Firestore rules, Storage rules, Functions, and all API handlers before backend reconnection.
7. Review cache headers first; purge only after a verified release is approved.
8. Require run ID, runner ID, executed steps, retrievable logs, exact commit correlation, and independent runtime verification before promotion.

## Cache policy

- HTML and app shell: revalidate on each navigation.
- Versioned/hashed assets: long-lived immutable cache.
- Authenticated API responses and user data: `no-store`.
- Cleanup is audit-first. No production CDN purge or data deletion is performed by this branch.
