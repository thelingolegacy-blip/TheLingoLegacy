# LINGO Enterprise Unified Master Program — Implementation Plan

**Date:** 2026-11-15  
**Program parent:** GitHub Issue #597  
**Program approach:** Option A — one unified master program  
**Canonical repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Working branch:** `implementation/lingo-core-v2-foundation`  
**Document status:** IMPLEMENTATION PLAN — NON-PRODUCTION  
**Release state:** PROTECTED HOLD

## 1. Executive mandate

Execute one dependency-aware LINGO Master Program across all eight waves, the existing engineering/recovery trackers, the 22-center Enterprise Operations framework, HubSpot CRM, LINGO ID, CORE V2 APIs, the internal virtual-credit wallet, Cloudflare, AppDeploy, web/mobile clients, and all eight portfolio divisions.

This plan unifies governance and execution. It does not imply that external services are connected, that migrations have occurred, or that a product is certified. Every service retains bounded ownership, explicit dependencies, its own tests, and evidence-backed acceptance.

## 2. Program invariants and decision rights

1. GitHub is the authoritative program and source-control record.
2. Issue #597 governs scope, dependencies, milestones, status, risks, and acceptance. Existing workstream issues remain the execution records: #575, #598, #599, #600, #601, and #607.
3. Production remains PROTECTED HOLD. No merge of draft PRs #594/#596/#608, production deployment, DNS/Worker/Firebase mutation, production identity/customer-data mutation, payment activation, or last-known-good replacement is authorized by this plan.
4. G02 remains protected and inactive. Restore ordinary hosted `ubuntu-latest` job creation; never use G02 as a workaround.
5. No paid resource, recurring commitment, cloud provisioning, or account/region change without separate explicit cost, account, region, security, and owner approval.
6. Use synthetic or sanitized data in isolated environments. No real-money movement; Phase 1 virtual credits remain internal, non-cash, non-transferable, and non-redeemable.
7. A file, mock, prototype, deployment label, configured binding, or green-looking dashboard is not proof of a working connection.
8. Status vocabulary is monotonic and evidence-based: NOT_STARTED → DESIGNED → BUILT → TESTED → CONNECTED → CERTIFIED → PRODUCTION. A later status requires all prior gates and linked evidence.
9. Every change has an accountable owner, reviewer/approver, source commit, environment, tests, security/privacy implications, rollback path, and cost impact.
10. Independent verification and release authorization are separate from implementation.

## 3. Program governance and workstream map

| Workstream | Governing issue | Scope and deliverable | Current boundary |
|---|---:|---|---|
| Program governance | #597 | Master roadmap, dependencies, decisions, milestones, risk and acceptance register | Active; this plan is subordinate to #597 |
| CI and cross-stack recovery | #575 | Hosted Actions startup recovery; Firebase publication boundary; Flutter/Android reproducibility; Oasis backend; Vercel retirement | P0 CI; other lanes remain open |
| Core identity/API/data/events | #598 | OIDC, Go API, PostgreSQL, migrations, outbox publisher/consumer, authorization | Source built; hosted verification blocked |
| Web/mobile/contracts | #599 | OpenAPI, TypeScript/Dart SDKs, Next.js and Flutter clients, browser/device tests | Contract foundation only |
| Control Plane/portfolio | #600 | Read-only registry, health/evidence views, eight portfolio division onboarding | Registry contract built; runtime not connected |
| Migration/security/SRE/release | #601 | Inventory, rehearsal, reconciliation, rollback, security, DR, cost and launch evidence | Not certified; production hold |
| Enterprise Operations Center | #607 and PR #608 | 22 centers, lifecycle, approvals, evidence, training, operations integration | Design/static prototype; no live integration |
| CRM | #597 → Wave 5; depends on #598/#599 | HubSpot identity mapping, consent and approved workflow sync | Portal onboarding incomplete; no sync assumed |
| Wallet / LINGO Bank | #597 → Waves 1, 2, 5, 6, 7 | One canonical virtual-credit ledger and product APIs | Architecture decision required; no live ledger |
| Edge / application delivery | #597 → Waves 0, 3–6 | Cloudflare, AppDeploy, web/mobile integration inventory and bounded connectivity | Existing deployed labels do not prove integration |

