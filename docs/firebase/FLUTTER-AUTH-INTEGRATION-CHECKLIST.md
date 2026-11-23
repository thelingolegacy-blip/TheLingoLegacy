# Flutter Firebase Auth integration checklist

Scope: complete and verify the existing Flutter email/password session gate against the isolated staging project. This checklist does not authorize production activation or protected data access.

## Existing implementation in the review branch

- [x] Firebase initialization remains guarded so placeholder options preserve offline preview.
- [x] Email/password sign-in and account creation UI is present.
- [x] Password reset request is present with a non-enumerating success message.
- [x] New accounts trigger an email verification message.
- [x] Unverified accounts are routed to a verification screen.
- [x] Session-aware sign-out is present.
- [x] A signed-in session is required before the main preview is shown.
- [x] Firestore client dependencies and a tenant/product/resource path helper are present.
- [x] Firestore rules remain default-deny; no protected reads or writes are enabled.

## Required configuration

- [ ] Verify the Firebase staging project exists and is accessible before generating app configuration.
- [ ] Register the actual Flutter app identifiers in staging for each supported platform.
- [ ] Generate and review `firebase_options.dart` using staging-only app configuration.
- [ ] Keep production project ID, API configuration, app IDs, and credentials out of staging builds.
- [ ] Configure build flavors/environment selection so staging cannot silently select production.
- [ ] Confirm email/password provider is enabled in the staging Firebase Authentication console.

## Code review and hardening

- [ ] Verify Firebase initialization errors fail closed and do not silently fall back to an authenticated state.
- [ ] Verify the verification refresh path updates the auth stream after `User.reload()`; test verified and unverified cases.
- [ ] Add resend-verification behavior with rate limiting and clear feedback.
- [ ] Add lifecycle-safe loading/error handling and prevent duplicate submissions.
- [ ] Review password policy, autofill behavior, keyboard navigation, accessibility, and localization.
- [ ] Ensure auth error messages do not reveal whether an email address is registered.
- [ ] Add tests for sign-in, account creation, invalid credentials, disabled accounts, rate limits, network loss, reset flow, verification-required flow, refresh, and sign-out.
- [ ] Test session expiry, token refresh, account disablement, and server-side revocation behavior.
- [ ] Do not treat email verification as authorization for tenant resources or financial actions.

## Firestore and protected product surfaces

- [ ] Keep all Firestore rules default-deny until server-side SAAAE policy is implemented.
- [ ] Implement trusted server-side tenant membership, role/attribute checks, approval and audit enforcement.
- [ ] Never authorize access from a client-created path, tenant ID, role, or product ID alone.
- [ ] Do not enable wallet, balance, reward, payout, or transaction writes from Flutter.
- [ ] Test cross-tenant and cross-product denial using emulator rules tests.
- [ ] Keep the tenant-scoped Firestore helper documented as path construction only, not an authorization boundary.

## Build and verification

- [ ] Run `flutter pub get` and commit the reviewed lockfile if dependency resolution succeeds.
- [ ] Run `dart format --set-exit-if-changed`.
- [ ] Run `flutter analyze`.
- [ ] Run all unit and widget tests.
- [ ] Run Firestore emulator tests with allow and deny cases.
- [ ] Build Android and iOS staging variants (and web only if it is an approved target).
- [ ] Verify staging app startup, sign-in, verification, reset, sign-out, and offline-preview fallback on actual supported runtimes.
- [ ] Confirm CI produced completed jobs, logs, and artifacts correlated to the tested commit.

## Current verified status (2026-11-23)

- The implementation exists in draft PR #654.
- The platform Firebase options are placeholders; no real staging app has been connected.
- No Flutter/Dart toolchain execution, dependency resolution, successful CI, emulator test, or device build is confirmed.
- This checklist records remaining work; it does not claim those checks passed.
