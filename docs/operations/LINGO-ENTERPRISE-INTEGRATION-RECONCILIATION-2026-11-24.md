# LINGO Enterprise Integration Reconciliation
**Snapshot date:** 2026-11-24  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Source of truth:** `main`  
**Disposition:** PROTECTED HOLD / NOT READY — reconciliation work only

## 1. Purpose

Create one evidence-led integration sequence for the LINGO ecosystem. This document is a coordination baseline, not a declaration that the ecosystem is integrated, tested, accepted, or production-ready.

The governing acceptance chain is:

`SOURCE → EXECUTION → EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION`

A merged change, successful static check, queued workflow, green badge, mockup, or written plan does not independently prove operational readiness.

## 2. Read-only repository snapshot

The following facts were retrieved from GitHub on 2026-11-24:

- Default branch: `main`.
- Main HEAD observed: `3fe099eb11329cc333ffa5a1ea36affcd0375343`.
- Open pull requests: **257**, retrieved across three complete GitHub API pages (100 + 100 + 57).
- First page of branch inventory: 100 branch refs; every returned branch reported `protected: false`. This is a first-page sample, not a complete branch count.
- Main branch reports `protected: false` through the branch endpoint (legacy branch-protection flag).
- A separate repository ruleset read confirms ruleset **27403956 — “Lingo - protect main”** is `active`. Its returned rules are only `deletion`, `non_fast_forward`, and `copilot_code_review` (review on push enabled; draft PR review disabled). The returned ruleset does **not** include required pull-request approvals or required status checks. Its empty include/exclude ref filters were preserved as returned; do not infer narrower coverage from the ruleset name alone.
- Therefore a ruleset exists and is active, but the current evidence does not establish the complete merge-governance controls required for protected integration (independent approvals and required CI checks). The legacy branch endpoint and ruleset endpoint are distinct controls; do not summarize this as “no ruleset exists.”
- The repository's `AGENTS.md` requires small reviewable changes, no routine direct commits to main, and the acceptance chain above. It also states that agents cannot authorize their own acceptance or release.
- Repeated GitHub Actions `startup_failure` outcomes with zero jobs and zero artifacts are infrastructure/job-instantiation failures. They are not successful CI and do not prove that application tests ran.

Evidence entry points:
- Main branch: https://github.com/thelingolegacy-blip/TheLingoLegacy/tree/main
- Open pull requests: https://github.com/thelingolegacy-blip/TheLingoLegacy/pulls
- Repository agent instructions: https://github.com/thelingolegacy-blip/TheLingoLegacy/blob/main/AGENTS.md

## 3. Cloudflare live account snapshot (read-only, 2026-11-24)

A fresh Cloudflare API read returned the following account inventory:

- Account plan: Free Website; the account-level `enforce_twofactor` setting is `false`.
- Worker inventory: **11** scripts; the previous ten-script snapshot is superseded.
- D1 inventory: **5** databases, including `lingo-game-engine-staging-20261107` and `asklingo-v2-staging-20261122`.
- Access inventory: **15** applications.
- Zone Worker routes: **27**.
- Accepted account members: **1**; the returned member's `two_factor_authentication_enabled` value is `false`.
- The **LINGO SAAAE Staging Privileged Executor** Access application exists for `saaae-staging.thelingolegacy.com`, but its attached policy list is empty.
- The current route inventory contains no route for `saaae-staging.thelingolegacy.com`; the existing public apex, wildcard, and www routing remain unchanged.
- The D1 database's existence does not prove the SAAAE schema or runtime is installed. PR #659's read-only schema inspection reported no SAAAE runtime/provisioning evidence tables; no migration was applied.

**Operational consequence:** privileged staging execution remains blocked. A separate operator/reviewer identity is not currently available from the accepted account-member roster; account MFA is not enforced and the sole returned member has 2FA disabled. Do not attach an Access allow policy, create a route, deploy a Worker, or apply a migration to work around these prerequisites. The account owner must establish MFA and a distinct authorized reviewer/operator identity through the provider's normal account process before this boundary can be completed.

