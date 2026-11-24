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

## 5. GitHub Actions execution diagnosis (2026-11-24)

A further read-only inspection of the latest runs on the reconciliation PR confirms:

- Latest static CI run: `45413702131`, workflow path `.github/workflows/jekyll-docker.yml`, conclusion `startup_failure`.
- Latest G02 image build run: `45413699027`, conclusion `startup_failure`.
- Latest Crimson Smoke UI validation run: `45413696013`, conclusion `startup_failure`.
- The preceding three runs on commit `212317788635160cf0486c1846213195f3f1b40c` failed identically.
- All six inspected run records have no instantiated jobs and no artifacts. Therefore there are no step logs, runner identities, or test results to evaluate.
- The static CI workflow source is syntactically structured for a single `ubuntu-24.04` hosted job with read-only contents permission; its first step captures runner identity, followed by checkout, Node 22 setup, static tests, and evidence upload. The independent hosted-runner probe is also a manual-only `ubuntu-latest` job with `contents: none`, no checkout, no actions, no secrets, and no network calls.
- The G02 self-hosted smoke and dispatch diagnostic workflows remain guarded by `if: false`; they were not activated.
- The GitHub integration available in this session exposes read-only run/job/artifact inspection and PR/file operations, but no workflow-dispatch operation or Actions administration endpoints. Thus it cannot initiate the isolated manual probe or inspect/repair repository runner settings from this session.

**Diagnosis boundary:** evidence establishes a GitHub Actions startup failure before job creation across multiple workflows, not an application test failure. It does not establish the provider's internal cause. Do not claim the workflow YAML, runner image, hosted capacity, account policy, or repository Actions setting is the cause without a successful job or authorized provider-side diagnostics.

