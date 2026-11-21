# SAAAE Foundation v1 — Server-Side Authorization, Approval & Audit Enforcement

**Status:** Architecture baseline / review candidate  
**Date:** 2026-11-21  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `security/saaae-foundation-v1-2026-11-21`  
**Production disposition:** PROTECTED HOLD — this document does not authorize merge, deployment, activation, data migration, or production mutation.

## 1. Purpose and governing rule

SAAAE is a mandatory, shared security governance layer for LINGOlegacy_MASTER and every connected LINGO product, service, AI agent, workforce system, property operation, and infrastructure domain.

**No authorization, no execution. No required approval, no execution. No verifiable audit trail, no protected execution.**

This document defines the target contract and implementation sequence. It does not claim that the full control plane, durable storage, provider integrations, or production enforcement already exist.

## 2. Existing repository capabilities and verified limits

The following source files were inspected on `main` before this proposal was written:

| Existing source | What the source currently establishes | Limit / integration rule |
|---|---|---|
| `src/auth/firebase-id-token.mjs` | Verifies Firebase ID-token signature and core issuer, audience, subject, and time claims; explicitly describes identity verification only | Identity is not authorization. Callers still need policy evaluation, tenant/resource scoping, and revocation/session policy |
| `src/ai/ask-lingo-facade.mjs` | Uses the Firebase token verifier and fails closed when identity verification is unavailable; public askLINGO remains disabled | Not a general authorization service; its in-memory rate limiter is isolate-local; do not treat it as a privileged action broker |
| `gateway-router.js` | Explicitly fails closed because cryptographic token verification is not configured in that legacy gateway path | Do not weaken the fail-closed response or infer that all routed services have verified identity |
| `ops/recovery/verify_approval.py` and `ops/recovery/schema/lingo-approval-v1.schema.json` | Verifies a signed, short-lived, single-use approval envelope bound to one full commit SHA and one action, with an externally pinned public key and nonce consumption | Release/recovery-specific contract; it does not yet bind a general business operation to tenant, product, resource, requester, canonical payload digest, or execution ID |
| `ops/recovery/README.md` | Documents C0–C6 recovery evidence and a signed approval proposal; explicitly says the verifier path has not been executed or certified in CI | Preserve as a recovery/release control; do not silently repurpose it as the ecosystem-wide runtime approval service |
| `lingoassister/repair-engine.mjs` and tests | Pure incident workflow logic; requires an approval record before its execution transition and fails closed on incomplete acceptance | In-memory incident model, not durable authorization or audit enforcement. Its simple approval record is not cryptographically bound to an immutable action payload |
| `lingoassister/README.md` | Explicitly calls for authenticated adapters, authorization enforcement, durable audit storage, provenance checks, and independently reviewable test output | Durable backend and production integration are not established by this module |

These are source-level observations from the inspected files, not runtime certification. Existing behavior and tests must be re-run on the implementation branch before any control is declared passing.

## 3. Target architecture

Use a shared policy decision point (PDP) with enforcement points (PEPs) at every server-side entry to a protected operation. A client, UI role flag, JWT claim, agent plan, or workflow input is never an enforcement point.

### 3.1 Principal model

Every request resolves to one authenticated principal:

- `principal_id`: immutable user, service, or agent identity;
- `principal_type`: `human`, `service`, or `agent`;
- `issuer`, `audience`, `issued_at`, `expires_at`, and authentication/session context;
- `tenant_id` and product/domain memberships, resolved from trusted server-side records;
- `delegated_by` and delegation scope, when a service or agent acts on behalf of a human;
- `authentication_strength` and step-up status where policy requires it.

Never accept a client-supplied UID, role, tenant, approver identity, or permission set as authoritative. Token verification establishes identity; policy evaluation establishes permission.

### 3.2 Authorization decision contract

Each decision evaluates a normalized tuple:

`principal + action + resource + tenant + product/domain + environment + context + policy_version`

The policy engine returns only:

- `ALLOW` with a short-lived, request-bound decision reference;
- `DENY`; or
- `INDETERMINATE` when policy, identity, membership, or required dependencies cannot be verified.

