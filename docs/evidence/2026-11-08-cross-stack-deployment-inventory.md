# Cross-stack deployment inventory — 2026-11-08

**Scope:** GitHub, Cloudflare Workers/D1/Access, Firebase, Flutter, and Vercel deployment-path reconciliation.  
**Disposition:** Production remains protected; this inventory does not authorize a release.

## GitHub

- Repository `thelingolegacy-blip/TheLingoLegacy` reports `main` as unprotected. The connected GitHub tools available in this session do not expose a branch-protection update operation. Require pull requests, at least one independent approval, required CI checks, signed commits where practical, and restrict force-push/deletion through the repository's GitHub settings before production promotion.
- GitHub Actions continues to fail before job creation. Flutter Firebase Integrity run #113 (`42503491050`) ended `startup_failure`; the run has no instantiated jobs or artifacts. The repeated branch-push trigger was narrowed to `main` pushes plus pull requests and manual dispatch, avoiding a new run for every feature-branch commit.
- No workflow step has yet executed. The new mobile workflow and Flutter contract tests are source changes only until GitHub Actions can start jobs.

## Cloudflare production and staging

- The active production Worker is `thelingolegacyv-5`, with 18 custom-domain routes. Its active deployed version is `2d161fa5-598f-4998-ada8-7ac4c72c3461` at 100% on deployment `ecd71a70-e476-4318-92a7-35249ced360b` (2026-10-25).
- The production Worker currently has only `ASSETS`, `CANONICAL_DOMAIN`, and `PUBLIC_SITE_URL` bindings. It has no D1 binding and no Firebase project binding. The production Worker therefore does not currently provide the intended Firebase/D1 application backend.
- The production D1 database has application tables, but it is not bound to the active production Worker. No production D1 data was read or modified during this inventory.
- The staging Worker `lingo-game-engine-staging` has only its D1 `DB` binding and `ENVIRONMENT` variable. It has no Firebase project binding. Its current deployed version is the earlier settings-only deployment, not the new PR #503 source.
- The staging D1 catalog has five application tables and four ledger triggers. It does not contain `lingo_api_rate_limits`; migration `0002` is unapplied. The new Worker source must not be deployed before the migration is applied and verified.
- The apex `/healthz` and homepage continued responding after the Access policy change. No Worker source, route, DNS, D1 row, or secret was changed during this inventory.

## Cloudflare Access

- The `All Workers` preview application no longer has a `bypass everyone` policy. It now allows Cloudflare account members and one exact operator email. The reusable bypass policy remains attached to eight other per-worker applications; each needs an individual intended-exposure review before any further changes.
- Do not delete the shared bypass policy globally. Doing so would affect unrelated per-worker applications.

## Firebase and Flutter

- `.firebaserc` identifies `lingo-legacy-production`, but this session did not verify the Firebase project's existence, ownership, registered apps, Auth providers, App Check, rules, Functions, or billing state because no Firebase project connector is available.
- The Flutter hardening branch replaces committed placeholder client values with build-time configuration, adds a preview-safe startup path, and adds web/Android/iOS development build workflows. The strict validator requires complete platform configuration and exact native application identifiers.
- Firebase Hosting is scoped to `build/web` only. Cloudflare remains canonical for apex/www. No Firebase Hosting deployment, Flutter store release, or Firebase project mutation occurred.
- Required Firebase repository variables must be provisioned by the project owner after verifying the real Web/Android/iOS/macOS app registrations. Never use service-account keys or admin credentials in Flutter builds.

## Vercel deployment-path retirement

- The Hobby Vercel project linked to this repository automatically created preview deployments for feature-branch pushes. The pause operation was accepted. Its API readback still reports `live: false` and the latest deployment target is not production; the API does not expose a separate paused flag, so the pause state cannot be independently confirmed from the readback.
- The former `launch` and `studio-preview` hostnames remain in Vercel project metadata, but Cloudflare DNS now routes `launch` to the Cloudflare static backup and `studio-preview` through Cloudflare. Apex and `www` DNS are also Cloudflare-routed.
- A separate Pro Vercel project remains linked to the same repository. Its API metadata still lists historical apex/www aliases and a previous production-target deployment, while the project-domain listing returned zero current domain records and `live: false`. It was deliberately not paused until its historical domain ownership is reconciled.
- The Vercel rate-limit status check is not Cloudflare deployment evidence. The Hobby project pause request is intended to stop duplicate preview deployments; the Pro project remains an unresolved legacy deployment path.

## Remaining release blockers

1. Restore GitHub Actions job startup and obtain current-head jobs, logs, and artifacts.
2. Enable main branch protection and required independent review.
3. Verify Firebase project ownership and all platform app registrations; provision required repository variables.
4. Verify Firebase Auth, App Check, database/storage rules, Functions, and authenticated end-to-end journeys.
5. Apply and verify staging D1 migration `0002` before any new staging Worker deployment.
6. Reconcile production Worker routes and the 18-route inventory with the canonical Wrangler configuration before any production upload.
7. Design and verify production backend bindings and authorization; do not bind the existing production D1 or Firebase project to the Worker by assumption.
8. Review the eight remaining per-worker Access bypass exceptions and the separate Pro Vercel project.
9. Complete browser, mobile-device, accessibility, security, and independent release acceptance.

**No production Worker deployment, Firebase deployment, mobile store release, DNS mutation, or production data mutation was performed.**
