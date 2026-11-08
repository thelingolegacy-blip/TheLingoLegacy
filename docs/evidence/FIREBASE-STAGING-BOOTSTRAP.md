# Firebase Staging Bootstrap — PR #498

**Status:** BLOCKED until a dedicated Firebase project is created or independently verified.
**Production project:** `lingo-legacy-production` — preserve as the existing default; never bind it to the staging Worker.
**Service-account private keys:** not required by this implementation. The Worker verifies Firebase ID tokens against Google's published signing keys.

## Required registration procedure

1. In the Firebase Console, create or verify a dedicated project for staging. A suggested project ID is `lingo-legacy-staging`, but use the actual project ID returned by Firebase; do not assume the name is available or that the project exists.
2. Confirm the project owner and billing/security settings. Do not attach production databases, users, or service credentials.
3. Register a separate Web app inside that staging project.
4. Enable the authentication provider selected for staging QA and create a dedicated non-production test account. Do not reuse production user credentials.
5. Record the Web app's project ID, auth domain, API key, app ID, and messaging sender ID in the staging deployment's protected configuration. Firebase Web API keys are client identifiers, not service-account private keys; still apply API restrictions where supported.
6. Populate the environment variables consumed by `scripts/verify-firebase-staging-config.mjs`:
   - `FIREBASE_STAGING_PROJECT_ID`
   - `FIREBASE_STAGING_AUTH_DOMAIN`
   - `FIREBASE_STAGING_API_KEY`
   - `FIREBASE_STAGING_APP_ID`
   - `FIREBASE_STAGING_MESSAGING_SENDER_ID`
7. Run `node scripts/verify-firebase-staging-config.mjs`. It must report `FIREBASE_STAGING_CONFIG=PASS`.
8. Set the isolated Cloudflare staging Worker plain-text binding `FIREBASE_PROJECT_ID` to the verified staging project ID only. Read the binding back and verify it is not `lingo-legacy-production`.
9. Configure the staging browser app with the same Web app config, a real Firebase Auth instance, and `window.LINGO_AUTH.getIdToken()`. Set `window.LINGO_GAME_API` to the isolated staging Worker endpoint. Confirm the browser origin is included in `STAGING_ALLOWED_ORIGINS`.
10. Run the issuer/audience/signature tests, authenticated bootstrap, one-time 5,000 Demo Coin grant, wallet balance, five-payline spin, idempotent replay, insufficient-funds rollback, and logout/session-expiry tests.
11. Capture exact commit, Worker version/deployment ID, test account identity hash (never token), run/job/runner IDs, logs, and artifacts.

## Activation boundary

The current staging Worker has no `FIREBASE_PROJECT_ID` binding. It therefore fails closed for authenticated API requests. Do not set a production project ID, do not copy production credentials, and do not enable authenticated play until the dedicated Firebase project and browser configuration are verified. The `.firebaserc` production default and production Flutter options must remain unchanged.