`DENY` and `INDETERMINATE` both prevent execution. No implicit allow, client-side fallback, cached stale grant, or permissive outage mode.

Required policy controls:

1. Default deny and least privilege.
2. RBAC for job functions plus ABAC for tenant, resource ownership, sensitivity, environment, jurisdiction, and risk.
3. Explicit separation of human, service, and agent principals.
4. Product/domain and tenant isolation on every protected data access.
5. Server-side authorization on every sensitive request, including internal service-to-service calls.
6. Permission revocation and policy-version invalidation.
7. Step-up authentication and dual control for designated high-impact operations.
8. Explicit deny rules for agent self-approval and privilege escalation.
9. No use of UI visibility or route obscurity as access control.

### 3.3 Approval contract

Approvals are required by policy, not by client choice. An approval is a durable record bound to one exact proposed operation.

Minimum approval record:

| Field | Requirement |
|---|---|
| `approval_id` | Globally unique immutable ID |
| `request_id` | Original request correlation ID |
| `requester_principal_id` | Authenticated requester |
| `approver_principal_id` | Independently authenticated, eligible human approver |
| `operation` | Canonical operation identifier |
| `resource_id` | Exact target resource |
| `tenant_id` / `product_domain` | Exact authorization boundary |
| `environment` | Exact environment, e.g. test, staging, production |
| `payload_digest` | Digest of canonical, immutable action parameters |
| `policy_version` | Policy version used to determine approval requirement |
| `issued_at` / `expires_at` | Server-generated UTC issue and expiry timestamps |
| `status` | Pending, approved, rejected, revoked, expired, consumed |
| `nonce` | Unique single-use replay control |
| `signature_key_id` / `signature` | Key identity and cryptographic approval proof |
| `execution_id` / `outcome` | Correlated execution and final outcome, once attempted |

Rules:

- Approval must be performed by an eligible human principal distinct from the requester for designated dual-control operations.
- An agent or service may propose and prepare an action but may not approve its own high-impact action.
- Approval binds to the canonical payload digest, operation, resource, tenant, product/domain, environment, and policy version. Any change invalidates the approval.
- Revalidate the approver's authority, requester authority, approval status, expiry, policy version, and payload digest immediately before execution.
- Approval is single-use. Use durable uniqueness/transactional consumption, not an isolate-local cache or host-local nonce file for distributed runtime enforcement.
- Revocation and expiry are terminal for that approval. A new action requires a new approval.
- Keep the existing recovery/release approval envelope as a separate, specialized control until a reviewed migration explicitly establishes compatibility.

### 3.4 Audit event contract

Every security-sensitive event must be recorded by a trusted server-side audit writer. At minimum:

- event ID and schema version;
- server-generated UTC timestamp;
- actor/principal ID and principal type;
- action, resource, tenant, product/domain, and environment;
- request ID, correlation ID, and idempotency key;
- authorization decision and policy version;
- approval ID and approver ID, when applicable;
- execution ID, result, and reason code;
- source service, trace context, and evidence/provenance references;
- canonical event digest and integrity-chain reference.

Audit events include authentication outcomes, authorization decisions, permission changes, approval lifecycle events, agent/service actions, sensitive data reads/exports, financial and wallet operations, publication, configuration changes, infrastructure changes, denied actions, policy failures, and audit subsystem failures.

Integrity and retention:

1. Append-only writer identity; application principals cannot update or delete prior audit events.
2. Tamper-evident chaining or signed batch manifests with independent verification.
3. Durable storage with retention, backup, access, and legal-hold policies defined per data class and jurisdiction.
4. Redact credentials, tokens, secrets, and unnecessary personal data; store digests/references instead of raw sensitive payloads.
5. Restrict audit search/export separately from ordinary product administration.
6. Alert on integrity breaks, sequence gaps, unexpected writer identities, and audit delivery failures.
7. Preserve denied and failed attempts; do not silently drop events.

