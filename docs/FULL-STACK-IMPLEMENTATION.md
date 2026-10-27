# Full-Stack Implementation and Activation

**Status:** integration code is under review. Configuration is wired for activation, but cloud services are not represented as active until an authorized deployment and live verification succeeds.

## Connected application layers

- **Web frontend:** static HTML/CSS/JavaScript; shared route registry and accessible navigation.
- **Backend:** Cloudflare Worker in `worker.js`; route inventory is exposed at `GET /api/v1/site/routes`. Existing runtime APIs include health, runtime manifest, platform status/gates/modules, and site context.
- **Flutter frontend:** `lib/main.dart` has destination navigation, backend context connectivity, and an account screen that uses Firebase Auth only when Firebase initialization succeeds.
- **Firebase:** `firebase_options.dart` accepts per-build `--dart-define` values. `firebase.json` points Firebase CLI to `firebase/database.rules.json`.
- **GitHub:** Flutter integrity workflow checks analysis/tests, requires configured Firebase values, and passes the appropriate web/Android values to release/debug builds.

## Route and API contracts

- Route registry: `config/site-routes.json`
- Shared responsive navigation: `assets/lingo-route-matrix.js`
- Public route API: `GET /api/v1/site/routes`
- OpenAPI contract: `openapi/site-platform.yaml`

A registry entry is not proof that the route is live on the production host. Confirm every route with live HTTP probes after deployment. The Flutter API context check targets `https://thelingolegacy.com/api/v1/site/context`; its successful response must be verified from the device/network used for release.

## Firebase activation checklist

1. Confirm that `lingo-legacy-production` is the correct, authorized Firebase project and that Realtime Database exists in the intended region.
2. In Firebase Console, enable Email/Password Authentication and configure authorized domains, password reset, and email verification. Configure any additional providers only after reviewing their redirect URLs and account-linking behavior.
3. Add the GitHub Actions **repository variables**:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_DATABASE_URL`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_WEB_APP_ID`
   - `FIREBASE_ANDROID_APP_ID`
   - `FIREBASE_IOS_APP_ID`
   - `FIREBASE_MACOS_APP_ID`
4. Add the corresponding **Actions secrets**:
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_WEB_API_KEY`
   - `FIREBASE_ANDROID_API_KEY`
   - `FIREBASE_IOS_API_KEY`
   - `FIREBASE_MACOS_API_KEY`
5. Confirm bundle IDs and app registrations in Firebase Console. Do not paste service-account JSON or private credentials into Flutter, source control, issues, or chat.
6. Run the Firebase Emulator Suite tests against the actual intended data model before deploying the database rules. The checked-in rules are a deny-by-default starter and may need schema-specific refinement.
7. Run `firebase deploy --only database --project lingo-legacy-production` from an authorized, reviewed environment after emulator validation. Hosting deployment is a separate release decision.
8. Run the GitHub Actions workflow, inspect all job logs, build Flutter web/Android, and test signup, verification, sign-in, password reset, sign-out, cross-user data denial, and the backend API connectivity.
9. Enable production traffic only after route/API probes, security review, rollback readiness, and post-deploy smoke tests pass.

## Build-time Firebase values

Flutter build arguments are supplied by the GitHub Actions workflow using `--dart-define`. The client API keys identify Firebase client applications; they are not substitutes for authorization. Enforce access through Firebase Security Rules and backend authorization. Do not put Admin SDK/service-account credentials in client builds.

For local builds, provide the same `FIREBASE_*` values through `--dart-define=NAME=value` for the target platform. Until real project app IDs and values are supplied, the Flutter shell intentionally remains usable without Firebase-backed account features.

## Release gates

- Successful route registry and page-target validation.
- Real live page/redirect for every advertised route.
- API tests for methods, errors, no-store, security headers, and authorization.
- Firebase Emulator tests for own-user access and cross-user denial.
- Flutter analyze, unit/widget tests, web release build, and Android build pass.
- No placeholder Firebase configuration in release artifacts.
- Completed GitHub workflow runs with job logs.
- Firebase rules deployment and post-deployment verification, when authorized.
- Production deploy and live smoke checks pass before describing the system as active.

## Known blockers

The previously observed GitHub Actions runs failed with `startup_failure` before jobs were created. These configuration changes do not repair repository-level Actions availability, add missing Firebase values, enable providers in Console, or deploy cloud resources. Confirm the next run produces jobs before interpreting any CI result as a code-level test.
