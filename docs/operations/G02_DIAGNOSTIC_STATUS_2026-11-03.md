# G02 Recovery Diagnostic Addendum — 2026-11-03

## Scope and safety

This addendum records read-only diagnostics performed on 2026-11-03. No production Worker, DNS record, D1 row, secret, Pages production deployment, Render service, or repository default-branch content was changed. No paid infrastructure was provisioned. No workflow was re-run because the inspected runs had no jobs to retry.

Governance remains:

`SOURCE → ACTUAL EXECUTION → RETRIEVABLE EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION`

A deployment allocation, preview publish, or provider status label is not release acceptance.

## GitHub Actions / G02

Repository: `thelingolegacy-blip/TheLingoLegacy`

Default branch at inspection: `main`, commit `59af084f5784ac5649c5c48537572a3f870aa4c1`.

The main branch API reported `protected: false`; protection enforcement was disabled and no required checks were configured. This is a governance gap. No settings were changed.

PR #449 head: `02872beb61b2bf30cb0906c4e533c93d6ae2f5f9`, base: `59af084f5784ac5649c5c48537572a3f870aa4c1`. PR #449 remains a draft.

Latest PR #449 Actions runs:
- `41672241398` — G02 Runner Image Build (no publish): `startup_failure`
- `41672247211` — Lingo Legacy Static CI: `startup_failure`
- `41672244509` — Crimson Smoke UI static validation: `startup_failure`

For all three runs, the jobs API returned zero jobs and the artifacts API returned zero artifacts. The first two were independently checked earlier; the third was checked in the same diagnostic pass. The run log download endpoint returned HTTP 404. The failure is before an inspectable job/runner execution; the exact GitHub-side cause remains unverified. Do not attribute it to a workflow step or G02 host without further evidence.

Related PR workflow runs also showed `startup_failure`:
- PR #436: `41438340894`, `41438339664`, `41438338142`
- PR #444: `41505724883`, `41505723296`, `41505721346`
- PR #447: `41647999307`, `41647995569`, `41647997385`, `41647993522`, `41647991883`, `41647989896`
- PR #448: `41659726816`, `41659724478`, `41659722144`

No job IDs, runner IDs, step records, retrievable job logs, or artifacts were available from these startup-failure runs. No G02 host was proven provisioned or registered.

## Render host availability

The selected Render workspace inventory contained one service:
- `lingo-legacy-platform-ops-preview`
- ID: `srv-dbjvtg0473hc73fq3e5g`
- Type: `static_site`
- Branch: `recovery/platform-ops-preview-2026-11-02`
- Auto deploy: off

This is a static site, not a persistent Linux VM or self-hosted GitHub Actions runner host. No Render compute service was created. A paid compute plan was not authorized and remains out of scope.

## Cloudflare Pages preview evidence

Project: `lingo-legacy-github-integration-test`
Deployment: `1a3ca3a1-ec1e-4dc3-80a9-eca779f5f6f3`
Branch commit: `02872beb61b2bf30cb0906c4e533c93d6ae2f5f9`
Environment: preview
Alias: `https://governance-g02-host-recovery.lingo-legacy-github-integration-test.pages.dev`

The deployment API reported a successful deploy stage. The retrievable deployment log shows:
- Repository cloned and checked out at the PR #449 head commit.
- A root `wrangler.json` was detected but rejected as an invalid Pages configuration; Cloudflare skipped it.
- No build command was configured, so the build step was skipped.
- 514 static assets were processed; 3 new files uploaded; assets published successfully.

This is actual static preview publication, not a code build, CI validation, G02 execution, or production deployment. The project configuration reported production deployments disabled. No production deployment was triggered.

## D1 schema verification

Read-only SQL queried `sqlite_master` for tables and views. Every query reported `changed_db: false` and `rows_written: 0`.

- `lingo-loyalty-staging`: 5 application tables plus 1 view (and Cloudflare internal `_cf_KV` table).
- `world-engine-db`: 11 application tables (and Cloudflare internal `_cf_KV` table).
- `lingo-production`: 17 application tables plus SQLite internal `sqlite_sequence` and Cloudflare internal `_cf_KV`.

