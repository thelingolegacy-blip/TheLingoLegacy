# Cross-stack deployment inventory — 2026-11-08

**Scope:** GitHub, Cloudflare Workers/D1/Access, Firebase, Flutter, and Vercel deployment-path reconciliation.  
**Disposition:** Production remains protected; this inventory does not authorize a release.

## GitHub

- Repository `thelingolegacy-blip/TheLingoLegacy` reports `main` as unprotected. The connected GitHub tools available in this session do not expose a branch-protection update operation. Require pull requests, at least one independent approval, required CI checks, signed commits where practical, and restrict force-push/deletion through the repository's GitHub settings before production promotion.
- GitHub Actions continues to fail before job creation. On PR #504 head `15ebb84426f10a13853a8966198b71c2a610a260`, Flutter Firebase Integrity run #114 (`42503951988`), Mobile Native Build Recovery run #10 (`42503950423`), Lingo Legacy Static CI run #2430 (`42503949675`), G02 Runner Image Build run #928 (`42503951122`), and Crimson Smoke UI static validation run #897 (`42503952950`) all ended `startup_failure`, each with 0 jobs and 0 artifacts. No workflow command executed. The Flutter workflow trigger was narrowed to `main` pushes, pull requests, and manual dispatch, avoiding repeated feature-branch runs.
- No workflow step has yet executed. The new mobile workflow and Flutter contract tests are source changes only until GitHub Actions can start jobs. The public GitHub status page currently reports all systems operational and no incident on Nov 8; the failures therefore cannot be attributed to a confirmed platform-wide outage. The connected GitHub integration blocks access to repository Actions permissions/runners settings, so the exact repository/account-level cause remains unknown.

## Cloudflare production and staging

- The active production Worker is `thelingolegacyv-5`, with 18 custom-domain routes. Its active deployed version is `2d161fa5-598f-4998-ada8-7ac4c72c3461` at 100% on deployment `ecd71a70-e476-4318-92a7-35249ced360b` (2026-10-25).
- The production Worker currently has only `ASSETS`, `CANONICAL_DOMAIN`, and `PUBLIC_SITE_URL` bindings. It has no D1 binding and no Firebase project binding. The production Worker therefore does not currently provide the intended Firebase/D1 application backend.
- The production D1 database has application tables, but it is not bound to the active production Worker. No production D1 data was read or modified during this inventory.
- The staging Worker `lingo-game-engine-staging` has only its D1 `DB` binding and `ENVIRONMENT` variable. It has no Firebase project binding. Its current deployed version is the earlier settings-only deployment, not the new PR #503 source.
- The staging D1 catalog has five original application tables and four ledger triggers. Migration `0002` was applied at `2026-11-08T17:17:11Z`; readback confirmed `lingo_api_rate_limits` and its four expected columns/constraints. The new Worker source remains undeployed pending Firebase staging identity and authenticated route tests.
- The apex `/healthz` and homepage continued responding after the Access policy change. No Worker source, route, DNS, D1 row, or secret was changed during this inventory.

## Cloudflare Access

- The `All Workers` preview application no longer has a `bypass everyone` policy. It now allows Cloudflare account members and one exact operator email. The reusable bypass policy remains attached to eight other per-worker applications; each needs an individual intended-exposure review before any further changes.
- Do not delete the shared bypass policy globally. Doing so would affect unrelated per-worker applications.

## Firebase and Flutter

- `.firebaserc` identifies `lingo-legacy-production`, but this session did not verify the Firebase project's existence, ownership, registered apps, Auth providers, App Check, rules, Functions, or billing state because no Firebase project connector is available.
- The Flutter hardening branch replaces committed placeholder client values with build-time configuration, adds a preview-safe startup path, and adds web/Android/iOS development build workflows. The strict validator requires complete platform configuration and exact native application identifiers. Five Firebase configuration tests, four Hosting-boundary tests, and four Cloudflare asset-publication tests passed in an isolated local Node harness (13 total); these are not GitHub CI results or Flutter SDK builds.
- Firebase Hosting is scoped to `build/web` only. Cloudflare remains canonical for apex/www. No Firebase Hosting deployment, Flutter store release, or Firebase project mutation occurred.
- Required Firebase repository variables must be provisioned by the project owner after verifying the real Web/Android/iOS/macOS app registrations. Never use service-account keys or admin credentials in Flutter builds.