### Decision rights

- **Program owner:** approves scope, priority, exceptions, and acceptance of business outcomes.
- **Architecture reviewer:** approves ADRs and cross-domain contracts; cannot authorize production release by architecture approval alone.
- **Workstream owner:** delivers bounded implementation and evidence.
- **Independent verifier:** reproduces tests, checks evidence provenance, and reports PASS/FAIL/UNKNOWN.
- **Security/privacy reviewer:** reviews trust boundaries, identity, sensitive data, retention, and threat findings.
- **Release approver:** separately authorizes a specific artifact, environment, change window, and rollback plan.
- **Operations Center:** may surface evidence and approvals; it cannot grant itself authority or bypass GitHub controls.

## 4. Parallel execution model

Run all independent lanes concurrently. Shared files and high-risk resources must have one designated writer at a time. Cross-lane integration starts only when the dependency contract is stable. Each lane reports status and blockers to #597; do not create competing master roadmaps.

| Lane | Parallel work now | Dependency before integration/acceptance | Owner record |
|---|---|---|---|
| A. CI recovery | Read-only diagnostics, hosted runner/org policy evidence, workflow minimization, support escalation package | Hosted job instantiates and completes; harmless smoke has run | #575 |
| B. Architecture/ADR | Context maps, provider responsibility matrix, identity/CRM/wallet/data/event ADRs, cost envelopes | Reviewed and recorded ADRs | #594 / #597 |
| C. Core API | Handler hardening, token/JWKS test harness, migration and rollback tests, DB role/TLS contract | Hosted CI and disposable PostgreSQL integration evidence | #598 |
| D. Event delivery | Outbox schema, publisher lease/claim model, consumer idempotency, retry/DLQ/replay harness | API/DB transaction contract stable | #598 |
| E. Web/SDK | TypeScript client, contract compatibility tests, Next.js shell and browser test design | Stable OpenAPI + verified identity/API | #599 |
| F. Mobile | Dart client, secure token-storage design, offline retry, pinned toolchains and device test plan | Stable OpenAPI + verified identity/API; CI for test claims | #599 / #575 |
| G. Control Plane | Registry schema validation, inventory adapters, freshness/unknown states, read-only UI prototype | Stable registry and evidence contracts | #600 / #607 |
| H. CRM | HubSpot property/consent mapping, field ownership, idempotency and conflict design; portal gap list | Stable LINGO identity mapping, privacy approval, owner-side portal setup | #597 |
| I. Wallet | Ledger domain model, event taxonomy, invariant/property tests, threat model, PostgreSQL/D1 ADR comparison | Approved ADR and isolated DB tests; no live balance writes | #597 / #598 |
| J. Portfolio | Repository/service inventory, product owner/contract/data classification, per-product onboarding checklist | Shared identity/API and registry contract | #600 |
| K. Enterprise operations | Map all 22 centers to accountable roles, record types, evidence and lifecycle; preserve #570/#608 work | Authenticated read-only connectors and durable evidence design | #607 |
| L. Migration | Read-only inventory, retain/wrap/migrate/replace/retire classification, synthetic rehearsal design | Certified target and signed source-target mapping | #601 |
| M. Security/SRE | Threat review, secret/dependency scan design, SLO/RTO/RPO, backup/restore plan, cost inventory | Implemented slices and executable CI evidence | #601 |
| N. Release governance | Candidate checklist, provenance/SBOM requirements, change template, rollback checklist | All wave exit gates and separate release approval | #601 / #597 |

Parallel means concurrent preparation and implementation where safe—not bypassing dependencies or claiming unverified integration.

