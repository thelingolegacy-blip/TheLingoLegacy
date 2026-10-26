# Full-Stack Implementation Plan

**Status:** proposed implementation package; configuration files do not prove cloud services are connected or deployed.

## Existing stack discovered
- **Web frontend:** static HTML/CSS/JavaScript assets.
- **Backend:** Cloudflare Worker in `worker.js`; current public endpoints include health, runtime manifest, platform status/gates/modules, and site context.
- **Mobile frontend:** Flutter app at `lib/main.dart`.
- **Firebase:** Firebase Core dependencies and client configuration templates exist. Confirm actual Firebase Console configuration; the checked-in options include placeholders.
- **GitHub:** repository and Actions workflows exist. A workflow file is not proof of a successful workflow run.

## Route registry and navigation
`config/site-routes.json` records the public route inventory. `assets/lingo-route-matrix.js` creates an accessible responsive navigation bar. It must be included by pages intended to show the shared navigation. `/media/` is marked planned and must not be advertised as live until a real target exists.

## Backend contracts
Current public endpoints:
- `GET /healthz`
- `GET /api/v1/runtime`
- `GET /api/v1/platform/manifest`
- `GET /api/v1/platform/status`
- `GET /api/v1/platform/gates`
- `GET /api/v1/platform/modules`
- `GET /api/v1/site/context`

Checkout and alert endpoints require separate secret, validation, consent, and rate-limit review. Feature flags are not proof downstream services are operational. Every new endpoint needs method/schema validation, authz, quotas, idempotency where appropriate, audit behavior, and stable error codes.

## Flutter and Firebase
1. Firebase Auth: approved providers, email verification, recovery, account deletion and sign-out.
2. Choose one authoritative database per domain and test security rules with Firebase Emulator.
3. Storage private by default, with file-size/MIME checks and lifecycle rules.
4. Analytics should respect consent and avoid sensitive values.
5. Privileged mutations and payment operations go through the backend, never embedded service-account credentials in Flutter.
6. The Flutter shell must remain usable if Firebase is not configured; use FlutterFire-generated options for actual production apps.

`firebase/database.rules.json` is a deny-by-default starting point. It is not deployed automatically and is not a complete schema-specific authorization policy.

## GitHub automation
The route-validation workflow validates the registry, local page targets, navigation routes, and backend route markers. It does not deploy, alter secrets, register runners, change DNS, or provision cloud resources.

## Release gates
- Local route and script validation passes.
- Every live route has a real page or documented redirect; planned routes are not presented as live.
- API tests verify methods, errors, no-store and security headers.
- Firebase emulator tests prove own-user access and cross-user denial.
- Flutter analyze and tests pass on a runner with a provisioned Flutter SDK.
- Production builds contain no placeholder Firebase values.
- A completed GitHub workflow run with job logs exists.
- Deployment and post-deployment smoke checks pass before the site is described as live.

## Scope limits
This package provides route navigation, a route inventory, Firebase rules starter, and CI validation. It does not provision Firebase resources, enable providers, verify billing, run a Flutter build, or deploy production.
