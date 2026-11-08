# Flutter, Firebase, and Cloudflare configuration boundary

**Date:** 2026-11-08  
**Status:** Source hardening proposal; not a production deployment.

## Canonical ownership

- GitHub is the source of truth.
- Cloudflare Workers and static assets own public web delivery and canonical domain routing.
- Firebase is reserved for authentication and application data services when a real project/app configuration and deployed security rules are verified.
- Flutter is a client. It must not contain service-account credentials or hard-coded Firebase client identifiers.

Firebase Hosting is scoped only to the generated Flutter web artifact at `build/web`; it no longer publishes the repository root, which could expose internal source, scripts, and documentation. Cloudflare remains the canonical apex/www delivery layer. The Firebase Hosting configuration is source-only here: no Firebase Hosting deployment was performed by this change.

## Flutter runtime behavior

Firebase client values are injected at build time using `--dart-define`. The expected build-time names are:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_WEB_API_KEY`, `FIREBASE_WEB_APP_ID`
- `FIREBASE_ANDROID_API_KEY`, `FIREBASE_ANDROID_APP_ID`
- `FIREBASE_IOS_API_KEY`, `FIREBASE_IOS_APP_ID`
- `FIREBASE_MACOS_API_KEY`, `FIREBASE_MACOS_APP_ID`

The Flutter integrity workflow reads these as GitHub repository variables. Firebase client API keys and app IDs are public client configuration, not service-account secrets. Never place service-account JSON, private keys, admin SDK credentials, or long-lived bearer tokens in these variables or in a client build.

Without complete values, the app remains in preview mode and does not initialize Firebase. This is an availability fallback only; it does not claim account, authentication, wallet, or data services are connected. When values exist, the client may initialize, but backend readiness still depends on verified Firebase Auth settings, App Check, Firestore/Realtime Database rules, Functions, and live integration tests.

## CI behavior

The Flutter workflow runs dependency resolution, static analysis, tests, web build, and Android debug build before the strict Firebase configuration gate. This keeps code-quality evidence available even when Firebase configuration is not yet provisioned. The final Firebase gate remains fail-closed and requires all platform variables to be present and the project ID to match `.firebaserc`.

The workflow also asserts that Firebase Hosting publishes only `build/web` and that the canonical Cloudflare route remains configured. It does not deploy Firebase, Cloudflare, Android, or iOS artifacts.

## Retired legacy surface

The unused root `firebase-worker.js` helper was removed. It depended on a static `FIREBASE_ID_TOKEN` environment binding and had no references from the active Worker configuration or source. Firebase ID tokens are short-lived user credentials and must be supplied per authenticated request and verified server-side, not configured as a long-lived shared Worker binding.

## External prerequisites not completed here

1. Confirm that Firebase project `lingo-legacy-production` exists and is owned by the correct account.
2. Register and verify the Web, Android, iOS, and macOS Firebase apps and their bundle/package identifiers.
3. Add the required non-secret client values as GitHub repository variables.
4. Verify Authentication providers, authorized domains, App Check, database rules, Storage rules, Functions, and billing/quotas.
5. Run the Flutter workflow successfully and complete authenticated end-to-end tests.
6. Only then approve a separately reviewed release and publish mobile artifacts through the appropriate store process.

No Firebase project, rules, database records, Cloudflare routes, Worker deployments, DNS, or production credentials were changed by this proposal.
