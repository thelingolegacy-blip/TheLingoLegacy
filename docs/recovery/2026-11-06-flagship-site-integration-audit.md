# LINGOlegacy — Flagship Site Integration Recovery Baseline

**Date:** 2026-11-06  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `recovery/flagship-site-integration-2026-11-06`  
**Base:** `3923a08b77c8cc93ec5447e9623045318c825234`  
**Disposition:** PROTECTED HOLD — recovery work is isolated; production remains unchanged.

## Executive result

The public apex site is reachable and `/healthz` returns `ok`, but the current evidence does **not** support calling the ecosystem a fully connected production application. The homepage labels itself a candidate experience, the catalog says destinations require verified routes before activation, and the join section says account creation and wallet actions must wait for secure services.

The current architecture has two distinct production Worker entry points:
- `lingo-flagship-root` handles the exact apex root route `thelingolegacy.com/`.
- `thelingolegacyv-5` handles the apex catch-all route `thelingolegacy.com/*` and the `www` catch-all route.

The exact-root Worker returns its embedded HTML only for `/` and returns 404 for other paths. The catch-all Worker serves static assets and exposes health/release-status endpoints. The latest Cloudflare settings inspection found only `ASSETS`, `CANONICAL_DOMAIN`, and `PUBLIC_SITE_URL` bindings on the catch-all Worker; the root Worker has no bindings. The runtime source reports Firebase, D1, KV, and R2 availability from environment bindings, so the inspected binding set does not establish any of those data services as connected.

## Verified findings

### Public website and user journeys

- `https://thelingolegacy.com/` is reachable. Its footer explicitly identifies the page as a candidate experience rather than a production status statement.
- `https://thelingolegacy.com/healthz` returns HTTP 200 with `ok`.
- The public homepage says destinations must be connected to verified routes before production activation and that account creation and wallet actions should only be enabled after secure services are verified.
- The public That’s My Lingo page describes a demo with no cash betting, wagering, cash-out, or redeemable value. It states that Firebase Authentication, Firestore, cloud saves, and other backend capabilities are prepared for later connection; that is not evidence those services are currently connected.
- The public askLINGO page says model availability is runtime-dependent and that source presence does not prove a live model is available.
- Public destination and account flows therefore require end-to-end route, identity, data, and failure-state acceptance before they can be represented as live services.

### Cloudflare delivery and DNS

- Zone `thelingolegacy.com` is active in the connected Cloudflare account.
- Apex catch-all: `thelingolegacy.com/*` → `thelingolegacyv-5`.
- Exact root: `thelingolegacy.com/` → `lingo-flagship-root`.
- WWW catch-all: `www.thelingolegacy.com/*` → `thelingolegacyv-5`.
- Atlas and launch have separate Worker routes.
- DNS has an apex proxied placeholder A record for Worker routing and a proxied `www` CNAME alias.
- `app.thelingolegacy.com` currently points to `my-flutter-app.pages.dev` and is not proxied. The destination and application readiness have not been verified.
- `admin.thelingolegacy.com` points to Firebase Hosting and is not proxied. This does not establish a working admin application or Firebase project configuration.
- `studio-preview.thelingolegacy.com` has a Cloudflare Worker-origin DNS record, but AppDeploy QA logs report missing Next.js chunks and unregistered Next.js data routes from that host.
- The route split is intentional in the existing cutover runbook: the exact-root route is more specific than the catch-all. A catch-all-only deployment will not replace the homepage. Preserve both existing production Worker versions and route IDs until a separately accepted cutover plan is authorized.

### Worker runtime and integrations

- Catch-all Worker runtime source exposes `/healthz`, `/api/v1/runtime`, `/api/v1/platform/status`, `/api/v1/platform/gates`, and a small number of guarded endpoints.
- The runtime explicitly reports billing disabled, no cash-out, and no real-money gameplay.
- Checkout returns `410 BILLING_DISABLED`; this is a deliberate safety control, not a missing feature to bypass.
- The Worker source contains a Firebase helper module, but the root Worker does not import or invoke that helper. A standalone helper file is not a connected integration.
- Current Worker bindings do not include Firebase, Firestore, D1, KV, or R2 resources. No live user identity or persistent shared application data service was verified.

### AppDeploy