## Vercel deployment-path retirement

- The Hobby Vercel project linked to this repository automatically created preview deployments for feature-branch pushes. Its pause operation is confirmed by the latest attempted deployment for PR #504 head `e95c02c56bba132e5ad6f86f352297c15944acf8` being `BLOCKED` with no production target. Older preview deployments remain in history and were not deleted; the project uses SSO protection for non-custom preview deployments.
- The former `launch` and `studio-preview` hostnames remain in Vercel project metadata, but Cloudflare DNS now routes `launch` to the Cloudflare static backup and `studio-preview` through Cloudflare. Apex and `www` DNS are also Cloudflare-routed.
- A separate Pro Vercel project remains linked to the same repository. Its pause request returned `invalid_deployment: Active production deployment does not exist`; the project reports `live: false`, its project-domain listing returned zero current domain records, and its metadata still lists historical apex/www aliases plus an old production-target deployment. It was left unchanged because its domain metadata is inconsistent and the pause endpoint found no active production deployment.
- The Vercel rate-limit status check is not Cloudflare deployment evidence. The Hobby project preview path is blocked; the Pro project remains a legacy Git link but has no active production deployment. Its Git disconnection still requires owner/admin action or a verified project-settings path.

## Remaining release blockers

1. Restore GitHub Actions job startup and obtain current-head jobs, logs, and artifacts.
2. Enable main branch protection and required independent review.
3. Verify Firebase project ownership and all platform app registrations; provision required repository variables.
4. Verify Firebase Auth, App Check, database/storage rules, Functions, and authenticated end-to-end journeys.
5. Verify the existing staging `0001` base schema and run authenticated rate-limit tests against the newly applied `0002` table before any new staging Worker deployment.
6. Reconcile production Worker routes and the 18-route inventory with the canonical Wrangler configuration before any production upload.
7. Design and verify production backend bindings and authorization; do not bind the existing production D1 or Firebase project to the Worker by assumption.
8. Review the eight remaining per-worker Access bypass exceptions and the separate Pro Vercel project.
9. Complete browser, mobile-device, accessibility, security, and independent release acceptance.

**No production Worker deployment, Firebase deployment, mobile store release, DNS mutation, or production data mutation was performed.**


## Related pull-request consolidation

- PR #434 (mobile startup/build recovery), PR #475 (Firebase Hosting build/web scope), and PR #354 (Firebase static-gate tests) were closed as superseded by draft PR #504. Their useful changes were carried forward or replaced by stricter implementations; their branches remain available for audit. PR #415 contains separate Ask Lingo/Flutter feature work and remains independent.


## Staging migration update — 2026-11-08T17:17:11Z

The additive `0002_lingo_api_rate_limits_staging.sql` migration was applied to the staging D1 database and schema-verified. The table is present; the schema readback did not modify application rows. This removes the missing-table prerequisite but does not authorize deployment of the new Worker source while Firebase staging identity and authenticated end-to-end tests remain unverified.

## Latest exact-head CI readback — 2026-11-08T17:19:31Z

PR #504 current head at this readback: `e95c02c56bba132e5ad6f86f352297c15944acf8`. The latest five workflow attempts on that exact head all ended `startup_failure` with zero jobs and zero artifacts:

- Flutter Firebase Integrity #119 — `42504385857`
- Mobile Native Build Recovery #15 — `42504383963`
- Lingo Legacy Static CI #2435 — `42504386714`
- G02 Runner Image Build #933 — `42504384924`
- Crimson Smoke UI static validation #902 — `42504382904`

No workflow command executed. The new Node validator tests were run locally in an isolated harness and passed 13/13. Flutter SDK analysis/builds remain unexecuted.


## Vercel retirement readback — 2026-11-08

The Hobby project's latest deployment attempt is `BLOCKED` after the pause request, confirming new preview deployment creation is stopped. Historical READY preview builds were preserved. The separate Pro project's pause request could not be applied because Vercel reports no active production deployment; no deletion or Git disconnect was attempted.
