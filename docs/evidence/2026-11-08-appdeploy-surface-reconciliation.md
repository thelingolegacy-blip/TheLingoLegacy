# AppDeploy Surface Reconciliation — 2026-11-08

## Purpose and authority

This record reconciles the connected AppDeploy application inventory with the canonical GitHub repository and Cloudflare runtime inventory. It is an evidence record, not a production acceptance or release authorization.

Canonical source remains `thelingolegacy-blip/TheLingoLegacy` on `main`. Cloudflare remains the intended edge runtime. AppDeploy URLs are staging/preview surfaces unless a separate release record explicitly proves otherwise.

## Account inventory

The connected AppDeploy account returned 18 applications. A second connected account returned the same 18 application IDs and metadata; a third returned zero applications. No write operation was performed. All reads below used the first account link, which returned the same inventory as the second.

### Primary operating surfaces

| Surface | App ID | Observed status | QA evidence | Notes |
|---|---|---|---|---|
| The Lingo Legacy Flagship | `the-lingo-legacy-y67ewl` | ready | latest snapshot reports valid; no frontend/backend errors | Its source snapshot is a minimal placeholder app; the fuller shell component exists but is not imported by `src/App.tsx`. |
| LINGO Studio Hub | `lingo-legacy-studio-hub-nhda3b` | ready | no frontend/backend errors; validation valid | 8 declared tests; AppDeploy recommends reducing to 3–5 focused tests. |
| LINGO Enterprise Control Center | `lingo-enterprise-control-center-qos4ix` | ready | QA screenshot metadata present; validation not returned | Staging-only/read-only by its declared purpose. |
| LINGOlegacy Universe Gateway | `lingolegacy-universe-gateway-h6kqu4` | ready | no backend errors; multiple frontend resource failures | Current logs include failed JS chunk loads from `studio-preview.thelingolegacy.com` and 404s for `/_next/data/.../legacy.json` and `studio.json` ("Route not registered"). |

### Additional listed applications

The same inventory includes Jersey Shore: The Undead, Crazy Weasols, LINGOloyalty staging preview, LINGO AI Sonic Boom, LINGO Legacy Master Project Plan, Hello The Lingo Legacy, That's My Lingo, LINGO Legacy Universe, Kotton's Code Cartoon Studio, Loyalty Lane Community Hub, Lingo Legacy Verification Bridge, Lingo Travel, and Obsidian Closet & Design Studio. Their listing state is `deployed`; this is not proof of production readiness or backend integration.

## Source snapshot observations

### Flagship preview
The inspected AppDeploy snapshot is `1792592998354`. Its `src/App.tsx` renders only a heading and tagline. A separate `src/components/LingoLegacyShell.tsx` contains a substantially fuller site shell, but the inspected `src/App.tsx` does not import it. This is a concrete integration gap in that AppDeploy snapshot. Do not infer that this snapshot is the current Cloudflare production source; GitHub remains authoritative.

### Studio Hub
The inspected snapshot is `1793837369387`, built with Vite + React. It includes the world matrix, experience layer, game layer, Lingo Station, Design Desk, Creative Publishing Command, and Asset Registry modules. This is a rich staging authoring surface, not evidence that each linked product has production backend services.

### Universe Gateway
The inspected snapshot is `1793645836683`, built with Next.js. The gateway includes destination pages and an ecosystem atlas. Its surface registry itself distinguishes staging from production and correctly describes the corporate domain as route-configured/runtime-unverified. QA logs show that some internal links and preview chunk URLs are not resolvable through the current staging host. These should be fixed by correcting asset base paths and route registration, then retested on the exact deployed snapshot.

## AppDeploy credit alert

AppDeploy reported that the connected account credit balance is exhausted and directed the account owner to:

https://dashboard.appdeploy.ai/my/dashboard

This is a platform funding/credit constraint, not proof that the four listed deployments failed. It may block future source updates or deployments. Do not retry deployments repeatedly or claim new changes were published until credit availability is restored and a new deployment result confirms success.

## Cross-system reconciliation

Cloudflare's previously recorded live inventory contains 11 Workers, 21 zone routes, 3 Pages projects, 4 D1 databases, 2 Queues, and 11 Access applications. The canonical Worker `thelingolegacyv-5` and the separate exact-root Worker `lingo-flagship-root` own different route scopes. The repository's `wrangler.jsonc` declares only apex and www routes, so the complete 21-route live topology is not represented in that single config file.

The gateway's staging logs reference `studio-preview.thelingolegacy.com`, while the public health probe previously encountered Cloudflare Access. Before changing access policy or routing, classify each hostname as public customer-facing, operator-only, or staging-only and reconcile the exact Worker/Pages origin for each.

The Cloudflare inventory also reported empty secret inventories for three inspected Workers. Confirm binding names and secret ownership through the owning environment before deciding whether any secret is genuinely missing; never put secret values in this record.

## Release and recovery disposition

- Production remains protected; no route, Access, DNS, Worker, Pages, D1, Queue, or secret mutation was made during this inspection.
- No AppDeploy source update or deployment was made.
- No GitHub workflow was dispatched, no runner registered, no PR merged, and no production promotion authorized.
- G02 remains FAIL / UNVERIFIED. The latest observed GitHub Actions runs failed at startup and returned no instantiated jobs.
- A `ready` AppDeploy status is not a production acceptance gate.
- The artifact repository namespace/token could not be resolved in the connected Cloudflare account. The exposed credential must be revoked/rotated in the actual owning account/environment.

## Ordered repair plan

1. Revoke the exposed artifact credential in its owning account; issue a new short-lived least-privilege credential only through a secure credential manager.
2. Reconcile all live hostname-to-Worker/Pages mappings against an explicit version-controlled route registry. Keep the existing route split unchanged until ownership and precedence are proven.
3. Classify Cloudflare Access applications by public/operator/staging exposure and review Bypass/Everyone policies individually. Do not bulk-edit policies.
4. Recover a single intended G02 runner registration; verify runner ID, runner name, labels, host service, Ubuntu hosted smoke, step execution, logs, artifacts, and run/commit correlation.
5. Resolve D1 metadata/table-count discrepancy using database-specific metadata reads before any migration.
6. Configure Queue producers/consumers only after their event contracts and idempotency behavior are defined and tested.
7. Fix the Universe Gateway Next.js asset base path and route registration errors in an isolated staging branch; verify all navigation targets and chunks on the same deployment snapshot.
8. Integrate the fuller flagship shell into the actual canonical GitHub application source only after identifying the authoritative app entrypoint; test responsive layouts and all navigation actions.
9. Restore AppDeploy credits or use the approved Cloudflare/GitHub staging path; do not silently switch providers.
10. Execute acceptance tests and independently verify every gate before any release decision.

## Evidence quality

This record reports only returned connector/API observations and inspected source snapshots. It does not assert that the complete LINGO ecosystem is fully operational. Unknowns remain unknown until the appropriate authenticated source and test evidence are available.
