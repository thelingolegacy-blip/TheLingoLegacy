# LINGOlegacy Studio Control Center — Integration Package

**Environment:** staging only  
**State:** implementation scaffold prepared; not deployed or activated  
**Production boundary:** no DNS, Worker route, production secret, Firebase project, or production app mutation is included.

## Purpose

Provide one reviewable integration contract for askLINGO, LINGOarts, Cloudflare, Firebase, and the 16 registered AppDeploy application surfaces. This package is deliberately isolated from existing production configuration.

## Architecture

- **Studio Control Center:** operator-facing orchestration and evidence review.
- **askLINGO:** MCP/tool contract and ChatGPT Actions schema. The endpoint is intentionally marked unconfigured until a real authenticated service is deployed.
- **LINGOarts:** creative asset and publishing workflow integration point; rights and publication approvals remain human gates.
- **Cloudflare:** isolated Worker preview on workers.dev; no production route declarations.
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
3. Deploy the isolated Cloudflare Worker to workers.dev only.
4. Implement and deploy the authenticated askLINGO MCP/API service.
5. Wire the dashboard to read-only registry and evidence APIs.
6. Run each gate and preserve raw logs/artifacts.
7. Obtain independent human acceptance. Production promotion remains a separate authorization.

## Current limitations

- The AppDeploy daily free deployment allowance is below its 16-credit minimum; the platform reported deployment pause until 2026-11-03 00:00 UTC.
- No Firebase connector or project mutation channel is available in this session. Firebase files are prepared for review only.
- The askLINGO app's inspected backend currently exposes a health check and realtime subscription routes; no chat/MCP endpoint was verified.
- The Cloudflare zone and Worker inventory were inspected read-only. No Worker or route was changed.
- App registration is not a successful health check or proof of 16 working micro-frontends.
