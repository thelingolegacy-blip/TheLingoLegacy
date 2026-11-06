# LINGO Legacy — Cloudflare Production Cutover Runbook

**Prepared:** 2026-11-04  
**Environment:** Cloudflare production + isolated Pages/Worker staging  
**Current disposition:** HOLD — planning only; no production mutation authorized or performed.

## 1. Current production routing snapshot

Cloudflare zone: `thelingolegacy.com`  
Zone ID: `91c3f6315fb3ca132b22744721103f88`

| Route | Route ID | Worker | Purpose |
|---|---|---|---|
| `thelingolegacy.com/` | `04e6903aedf14510b58b34b57df699e1` | `lingo-flagship-root` | Exact-root flagship page |
| `thelingolegacy.com/*` | `41e8d027e8cd4cb19d21df7143a2c25e` | `thelingolegacyv-5` | Catch-all production site/runtime |
| `www.thelingolegacy.com/*` | `c861b5b2158745f2bcfbfdca9778c325` | `thelingolegacyv-5` | Canonical www handling |
| `launch.thelingolegacy.com/*` | `e478916a164849768adecb4634c4f24d` | `lingo-static-backup-proxy` | Noindex recovery/prototype route |
| `atlas.thelingolegacy.com/*` | `cc917f80e69d470281cc6347ee8c0195` | `lingo-ecosystem-atlas` | Separate ecosystem atlas |

### Current rollback references

- Catch-all Worker `thelingolegacyv-5`
  - Deployment: `ecd71a70-e476-4318-92a7-35249ced360b`
  - Active version: `2d161fa5-598f-4998-ada8-7ac4c72c3461` (version number `137`) at 100%.
  - Newer uploaded versions through `223` are preview versions; they are not the active production deployment.
  - Bindings: `ASSETS` (assets), `CANONICAL_DOMAIN` (plain text), `PUBLIC_SITE_URL` (plain text)
- Exact-root Worker `lingo-flagship-root`
  - Deployment: `31ccefbb-df4f-4a62-974b-3ee9d0bc81d3`
  - Active version: `658acd1a-997b-45cd-b8fc-e59c59b26b45` (version number `1`) at 100%.
  - Version number `2` is preview-only and is not active on the exact-root route.
  - No bindings
- These IDs are rollback references only. Do not delete or overwrite them.

## 2. Candidate and staging references

- GitHub PR #451: https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/451
- Branch: `studio-hub/recovery-preview-2026-11-04`
- Candidate Pages project: `lingo-legacy-github-integration-test`; no custom domains configured and production deployments are disabled.
- The project was publishing the repository root (516–528 files per preview), including source/configuration files such as `firebase.json`, `worker.js`, and `lib/firebase_options.dart`. The GitHub repository is public and the inspected Firebase values are placeholders; no real secret values were observed in those files.
- Automatic preview deployments are now disabled (`preview_deployment_setting=none`, `deployments_enabled=false`). The project has 1,798 historical preview deployments whose URLs remain accessible; treat them as historical, unapproved previews only.
- Do not re-enable this project until a safe allowlisted build-output directory is configured and verified.
- Isolated API Worker: `lingo-release-candidate-validation-20261104`
  - Workers.dev: https://lingo-release-candidate-validation-20261104.thelingolegacy.workers.dev
  - Deployment: `3d72d425c65e490a9b3bf6f6df6c2bcc`
  - No routes, secrets, or service/resource bindings; API runtime only.
- Existing staging World Engine and Studio Control Center Workers are separate staging services. Their read-only health results do not imply production readiness.

## 3. Critical routing precedence

The exact-root route `thelingolegacy.com/` is more specific than the catch-all route `thelingolegacy.com/*`. Therefore, deploying the candidate static site to the catch-all Worker alone will **not** replace the homepage currently served by `lingo-flagship-root`.

A correct cutover must address both:
1. Candidate asset/runtime delivery for deep routes through the catch-all Worker.
2. Exact-root homepage behavior through an independently tested replacement of `lingo-flagship-root`, or an explicitly reviewed route change that allows the catch-all Worker to receive the root request.

Do not remove the exact-root route as an untested shortcut. Preserve the current root Worker and catch-all Worker versions for immediate rollback.

## 4. Required pre-cutover gates

No production write is permitted until all of these are satisfied:

