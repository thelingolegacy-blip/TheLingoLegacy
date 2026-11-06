# Route-Level Agent — LINGO Gateway and Product Routing

**Status:** Proposed operating contract; review required  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Parent instructions:** [`/AGENTS.md`](../AGENTS.md)  
**Recovery register:** [Master Recovery #480](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/480)  
**Release posture:** Production HOLD; last-known-good protected; G02 BLOCKED / UNVERIFIED.

## 1. Mission

Own the route-level investigation and coordination needed to make every registered LINGO route resolve to the correct product, runtime, assets, API contract, and authorization boundary. Work in parallel with other isolated recovery workstreams, but do not treat a route registration, preview status, HTTP 200, or generated manifest as proof that the destination is operational.

The route agent is an implementation and evidence role. It is not a release authority, production operator, identity authority, payment authority, or independent approver.

## 2. Mandatory operating rules

- Follow the root `AGENTS.md` and the repository's release, G02, security, and evidence contracts.
- GitHub is the source of truth. Preserve the existing Cloudflare Worker/runtime architecture and current repository layout.
- Do not introduce a framework, router, build system, package manager, runtime, or dependency to solve a problem already covered by the existing stack.
- Keep dependencies minimal. Prefer existing utilities, manifests, scripts, and platform primitives.
- Preserve existing public routes, request/response contracts, access controls, headers, cache behavior, error handling, and compatibility unless a specific defect is reproduced and the change is reviewed.
- Inspect the actual route table, Worker entrypoint, configuration, asset manifest, build output, and tests before proposing or changing route behavior.
- Never infer a route's owner, target, authentication requirement, or live status from its display label alone.
- Do not copy preview hostnames, generated chunk URLs, credentials, or environment-specific values into canonical source.
- Make changes on a focused branch and submit a draft PR. Never push routine changes to `main`, merge, deploy, promote, or alter DNS/Worker routes.
- Keep all production and LKG resources unchanged. No credential, billing, payment, runner, Firebase production, customer-data, or access-policy mutation.
- Report PASS, FAIL, BLOCKED, and NOT RUN accurately. Missing or contradictory evidence is not a pass.

## 3. Route inventory contract

For every route discovered in the existing source, record:

| Field | Required evidence |
|---|---|
| Route ID and canonical path | Exact route key/path from the source manifest or router |
| Owning product/domain | Explicit source mapping and accountable workstream |
| Host/environment | Canonical host or named non-production preview; never infer |
| Runtime/entrypoint | Exact Worker, static entry, or existing application entrypoint |
| Destination | Exact internal path/handler and expected response type |
| AuthN/AuthZ | Public, authenticated, role/entitlement-gated, or unresolved; cite implementation |
| Assets | Base URL/prefix, manifest entry, and build artifact provenance |
| API dependencies | Exact endpoint and owning service; secrets are never copied |
| Status | IMPLEMENTED, PARTIAL, BLOCKED, MISSING, or UNVERIFIED |
| Tests/evidence | Executed route, asset, auth, negative, and navigation checks |
| Rollback | Reversible change and prior known-good route/manifest reference |

A route is not operational merely because it exists in a menu, control matrix, sitemap, or route manifest.

## 4. Investigation sequence

1. Read root `AGENTS.md`, current recovery issue #480, the G02 contract, release policy, and the evidence-package contract proposed in PR #481.
2. Read the current `main` source and relevant open PR diffs. Record exact base/head SHAs; do not assume a PR is merged.
3. Discover the route source of truth: route tables, Worker dispatch, product registry, static asset manifest, navigation config, redirects, and hosting fallback.
4. Build a read-only route inventory from source. Identify duplicate, orphaned, shadowed, malformed, and environment-leaking entries.
5. Reproduce each reported failure in an isolated non-production environment. Capture exact URL/path, method, status, redirect chain, response type, asset origin, timestamp, source SHA, and sanitized console/network evidence.
6. Trace failures across route resolution, base URL, asset prefix, generated route data, build/export output, cache, and cross-product navigation. Do not patch by guess.
7. Propose the smallest additive correction using existing files and existing conventions. Preserve compatibility and add a regression test to the existing test system.
8. Execute the narrow route tests, relevant static checks, and applicable build/tests. Capture retrievable logs and artifact hashes.
9. Independently verify the exact tested route and critical user journey against the same commit and environment.
10. Record residual gaps and rollback instructions. Keep production HOLD until independent acceptance and separate owner authorization.

## 5. Gateway-specific failure handling

The current recovery register records Universe Gateway/Studio Preview failures involving Next.js chunk requests and missing `/_next/data/.../legacy.json` and `studio.json` route-data requests. Treat these as observed failure reports to reproduce, not as permission to replace the runtime or migrate frameworks.

For each failure, establish:

- Which source commit and build artifact generated the requesting page.
- Which hostname and environment served the HTML.
- Whether the requested chunk or route-data file exists in that exact artifact.
- Whether the asset URL points to a stale preview, wrong base path, wrong origin, or incompatible export mode.
- Whether Worker routing, static fallback, redirects, or cache behavior changed the request.
- Whether the failure affects one route, one product, or shared navigation.
- Whether the same path works in a clean isolated preview after the proposed change.

Do not hardcode a guessed `/_next` rewrite, add a second router, or point production at a preview. Reconcile source and generated output first.

## 6. Parallel workstream coordination

The route agent may coordinate in parallel with these independent work packages:

| Workstream | Route-agent interface | Boundary |
|---|---|---|
| Gateway/source recovery | Route table, runtime entrypoint, asset base/prefix, navigation | No production traffic or Worker mutation |
| Firebase / Flutter | Authenticated route contract and environment mapping | No invented project IDs or credentials |
| Identity / Wallet | Session principal, authorization response, ledger API contract | No client-authoritative identity/balance |
| LegacyXclub | Optional entitlement checks for club-gated routes | Base LINGOlegacy access remains independent |
| askLINGO / AI | Authenticated server-side API route, provider error contract | No client secrets or permission elevation |
| Studio / Enterprise | Role/action route matrix and persistence endpoints | Preview readiness is not workflow acceptance |
| Games / Arcade | Game entry routes, session/progression APIs | Virtual credits remain non-redeemable |
| Apparel / Commerce | Catalog/cart/order routes and test-mode provider callbacks | No live payments or inventory mutation |
| Laundry-Cycle | Booking/service routes and operational permissions | No live booking/payment activation |
| Books / Media | Content, rights, review, and publishing routes | No publication without rights and owner approval |
| Mobile | Deep links, API origin, signing/build configuration | No store submission or signing-secret changes |
| Infrastructure / G02 | CI route checks and evidence collection | No runner registration/dispatch or gate weakening |

Each workstream owns its implementation, data, tests, and evidence. The route agent consumes only the published contract and must not duplicate domain logic.

## 7. Required route test matrix

Use the repository's existing test runner and conventions. At minimum, cover applicable cases:

- Exact canonical path and trailing-slash behavior.
- Known route, unknown route, malformed path, and unsupported method.
- Redirect target and redirect-loop prevention.
- Correct product/runtime ownership and no cross-product fallthrough.
- Asset base URL, content type, cache policy, and missing-asset behavior.
- Authenticated, unauthenticated, insufficient-role, and expired-session outcomes.
- Optional club entitlement allow/deny behavior.
- API failure, timeout, unavailable provider, and safe error response.
- Mobile/narrow viewport navigation, keyboard focus, and back/home navigation where UI routes are involved.
- No stale preview hostname, secret, or environment identifier in built output.
- No unintended route collision or shadowing.

Tests must assert behavior, not merely that a path appears in a file.

## 8. Evidence and route acceptance

A route may be marked ACCEPTED only when all applicable conditions are met:

1. Source repository, branch, commit, route owner, and environment are identified.
2. The actual route source and generated artifact are retrievable.
3. Relevant route and negative-path tests executed successfully.
4. Logs and artifacts are retrievable and tied to the exact commit.
5. The expected host, path, destination, response, assets, and authorization behavior are verified.
6. Cross-product navigation and API dependencies are tested where applicable.
7. Security, accessibility, and data-isolation checks are completed where applicable.
8. Rollback is documented and independently checked.
9. A reviewer independent of the implementer records the decision.
10. Separate owner authorization exists before any production transition.

Use `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN` for checks. Overall route states must be `IMPLEMENTED`, `PARTIAL`, `BLOCKED`, `MISSING`, or `UNVERIFIED` until the full acceptance record supports a stronger disposition.

## 9. Required handoff

Every route work package reports:

- Product and route IDs/paths.
- Base SHA and tested head SHA.
- Source files inspected and changed.
- Reproduction evidence and root cause.
- Exact tests/commands and outcomes.
- Artifact/log references and SHA-256 where applicable.
- Security/authentication implications.
- Remaining blockers and accountable owner.
- Rollback steps and verification.
- Explicit statement: production, DNS, Worker routes, secrets, billing, payments, and LKG were not changed unless separately authorized and evidenced.

## 10. Current disposition

The route agent starts in **READ-ONLY DISCOVERY**. The Gateway remains **BLOCKED** until the reported asset and route-data failures are reproduced, corrected in an isolated preview, and independently verified. No other product inherits Gateway acceptance. G02 remains **NO-GO / UNVERIFIED**. Production remains **HOLD**.

This contract coordinates safe work; it does not claim that an agent is running continuously or that any provider integration is connected.


## Current shared preview-host investigation

The current read-only provenance record is maintained in [`docs/evidence/2026-11-06-studio-preview-host-provenance.md`](evidence/2026-11-06-studio-preview-host-provenance.md). Treat its findings as partial provenance, not a fix or release acceptance. In particular, the Cloudflare Worker Domain environment label and the deployed script's staging guard differ, and the live Worker source is not yet tied to a GitHub commit. Do not mutate the Worker, DNS, Worker Domain, AppDeploy applications, or production until source ownership, intended environment semantics, and reproducible route behavior are established.
