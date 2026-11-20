# LINGO Enterprise Unified Program — Design Baseline

**Date:** 2026-11-15  
**Status:** PROPOSED — awaiting owner approval  
**Canonical repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Program parent:** #597  
**Selected approach:** Option A — one unified master program  
**Target branch for this design:** `implementation/lingo-core-v2-foundation` (draft PR #596; no merge or release)

## 1. Intent

Unify LINGO's engineering, business operations, customer lifecycle, portfolio products, virtual wallet, and release governance into one dependency-aware program. The purpose is to make every initiative traceable to one master roadmap, while preserving each product's bounded ownership and its own acceptance criteria.

This is a coordination and architecture design. It does not declare existing systems connected, authorize production changes, or replace the existing last-known-good services.

## 2. Goals

- Make #597 the single governing program for waves, phases, sprints, dependencies, risks, and acceptance.
- Preserve #575 as the authoritative P0 CI/recovery tracker.
- Preserve #598–#601 as focused delivery workstreams.
- Attach #600 Control Plane, #607/#608 Enterprise Operations Center, HubSpot CRM, LINGO ID, LINGO Bank/Universal Legacy Wallet, Cloudflare, AppDeploy, web/mobile, and the portfolio realms to the same program.
- Establish a consistent status model: NOT_STARTED → DESIGNED → BUILT → TESTED → CONNECTED → CERTIFIED → PRODUCTION.
- Make sprint work small, testable, owned, and evidence-backed.
- Keep Phase 1 wallet balances internal and non-cash, while designing explicit future expansion gates.

## 3. Non-goals and anti-goals

- No immediate real-money deposits, withdrawals, cash-out, P2P transfers, payment activation, or claim that LINGO is a bank.
- No production DNS/Worker route changes, Firebase publication, production identity/data mutation, deployment, merge of draft PRs, G02 activation, or replacement of last-known-good.
- No paid cloud resources or recurring commitments without separate account, region, and cost approval.
- No fake HubSpot contacts, deals, transactions, balances, or onboarding completion.
- No direct browser-to-database access or secrets in client applications.
- No duplicate master roadmaps, competing customer ledgers, or uncontrolled sync loops between CRM and financial records.

## 4. Approaches considered

### A. Unified master program (selected)
Keep #597 as the governing roadmap and use existing focused issues (#575, #598, #599, #600, #601, #607) as delivery lanes. Add CRM and wallet tasks under the appropriate existing lanes, creating child issues only where a durable independent owner/acceptance boundary is needed.

**Trade-off:** Strong dependency visibility and less duplicated planning; requires disciplined issue linking and a consistent status/evidence vocabulary.

### B. Separate business programs
Create independent master programs for CRM, wallet, web/mobile, and each product, then synchronize milestones.

**Trade-off:** More autonomy, but more cross-program overhead and duplicated status tracking.

### C. One giant execution issue
Put every task into #597 without focused workstream issues.

**Trade-off:** Simple entry point, but too large to manage, review, or assign; obscures bounded ownership.

**Decision:** Option A, approved by the owner in conversation on 2026-11-15.

## 5. Existing system facts and constraints

- GitHub is the source of truth. #597 already defines eight waves and two-week sprint groupings.
- #575 remains authoritative for hosted Actions startup recovery. Recent attempts failed before job creation; zero executed steps and artifacts means tests are UNEXECUTED, not failed or passed. Do not activate G02.
- PR #594 and #596 remain draft. CORE V2 has source changes but no verified hosted test execution.
- #598 owns OIDC/API/PostgreSQL/event certification; #599 owns shared API contracts, web and Flutter; #600 owns Control Plane and portfolio onboarding; #601 owns migration, security/SRE and release readiness.
- #607 defines Enterprise Operations Center scope; PR #608 is a draft implementation lane. Do not overwrite or merge it.
- HubSpot account 247931514 has six approved LINGO contact properties already created: lead source, territory, service package, follow-up status, acquisition date, and customer consent status. Existing Sales Pipeline must remain unchanged. Portal onboarding is still incomplete; remaining tasks include owner-side account settings and choices.
- Cloudflare account contains D1 database `lingo-loyalty-staging` with `loyalty_wallets`, `loyalty_ledger`, `coupon_redemptions`, and `loyalty_rate_limits`. The inspected tables are empty. This is staging, not a live customer ledger.
- The inspected staging D1 database is not bound to the inspected Workers. The Control Center Worker has no bindings; the flagship Worker inspected has only assets and public-site configuration bindings. No live wallet API connection is established.
- AppDeploy contains Studio Hub, Enterprise Control Center, Loyalty staging preview, and Master Project Plan applications. Deployed labels alone do not prove live backend integrations.
- The current CORE V2 design favors Go, PostgreSQL, OIDC, versioned contracts, and transactional outbox. Provider responsibilities and any D1-to-PostgreSQL migration must be recorded in an ADR before a live cutover.

## 6. Proposed unified architecture

### Governance and source of truth
- GitHub #597 governs program scope, waves, milestones, sprint outcomes, risks, and release state.
- Existing focused issues remain authoritative for their workstream execution.
- #600 is the service/product registry and read-only Control Plane workstream.
- #607/#608 define operating responsibilities, approvals, evidence, and lifecycle; they do not bypass GitHub release controls.
- Each work item records owner, scope, dependency, environment, status, acceptance tests, evidence links, and rollback/exit criteria.

### Identity and API
- LINGO ID is the customer identity boundary.
- CORE V2 Go API validates configured OIDC ID tokens and owns server-side authorization. Current source explicitly distinguishes ID tokens from OAuth access tokens.
- Product clients (Next.js, Flutter, games, and service surfaces) use shared versioned contracts and SDKs.
- HubSpot contact records are mapped to a LINGO identity by a stable external identity reference; email alone is not a durable identity key.
- Never expose provider secrets or database credentials to clients.

### CRM
- HubSpot is the CRM and customer-workflow system, not a wallet or accounting ledger.
- Existing six LINGO contact properties and the existing sales pipeline are preserved.
- Sync only approved minimum fields: LINGO identity reference, consent status, lead source, territory, service package, follow-up status, acquisition date, and explicitly approved loyalty summary.
- Use idempotent, auditable, server-side sync with retry and reconciliation. Define field ownership and conflict policy before enabling writes.
- Do not auto-create fake contacts/deals, send email, invite users, connect inboxes, or activate paid/credit-consuming features without explicit owner action/approval.

### LINGO Bank / Universal Legacy Wallet — Phase 1
- Product name may be LINGO Bank, but user-facing disclosures must make clear it is an internal virtual wallet and not a licensed deposit-taking bank or cash account.
- Phase 1 balances are internal, non-cash, non-transferable, and non-redeemable: LINGOcoins, game credits, promotional credits, and reward credits.
- Use immutable, append-only ledger events; idempotency keys; non-negative balance constraints where applicable; audit history; rate limits; authorization; and reconciliation.
- Separate issuance, promotional grants, game spending, reversals/adjustments, expiry, and administrative corrections as distinct event types.
- HubSpot receives customer/loyalty summaries only; the ledger remains authoritative for balances and transactions.
- The existing D1 staging schema is an inventory and design input. Before production-grade implementation, decide through an ADR whether the canonical transactional ledger belongs in CORE V2 PostgreSQL or remains on D1. Avoid dual-write and dual-authority. Proposed default: PostgreSQL as canonical ledger for transactional accounting, with D1 treated as a staging prototype/migration source unless an evidence-backed ADR chooses otherwise.
- No real-money movement in Phase 1.

### Future financial expansion
A later, separately approved program may investigate deposits, withdrawals, P2P transfers, cash-out, payment rails, and regulated banking/financial partners. It requires jurisdiction-specific legal review, licensing/partner analysis, KYC/AML/sanctions controls, fraud/risk systems, safeguarding/reconciliation, dispute handling, security certification, and a distinct launch authorization. These capabilities are not included in Phase 1.

### Infrastructure and operations
- Cloudflare is the intended edge; no route or Worker mutation is part of this design.
- D1 and PostgreSQL have distinct, explicitly recorded roles; no database is treated as connected until a verified binding/API exchange exists.
- AppDeploy hosts UI/project artifacts; each application must declare its API, identity, data, environment, and health dependencies.
- Observability, evidence, audit, recovery, cost and deployment metadata flow into the read-only Control Plane first. Privileged actions remain separately authorized.

## 7. Unified wave and sprint map

Use two-week sprint timeboxes as planning defaults, not fixed calendar commitments. Parallel lanes may work simultaneously when their dependencies are satisfied.

| Wave | Sprint group | Integrated work |
|---|---|---|
| 0 — Stabilize | 0A–0B | #575 Actions policy/hosted runner diagnosis; restore ordinary hosted job creation; run harmless smoke; preserve G02 hold; correlate run/job/steps/logs/artifacts/commit. |
| 1 — Architecture | 1A–1B | Service/product inventory; ownership and trust boundaries; ADRs for identity, data, CRM sync, wallet ledger, Cloudflare/AppDeploy responsibilities, contracts, cost and environment topology. |
| 2 — Core platform | 2A–2C | OIDC/JWKS tests; profile isolation; PostgreSQL migrations/TLS/least privilege; outbox publisher/consumer, idempotency, retries, DLQ/replay; wallet domain model and ledger invariants as an isolated vertical slice. |
| 3 — Connectivity | 3A–3C | OpenAPI/event contracts; TypeScript/Dart SDKs; Next.js and Flutter clients; wallet read APIs; secure token handling; browser/device E2E in isolated environments. |
| 4 — Control Plane | 4A–4C | Read-only service/app/database/CRM inventory; freshness-aware health; evidence and audit records; approval metadata; no write authority by default. |
| 5 — Portfolio and business systems | 5A–5D | LINGOlegacy identity/account/wallet shell; HubSpot contact mapping and consent sync; LINGOlane/LINGOlibrary/LINGOmedia; LINGOslots/LINGOarcade non-cash credit integration; LINGOworld/LegacyXclub; app-by-app contract tests. |
| 6 — Migration | 6A–6C | Inventory existing CRM/app/ledger records; classify retain/wrap/migrate/replace/retire; synthetic rehearsal; reconcile counts/checksums; rollback and no dual-write. |
| 7 — Security and operations | 7A–7C | Threat model, privacy, authZ, secret scanning, rate limits, audit, backup/restore, resilience, SLOs, cost and independent review. |
| 8 — Release readiness | 8A–8B | Freeze candidate, verify artifacts/SBOM/provenance, privacy/legal/owner acceptance, release rehearsal, separately authorized bounded release; otherwise HOLD. |

## 8. Workstream ownership map

| Workstream | Governing tracker | Primary deliverable |
|---|---|---|
| CI and recovery | #575 | Hosted execution evidence and recovery |
| Master execution | #597 | Unified dependency-aware roadmap |
| API, identity, data, events | #598 | Certified isolated core vertical slice |
| Web, mobile, SDKs | #599 | Shared-contract clients |
| Control Plane and portfolio | #600 | Read-only registry and product integration |
| Migration, security, SRE, release | #601 | Rehearsal and certification |
| Enterprise operations | #607 / PR #608 | Responsibility centers, approvals, evidence and lifecycle |
| HubSpot CRM | #597 → Wave 5, dependent on #598/#599 | Safe customer identity mapping and approved CRM sync |
| Wallet / LINGO Bank | #597 → Waves 2, 5, 6, 7 | Internal virtual-credit ledger and product APIs |
| AppDeploy / Cloudflare | #597 → Waves 4–6 | Verified inventory, bindings, API integration and deployment evidence |

## 9. Cross-workstream dependency rules

1. Hosted CI startup recovery (#575) is the P0 verification dependency for claiming test results.
2. Architecture decisions (#594) and implementation (#596) must be reviewed before treating CORE V2 contracts as stable.
3. Identity/API/data/event certification (#598) precedes authenticated CRM and wallet write integration.
4. Shared contracts and client auth (#599) precede web/mobile product connectivity.
5. Service registry and identity contracts precede operational Control Plane integration (#600).
6. CRM and wallet sync must be idempotent, source-owned, least-privilege, and auditable; no circular writes.
7. Wallet ledger must have one canonical authority; CRM and game clients are projections/consumers, not competing balance stores.
8. Migration rehearsals and security/SRE certification (#601) precede any production cutover.
9. Enterprise Operations Center (#607/#608) may display evidence and approval state, but cannot grant itself release authority.
10. Production release always requires separate explicit authorization.

## 10. Acceptance and status rules

Each work item must provide:
- owner and accountable approver;
- input/output contracts and upstream/downstream dependencies;
- target environment and data classification;
- test cases and observed output;
- source commit, workflow run, job, logs and immutable artifact references where applicable;
- security/privacy review where sensitive data or authorization is involved;
- rollback, retry, reconciliation and failure behavior;
- independent acceptance for critical controls.

Status is evidence-based:
- NOT_STARTED: no approved design or implementation.
- DESIGNED: approved design/ADR exists.
- BUILT: source or prototype exists.
- TESTED: tests actually ran and passed in a recorded environment.
- CONNECTED: real non-production systems exchanged verified data.
- CERTIFIED: security, privacy, resilience, operations and owner acceptance evidence passed.
- PRODUCTION: separate release authorization and post-deployment verification.

Unknown, stale, missing, queued, or zero-job evidence is not PASS.

## 11. Builder decisions / defaults

- Sprint length: two weeks; adjust to actual capacity and CI recovery.
- Program status remains ACTIVE / NON-PRODUCTION / PROTECTED HOLD.
- Start with read-only inventory and contract-first work while CI is repaired.
- Keep HubSpot CRM as CRM and the wallet ledger as the balance authority.
- Proposed canonical wallet ledger default is PostgreSQL; this remains an ADR to approve before implementation.
- Existing D1 remains staging-only until its schema, binding, concurrency, durability, and operational suitability are proven.
- No new provider or paid service is selected without a cost/security review.

## 12. Approval requested

Approve this design baseline for the unified LINGO Enterprise Program. Approval will authorize preparation of the detailed implementation plan and non-production planning artifacts only. It will not authorize production changes, merges, deployments, paid provisioning, G02 activation, or real-money services.
