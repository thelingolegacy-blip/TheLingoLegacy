# LINGOlegacy Studio Control Center — Integration Package

**Environment:** staging only  
**State:** partially deployed to isolated staging; Cloudflare gateway is live on workers.dev; AppDeploy extension and live integration acceptance remain pending  
**Production boundary:** no DNS, Worker route, production secret, Firebase project, or production app mutation is included.

## Purpose

Provide one reviewable integration contract for askLINGO, LINGOarts, Cloudflare, Firebase, and the 16 registered AppDeploy application surfaces. This package is deliberately isolated from existing production configuration.

## Architecture

- **Studio Control Center:** operator-facing orchestration and evidence review, extending the existing LINGO Enterprise Control Center rather than creating a duplicate control-plane application.
- **askLINGO:** MCP/tool contract and ChatGPT Actions schema. The endpoint is intentionally marked unconfigured until a real authenticated service is deployed.
- **LINGOarts:** creative asset and publishing workflow integration point; rights and publication approvals remain human gates.
- **Cloudflare:** one separate staging Worker deployed on workers.dev only; no production/zone route declarations. Worker is GET/HEAD-only, uses a 16-origin allowlist, does not forward credentials, and exposes /healthz/apps for a read-only HEAD probe of all registered origins.
- **Firebase:** server-authoritative task/evidence functions and deny-by-default client writes. Rules/functions are templates and are not deployed.
- **AppDeploy:** 16 existing application origins registered as staging surfaces; existing apps remain untouched.

## Five gates

1. ASK-01 — validate manifest and endpoint authentication.
2. EDGE-01 — verify exact route allowlist, GET/HEAD-only proxy, and staging-only Worker deployment.
3. FB-01 — validate custom-claim RBAC, deny-by-default rules, and callable-function authorization.
4. APP-16 — verify all 16 application IDs and staging origins; do not infer route health from registry presence.
5. REL-01 — collect real run IDs, job/step logs, artifact digests, and independent review before acceptance.

## Security model

- No wildcard origin, arbitrary destination, open redirect, or user-controlled upstream.
- No cookies, Authorization headers, or client credentials forwarded by the preview proxy.
- No writes through Firestore client SDK. Privileged writes use Firebase Admin SDK functions with custom-claim checks.
- Evidence records are append-only and require a verifier identity, independent reviewer, source run URL, and SHA-256 artifact digest.
- Gate acceptance is not production promotion. promotionAuthorized remains false.
- No secret values belong in this repository. Use platform secret stores only after an authorized staging connection exists.

## Deployment sequence

1. Review this branch and its static checks.
2. Configure a dedicated staging Firebase project and staging custom claims.
3. COMPLETE — deploy the isolated Cloudflare Worker to workers.dev only; runtime smoke verification remains.
4. Implement and deploy the authenticated askLINGO MCP/API service.
5. Extend the existing LINGO Enterprise Control Center staging app; do not create a second control-center app.
6. Run each gate and preserve raw logs/artifacts.
7. Obtain independent human acceptance. Production promotion remains a separate authorization.

## Current limitations

- The last recorded AppDeploy preflight reported the free-tier daily allowance below the 16-credit deployment minimum. A fresh deployment-specific preflight is still required; the account overview currently reports 194.368 monthly credits available, which does not by itself prove that the daily deployment allowance is sufficient.
- The Firebase plugin is available but not connected in this session; no dedicated staging Firebase project has been confirmed. Firebase files are prepared for review only.
- The askLINGO app's inspected backend currently exposes a health check and realtime subscription routes; no chat/MCP endpoint was verified.
- The current Cloudflare deployment is record 3e86b188-1697-414c-b7bd-637e5eccdc5e, serving version 6827a64d-53b6-4b96-93fe-89fb864ff4d9 at 100%. Earlier deployments remain historical rollback records, not additional live gateways. Runtime HTTP smoke verification remains pending.
- All 16 registered AppDeploy surfaces currently report deployment ready and their latest status snapshots report zero frontend/network/backend errors; this is not independent HTTP health evidence or proof of 16 working micro-frontends.
- The repository validation script, Firebase Emulator Suite, authenticated MCP handshake, and 16 direct HTTP probes have not yet been executed.