For operations that mutate protected state, authorization and audit intent must be durably committed before the side effect. Prefer a transactional outbox or equivalent atomic pattern. If the system cannot guarantee durable audit intent and later outcome reconciliation, it must not execute the protected operation. A post-execution audit write alone is insufficient because a storage outage could otherwise leave an untraceable side effect.

### 3.5 Idempotency and replay defense

Every mutating request must carry or receive a server-issued idempotency key scoped to principal, tenant, operation, and resource. Store the request digest and terminal outcome durably. Reuse with a different payload is rejected; exact replay returns the prior outcome and does not repeat the side effect. Approval nonce consumption and action idempotency are separate controls.

### 3.6 Initial pure policy evaluator

The review branch adds:

- `src/security/saaae/policy.mjs`: deterministic RBAC/ABAC policy evaluation with explicit `ALLOW`, `DENY`, and `INDETERMINATE` outcomes; default deny; explicit-deny precedence; tenant/product-domain boundary checks; exact attribute matching; rule validity windows; and fail-closed handling of malformed policy.
- `src/security/saaae/policy.test.mjs`: targeted cases for scoped allow, default deny, explicit deny precedence, tenant mismatch, inactive principal, unavailable policy, ABAC conditions, expired rules, broad/invalid allow rules, and malformed condition namespaces.
- `package.json`: adds `test:saaae` and includes it in the aggregate `npm test` script.

This is pure policy logic only. It does not authenticate the principal, load trusted roles or memberships, persist policy decisions, create/consume approvals, write audit records, enforce revocation against a live identity store, or wrap a real protected operation. A trusted server-side adapter and per-operation enforcement point remain required.

A local isolated Node harness previously exercised the eleven original policy-decision cases successfully. Since then, additional tests have been authored, bringing the targeted test suite to 59 cases; those additional suites have NOT RUN. The repository aggregate test command and hosted CI have not been run for this branch; no runtime or production integration is claimed.

### 3.7 Initial approval, audit, idempotency, and server-boundary primitives

The review branch now adds:

- `src/security/saaae/canonical.mjs`: deterministic JSON canonicalization and SHA-256 digest helpers; rejects unsupported and non-finite values.
- `src/security/saaae/authorization.mjs`: server-side request boundary that calls trusted authentication, server-side context resolution, policy loading, and mandatory durable audit-decision callback. It never treats client role/tenant fields as authoritative and will not return ALLOW when the audit callback is unavailable or unconfirmed.
- `src/security/saaae/approval.mjs`: exact request/operation/resource/tenant/domain/environment/policy/payload binding; human approver requirement; optional separation of duties; expiry checks; signature-verifier hook; execution-time approver revalidation; and durable atomic single-use consumption contract.
- `src/security/saaae/audit.mjs`: canonical hash-linked audit envelopes, atomic chain-head compare-and-set append contract, independent chain verification, and a separately signed checkpoint verification hook.
- `src/security/saaae/idempotency.mjs`: durable atomic claim/completion contract scoped to principal, tenant, operation, resource, key, and payload digest; exact replay, in-progress, and payload-conflict outcomes.
- Targeted Node test files for each primitive. There are 51 authored targeted test cases across policy, canonicalization, authorization, approvals, audit, and idempotency.
- `docs/security/SAAAE-DURABLE-ADAPTER-CONTRACTS-v1.md`: required transactional storage behavior and integration boundaries.

These are enforcement primitives and adapter contracts, not completed durable adapters. Signature verification, trusted role/membership resolution, transactional stores, signed checkpoint key custody, and actual protected-operation integration remain injected dependencies that must be independently implemented and verified.

The initial eleven policy-decision cases were previously exercised in an isolated local Node harness. The newly authored canonicalization, authorization, approval, audit, and idempotency test suites have not been run in a repository checkout or hosted CI. The aggregate `npm test` remains NOT RUN for this branch.

### 3.5 Idempotency and replay defense

Every mutating request must carry or receive a server-issued idempotency key scoped to principal, tenant, operation, and resource. Store the request digest and terminal outcome durably. Reuse with a different payload is rejected; exact replay returns the prior outcome and does not repeat the side effect. Approval nonce consumption and action idempotency are separate controls.

