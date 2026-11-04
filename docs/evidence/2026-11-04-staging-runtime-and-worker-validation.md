# LINGO Legacy — Staging Runtime and Worker Validation

**Date:** 2026-11-04  
**Environment:** Cloudflare Workers staging and Cloudflare Pages preview  
**Production mutation:** None  
**Status:** Staging services verified; release remains blocked.

## 1. World Engine staging Worker

Worker: `lingo-world-engine-staging`  
Workers.dev URL: `https://lingo-world-engine-staging.thelingolegacy.workers.dev`

Read-only live endpoint checks:

| Endpoint | Result |
|---|---|
| `GET /healthz` | HTTP 200; status `ok`; D1 reachable; 5 published worlds; KV binding present |
| `GET /api/v1/worlds` | HTTP 200; registry returned 5 published world records |

Published world records:
- Crazy Weasols — `browser-play-lab-v1`
- Doughboy’s Oasis — `oasis-vertical-slice-v1`
- Jersey Shore: The Undead — `browser-play-lab-v1`
- That’s My Lingo — `virtual-reel-v1`
- Tricia’s Escape — `browser-play-lab-v2`

Bindings verified from Worker settings:
- D1 binding `WORLD_ENGINE_DB`, database ID `3c307c69-c65a-43bf-9a01-33b33972177a`
- KV binding `WORLD_REGISTRY_KV`, namespace ID `7da6b33bdf9746c49bbedde585bef8e5`

This proves the staging registry service and its D1/KV connectivity respond. It does **not** prove user accounts, identity, game save writes, multiplayer, production API routing, or live-world integration.

## 2. Studio Control Center staging Worker

Worker: `lingo-studio-control-center-staging`  
Workers.dev URL: `https://lingo-studio-control-center-staging.thelingolegacy.workers.dev`

Read-only live endpoint checks:

| Endpoint | Result |
|---|---|
| `GET /healthz` | HTTP 200; environment `staging`; mode `read-only`; 16 registered origins |
| `GET /healthz/apps` | HTTP 200; 16 of 16 configured origins returned HTTP 200 |

The Worker source explicitly limits proxy methods to GET/HEAD, blocks protected API/auth/OAuth/admin routes, strips upstream Set-Cookie, and describes itself as a static preview proxy. The 16-origin health response is origin availability only; it is not a functional test of each product's APIs or game loop. The route catalog contains legacy AppDeploy slugs and destinations that require canonical-route reconciliation before any public promotion.

## 3. Release candidate Worker source syntax

Branch source: `worker.js`, blob `f3916fe6658845d08c3727da1caecdf4b24387ca`.

- A JavaScript parser check using the V8 function compiler passed after correcting missing commas in the runtime manifest and platform-status objects.
- Runtime feature flags for premium studio, live operations, askLINGO, and analytics now report disabled until those integrations exist; only `staging_preview` is marked true.
- Billing remains fail-closed: checkout returns `410 BILLING_DISABLED`; subscriptions, paid game credits, and cash-out remain false.
- This is a source syntax check, not an upload or runtime acceptance test of this release-candidate Worker. The release-candidate `worker.js` has not been deployed to production or assigned a production route.

## 4. GitHub Actions execution evidence

The source commit `820f8aad60d0c61e7c34153c53f34b7396333fae` triggered six workflows:
- Crimson Smoke UI — static validation, run `41926947031`
- Studio Static Validation, run `41926945723`
- Studio Preview Package, run `41926942622`
- Studio Sandbox Guard, run `41926944222`
- Lingo Legacy Static CI, run `41926941159`
- G02 Runner Image Build (no publish), run `41926939464`

All six concluded `startup_failure`; each Jobs API response returned zero jobs and each Artifacts API response returned zero artifacts. There is no runner assignment, step execution, log artifact, or G02 sentinel evidence. These are failed startup attempts, not PASS.

## 5. Production isolation

- No production DNS record, Worker route, Worker script, Pages custom domain, main branch, or production asset was changed.
- The exact root route `thelingolegacy.com/` remains assigned to `lingo-flagship-root`; the catch-all `thelingolegacy.com/*` remains assigned to `thelingolegacyv-5`.
- Production `/studio-hub/` remains unserved by the current production route.
- The Studio Hub remains on the isolated Pages preview project.

## 6. Remaining release blockers

1. G02 runner/host assignment and actual workflow jobs, logs, artifacts, sentinel, and independent acceptance.
2. Worker-runtime acceptance of the release-candidate `worker.js` in an isolated staging deployment with a complete, reviewed binding manifest.
3. Reconcile and validate canonical product routes and retire or clearly label stale proxy destinations.
4. Firebase project configuration and verified auth, data, and cloud-save flows; repository currently has Firebase placeholders on main.
5. Full security, accessibility, performance, privacy, content-rating, and asset-rights review.
6. A production cutover plan for the exact root Worker and catch-all Worker, with rollback evidence and explicit release approval.

**Disposition:** STAGING RUNTIME CHECKS PASS FOR THE READ-ONLY ENDPOINTS ABOVE. RELEASE CANDIDATE NOT ACCEPTED. PRODUCTION HOLD.