The D1 list API reported `num_tables: 0` for each database, which conflicts with direct SQL schema evidence. Direct SQL is the verified schema inventory; the metadata field is unreliable in this inspection.

## AppDeploy inventory

All 18 registered AppDeploy apps returned deployment status `ready` when checked. This status does not establish production release acceptance or custom-domain health.

Sampled QA snapshots for the flagship Control Center, Universe Gateway, Studio Hub, loyalty wallet preview, askLINGO, studio runtime, That’s My Lingo, Universe game, secondary control, Obsidian studio, and other surfaces were inspected. Current QA snapshots for the sampled surfaces generally showed no frontend or network errors. Historical error records remain for KottonsCode, Jersey Shore, and Travel; these need fresh regression runs before being called clean. Snapshot age varies.

## DNS / Worker routing

The Cloudflare zone `thelingolegacy.com` is active and on the Free Website plan. Existing apex and subdomain Worker routes were read only. The proxied apex A record uses `192.0.2.0` and is annotated as a Cloudflare Worker route; it was not modified. The www CNAME points to the apex. `app.thelingolegacy.com` is attached to the Pages project `my-flutter-app` and its Pages custom-domain record reports active, but the latest listed Pages deployment is old (2026-08-30) and carries no commit hash. This is not fresh release evidence.

## Acceptance blockers / next actions

1. Obtain GitHub-side explanation or support evidence for account/repository Actions `startup_failure` before attempting workflow-source changes or retries.
2. Provision or identify an authorized persistent Linux host for `lingo-legacy-g02`; no free persistent host was verified. Do not create paid compute without explicit cost approval.
3. Register the exact G02 runner identity and labels only after host hardening and owner approval; capture host/service inventory and runner ID.
4. Execute the G02 sentinel and preserve job IDs, step records, raw logs, artifact IDs, hashes, and independent verification.
5. Add required branch protection/status checks only after an authorized governance change plan; current main branch protection is disabled.
6. Reconcile the Pages `wrangler.json` warning and missing build command in a separate isolated change if the Pages project is intended to perform a real build. Do not mistake static asset upload for build validation.
7. Run fresh regression checks on surfaces with historical errors and verify app integrations, domain routing, data flows, accessibility, mobile behavior, and release-specific acceptance criteria.
8. Keep production promotion, DNS/secret mutation, payment activation, and merges blocked until every gate is evidenced and explicitly authorized.


## Follow-up after diagnostic addendum commit

The addendum was committed to the same isolated branch as commit `2a370411df800a200a64625b68404cb74264c6ea`; PR #449 head now points to this commit. Cloudflare Pages created a new preview deployment for this exact commit:
- Deployment: `fd256225-6c47-4cb1-a2cb-f2a1e47dfab6`
- Preview URL: `https://fd256225.lingo-legacy-github-integration-test.pages.dev`
- All stages (queue, initialize, clone, build, deploy) reported success.

The push also produced two more GitHub Actions runs:
- `41674141093` — Lingo Legacy Static CI: `startup_failure`
- `41674131623` — `.github/workflows/lingo-autorepair-deploy.yml`: `failure`

Both runs returned zero jobs and zero artifacts. No job logs or step-level evidence are available.

### Source defect identified in auto-repair workflow

Read-only source inspection found that the default-branch version of `.github/workflows/lingo-autorepair-deploy.yml` contains a blank `needs:` value under `deploy-cloudflare`. The unmerged PR #436 branch changes this to `needs: repair` while preserving the production deployment hard hold `if: ${{ false }}`. This is a concrete source defect and PR #436 contains a candidate correction. However, PR #436's own Actions runs are also `startup_failure` with no inspectable jobs. The missing job logs prevent proving that the blank `needs:` value caused run `41674131623`; treat the source defect as confirmed and the causal link as unverified. Do not merge PR #436 until its workflow validation and independent acceptance evidence are retrievable.