## 4. Mandatory execution lifecycle

1. Receive request and assign server-generated request/correlation IDs.
2. Authenticate principal and validate token/session state.
3. Resolve tenant, product/domain, resource, and delegation context from trusted server-side records.
4. Evaluate policy; deny on `DENY` or `INDETERMINATE`.
5. Evaluate risk and approval requirements.
6. If required, persist approval request and obtain independent human approval.
7. Bind approval to exact canonical operation and payload digest.
8. Revalidate identity, permissions, policy version, approval status, expiry, and idempotency immediately before execution.
9. Durably record execution intent and audit envelope.
10. Execute through the server-side action adapter only.
11. Verify resulting state independently.
12. Append outcome event, reconcile intent/outcome, and preserve evidence.
13. Return a response that does not disclose sensitive policy internals.

Any failure before step 10 blocks execution. Any uncertain result after step 10 enters reconciliation; do not blindly retry a non-idempotent side effect.

## 5. Domain enforcement map

Each domain owns its own policy namespace, resource registry, data boundary, and authorized operators while using the shared SAAAE control plane.

| Domain | Example protected actions | Additional control boundary |
|---|---|---|
| LINGOlegacy | identity, accounts, sessions, wallet, profile | account ownership, ledger invariants, recovery |
| LINGOworld | AI agents, tools, integrations, service orchestration | capability is not authorization; delegation and tool allowlists |
| LINGOlane | commerce, apparel, promotions, laundry operations | catalog/order separation, publishing and financial approvals |
| LINGOslots | game administration, configuration, rewards | economy policy, virtual-credit integrity, dual control |
| LINGOarcade | game operations, content, progression | server-authoritative progression and anti-replay |
| LINGOlibrary | publishing, manuscripts, intellectual property | rights/provenance, contributor and publication approvals |
| LINGOmedia | media production, licensing, distribution | asset rights, release and distribution approvals |
| LINGOtravel | reservations and travel operations | customer-data scope, payment-provider boundary |
| Workforce | HR, payroll, employee records | strict personnel-data segregation, payroll dual control |
| Properties | residential, hotel, hospitality operations | tenant/property boundary, safety and jurisdiction rules |
| Infrastructure | roads, lighting, water, drainage, sewer operations | critical-infrastructure separation, operator qualification, change windows, emergency controls |

Physical infrastructure operations require a separate safety case, jurisdictional authority, operational technology (OT) boundary, and human control model. SAAAE is necessary but is not a substitute for engineering safety interlocks or regulatory compliance.

## 6. Security acceptance matrix

All tests must run against the actual server-side enforcement path with isolated fixtures and inspectable evidence. Unit tests alone do not certify deployed enforcement.

| ID | Test | Expected result |
|---|---|---|
| AUTH-01 | Missing, malformed, expired, wrong-issuer, or wrong-audience identity | Reject; record security event |
| AUTH-02 | Valid identity with no action permission | Deny at server boundary |
| AUTH-03 | Client changes role, UID, tenant, or resource owner fields | Ignore/reject; no privilege change |
| AUTH-04 | Cross-tenant read or write | Deny; no data disclosure |
| AUTH-05 | Revoked membership or stale policy version | Deny on next protected request |
| AUTH-06 | Policy service unavailable or indeterminate | Fail closed |
| APR-01 | Approval missing, pending, rejected, expired, or revoked | No execution |
| APR-02 | Payload, resource, operation, tenant, domain, or environment changed | Approval mismatch; no execution |
| APR-03 | Requester attempts self-approval where dual control applies | Reject |
| APR-04 | Agent/service attempts to approve its own high-impact action | Reject |
| APR-05 | Duplicate approval nonce or consumed approval | Reject replay |
| APR-06 | Approver loses authority before execution | Revalidate and reject |
| AUD-01 | Audit store unavailable before protected mutation | Block mutation |
| AUD-02 | Audit writer attempts update/delete of prior event | Deny and alert |
| AUD-03 | Event digest/chain altered or sequence gap introduced | Independent verifier detects tampering |
| AUD-04 | Secret or unnecessary sensitive payload in event | Redaction/minimization assertion fails test |
| IDEM-01 | Same idempotency key and same payload replayed | Return prior result; no duplicate side effect |
| IDEM-02 | Same idempotency key with different payload | Reject conflict |
| TRACE-01 | Completed protected operation | Correlate principal, decision, approval, intent, execution, outcome, and audit evidence |
| TRACE-02 | Denied or failed protected operation | Correlated denial/failure event retained |

