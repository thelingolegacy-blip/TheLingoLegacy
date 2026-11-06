# Firebase flagship identity reconciliation — 2026-11-06

## Decision recorded

The user has explicitly confirmed that the authoritative Firebase project for the LINGO flagship is:

`lingo-legacy-production`

This is the canonical project ID for flagship Firebase client configuration and Firebase CLI targeting. It is not permission to deploy, mutate Firebase production resources, activate live services, or spend money.

## Repository findings

Read-only inspection of `main` and branch `fix/firebase-hosting-output-scope-2026-11-06` established:

- `.firebaserc` already maps `projects.default` to `lingo-legacy-production`.
- `lib/firebase_options.dart` uses `lingo-legacy-production` for web, Android, iOS, and macOS project IDs, auth domain, database URL, and storage bucket.
- `firebase.client.json` also names `lingo-legacy-production` and matching resource domains.
- The client configuration is **not operationally complete**: Flutter API keys, app IDs, and messaging sender ID remain `YOUR_...` placeholders in `lib/firebase_options.dart`; `firebase.client.json` also contains placeholders.
- `android/app/google-services.json` and `ios/Runner/GoogleService-Info.plist` were not present at the inspected `main` paths. Native Firebase app registration/configuration therefore remains unverified.
- `firebase.json` on this branch scopes Hosting output to `build/web`. This is a safer artifact boundary than publishing the repository root; it does not itself prove a deploy or a successful build.
- `.github/workflows/flutter-firebase-integrity.yml` runs contract checks and Flutter analysis/tests/builds. It contains no Firebase deploy command.
- Historical references to `lingo-legacy` and `the-lingo-legacy` occur in other project contexts. They must not override the user-confirmed flagship Firebase project. In particular, the G02 staging evidence workflow must continue to use a dedicated non-production Firebase project and must reject `lingo-legacy-production`.

## Changes in this branch

- Strengthened `scripts/verify-flutter-firebase.mjs` to check project identity across `.firebaserc`, `firebase.client.json`, and all four Flutter platform configurations.
- The validator continues to fail closed when placeholder credentials remain; it does not generate or invent Firebase credentials.
- No secrets, service-account files, production Firebase resources, deployment settings, or production routes were changed.

## Remaining integration work

1. Obtain the actual registered Firebase Web, Android, iOS, and macOS app configuration from the authorized Firebase project owner/console. Do not put service-account credentials or private keys in Git.
2. Confirm the registered Android application ID and iOS/macOS bundle IDs before adding native configuration files.
3. Supply client configuration through the approved secret/configuration mechanism; public Firebase client API keys are not service-account credentials, but still require appropriate API restrictions and Firebase Security Rules.
4. Independently review Authentication providers, Realtime Database/Firestore rules, Storage rules, App Check, authorized domains, backups/retention, and least-privilege server identities before enabling any live feature.
5. Keep G02 evidence writes on a separate non-production Firebase project with staging-only IAM. Never point staging agents at `lingo-legacy-production`.
6. Run the strengthened validator, Flutter analyze/tests, web build, and Android build in CI; inspect logs and artifacts. A successful source-level check is not Firebase connectivity or production acceptance.

## Verification status

- Canonical flagship project ID: **CONFIRMED by user**.
- Repository project-ID alignment: **SOURCE-ALIGNED**.
- Client credentials/app registrations: **INCOMPLETE / UNVERIFIED**.
- Firebase service connectivity and security posture: **NOT TESTED**.
- Production Firebase mutation/deployment: **NOT PERFORMED**.
- Spend: **$0 authorized; no paid operation initiated**.
- Release authority: **PROTECTED HOLD; no merge or production promotion authorized**.
