# askLINGO v2.0 — Parallel Build Execution Plan

**Status:** Workstream orchestration baseline / no runtime activation
**Source:** `feat/asklingo-v2-foundation-2026-11-21@748c438f0952a98e6f49e0481a9484e071b889f3`
**Execution branch:** `feat/asklingo-v2-parallel-build-2026-11-21`
**Release posture:** Development-first; staging only after prerequisites; production HOLD unchanged.

## Execution model

Run all 17 workstreams concurrently for discovery, contract definition, implementation preparation, and isolated development. Shared contracts are versioned and reviewed before integration. Workstreams may proceed in parallel only where their interfaces and trust boundaries are explicit. Integration and activation remain gated by dependency evidence.

No workstream may enable production behavior, select a paid provider, provision secrets, persist conversations, change production bindings/routes/DNS, merge, or deploy under this plan. Existing askLINGO facade behavior (`ASKLINGO_DISABLED`) remains authoritative until a separate implementation review and release authorization.

## 17 parallel workstreams

| ID | Workstream | Parallel deliverable | Hard dependency / activation gate |
|---|---|---|---|
| W01 | Core intelligence | Provider-neutral inference interface, request/response schemas, deterministic mock adapter, safety/error normalization | Provider selection and spend approval required before real inference |
| W02 | Multi-agent orchestration | Agent registry schema, routing policy, delegation envelope, bounded task planner | SAAAE authorization and worker identity |
| W03 | Knowledge and memory | Store-agnostic interfaces, classification, provenance, retention/deletion model, non-persistent default | Privacy review and approved store before persistence |
| W04 | Identity and access | Identity-provider adapter contract, claims validation, RBAC/ABAC policy interface, revocation contract | Real isolated staging identity configuration |
| W05 | Product intelligence | Product registry and read-only context adapters, product/tenant isolation contract | Per-product owner, API, scopes, and sandbox verification |
| W06 | Voice/mobile/web | Shared client contract, responsive experience shells, voice capability contract, accessibility criteria | API contract; no privileged client-side authority |
| W07 | SAAAE governance | Server-side policy enforcement interface, approval digest schema, audit event schema, deny-by-default tests | Durable staging approval/audit stores and independent review |
| W08 | QA, monitoring, recovery | Test matrix, correlation IDs, health/readiness probes, privacy-minimized telemetry and recovery runbooks | Evidence sink and CI checks |
| W09 | LINGOassist lifecycle | Task envelope, state machine, idempotency, cancellation, retry and evidence hooks | W02/W07 contracts |
| W10 | API gateway | Versioned route contract, strict validation, generic errors, request IDs, adapter boundary | W04/W07 gates; existing disabled route preserved until approved |
| W11 | Research/retrieval | Source adapters, citation/provenance model, untrusted-content handling, retrieval evaluation | W03 data boundaries and source policy |
| W12 | Agent registry/capabilities | Immutable agent records, capability vocabulary, contract validation and registry tests | W02/W07 |
| W13 | Task planning/previews | Plan representation, target/impact/dependency preview, risk tier and approval requirement | W09/W07; planning must not execute |
| W14 | Evidence/verification | Evidence manifest, correlation model, independent verifier contract, acceptance predicates | W08 and independent review |
| W15 | UX/governance console | Conversation, research, task, agent, approvals, audit and settings prototypes | W06/W07; UI cannot grant authority |
| W16 | Cost/operations | Budgets, quotas, timeouts, concurrency, abuse controls, provider cost accounting and alerts | Provider decision; zero-spend default |
| W17 | Release/recovery | CI acceptance matrix, artifact provenance, staged rollout/rollback and LKG protection | All implementation gates; separate human release authorization |

## Shared interfaces to stabilize first

1. Principal and scope: subject, issuer, tenant, product, environment, resource, operation.
2. Request envelope: request/correlation ID, actor, surface, locale, payload classification, expiry.
3. Task envelope: task ID, idempotency key, target, operation, constraints, approval reference.
4. Policy decision: allow/deny, reason code, policy version, evaluated scope, correlation ID.
5. Approval record: requester, independent approver, exact action digest, target, scope, expiry, one-time consumption and revocation.
6. Evidence manifest: source SHA, run/job/step, artifact identity/checksum, timestamps, verifier and acceptance predicate.
7. API result: request ID, status, safe error code, answer/content, citations and non-executable suggested actions.

## Parallel integration cadence

- **Wave A — Contract and inventory:** W01–W17 each map existing assets, define interfaces, record gaps and tests.
- **Wave B — Isolated implementation:** build independent modules and deterministic tests; no external provider or production credentials.
- **Wave C — Staging integration:** connect only after staging identity, policy, approval, audit, and rate-limit dependencies are verified.
- **Wave D — Acceptance:** security, privacy, accessibility, cost, failure-mode, isolation, evidence and recovery reviews.
- **Wave E — Release decision:** prepare release candidate; merge, deployment, activation and production promotion each require their own explicit authorization.

## Non-negotiable controls

- Default deny; missing/ambiguous/unavailable policy means blocked.
- Authentication is not authorization; agent role names are not grants.
- Approval is bound to an exact action digest, target, scope, actor, and expiry; re-check revocation at execution.
- No self-approval, ambient authority, cross-product access, or client-side authorization.
- No conversation persistence by default; no paid inference by default.
- Retrieved content and model output are untrusted data, never policy or authority.
- No claim of execution, test pass, deployment, activation, or completion without attributable evidence.
- Preserve the current facade's disabled behavior and existing production HOLD/G02 controls.
- No merge, production deployment, secret provisioning, production route/binding changes, or paid service activation through this orchestration plan.

## Initial acceptance criteria for each workstream

Each workstream must deliver: owner/maintainer, current-state inventory, source references, interface/schema, threat and privacy notes, deterministic tests, failure behavior, cost implications, dependencies, evidence plan, rollback/reversal notes, and explicit NOT RUN/BLOCKED/PASS status. A document or mock is not a runtime implementation.

## Current verified baseline

- Foundation PR #644 is open/draft against main SHA `3fe099eb11329cc333ffa5a1ea36affcd0375343`, latest inspected head `748c438f0952a98e6f49e0481a9484e071b889f3`, with 38 changed files, 2,463 additions, and 2 deletions.
- PR #645 is stacked on #644. PRs #646 and #647 are parallel executable slices stacked on #645; they remain draft and unmerged.
- PR #646 includes the default-deny SAAAE kernel; action-digest canonicalization was hardened against `__proto__`, cycles, and sparse arrays, with targeted isolated regression checks (3/3). Full PR suite and hosted CI remain unverified.
- PR #647 includes the agent capability registry; duplicate scope keys now use an unambiguous JSON tuple, with a targeted delimiter-injection regression check (1/1). Full PR suite and hosted CI remain unverified.
- Latest inspected foundation Actions runs failed at startup before job creation; do not count them as test passes.
- Isolated Cloudflare staging D1 and disabled Worker scaffold have been provisioned; D1 schema applied and verified. Firebase Auth remains blocked pending Firebase plugin connection and a dedicated project. See PR #644 `docs/asklingo-v2/23-STAGING-PROVISIONING.md`.
- Existing service contract states no production askLINGO query endpoint, no verified provider, no active Firebase Auth, and no approved conversation persistence.
- Existing facade authenticates then intentionally returns `ASKLINGO_DISABLED`; preserve this behavior.
- G02 remains FAIL / UNVERIFIED; G03–G11 remain held; production promotion remains on HOLD; last-known-good remains protected.