Acceptance requires all applicable tests to pass, test provenance to be independently retrievable, and no critical/high security issue to remain open unless formally risk-accepted by the authorized owner. A test report or source document is not runtime certification.

## 7. Implementation sequence

### Phase 0 — Preserve and map
- Inventory existing Firebase identity verification, recovery approval verifier, LINGOassister contracts, product-specific server handlers, Firestore rules, Worker routes, and audit/event stores.
- Identify the authoritative backend for each operation before choosing a persistence adapter.
- Reconcile existing schemas and policies; do not create duplicate identity, approval, or audit systems.
- Record each control as existing-and-tested, existing-but-unverified, partial, missing, or blocked.

### Phase 1 — Shared contracts and pure policy logic
- Define versioned principal, resource, policy decision, approval, audit event, and idempotency schemas.
- Implement deterministic policy evaluation with default-deny behavior and explicit policy versioning.
- Add canonical payload hashing and approval binding.
- Add test fixtures for separation of duties, tenant isolation, expiry, revocation, tampering, and replay.

### Phase 2 — Durable adapters
- Select storage only after confirming the authoritative project/account, tenancy model, transactional guarantees, backup/restore, and zero-cost/resource constraints.
- Implement least-privilege approval persistence, nonce/idempotency uniqueness, append-only audit writer, and outbox/reconciliation.
- Verify retention, access separation, integrity verification, and restore behavior.

### Phase 3 — One low-risk staging vertical
- Integrate one isolated non-production server operation end to end.
- Keep all client surfaces read-only with respect to protected state.
- Prove allow, deny, indeterminate, approval, revocation, audit-outage, replay, and reconciliation behavior.
- Obtain independent security review before expanding to additional domains.

### Phase 4 — Domain-by-domain rollout
- Integrate each domain separately with its own resource model and policy set.
- Apply stronger dual-control and step-up requirements to money, payroll, publication, account recovery, and infrastructure changes.
- Do not infer readiness in one domain from another domain's test results.

### Phase 5 — Certification and release
- Produce source, test, integration, hosted execution, audit integrity, backup/restore, and independent review evidence.
- Keep merge, deployment, activation, certification, and production promotion as separate gates.
- Production remains held until the existing G02 and subsequent release requirements independently pass and a separate, task-specific human promotion authorization is recorded.

## 8. Governance and change boundaries

- GitHub remains the source of truth.
- Work on an isolated review branch; do not commit routine changes directly to `main`.
- Preserve the last-known-good state and all existing recovery evidence.
- Do not weaken existing workflow, runner, branch-protection, Firebase, Cloudflare, or production controls to make tests pass.
- Do not create credentials, provision paid resources, alter live data, or change production infrastructure as part of this architecture proposal.
- Agents may inspect, implement scoped code, run safe tests, and prepare review evidence; they may not self-certify, approve their own high-impact action, merge, or promote.
- Report every check as PASS, FAIL, BLOCKED, or NOT RUN with exact evidence and commit correlation.

## 9. Definition of done

SAAAE is not complete until every protected server operation is covered by a tested enforcement point; policy decisions fail closed; required approvals are durable and bound to the exact action; distributed replay is prevented; audit intent and outcome are tamper-evident and independently verifiable; and each product domain passes its own integration and acceptance gates.

**Current status:** Architecture baseline and initial pure policy evaluator are present on the review branch. The evaluator has not yet been integrated with trusted identity/resource adapters or live protected operations. Durable approvals, append-only audit persistence, cross-domain enforcement, repository/hosted test execution, and independent certification remain unverified.
