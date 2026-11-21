# LINGOlegacy Studio Control Center — Integration Package

**Environment:** staging only  
**State:** existing Enterprise Control Center extension deployed and ready; Cloudflare staging gateway active; independent HTTP smoke evidence remains blocked by execution egress policy.  
**Production boundary:** no production DNS, Worker route, secret, Firebase project, AppDeploy production app, payment path or promotion was changed.

## Purpose

One reviewable integration contract for askLINGO, LINGOarts, Cloudflare, Firebase and the 16 registered AppDeploy application surfaces. Extend the existing LINGO Enterprise Control Center; do not create a duplicate control-center app.

## Canonical architecture

- **Studio Control Center:** the existing AppDeploy app `lingo-enterprise-control-center-qos4ix`, extended with a Staging Integrations evidence page and a read-only backend health endpoint.
- **askLINGO:** MCP/tool manifest and OpenAPI contract. The endpoint remains explicitly unconfigured until a real authenticated service and authorized credentials exist.
- **LINGOarts:** preserve the existing Studio Hub and its authenticated asset workflows. The Control Center provides a secure handoff link; no cross-app credential sharing is implemented.
- **Cloudflare:** one isolated staging Worker on workers.dev only. GET/HEAD-only, fixed 16-origin allowlist, no cookie or Authorization forwarding, protected API/auth/admin paths blocked, and a read-only `/healthz/apps` HEAD-probe endpoint.
- **Firebase:** deny-by-default Firestore rules and server-authoritative callable-function templates. They are not deployed until a dedicated staging project and connector are connected.
- **AppDeploy:** 16 existing application origins registered as staging surfaces. The existing applications are preserved.

## Five core gates

1. **ASK-01** — authenticated MCP service, tool-schema tests and unauthorized-request rejection.
2. **EDGE-01** — exact route allowlist, GET/HEAD-only behavior, staging-only deployment and runtime smoke evidence.
3. **FB-01** — custom-claim RBAC, deny-by-default rules, Emulator Suite tests and function logs.
4. **APP-16** — all 16 app IDs and origins, with direct HTTP status/timestamp/response digest for each.
5. **REL-01** — real run/job/runner IDs, execution steps, retrievable logs, artifact digests and independent human review.

## Security model

- No wildcard origin, arbitrary destination, open redirect or user-controlled upstream.
- No cookies, Authorization headers or client credentials forwarded by the preview proxy.
- No Firestore client writes. Privileged writes remain server-authoritative and custom-claim gated.
- Evidence records require a verifier identity, independent reviewer, source run URL and SHA-256 artifact digest.
- Gate acceptance is not production promotion. `promotionAuthorized` remains false.
- No secret values belong in this repository or chat. Use a platform secret store only after an authorized staging connection exists.

## Execution status — 2026-11-03

### Completed

- **AppDeploy Control Center:** existing app updated in place and reports `ready`. Snapshot `1793664829309`; QA snapshot `2026-11-03T00:14:02.920Z`; zero reported frontend, network and backend errors. Five UI tests remain, with exactly one sanity test.
- **Control Center UI:** Staging Integrations page lists all 16 registered origins, distinguishes provider QA from direct HTTP evidence, links to Cloudflare health probes and the existing Studio Hub, and shows fail-closed integration/G02 status.
- **Backend health:** added read-only `GET /api/_healthcheck` returning staging metadata and `productionMutation: false`.
- **Cloudflare:** active deployment `3e86b188-1697-414c-b7bd-637e5eccdc5e`, version `6827a64d-53b6-4b96-93fe-89fb864ff4d9`, 100% traffic; workers.dev enabled, preview URLs disabled, persistent invocation logs enabled. Preserve all historical deployment records.
- **Static package validation:** seven contract assertions passed against current branch contents.

### Still blocked or unverified

- **16 direct HTTP probes:** provider status reads return `ready` for all 16 apps and zero reported errors, but a direct HEAD attempt against each origin was denied by the execution environment's outbound egress policy (HTTP 403) before reaching the origin. The Worker `/healthz/apps` endpoint is configured to run the checks from Cloudflare; its response still needs to be retrieved from a permitted network context.
- **Cloudflare runtime smoke:** the execution environment could not reach the workers.dev host because outbound requests were denied. Deployment/configuration is verified; runtime response is not.
- **askLINGO:** current backend has a health check and realtime subscription routes, but no authenticated chat/MCP endpoint or service credentials were verified.
- **LINGOarts:** authenticated `GET/POST /api/assets` routes remain inside the existing Studio Hub. The Control Center uses a secure handoff link; no cross-app token exchange exists. Rights review and publication remain human gates.
- **Firebase:** no Firebase connector or dedicated staging project is connected; no project mutation or Emulator Suite run occurred.
- **G02:** latest PR-head workflows ended `startup_failure` with zero jobs and zero artifacts. No runner ID/name, steps, logs or artifact evidence exists.
- **TypeScript:** AppDeploy deployment build/QA is ready, but a separate `tsc --noEmit` typecheck was not run. Vite build success is not represented as a full TypeScript typecheck.
- **Repository execution:** the seven static assertions were run against fetched branch content in the connector JavaScript runtime; the checked-in Node validator was not run from a repository checkout.

## Deployment and acceptance sequence

1. Keep PR #445 draft and review the canonical package.
2. Preserve the active Cloudflare staging Worker and its deployment history.
3. Retrieve `/healthz/apps` results from a permitted runtime and retain per-origin response evidence.
4. Implement askLINGO MCP only after an authenticated endpoint and authorized credential path exist.
5. Continue LINGOarts through the existing authenticated Studio Hub; do not share credentials across apps.
6. Connect a dedicated Firebase staging project before rules/function deployment or Emulator Suite testing.
7. Restore G02 runner assignment and collect retrievable job logs/artifacts.
8. Obtain independent acceptance before any separate production authorization.

PR #445 remains open and draft. No merge to `main` or production promotion is authorized.