No Cloudflare account settings, members, Access policies, DNS records, Worker routes, Worker scripts, D1 schemas, or deployments were changed by this read.

## 4. High-priority integration relationships

### A. Canonical portfolio, enterprise register, and public directory

These proposals overlap but have distinct intended roles:

- **PR #511 — master registry and dependency graph:** proposes the broad product, route, plugin, campaign, identity, wallet, and dependency registries; includes ADR-002 for the identity/backend decision.
- **PR #602 — 14-node ecosystem inventory and dispatch contracts:** adds a 14-node inventory, schemas/validators, recovery dispatch contracts, and `/worlds/` changes. It is stacked on PR #548, not directly on main.
- **PR #638 — enterprise stack register and Studio module catalog:** proposes the shared enterprise architecture, 22 Studio modules, and readiness/evidence taxonomy. It explicitly says backend authority remains unselected until #511 ADR-002 and #515 are reconciled.
- **PR #640 — canonical public portfolio directory:** maps the public portfolio into eight canonical groups and separates shared platform capabilities from public brands; also changes `index.html` and `worlds/index.html`.
- **PR #548 — flagship website/live-readiness base:** is the declared base of #602 and also changes homepage, brand framework, navigation, and `worlds/index.html`.

**Required reconciliation:** establish one canonical registry model with explicit entity types (portfolio, brand, subproduct, shared platform capability, operations domain), stable IDs, ownership, dependencies, environment, and readiness evidence. Preserve the 14-node inventory as traceable source inventory while presenting the eight canonical public portfolio groups. Do not maintain competing registries or merge the overlapping homepage/directory changes as independent competing implementations.

### B. Backend, identity, and data authority

- **PR #515** proposes Supabase-primary backend architecture.
- **PR #511 ADR-002** is the named decision record for identity/backend authority.
- **PR #654** proposes Firebase Auth + Firestore and Flutter sign-in as a staged Firebase direction.
- The current architecture materials do not establish one fully accepted, operational backend authority.

**Required reconciliation:** produce an owner-reviewed architecture decision that names the canonical system of record for identity, authorization, transactional data, ledger, files, analytics, and product-specific databases. Explicitly document what remains separate and why. Until that decision and compatibility checks are accepted, do not activate competing production backends or migrate data.

### C. Staging security and privileged execution dependency chain

- **PR #655** changes the staging game-engine Firebase project binding and is based on `staging/server-authoritative-game-foundation-2026-11-07`.
- **PR #658** is explicitly based on #655's branch and proposes staging game-engine SAAAE runtime controls.
- **PR #659** is explicitly based on #658's branch and proposes the staging Cloudflare Access privileged-executor boundary.
- The PR descriptions report missing live staging resource verification, incomplete operator separation, and absent successful GitHub Actions execution evidence.

**Required order:** verify the staging project/resource identities and base configuration; validate #655; validate the #658 migrations/runtime and approval/audit semantics; then validate #659's operator identity and Access policy lifecycle. Keep all three staging-only. No migration, grant, DNS, Access allow policy, Worker deployment, or production mutation is implied by source code alone.

### D. CI startup recovery

- **PR #656** proposes a manual-only hosted-runner bootstrap on `ubuntu-latest`.
- It is intentionally isolated from G02 and does not certify product code, Firebase, Cloudflare, or the self-hosted runner.
- The connected GitHub integration does not expose the required `workflow_dispatch` action.

**Required order:** owner dispatches the documented workflow from its exact branch; independently inspect the resulting run, instantiated job, positive runner ID, runner name, completed steps, run/commit correlation, and `HOSTED_BOOTSTRAP_PASS`. Do not treat a startup failure with zero jobs as a test result. G02 remains independently blocked until its own acceptance contract is satisfied.

### E. Website and studio CI maintenance

- **PR #602** is stacked on #548 and both touch the public directory.
- **PR #640** independently touches the homepage and directory on main, so its changes must be compared against #548/#602 before selecting a single canonical implementation.
- **PR #638** changes `studio/index.html` and `worker.js` as well as adding its enterprise registry.
- **PR #660** only aligns two Studio workflows to Node 22; it does not resolve Actions job startup failure.

