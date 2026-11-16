# Firebase Authentication and Project-Boundary Review

**Observed:** 2026-11-16  
**Release posture:** `PROTECTED_HOLD`  
**Changes made:** read-only source review; no Firebase/GCP provider configuration or deployment changes.

## Verified source state

- Root `.firebaserc` maps the default Firebase project to `lingo-legacy-production`.
- Root `firebase.json` configures Hosting `public: "."`. Its ignore list does not establish a dedicated, allowlisted build output. This is a publication-boundary blocker; do not deploy from the repository root.
- Root `firebase.client.json` names the production project and contains placeholder values for the API key, messaging sender ID, and app ID. It is not a working client configuration.
- `src/auth/firebase-id-token.mjs` implements Firebase ID-token verification using Google's published signing keys and RS256 signature verification. It checks project-specific audience and issuer, subject, expiry, issued-at time, and auth time. It does not use a service-account secret. Its own documentation correctly states that identity verification is not authorization.
- Legacy `firebase-worker.js` hardcodes the production Firebase project/database and contains a shared `FIREBASE_ID_TOKEN` environment-token pattern. Earlier repository-wide reference inspection found no active call site/import. Treat this helper as **prohibited legacy code**; do not configure that shared token or activate the helper.
- No root Firestore rules file was found at the expected root paths. Product-specific rules must be located and audited individually before any Firebase-backed product is accepted.
- No Google Cloud/Firebase administrative connection is available in this workspace, so provider-side project settings, IAM, Auth providers, App Check, service identities, and billing state cannot be changed or independently certified here.

## Required project separation

The only root project target currently declared is production. Do not use it for setup tests.

Before creating Workload Identity Federation, service identities, Firebase Auth clients, or staging secrets, the owner must identify an approved **non-production Google Cloud project ID and numeric project number**. The project number must be read from Google Cloud itself, not inferred from the project ID or copied from another environment.

After owner approval:

1. Create a dedicated non-production workload identity pool/provider with exact GitHub issuer, audience, repository ID, branch/ref, and workflow identity attribute conditions.
2. Bind only a staging service account with the minimum required Firebase/GCP roles; do not grant Owner or Editor.
3. Keep human user sign-in separate from CI deployment identity.
4. Configure Firebase Auth providers and exact redirect domains only for the approved staging app origins.
5. Set client config through the approved public Firebase client configuration path; treat Firebase API keys as public identifiers subject to API restrictions, not as server credentials.
6. Use Firebase ID tokens for end-user identity and verify signature, issuer, audience, expiry, and subject at trusted API boundaries.
7. Authorize every operation separately using user ownership, tenant/product scope, role, and allowed-field constraints.
8. Enforce App Check for supported clients after debug/emulator and release-token acceptance tests.
9. Audit every Firestore/Realtime Database ruleset. Deny client writes to balances, ledgers, entitlements, rewards, and other authoritative state; test cross-user reads/writes and unauthenticated access.
10. Build Firebase Hosting into a dedicated output directory and verify a positive allowlist of deployable files before changing `firebase.json` or publishing anything.

## Acceptance tests

- Valid, current ID token for the approved staging project.
- Wrong audience/project, wrong issuer, malformed JWT, invalid signature, unknown signing-key ID, expired token, future-issued token, and missing subject.
- JWKS fetch timeout/unavailability returns a fail-closed service error, not anonymous access.
- Valid identity without permission is denied.
- Cross-user and cross-tenant access is denied.
- App Check missing/invalid/expired token is denied where enforcement is enabled.
- Client attempts to write authoritative wallet/ledger/reward fields are denied.
- Hosting artifact contains only approved public files and excludes source, secrets, CI metadata, docs, local configuration, and control-plane assets.

## Current decision

Firebase Authentication, Firestore, Hosting, App Check, and CI federation remain `CONFIG_REQUIRED` / `NOT_VERIFIED`. Do not create production credentials, bind secrets, enable production Auth, or publish Firebase Hosting. The current production target is a source declaration, not proof of a verified project or deployment.

## Evidence boundary

This review verifies repository source only. It does not prove provider-side Firebase project existence/ownership, project number, enabled Auth providers, user accounts, IAM bindings, App Check enforcement, Firestore rules deployment, Hosting deployment target, or runtime login/authorization behavior.