## 5. Eight-wave execution plan and exit gates

### Wave 0 — Stabilize execution and protect the baseline (P0)
**Sprint 0A — Diagnose:** inspect repository/org Actions policy, hosted runner availability, billing/quota, concurrency, workflow triggers, required checks, and external restrictions. Capture run IDs, commit SHAs, job counts, step counts, logs, artifacts, and exact startup failure.
**Sprint 0B — Restore:** apply only an approved, minimal Actions configuration repair; run a harmless hosted `ubuntu-latest` smoke test; then run the CORE V2 workflow on its implementation branch.
**Acceptance:** at least one hosted job is created and completed; logs and artifact are attributable to run/job/commit; required workflow steps actually execute. G02 remains inactive. Firebase, Flutter, Oasis, and Vercel tasks remain separately tracked and cannot be marked complete by CI recovery alone.

### Wave 1 — Architecture and engineering standards
**Sprint 1A:** bounded-context map; system/repository/service inventory; ownership, trust boundaries, data classification, environment matrix.
**Sprint 1B:** ADRs for provider responsibilities, identity, CRM sync, canonical wallet ledger, database roles, event transport, edge/app delivery, observability, cost and reversibility.
**Acceptance:** all critical services have an owner and source of truth; no competing customer identity or balance authority; ADRs include alternatives, consequences, security, cost, migration and rollback.

### Wave 2 — Core platform vertical slices
**Sprint 2A:** Go API input/authorization boundaries, fuzz/property tests, correlation IDs, error envelope and OpenAPI compatibility.
**Sprint 2B:** OIDC issuer/audience/signature/expiry/algorithm/key-rotation tests; PostgreSQL migration, constraints, TLS verify-full, least-privilege role, pool/timeouts, backup and restore rehearsal.
**Sprint 2C:** outbox publisher with safe claim/lease semantics; idempotent consumer; bounded exponential retry; dead-letter and controlled replay; duplicate, ordering and crash tests.
**Acceptance:** hosted CI runs and passes; isolated end-to-end identity → API → PostgreSQL transaction/outbox → consumer flow is traceable; rollback and duplicate/replay semantics are demonstrated. Persisting an outbox row alone is not operational event delivery.

### Wave 3 — Universal connectivity
**Sprint 3A:** versioned OpenAPI/event contracts, TypeScript and Dart SDKs, compatibility checks, auth, timeouts, retries, idempotency and tracing.
**Sprint 3B:** Next.js authenticated profile shell and browser E2E using synthetic accounts.
**Sprint 3C:** Flutter iOS/Android clients, secure token storage, offline-safe behavior, pinned toolchains and reproducible device/build tests.
**Acceptance:** web and mobile consume the same versioned contract; isolated browser/device tests execute with attributable evidence; no production credentials or data.

### Wave 4 — Master Control Plane
**Sprint 4A:** read-only service/product/repository/environment registry with owner, contract, dependency, data classification, environment and lifecycle.
**Sprint 4B:** health, deployment, CI evidence, incident, audit and cost views with source IDs, timestamps, freshness, pagination and partial-failure states.
**Sprint 4C:** approval metadata, exception expiry, rollback records and audit design; mutation paths remain disabled until independently reviewed.
**Acceptance:** accurate, freshness-aware read-only state; UNKNOWN is never displayed as PASS; no privileged action or single point of failure is introduced.

### Wave 5 — Portfolio and business systems
**Sprint 5A:** LINGOlegacy flagship identity/account/community shell and approved identity mapping.
**Sprint 5B:** LINGOlane, LINGOlibrary and LINGOmedia bounded contract-first integrations.
**Sprint 5C:** LINGOslots and LINGOarcade game/session/progression integration; virtual credits remain non-cash, non-transferable and non-redeemable.
**Sprint 5D:** LINGOworld and LegacyXclub bounded integrations.
**CRM sub-lane:** preserve HubSpot's existing Sales Pipeline and approved properties; define stable external LINGO identity reference, consent source of truth, field ownership, minimum data, idempotent sync, retry/reconciliation and opt-out handling. No fake contacts/deals, outreach, inbox connection, or paid feature activation.
**Acceptance:** each of eight divisions has an owner, registry entry, contract, dependency list, data owner, auth policy, health check, tests, cost owner, rollback and explicit status. HubSpot sync is not enabled until identity, consent, privacy and portal prerequisites pass.