**Required order:** reconcile the desired homepage and directory output; compare all competing diffs; preserve Worker ownership and exact-root versus wildcard route boundaries; validate Studio registry integration; then run static, route, browser, accessibility, and security checks once Actions can instantiate jobs.

## 4. Integration sequence

| Order | Workstream | Entry criteria | Exit evidence |
|---|---|---|---|
| 0 | Preserve production and last-known-good | Current source and live topology captured | No unapproved production mutation; rollback/LKG identity retained |
| 1 | Repository governance and CI recovery | Branch inventory, main protection state, Actions settings/permissions understood | Enforced review/check policy; real jobs with steps/logs on exact commits |
| 2 | Canonical portfolio and dependency registry | #511, #602, #638, #640 and #548 diffs reconciled | One validated registry and one canonical public directory contract |
| 3 | Backend and identity decision | #511 ADR-002, #515, #654 and existing service inventory compared | Owner-approved system-of-record decision and environment map |
| 4 | SAAAE staging control plane | Staging resources and distinct operators verified | Default-deny authorization, scoped grants, persistent approvals, atomic/tamper-evident audit, revocation and staging integration tests |
| 5 | Shared platform interfaces | Identity, API/event, ledger, storage, telemetry, secrets and environment contracts accepted | Versioned interfaces and compatibility tests |
| 6 | Product/domain integrations | Shared interfaces available; each product's source and dependencies inventoried | Per-product functional, security, privacy, accessibility and data-isolation evidence |
| 7 | Web/mobile/game surfaces | Canonical portfolio and service contracts accepted | Web/browser QA, Flutter builds/device QA, game title-specific test artifacts |
| 8 | Operations and resilience | Observability, backup, restore, incident, cost and support controls implemented | Verified alerting, restore drills, runbooks, SLOs and ownership |
| 9 | Release acceptance | All relevant prior gates passed | Independent review, named owner acceptance, explicit authorization, then separate promotion decision |

## 5. Mandatory security and release invariants

- SAAAE is enforced server-side; client-side UI checks are not authorization.
- Default-deny RBAC/ABAC with unique human/service/agent identities, least privilege, tenant/product/resource/operation scoping, session/token validation, immediate revocation, and fail-closed behavior.
- Approval records are persistent and bound to requester, approver, action, resource, scope, policy version, expiry, and one-time/idempotent consumption semantics.
- Audit records are durable, tamper-evident, correlated, and fail closed for privileged operations.
- Secrets are never committed, copied into logs, or placed in evidence records. Inventories store metadata only.
- Staging and production identities, databases, Workers, routes, credentials, and data remain isolated.
- No real-money wagering, cash-out, wallet-value mutation, sweepstakes activation, payment activation, or customer-data mutation without their separate legal, security, financial, and release gates.
- G02 remains FAIL / UNVERIFIED; G03–G11 and production promotion remain held until their own evidence is accepted.
- Historical names and artifacts remain preserved in their correct archive; canonical current brand/product identities are not silently replaced.

## 6. Immediate next actions

1. Complete the full open-PR and branch inventory, including pagination and branch ancestry.
2. Build a PR-to-file overlap matrix and dependency graph; identify superseded, duplicate, stacked, independent, and blocked proposals without deleting their history.
3. Compare the current main tree against the exact head commits for the integration candidates.
4. Prepare one reviewable consolidation sequence with explicit keep/rebase/cherry-pick/close-as-superseded recommendations and conflict notes.
5. Reconcile the backend/identity ADR before connecting product data paths.
6. Resolve GitHub Actions job startup through the isolated bootstrap evidence path; do not weaken checks or substitute the G02 runner.
7. Execute staged validations and record exact commit/run/evidence references.
8. Request independent review and owner acceptance before merge; keep production promotion separate.

## 7. Current disposition

**NOT MERGED. NOT DEPLOYED. NOT CERTIFIED.**

This reconciliation document is a planning and evidence index. It does not change runtime configuration, production routes, Firebase resources, Cloudflare resources, secrets, payment settings, runner registration, or customer data. Open PRs and branches remain preserved pending the full reconciliation.