- GitHub Actions workflows create jobs and execute. The latest attempts currently end in `startup_failure` with zero jobs and zero artifacts.
- G02 runner assignment is proven with runner ID > 0, exact runner identity/labels, actual step logs, host diagnostics, sentinel artifact, integrity hashes, and independent acceptance.
- Release-candidate Worker is tested with the real static `ASSETS` bundle and reviewed production binding manifest. The isolated API Worker currently has no `ASSETS` binding.
- Staging routes are tested for root, nested pages, asset URLs, API endpoints, redirects, mobile and desktop.
- Production Drop and That’s My Lingo checkout CTAs are replaced with the disabled-payment UI. Current production Drop page still shows enabled Stripe buttons even though a dummy checkout POST is rejected with HTTP 503 because Stripe is not configured.
- Firebase configuration and auth/cloud-save flows are completed or those features are clearly disabled and excluded from launch claims.
- Security, privacy, accessibility, performance, content-rating, asset rights, and operational monitoring reviews are complete.
- Independent release acceptance is recorded and explicit production promotion authorization is present.

## 5. Controlled cutover sequence (future; not executed)

1. Freeze the exact release commit and create immutable checksums for all source and asset files.
2. Record fresh UTC snapshots of the two production Worker deployments, route IDs, bindings, secrets names (never values), DNS state, and health endpoints.
3. Deploy the candidate catch-all Worker and its complete static asset bundle to a new isolated staging Worker with reviewed bindings. Do not point production routes at it.
4. Deploy a separate exact-root candidate Worker to isolated staging. Verify the root redirect/landing behavior and canonical URLs.
5. Run the complete staging route matrix:
   - `/`, `/studio-hub/`, `/studio-sites/`, `/thats-my-lingo/`, `/drop/`, `/kottons-code/`
   - all 13 Play Lab game IDs
   - `/healthz`, `/api/v1/runtime`, `/api/v1/platform/status`, `/api/v1/platform/gates`
   - checkout POST must return `410 BILLING_DISABLED`
   - no missing assets, no enabled checkout controls, no unexpected console errors, no mobile horizontal overflow.
6. Obtain independent review and release acceptance. Confirm the rollback plan and responsible operator.
7. During an approved release window, deploy the catch-all Worker version first while preserving its previous version; verify deep routes and APIs on production.
8. Deploy/route the exact-root candidate only after deep routes pass; verify `/` and `www` immediately.
9. Re-run the production route matrix, compare all critical source hashes and Worker version IDs, and inspect logs/metrics.
10. If any required check fails, restore the exact-root and catch-all Worker versions listed in Section 1, restore route mappings if changed, and verify rollback.

## 6. Immediate rollback triggers

Rollback immediately if:
- root or deep routes return 4xx/5xx unexpectedly;
- static assets or game routes fail;
- checkout becomes enabled or any payment provider is contacted;
- CORS, CSP, auth, or security headers regress;
- production data, identity, or user progress is altered unexpectedly;
- health, error-rate, latency, or resource thresholds breach the approved limits;
- any source hash or deployed Worker version differs from the accepted release manifest.

## 7. Current live verification

At the time of this runbook:
- `https://thelingolegacy.com/` is reachable and serves the existing flagship root page.
- `https://thelingolegacy.com/healthz` returns HTTP 200.
- `https://thelingolegacy.com/api/v1/platform/status` reports `SERVING / RELEASE-LOCKED`, G02 `FAIL / UNVERIFIED`, G03–G11 blocked, promotion authorization false, production mutation frozen, and LKG protected.
- Fresh live status reports Worker runtime `5.0.0-studio-platform`; API and edge rendering are enabled, but Stripe, Firebase, D1, KV, R2, Beacon webhook, and Twilio integrations are all `false`. WebSocket realtime is `false`. `G00_SOURCE_AUTHORITY` and `G01_REPOSITORY` are `PASS`; G02 remains `FAIL / UNVERIFIED`; G03–G11 remain `BLOCKED`; promotion and activation authorization remain `false`.
- `https://thelingolegacy.com/studio-hub/` returns a not-found page.
- The new Hub is available in GitHub source and historical Pages previews only. The shared integration-test Pages project is no longer an approved staging target; its automatic preview deployments are disabled pending a safe output-directory rebuild.

**Final decision:** No promotion, production DNS change, route mutation, Worker deployment, or production binding/secret change is performed by this runbook. The GitHub source candidate contains disabled-payment pages, but production remains on the legacy active Worker versions above. This runbook defines a verifiable cutover path for a later authorized release.