### Wave 6 — Migration and coexistence
**Sprint 6A:** inventory repositories, routes, databases, CRM, app deployments, integrations, assets, identities and last-known-good baselines.
**Sprint 6B:** classify retain/wrap/migrate/replace/retire/investigate; create synthetic/sanitized source-target fixtures and repeatable tooling.
**Sprint 6C:** rehearse bounded migration, counts/checksums/referential integrity/permissions/parity, rollback, and no-dual-write behavior.
**Acceptance:** signed reconciliation and rollback evidence for each bounded slice. No production cutover follows automatically.

### Wave 7 — Security, reliability and operational certification
**Sprint 7A:** independent threat review; SAST/SCA/secret/SBOM/IaC scans; least privilege, TLS, key rotation, privacy/retention and audit review.
**Sprint 7B:** load/capacity, failure injection, SLO/SLI, error budget, backup/restore, DR and incident response exercises; define and demonstrate RTO/RPO.
**Sprint 7C:** provider cost forecasts, budget alerts, TTL/teardown, operational ownership, support and training evidence.
**Acceptance:** critical findings closed or formally risk-accepted by authorized owner; reproducible security, resilience, restore, SLO and cost evidence; independent certification recorded.

### Wave 8 — Launch readiness and controlled release
**Sprint 8A:** freeze candidate; verify source, dependency locks, tests, artifacts, SBOM, provenance, approvals, runbooks, privacy/legal/product acceptance and rollback rehearsal.
**Sprint 8B:** conduct go/no-go for one explicitly named environment and bounded change. Production remains HOLD unless a separate written release authorization identifies artifact, environment, window, operator, approver, monitoring and rollback.
**Acceptance:** signed release acceptance, deployment evidence, post-deploy health and rollback proof. If any required evidence is missing, decision is NO-GO/HOLD.

## 6. PostgreSQL wallet-ledger decision gate

**Direction:** PostgreSQL is the preferred future canonical transactional ledger, subject to an ADR and acceptance. The existing Cloudflare D1 database remains a staging prototype and migration input until that decision is approved. Neither database is declared live or authoritative for customer balances today.

The ADR must compare PostgreSQL and D1 on transactional semantics, isolation/concurrency, constraints, idempotency, auditability, backup/restore, portability, operational complexity, security, latency, cost, provider lock-in, and migration/rollback risk.

If PostgreSQL is selected, acceptance must include:
- One canonical ledger authority; no dual-write or dual-authority balance model.
- Append-only ledger entries with explicit event types for issuance, promotional grant, spend, reversal, expiry and administrative adjustment.
- Idempotency keys, uniqueness constraints, transaction boundaries, ordering/consistency rules and concurrency tests.
- Non-negative balance policy where applicable; immutable audit trail; authorization and rate limits.
- Reconciliation from ledger entries to derived balances; deterministic rebuild test.
- Least-privilege DB roles, TLS `verify-full`, secret management, backup/restore and retention proof.
- D1 inventory/export validation, source-target mapping, checksums, rehearsal, cutover and rollback plan before any migration.
- No live wallet writes, real-money features, transfers, redemption or cash-out under this approval.

## 7. Shared acceptance record

