# The Lingo Legacy — Preservation and Release Gate Audit

**Audit date:** 2026-11-07  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Audited main commit:** `c1804501038640e19efa6bd6c0b4d3c4ee91e578`  
**Preservation branch:** `preservation/last-known-good-main-c1804501-2026-11-07`  
**Environment:** Read-only production audit; no production mutations  
**Disposition:** `PROTECTED HOLD — NOT CERTIFIED FOR RELEASE`

## Preservation

A GitHub branch was created from the exact observed `main` commit SHA. This is a preservation reference, not an immutable Git tag. The available GitHub integration exposes branch creation and ref updates but no tag-object/tag-ref creation action. No tag was fabricated and no tag was pushed. The requested `v5.0.0-studio-certified` tag was not present at audit time.

Main branch protection read from the GitHub branch endpoint was `protected=false`. This is a governance gap. No branch protection settings were changed.

## GitHub source and CI

- Main commit: `c1804501038640e19efa6bd6c0b4d3c4ee91e578`.
- Numerous open PRs remain, including draft staging and recovery work. The release candidate is not a single integrated, accepted commit.
- Recent workflow runs for the staging branch concluded `startup_failure`, including the server-game validation workflow and static CI. No jobs ran; there is no provider-executed test evidence.
- `.github/workflows/production-promotion.yml` has an unconditional `if: false` on its Cloudflare deployment job. This is a deliberate hard hold, not an active production promotion pipeline.
- The workflow's G02 gate requires a self-hosted runner labelled `lingo-g02`; G02 remains unverified.

## Cloudflare Workers and routing

Observed routes:
- `thelingolegacy.com/*` → `thelingolegacyv-5`.
- `thelingolegacy.com/` → `lingo-flagship-root`.
- `www.thelingolegacy.com/*` → `thelingolegacyv-5`.

The exact-root route is distinct from the wildcard route. Preserve this split unless a separately tested routing change is approved.

The `thelingolegacyv-5` deployment API reports its latest 100%-traffic deployment was created `2026-10-25T16:21:58.131638Z` and points to version ID `2d161fa5-598f-4998-ada8-7ac4c72c3461`. The version inventory labels version 250 as a preview upload and version 251 as another preview upload. Neither is proven to be the active production deployment.

Production Worker settings currently expose:
- `ASSETS` asset binding.
- `CANONICAL_DOMAIN` public text variable.
- `PUBLIC_SITE_URL` public text variable.

No D1, KV, R2, or Firebase secret binding was observed on the production Worker. Its source reports D1/KV/R2/Firebase integrations based on the presence of bindings and hardcodes the release gates as G02 FAIL / UNVERIFIED and G03–G11 BLOCKED. Checkout is deliberately disabled with `BILLING_DISABLED`.

## D1

Production D1 database ID: `6b63b699-5cee-400d-b5c0-92d7c9708539`.

A direct query against `sqlite_master` returned existing tables, including:
- `users` with integer primary key, username and email.
- `game_spins` with integer user_id, grid, bet and payout.
- `jackpot_spins`.
- `leaderboard`.
- `sessions`.

Other existing tables include `ai_conversations`, `canon_registry`, `canon_sources`, `studio_projects`, and others. The Cloudflare account database inventory's `num_tables` field returned zero for this database, which conflicts with the direct SQL result. The direct SQL schema is the relevant observation for migration safety.

The proposed `0001_studio_game_schema.sql` was not found on main. The proposed schema introduces a separate Firebase-UID wallet model and REAL balances; it must not be applied to production without a reviewed migration that preserves existing IDs, data, constraints, and application contracts. Floating-point wallet balances are prohibited; use integer minor units.

## Firebase

- `firebase.client.json` contains placeholder values for API key, messaging sender ID, and app ID.
- `lib/firebase_options.dart` contains placeholder Web, Android, iOS, and macOS options.
- `firestore.rules` was not found on main.
- `firestore.indexes.json` was not found on main.

No Firebase rules or indexes were deployed during this audit. The proposed profile rule is not sufficient as a complete production authorization model without reviewing profile fields, role claims, and data ownership boundaries. Default-deny rules should be retained until the intended collection model is specified and tested in the Firebase Emulator.

## Flutter and Pages

Cloudflare Pages project `my-flutter-app` has one returned production deployment:
- Deployment ID `8a5b368c-df64-4342-9fcd-2054465f2a25`.
- Created `2026-08-30T21:44:09.86966Z`.
- Alias `app.thelingolegacy.com`.
- Trigger metadata has an empty commit hash.
- No deployment environment variables were listed.