- The connected AppDeploy inventory returned 18 app entries; the same inventory was returned by two linked account connections. A third linked account returned no apps.
- The LINGOlegacy Universe Gateway and flagship app report deployed/ready snapshots. A ready deployment state does not prove every user journey is functional.
- Gateway QA logs include failed Next.js chunk loads and 404s for `/_next/data/.../legacy.json` and `studio.json` on `studio-preview.thelingolegacy.com`.
- The flagship and Studio Hub snapshots returned no frontend/backend errors in their latest status responses, but their descriptions explicitly keep important production integrations disabled or staging-only.
- The Hello The Lingo Legacy monitor cron is disabled with reason `credits_exhausted`.
- AppDeploy reports the connected account's credit balance is exhausted. This prevents treating AppDeploy as an available deployment/repair path until the account balance is addressed.

## Gap register

| ID | Gap | Evidence | Closure requirement |
|---|---|---|---|
| SITE-01 | Candidate homepage is not a complete connected product | Public homepage candidate notice and route disclaimer | Verified route catalog, real destinations, acceptance-tested navigation |
| SITE-02 | Exact-root and catch-all Workers must be released together | Live route inventory and cutover runbook | Isolated root + deep-route candidate tests; rollback evidence |
| SITE-03 | Studio preview has missing Next.js assets/data routes | AppDeploy gateway QA errors | Correct build output, route manifest, asset base path, clean browser/network QA |
| SITE-04 | Shared identity is not verified | Firebase config placeholders and absent Worker Firebase binding | Separate Firebase staging project, FlutterFire config, Auth flows, security review |
| SITE-05 | Shared persistent data is not verified | No shared root Firestore rules/indexes; no Firestore package in Flutter manifest | Firestore schema/rules, emulator tests, staging acceptance |
| SITE-06 | Mobile build foundation is incomplete | Flutter/Dart baseline, Android SDK targets, iOS stubs | Supported toolchain, native project completion, Android/iOS build artifacts |
| SITE-07 | HERE map service is not integrated | No HERE plugin or location service in repository | Licensed SDK package, native permissions, consent-aware foreground location, map tests |
| SITE-08 | Admin and app custom domains are unverified | DNS targets only | Verify target ownership, TLS, origin, app routing, and access controls |
| SITE-09 | Production branch governance is weak | GitHub branch API reports `main.protected=false` and required checks off | Human-approved branch protection/ruleset review; do not change automatically |
| SITE-10 | G02 and downstream release gates remain blocked | Existing G02 acceptance contract and current release posture | Real runner assignment, executed steps, retrievable logs/artifacts, independent verification |
| SITE-11 | AppDeploy automation capacity is unavailable | Credit alert and disabled monitor cron | Restore account capacity or choose a verified alternate staging path |
| SITE-12 | AI, wallet, commerce, realtime, and payment services are not live | Public product disclosures and Worker runtime flags | Integrate each service independently; maintain no-payment/no-cash-out guardrails |

## Parallel workstreams

1. **Website routing and experience:** reconcile the root/catch-all Worker model, correct preview build output, validate every public catalog destination, and run browser/mobile navigation checks.
2. **Shared identity and data:** establish isolated Firebase staging, implement Auth and Firestore, write ownership/consent rules, and test with emulators before any production data is considered.
3. **Flutter mobile foundation:** align toolchain and native project files, install the licensed HERE package, and build Android/iOS artifacts.
4. **Cloudflare runtime:** keep production routes frozen; create and validate isolated preview versions with reviewed bindings and no production secrets.
5. **AppDeploy recovery:** preserve the current ready snapshots; do not retry paid operations while credits are exhausted. Repair preview build errors in source and verify once deployment capacity is available.
6. **Release governance:** preserve G02 fail-closed criteria, create retrievable evidence, and obtain independent acceptance before any merge or promotion.

## Immediate acceptance gates

- A single route manifest agrees with the actual root Worker, catch-all Worker, and public catalog links.
- Every required route returns the expected status and content; no missing JS/CSS/image chunks; no unregistered data routes.
- Root and deep-route preview candidates are independently testable and retain the documented rollback versions.
- Firebase Auth and Firestore work in a non-production project with emulator-tested rules and real sign-in/sign-out/unauthorized-access cases.
- HERE maps work on real Android and iOS builds with foreground-only, opt-in location and tested denied-permission states.
- Account, wallet, purchase, cash-out, and payment controls remain disabled unless separately reviewed and explicitly approved.
- G02 and all downstream release gates have current, retrievable, independently correlated evidence.
- Production changes remain blocked until a separately recorded authorization names the exact release, routes, and operation.

## Change and evidence boundary

This report is an evidence-based recovery baseline, not a claim that gaps are closed. It does not alter production DNS, Worker routes, Worker deployments, Firebase projects, secrets, payments, user data, or AppDeploy deployments. The feature branch is isolated from `main`. The protected hold and last-known-good references remain intact.