**Next safe action:** an authorized repository administrator must dispatch `.github/workflows/isolated-hosted-runner-probe.yml` manually (or use GitHub's UI) and inspect the run's jobs. If it also ends in `startup_failure` with zero jobs, escalate the exact run IDs to GitHub Support / account administration for hosted-runner startup diagnostics. Keep all self-hosted G02 jobs disabled.

## 6. High-priority integration relationships

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


## 7. Parallel application and live staging reconciliation (2026-11-24)

The following checks were performed in parallel against the current draft branches and Cloudflare account. All Cloudflare database queries in this section were read-only `SELECT` statements; no resource or schema was changed.

### Ecosystem registry — PR #602

- Parsed the branch's registry JSON and schema JSON successfully.
- Registry contains **14 realms**, **14 unique IDs**, and **8 unique non-null routes**.
- Production policy remains `protected-hold`.
- Realm readiness values remain non-production states (`live-uncertified`, `scaffolded-unverified`, `planned`, `preview-needs-independent-qa`, `planned-disabled`).
- This was a structural parse/invariant spot-check, not execution of the committed Node validator or full JSON Schema validator in CI.

### Firebase / Flutter — PRs #654 and #655

- PR #654 Firestore rules are explicit deny-all (`allow read, write: if false`) pending reviewed tenant-scoped rules and emulator tests.
- Flutter Firebase configuration requires complete options and exact project-ID match; default target is `lingo-legacy-staging`, while production requires explicit build-time opt-in.
- Actual Firebase staging project existence/access, registered platform app IDs, Firebase credentials, Flutter dependency resolution, emulator rules tests, and GitHub Actions execution remain unverified. No Firebase project or configuration was changed.

### askLINGO — PR #657 and live Cloudflare staging

- Live Worker inventory includes `asklingo-v2-staging`.
- Its Worker settings show a D1 binding `ASKLINGO_DB` to database `e041e690-2a45-4c82-8b46-6e012d739972` (`asklingo-v2-staging-20261122`).
- A read-only `sqlite_master` inspection found the expected authorization foundation tables: `principals`, `grants`, `approvals`, `audit_events`, `idempotency_keys`, and `rate_limit_buckets`, plus Cloudflare's `_cf_KV`; append-only audit triggers and lookup indexes are present.
- PR #657 source verifies Firebase RS256 signatures and token claims, checks disabled/revoked account state, applies scoped staging grants, rate limits, and fail-closed audit handling. It deliberately returns `503 service_not_enabled` while provider/privacy approval remains pending; inference and operational actions are not enabled.
- No matching askLINGO-named Cloudflare Access application was returned by the account Access-app query. This does not invalidate its Firebase bearer-token model, but any additional Access front-door requirement must be specified separately.
- No live query, conversation persistence, inference, or operational action was enabled by this inspection.

### Game engine SAAAE — PRs #655, #658, #659

- The dedicated game-engine D1 database `793ab138-7818-47c9-ad01-b319ad34a8c5` exists.
- Read-only schema inspection found the existing game foundation tables and ledger/rate-limit structures, but **none** of the six `lingo_saaae_*` tables required by PR #658's migration.
- A direct Worker-settings read for `lingo-game-engine-staging` returned Cloudflare 404 (`This Worker does not exist on your account`). The current account Worker inventory does not list that script. The existence of the D1 database is not evidence of a deployed game-engine Worker.
- PR #655's Wrangler config specifies the staging Firebase project ID, but this source configuration is not live deployment evidence. Historical evidence in the branch records an earlier Worker binding to the production Firebase project; that historical state must not be treated as a current staging runtime.
- PR #658 source includes scoped principal/membership/grant authorization, rate limiting, approval-bound spins, and settlement logic. Its six-table migration is not applied to the live D1 database. PR #659's Access application remains a zero-policy shell; independent operator identity and MFA requirements remain blockers.
- Do not deploy the Worker, apply either SAAAE migration, add Access policies, or create routes until staging Firebase identity, separate reviewer identity, exact-source CI, migration tests, rollback, and explicit staging authorization are all satisfied.

### Overall parallel disposition

Source-level work and read-only infrastructure reconciliation advanced, but no application branch was merged, no new Worker deployed, no migration applied, no Firebase project mutated, and no production setting changed. CI remains blocked before job creation. All related PRs remain draft/unmerged and production remains under protected hold.


## 8. Backend authority and Supabase connector reconciliation (2026-11-24)

- PR #515 proposes Supabase as the primary transactional backend while retaining Firebase for identity compatibility and specialist services.
- PR #638 explicitly states backend authority is unselected pending owner reconciliation of ADR-002 and PR #515. PR #654/#655 meanwhile implement a Firebase Auth + Firestore staging foundation, and PR #658/#659 depend on that Firebase staging identity.
- This is an unresolved architecture decision, not a safe basis for merging or migrating data. The canonical owner must select one authoritative transactional system and define which records/services remain in Firebase before any backend schema or application data is moved.
- Supabase project discovery returned one project, `zoksxavxmgnkrthselek`, in `us-west-2`, provider status `ACTIVE_HEALTHY`, PostgreSQL 17.6. The Edge Functions inventory returned zero functions.
- Supabase table and migration reads failed with database authentication errors (`password authentication failed` for the connector's read-only and postgres roles). Advisor reads reported the project as hibernated. These connector errors conflict with the provider-level `ACTIVE_HEALTHY` status; they do **not** establish that the database has zero tables or migrations.
- No Supabase schema, migration, branch, function, or project was changed. Do not create or migrate a backend until owner architecture approval, database access recovery, RLS/security review, migration plan, and exact-source CI are available.


## 9. AppDeploy portfolio and preview QA reconciliation (2026-11-24)

- The primary AppDeploy account lists **20 deployed app records**, all currently reported with deployment status `ready`. This means a deployment record is available; it is not independent product acceptance or proof of production readiness.
- The connected AppDeploy account reports the free plan and 547.83186303 monthly credits available, with zero top-up credits. Deployment access is explicitly `deploy_app_allowed: false` because the authorization expired on 2026-07-07. No deploy, build, restore, source mutation, resource upload, or paid action was attempted.
- Twenty app status checks were reviewed across the portfolio. Most returned empty current frontend/backend error lists and empty network-error lists, but their QA snapshots are not uniformly current and do not replace manual browser/device/accessibility review.
- Two actionable QA findings remain:
  - `LINGO Studio Hub` reports two frontend resource failures for `/resources/visuals/lingoapparel-world.jpeg`; its QA snapshot also contains an eight-test advisory. The image path/resource must be reconciled against the saved source and resource inventory.
  - `Hello The Lingo Legacy` reports an aborted frontend request and one backend error in its status record. Its runtime/realtime path requires a fresh controlled diagnostic before acceptance.
- `That's My Lingo`, `Kotton's Code Family Explorer`, and `Loyalty Lane Apparel` have recent deployment snapshots and zero reported frontend/network errors in their returned QA records. Their product-level legal, privacy, inventory, game-math, payment, accessibility, and independent acceptance gates remain separate.
- No AppDeploy deployment permission renewal or secret-entry action was initiated. Account owner authorization is required before further app writes; use GitHub as source of truth and export any approved AppDeploy source changes back to the canonical repository.


## 10. Public portfolio taxonomy and stacked-PR ordering

- PR #602 preserves a useful **14-node inventory**, but it is stacked on PR #548's website-readiness branch and is not a clean independent merge to `main`.
- PR #638 recommends retaining those 14 nodes while classifying them as public portfolios, subproducts, or shared platform capabilities.
- PR #640 provides the current eight-public-portfolio presentation: `LINGOlegacy`, `LINGOlane`, `LINGOslots`, `LINGOarcade`, `LINGOlibrary`, `LINGOmedia`, `LINGOworld`, and `LegacyXclub`. It classifies Studio, Core, Identity, and Wallet as shared platform capabilities, with Campus and Shield inside LINGOworld. This is consistent with the canonical public-brand hierarchy and should be the portfolio presentation layer; it does not delete the detailed 14-node inventory.
- Current PR metadata: #548 remains draft and reports `mergeable: false`; #602 remains draft and targets #548's branch; #638 and #640 are draft and target `main`. No branch was rebased or merged.
- Recommended integration order: first resolve the #548 exact-root/wildcard source and preview acceptance; then reconcile #638's enterprise taxonomy with #602's detailed registry and #640's public directory; then select one canonical registry/validator owner and remove duplicate/conflicting ownership before any merge.
- Do not merge #602 into `main` while its base dependency is unresolved, and do not merge multiple competing registry/portfolio implementations solely to make branches appear consolidated.


## 11. Current merge graph and file-overlap review (2026-11-24)

A fresh PR metadata and complete changed-file inventory review was performed for #548, #511, #515, #523, #638, #640, and #656.

### Direct merge and overlap findings

- **#548** is open/draft, reports `mergeable: false`, targets `main`, and changes 19 files including `index.html`, `assets/flagship-home.css`, `assets/flagship-home.js`, and `worlds/index.html`. Its exact-root Worker and preview build changes remain the foundational flagship site work.
- **#640** is open/draft, reports `mergeable: true`, targets `main`, and overlaps #548 on all four of those flagship presentation paths. A direct merge of both without a single chosen source-of-truth implementation would risk overwriting homepage, navigation, and /worlds/ work. Keep #640 as the canonical directory/presentation proposal; reconcile its overlapping files against #548 before either merge.
- **#602** remains stacked on #548's branch, so its 14-realm registry and expanded /worlds/ implementation must not be merged to `main` until #548's base is resolved. It also overlaps the public directory implementation in #640. The detailed 14-node registry and eight-portfolio public presentation should be reconciled as data model vs presentation, not treated as competing replacement implementations.
- **#511** is open/draft and targets `main`; its 28-file master registry/dependency-graph baseline includes ADR-002 and identity/wallet contracts. It is the appropriate owner for the canonical dependency graph, but its backend decision record must be reconciled with #515 and the later Firebase staging branches before it is accepted.
- **#515** is open/draft, targets `main`, and changes only `docs/SUPABASE-PRIMARY-BACKEND-ARCHITECTURE.md`. It is an architecture proposal, not a live backend migration or deployed service. Do not treat the proposal as authority while Firebase staging is being built.
- **#638** is open/draft, targets `main`, and changes nine files including `worker.js`, Studio registry/validator files, and `studio/index.html`. Its enterprise module registry can be reconciled with #511's dependency graph, but the Worker and Studio page must be checked against existing owners before merging.
- **#523** is open/draft, reports `mergeable: false`, targets `main`, and adds a control-room page plus release/runbook documentation and Studio Hub. It is not a substitute for actual runtime observability, live integration, or release evidence.
- **#656** is open/draft, targets `main`, and contains the isolated manual hosted-runner probe plus its recovery runbook. It is the canonical safe CI startup diagnostic; it must be manually dispatched by a repository owner because this connector has no dispatch action.

### Recommended consolidation sequence

1. Resolve the #548 exact-root/preview source and its reported mergeability conflict first.
2. Reconcile #640's overlapping homepage and directory files with #548, preserving the canonical eight-portfolio presentation and 14-realm registry data.
3. Reconcile #511, #638, #602 and #515 into one canonical registry/dependency/backend architecture decision, with explicit file ownership and no duplicate validators.
4. Keep #654–#659 as dependent identity and SAAAE staging slices; do not merge dependent branches out of order.
5. Keep #523 as a later presentation/runbook integration after real runtime telemetry is available.
6. Use #656 for the manual hosted-runner diagnostic; do not activate G02 as a workaround.

This is a file-overlap and metadata review, not a merge simulation. GitHub's `mergeable` field is only a provider-reported snapshot and does not replace fetching the current merge base, reviewing the complete diff, and executing exact-head CI.