This does not prove the currently served bundle was built from the audited Git commit or contains valid Firebase options. The repository's Firebase options are placeholders. No Flutter build or Pages deployment was performed.

## Commerce and payment security

The current production Worker explicitly disables checkout and returns `BILLING_DISABLED`. No Stripe secret was added and no webhook was activated. The supplied sample webhook is unsafe for production because it does not validate Stripe's signature, enforce timestamp tolerance, persist event IDs for idempotency, or reconcile a payment before crediting an account.

Do not enable payment ingestion until the signed webhook, replay protection, ledger reconciliation, fraud controls, refund/dispute behavior, and compliance review are complete.

## DNS and account security

- DMARC record is `v=DMARC1; p=none` with aggregate reporting. This is monitoring mode, not enforcement.
- Do not change to `p=reject` until SPF, DKIM, all authorized senders, forwarding paths, and DMARC alignment have been validated from reports.
- Cloudflare zone security level is `medium`. This is not evidence of account-wide MFA enforcement.
- Account-level MFA/member policy could not be verified from the available read-only endpoint set. No account security policy was changed.

## Review of supplied health monitor

The supplied monitor hardcodes `authGateStatus = "PASS"`; it does not send an unauthenticated request to an API route and observe a 401. Its CSPRNG check only verifies that `getRandomValues` does not throw and does not measure entropy or validate payout math. It must not issue a `HEALTHY` certification as written. Health monitoring must distinguish dependency reachability from security-policy validation and should never claim to certify cryptographic entropy from a single sample.

## Release gate matrix

| Gate | Result | Reason |
|---|---|---|
| Preserve baseline reference | PARTIAL | Exact-SHA preservation branch created; immutable tag action unavailable |
| Main branch protection | FAIL | GitHub reports `protected=false` |
| GitHub Actions / G02 | FAIL | Startup failures; no executed jobs |
| Production Worker version 250 | FAIL | Preview upload; active deployment points to older version |
| Production Worker D1/KV bindings | FAIL | No such production bindings observed |
| Production D1 migration | BLOCKED | Existing schema differs; migration file absent on main |
| Firebase client config | FAIL | Placeholder identifiers |
| Firestore rules/indexes | BLOCKED | Files absent from main; collection policy not verified |
| Flutter Pages synchronization | FAIL | Last returned deployment is Aug 30 and commit hash empty |
| Stripe webhook | BLOCKED | Checkout disabled; supplied example lacks signature and idempotency |
| DMARC enforcement | NOT READY | p=none; sender alignment not verified |
| Account MFA enforcement | UNVERIFIED | Not observable through available endpoint |
| Production certification | FAIL / HOLD | Required gates are not satisfied |

## Actions taken

1. Read-only inspection of GitHub main, PR inventory, workflow runs, source configuration, Cloudflare routes, Worker deployments/settings, Pages deployment, D1 schema, DNS DMARC, and zone security level.
2. Created preservation branch `preservation/last-known-good-main-c1804501-2026-11-07` from the exact observed main SHA.
3. No production Worker promotion, route mutation, D1 migration, secret update, Firebase deployment, Pages deployment, DNS change, billing activation, or rollback was performed.

## Required order to resume release work

1. Enable branch protection and a reviewed required-check policy.
2. Restore G02 and GitHub Actions execution; collect runner ID/name, completed steps, logs, artifacts, and exact commit correlation.
3. Reconcile the production D1 schema with the proposed new wallet model through additive, backwards-compatible migrations tested against a production clone.
4. Supply valid Firebase public app configuration through the approved project configuration path; implement and emulator-test explicit Firestore rules/indexes.
5. Build Flutter from the canonical commit and deploy only to staging Pages; verify app login and API calls end-to-end.
6. Add the production Worker bindings/secrets only after the runtime is proven in staging and the exact Worker bundle is correlated to source.
7. Keep Stripe disabled until signed webhook verification, idempotency, ledger, and payment reconciliation are accepted.
8. Verify rollback targets and execute live probes; only then create a certified tag and authorize a staged percentage promotion.

**Final disposition:** Production stays on its existing deployed version and route map. The platform is not certified as a unified production application. The release manifest's `PASS / 100% PRODUCTION ACTIVE` assertion is not supported by the observed evidence.
