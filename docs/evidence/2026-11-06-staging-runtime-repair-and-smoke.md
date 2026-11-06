# LINGO Staging Runtime Repair and Smoke Evidence

**Verified at:** 2026-11-06T03:03:49Z  
**Environment:** Isolated Cloudflare Workers staging + AppDeploy staging  
**Change type:** Staging-only API runtime defect repair  
**Authorization:** User requested establishing a running operational environment; no production promotion authorized  
**Actor:** Assistant execution through connected GitHub and Cloudflare control planes  
**Production mutation:** None  
**Disposition:** Staging smoke checks PASS for the endpoints listed below; production release remains HOLD

## 1. Change manifest

- Repository: `thelingolegacy-blip/TheLingoLegacy`
- Branch: `recovery/cloudflare-api-worker-asset-fallback-2026-11-06`
- Source commit containing Worker fix: `fcfe4e866d76d54e0a852413b9b0ac8b17684080`
- File: `worker.js`
- Git blob SHA-1: `48d775cb28ade094dc5f57aa44dd41aba533c57c`
- File size: 14,029 UTF-8 bytes
- SHA-256: `680857604aae8ea18d3d23f48970a092f2791e5affcf1d3a2b263ba93e7e7dae`
- Change: before calling `env.ASSETS.fetch(request)`, explicitly check that the API-only validation Worker has an ASSETS binding; when it does not, return a secured JSON 404 instead of throwing and returning HTTP 500.
- The change does not add a binding, secret, custom route, data write, payment path, or production capability.

## 2. Cloudflare deployment and rollback

Worker: `lingo-release-candidate-validation-20261104`

- Worker tag: `3ccb61625ff04336b1394cafdfcbeac8`
- New deployment ID: `38b30e12-9099-48ab-ae9a-a7805d9c4e49`
- New active version ID: `6e44e2c8-3abd-489e-bce9-52e342f47a7b`
- Active allocation: 100%
- Upload ETag: `ac656ba7c9f18ee496a7021b41f16df5b964e44291fad2af203c78647f474b57`
- Cloudflare GET of the deployed script was compared byte-for-byte with the GitHub branch source: exact match.
- SHA-256 of GitHub source and downloaded deployed script matched: `680857604aae8ea18d3d23f48970a092f2791e5affcf1d3a2b263ba93e7e7dae`.
- No custom routes; Workers.dev remains enabled for this isolated validation hostname; preview URLs remain disabled; bindings remain empty.
- Previous rollback deployment ID: `49fc7cae-712a-4753-bf7b-2cf4db952864`.
- Previous rollback version ID: `3d72d425-c65e-490a-9b3b-f6f6df6c2bcc` (100% before repair).

## 3. Isolated release-candidate Worker smoke matrix

Checks were executed through Cloudflare Browser Rendering against the deployed Workers.dev URL on 2026-11-06.

| Request | HTTP | Result |
|---|---:|---|
| `GET /healthz` | 200 | Runtime responds; security headers and runtime header present |
| `GET /api/v1/runtime` | 200 | API manifest responds; Firebase, D1, KV, R2, Stripe, Twilio, and webhook integrations all false |
| `GET /api/v1/platform/status` | 200 | `SERVING / RELEASE-LOCKED`; G02 fail/unverified; G03–G11 blocked |
| `GET /api/v1/platform/gates` | 200 | Fail-closed true; mutation freeze true; LKG protected |
| `GET /api/v1/platform/modules` | 200 | 21-module manifest returned |
| `GET /api/create-checkout-session` | 410 | `BILLING_DISABLED`; no checkout or payment session |
| `GET /favicon.ico` | 404 | Explicit API-only/no-ASSETS response; no unhandled exception |

### Defect correction evidence

Before the repair, Cloudflare Observability recorded 12 requests to `/favicon.ico` returning HTTP 500 during the prior seven-day window. The Worker intentionally had no ASSETS binding, but the fallback attempted `env.ASSETS.fetch()` unconditionally.

After the repair, a fresh browser-rendered request to `/favicon.ico` returned HTTP 404 with the explicit message that static assets are not bound to this API-only validation Worker. This is the correct fail-closed behavior for this API-only service. The API endpoints above continued returning HTTP 200.

## 4. Studio Control Center staging

Worker: `lingo-studio-control-center-staging`

- `GET /healthz`: HTTP 200; service ready; staging; read-only; 16 registered origins.
- `GET /healthz/apps`: HTTP 200; all 16 of 16 configured AppDeploy origins returned HTTP 200 to the gateway's HEAD checks.
- This is an availability check only. It does not certify each product's API, login, data persistence, game loop, or write path.
- Gateway is explicitly read-only: GET/HEAD only; protected API/auth/OAuth/admin paths are blocked.

## 5. World Engine staging

Worker: `lingo-world-engine-staging`

- `GET /healthz`: HTTP 200; D1 database reachable; five published worlds; KV binding present.
- `GET /api/v1/worlds`: HTTP 200; five published staging registry records returned.
- Published records: Crazy Weasols, Doughboy’s Oasis, Jersey Shore: The Undead, That’s My Lingo, and Tricia’s Escape.
- D1 schema and world records were queried read-only. The schema query reported `changed_db=false` and `rows_written=0`.
- The D1/KV registry is staging data, not production game-save, account, or multiplayer infrastructure.

## 6. AppDeploy staging surfaces

- Studio Hub: `https://lingo-legacy-studio-hub-nhda3b.v2.appdeploy.ai/` returned HTTP 200 in browser-rendered fetch; latest AppDeploy QA snapshot says deployment ready, validation valid, and zero frontend/network/backend errors.
- Backend: `https://hello-the-lingo-legacy-ois1rj.v2.appdeploy.ai/` returned HTTP 200; latest QA snapshot reports zero frontend/network/backend errors.
- The backend `media-health-monitor` cron remains disabled; provider status reports reason `credits_exhausted`.
- Account overview simultaneously reported monthly credits available `41.410911038`, while app-status QA responses emitted an exhausted-credit alert. This provider-account status conflict remains unresolved. No AppDeploy deploy/retry, top-up, or paid operation was attempted.
- Backend source still needs route-level authentication/authorization and data-scope remediation before production integration. A clean QA snapshot does not close that security finding.

## 7. Release and production boundaries

- GitHub Actions/G02 remains unaccepted. The latest tracked G02 run `42150617476` has zero jobs and zero artifacts.
- PR #466 remains draft and is not merged.
- No production DNS, custom Worker route, apex/www route, Pages domain, Firebase project, secret, payment setting, or production Worker was changed.
- The release-candidate Worker continues to report G02 fail/unverified, G03–G11 blocked, billing disabled, production mutation frozen, and LKG protected.
- No production promotion or acceptance is claimed by this staging smoke test.

## 8. Rollback

If the isolated validation Worker regresses, restore the prior 100% version `3d72d425-c65e-490a-9b3b-f6f6df6c2bcc` through a new Cloudflare deployment for this Worker. The prior deployment record remains available. No production rollback is required because no production route targets this Worker.

**Final disposition:** The isolated Cloudflare API runtime is serving and its tested contracts pass. The Studio gateway and World Engine staging services are serving; 16 configured origin HEAD checks pass and five staging worlds are queryable. This is a functioning staging environment, not an accepted or production-integrated LINGO release.
