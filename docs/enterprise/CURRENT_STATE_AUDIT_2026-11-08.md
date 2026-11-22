# LINGO Legacy Current-State Audit — 2026-11-08

**Observation date:** 2026-11-08 UTC  
**Source repository:** thelingolegacy-blip/TheLingoLegacy  
**Scope:** Read-only GitHub, Cloudflare and public HTTP inspection  
**Change policy:** No production mutation performed during this audit.

## 1. GitHub source

- Canonical repository exists: thelingolegacy-blip/TheLingoLegacy.
- Default branch: main.
- Main commit observed: 90226f6efdd6d480f36275c225550dc271f8c05e.
- Repository visibility: public.
- Repository permission: admin access was returned for the connected account.
- Branch protection and required status checks were reported disabled in the earlier same-day repository audit. Recheck before any release; do not assume protection is active.
- The repository README contains legacy naming and branding references that conflict with current LINGO naming decisions. Reconcile in a separate reviewed change.

## 2. Cloudflare zone and route snapshot

Read-only API inspection returned:
- Zone: thelingolegacy.com.
- Zone ID: 91c3f6315fb3ca132b22744721103f88.
- Zone status: active.
- Zone paused: false.
- Plan label: Free Website.

Observed routes:
| Pattern | Worker |
|---|---|
| thelingolegacy.com/ | lingo-flagship-root |
| thelingolegacy.com/* | thelingolegacyv-5 |
| www.thelingolegacy.com/* | thelingolegacyv-5 |
| launch.thelingolegacy.com/* | lingo-static-backup-proxy |
| atlas.thelingolegacy.com/* | lingo-ecosystem-atlas |
| thats-my-lingo.thelingolegacy.com/* | thelingolegacyv-5 |
| ai.thelingolegacy.com/* | thelingolegacyv-5 |
| hub.thelingolegacy.com/* | thelingolegacyv-5 |

The exact-root route is more specific than the apex catch-all. Both must be tested independently during any cutover.

## 3. Active deployment versus uploaded versions

### Catch-all Worker: thelingolegacyv-5
- Active deployment ID: ecd71a70-e476-4318-92a7-35249ced360b.
- Active version ID: 2d161fa5-598f-4998-ada8-7ac4c72c3461.
- Active traffic percentage: 100%.
- Active deployment creation timestamp: 2026-10-25T16:21:58Z.
- Latest uploaded versions observed include version 269 (2026-11-08T23:35:46Z) and version 268 (2026-11-08T23:32:51Z).
- Version uploads are not the same as active deployments. The deployments endpoint still identified the October 25 deployment as active at 100%.
- Current bindings by name/type: ASSETS (assets), CANONICAL_DOMAIN (plain text), PUBLIC_SITE_URL (plain text).
- Compatibility date: 2026-09-01; nodejs_compat enabled; observability enabled.

### Exact-root Worker: lingo-flagship-root
- Active deployment ID: 31ccefbb-df4f-4a62-974b-3ee9d0bc81d3.
- Active version ID: 658acd1a-997b-45cd-b8fc-e59c59b26b45.
- Active traffic percentage: 100%.
- Active version number: 1.
- Version number 2 exists as an uploaded preview version; it is not the active deployment.
- No bindings were returned.
- Compatibility date: 2026-09-01; nodejs_compat enabled.

### Staging workers
- lingo-studio-control-center-staging: active deployment e142ffd0-8e76-495d-a9f0-e6a3c9ef3558, 100%; no bindings returned in settings.
- lingo-game-engine-staging: active deployment 273be68c-1544-4c22-be1f-7733e9e8c669, 100%; bindings include D1 DB and plain-text ENVIRONMENT.
- These are staging services. Their deployment state does not imply production readiness.

## 4. Public access verification limitation

A public HTTP fetch of https://thelingolegacy.com redirected the inspection client to a Cloudflare Access login URL. The same inspection could not retrieve /studio-hub/ or /api/v1/platform/status.

This does not establish whether ordinary intended visitors are blocked, because access policies may treat automated clients differently. It does mean anonymous public access was not independently verified. Required follow-up: test from a normal logged-out browser on a separate network and from an authorized test account; record HTTP status, redirect chain, headers and screenshots without exposing tokens.

## 5. Known product and studio readiness

The 2026-11-04 cutover runbook reports:
- /studio-hub/ returned not found.
- /studio-sites/ and /kottons-code/ returned HTTP 200.
- /ai/ runtime-dependent.
- /app/ browser-side local demo.
- /lane/ source-only.
- Stripe, Firebase, D1, KV, R2, webhook and SMS integrations reported false in that runtime snapshot.
- G02 FAIL / UNVERIFIED; G03–G11 blocked.
- Production mutation freeze and last-known-good protection active.

These dated product findings require fresh validation before use as current service truth.

## 6. Risks and corrective actions

| Priority | Finding | Required action |
|---|---|---|
| P0 | G02 remains unverified in latest accepted runbook | Recover and independently prove runner dispatch, execution, logs, artifact and host health |
| P0 | Uploaded Worker versions differ from active deployment versions | Reconcile source commit, version upload, deployment and approval manifests; do not promote automatically |
| P0 | Public anonymous access could not be verified | Validate intended Cloudflare Access policy using real browser sessions |
| P1 | Exact-root and catch-all Workers are separate | Maintain independent staging and rollback plans |
| P1 | Studio hub route previously returned not found | Build and test the Studio surface in isolated staging |
| P1 | Product integrations are reported disabled in prior runtime snapshot | Verify each binding and service independently; disable UI claims until proven |
| P1 | Main branch protection reported disabled | Review branch protection/rulesets and required checks; do not change without approval |
| P2 | Legacy naming and project duplication exist | Canonicalize registry and repository ownership through reviewed PRs |

## 7. Audit boundary

No DNS records, Worker routes, deployments, bindings, secrets, databases, production code or payments were changed by this read-only audit. This document records observations, not release acceptance.