Every milestone/issue must carry:
- Workstream and accountable owner; reviewer and approver.
- Scope, inputs/outputs, environment, data classification and dependency IDs.
- Status and explicit reason; blocked-by and risk/decision links.
- Source branch, commit SHA, PR and changed paths.
- Workflow run ID, job ID, executed steps, logs, artifacts and test report.
- Contract/schema version and compatibility result.
- Security/privacy review and unresolved findings.
- Connection proof (request/response or trace IDs) for CONNECTED claims.
- Reconciliation, rollback, recovery and operational evidence where relevant.
- Cost estimate, account/region and approval reference where resources are involved.
- Independent verifier and acceptance timestamp.

Missing or inaccessible evidence is UNKNOWN/UNVERIFIED, never PASS.

## 8. Milestone sequence and program dashboard

| Milestone | Required result | Depends on | Exit status |
|---|---|---|---|
| M0 — Hosted execution restored | Hosted smoke and CORE V2 jobs instantiate/complete with artifacts | #575 | OPEN / P0 |
| M1 — Architecture baselined | ADRs and ownership/trust/data maps approved | M0 may run in parallel; review required | IN PROGRESS |
| M2 — Core slice certified in isolation | OIDC + PostgreSQL + API + outbox consumer tests pass | M0, M1 | BLOCKED |
| M3 — Shared clients verified | Web/Flutter use versioned API; E2E/build evidence | M2 | NOT STARTED |
| M4 — Read-only Control Plane verified | Registry and evidence views show freshness/unknown correctly | M1, M2 contracts | DESIGN/BUILT |
| M5 — Portfolio/CRM/wallet slices connected in non-production | Per-system contract and consent/security proof | M2, M3, M4 as applicable | NOT CONNECTED |
| M6 — Migration rehearsals pass | Reconciliation and rollback evidence per bounded slice | M2, M5 | NOT STARTED |
| M7 — Security/SRE/cost certified | Independent reviews and resilience/cost proof | M2–M6 | NOT CERTIFIED |
| M8 — Release candidate accepted | Complete evidence and separate go/no-go | M0–M7 | PROTECTED HOLD |

## 9. Immediate execution checklist

- [ ] #575: capture current Actions failure evidence and pursue hosted job-startup remediation; do not activate G02.
- [ ] #594: review provider-neutral architecture and record final ADRs; keep draft until review/CI gates pass.
- [ ] #596: close source-review findings, complete JWKS/outbox/DB hardening and obtain real hosted evidence; keep draft/unmerged.
- [ ] #598: implement OIDC/JWKS, PostgreSQL role/TLS and outbox lifecycle tests.
- [ ] #599: build typed SDK/client plans and contract checks; defer CONNECTED status.
- [ ] #600: validate registry and prepare read-only inventory adapters; no privileged actions.
- [ ] #601: build migration/security/SRE/release evidence plans; no production cutover.
- [ ] #607/#608: preserve existing operations work; sequence with #570; no overwrite or merge without review.
- [ ] HubSpot: document portal prerequisites, consent/field ownership and mapping; no live sync until approval.
- [ ] Wallet: produce ADR and ledger invariants; no live balance data or migration.
- [ ] Cloudflare/AppDeploy/Firebase: inventory only until separately approved bounded change and proof.
- [ ] Portfolio: register all eight divisions with owners, contracts, status and dependencies.
- [ ] #597: maintain the single milestone, dependency, risk and decision register; link evidence, not duplicate plans.

## 10. Current verified baseline

At plan creation, the repository records PR #594 and #596 as open drafts; #597 is open; #575 remains the P0 cross-stack recovery tracker; latest recorded CORE V2 hosted run evidence shows startup failure before job creation, with zero jobs/artifacts and no executed tests. #598 records source hardening but remains unverified; #599 is contract foundation only; #600 is registry contract built but operational Control Plane not connected; #601 is not certified; #607 is design/static prototype only.

This document is a plan committed to the implementation branch. It is not test evidence, service-connection evidence, migration authorization, or release acceptance.

**Operating principle: One LINGO Master Program. Parallel workstreams. Shared dependencies. Independent acceptance. Protected production.**
