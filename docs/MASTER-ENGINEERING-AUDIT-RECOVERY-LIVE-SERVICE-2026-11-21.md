# LINGOlegacy_MASTER — Master Engineering Audit, Recovery, Integration & Live-Service Runbook

**Audit date:** 2026-11-21  
**Control repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Baseline branch:** `main`  
**Baseline commit observed:** `3fe099eb11329cc333ffa5a1ea36affcd0375343`  
**Execution branch:** `docs/master-engineering-audit-live-service-2026-11-21`  
**Program owner:** Zavione / The Lingo Legacy  
**Disposition:** CONTINUE SAFE EXECUTION; PRODUCTION PROTECTED HOLD  
**Budget posture:** free-tier-first; no incremental spend without separate approval.

> This is the operational master artifact. It is an evidence ledger and execution contract, not a deployment authorization. A source file, issue, PR, successful API response, queued build, or HTTP response alone does not prove a service is running.

## 1. Mission and completion standard

Bring the LINGO portfolio and shared platform into a coherent, secure, observable, maintainable service architecture. Inventory, restore, reconcile, repair, test, integrate, preview, review, merge, deploy, and operate each component in dependency order. Continue parallel work where independent; serialize changes to shared files, schemas, branches, identity systems, provider resources, DNS, routes, and production.

A component is **RUNNING** only after its accepted source SHA is correlated to a successful build and deployment, its intended runtime and dependencies are verified, its public/private routes and user journeys pass, monitoring and rollback are proven, and the responsible operator/support path is recorded.

## 2. Non-negotiable controls

1. GitHub is the source of truth. Preserve all repositories, histories, branches, PRs, tags, backups, artifacts, snapshots, and last-known-good versions.
2. Restore before replacing; reconcile before duplicating; verify before merging; verify deployed provenance before declaring live.
3. Never force-push, rewrite history, bulk-copy repositories, delete branches, or overwrite assets as a shortcut.
4. Keep production PROTECTED HOLD until all applicable acceptance gates pass and separate promotion authorization is recorded.
5. G02 remains FAIL / UNVERIFIED until runner ID is nonzero, runner name is populated, exact designated labels/identity are verified, job steps actually instantiate and complete, logs and artifacts are retrievable, and run/job/commit evidence correlates. Hosted-runner evidence is separate and cannot substitute for G02.
6. Do not register or restart runners, change repository/org permissions, alter DNS/routes/Worker versions, mutate production databases/auth, change payment settings, publish private surfaces, rotate secrets, or incur spend without resource-specific authorization and a tested rollback plan.
7. Never put secret values, personal/minor information, private business data, or sensitive account data in source, logs, comments, artifacts, or this ledger.
8. Demo/Play Coins remain non-redeemable. Real-money wagering, prize issuance, payouts, financial custody, and sweepstakes activation remain disabled pending legal, jurisdictional, provider, age, fraud, and security acceptance.
9. Public Kotton’s Code content remains privacy-gated. Keep private family/minor details out of public bundles.
10. Preserve House of Avalon as a separate historical archive. The current identity is exactly **THE PRESTIGIOUS HOUSE OF DUSSE**; founder Zavione; debut November 7, 2021. Do not infer transfer of legal status.

## 3. Repository and authority model

| Repository / system | Intended responsibility | Required evidence before integration |
|---|---|---|
| `thelingolegacy-blip/TheLingoLegacy` | Canonical governance, public/runtime Worker source, portfolio registry, operational docs and recovery control | main SHA, PR lineage, workflow evidence, route/runtime mapping |
| `thelingolegacy-blip/TheLingoLegacy-Web` | Separate private Next.js/React/TypeScript + OpenNext/Cloudflare web application; current main SHA observed: `84a4d65282aef3c6fec7149d8aaa6f13402165da` | live repo read, main SHA, package/build contract, workflows, preview and deployment provenance |
| Cloudflare | Edge Worker/Pages runtime, DNS/routes, assets, security and observability | current resource inventory, active version/deployment IDs, bindings, routes, build triggers, logs and probes |
| Firebase / Supabase / other data providers | Identity, data, storage and API services according to a single-authority decision | exact project identity, environment, schema/rules, auth mapping, backups, restore and integration tests |
| Flutter / iOS / Android | Mobile clients and device distribution | reproducible build, static/unit/integration tests, device QA, auth/deep-link/offline behavior |
| Game runtimes | Isolated game experiences and server-authoritative state | deterministic builds, session lifecycle, anti-cheat/economy tests, safe demo mode |
| Commerce / payments | Apparel, ordinary business payments, approved support/donations | catalog/fulfillment/tax/refund review, test-mode lifecycle, reconciliation and separate production authorization |
| Creative/content systems | Brand, design, media, books, campaign and asset production | source/rights/provenance, approvals, privacy and accessible delivery |
| Analytics / operations | Monitoring, analytics, support, HR/workforce and operations domains | scoped identity, RBAC/ABAC, data segregation, audit trails and SLO ownership |

The private web repository is not a competing governance source. Do not assume code migration or production integration until both repositories are inspected and their dependency/deployment boundaries are documented. No credentials or secret values belong in this artifact.

## 4. Portfolio scope and product register

Maintain separate product ownership and release gates for:

- **LINGOlegacy:** flagship identity, account, wallet architecture, community and public site.
- **LINGOlane:** Designs & Promotions, Loyalty Lane Apparel, Laundry-Cycle / Loyalty Lane Cycles.
- **LINGOslots:** That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions, Cashman Lingo Mania.
- **LINGOarcade:** Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly, Jersey Shore: The Undead.
- **LINGOlibrary:** KottonsCode, The Block I Grew Up On, Say It Again, Dice Shift Hotel, Legacy Legends.
- **LINGOmedia:** Rise of Zavione Parts 1 and 2.
- **LINGOworld:** LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations.
- **Other identities:** THE PRESTIGIOUS HOUSE OF DUSSE and LegacyXclub.
- **Shared capabilities:** identity/auth, profile, API gateway, data, wallet/economy, notifications, search, analytics, observability, security, support, release governance, web, mobile and smart-TV distribution.
- **Separately permissioned operations domains:** organizers/promoters/managers; workforce administration, HR and payroll; homes/residential property; hotels/hospitality; roads/transportation infrastructure; street/road lighting; water distribution and flow monitoring; wastewater, drainage and sewer-flow monitoring. These domains share platform infrastructure but require distinct roles, tenant boundaries, jurisdiction controls, audit logs and financial-data segregation.

For every product, record: owner; canonical source path/repository; exact branch/SHA; runtime; environment; route; backend/auth/data dependencies; assets/rights; test evidence; accessibility/device QA; privacy/legal status; monetization state; support/monitoring; rollback; preview URL; production URL; remaining blockers.

## 5. Master execution sequence

### Phase 0 — Preserve and establish baseline
- Capture repository HEADs, branch/PR inventory, tags, workflow inventory, provider resource inventories, active deployments, backups and known-good versions.
- Create immutable audit snapshots and correlate all evidence to timestamps and SHAs.
- Mark unknowns UNKNOWN; never convert missing evidence into PASS.
- Acceptance: complete responsibility matrix and provenance ledger.

### Phase 1 — Reconcile repositories, branches and pull requests
- Inspect both repositories independently; record ownership, main SHA, build system, workflows, runtime, deployment target and secret boundaries.
- Classify open PRs: merge candidate, stacked dependency, duplicate, stale, conflicting, blocked, or documentation-only.
- Compare exact base/head SHAs, diff, tests, permissions, privacy and provider effects.
- Merge only accepted, non-draft PRs with executed checks and correct target. Keep blocked PRs open with precise reasons.
- Acceptance: one reconciled PR queue, no silent bulk migration or competing source of truth.

### Phase 2 — Recover CI admission and G02
- Diagnose workflow startup/admission failure before treating it as a code failure.
- Prove a minimal read-only hosted canary executes on `ubuntu-latest`; require a real run, job, runner name, completed step, log and commit correlation.
- Separately prove the designated G02 runner identity, labels, nonzero runner ID, host/service provenance, steps, logs and evidence artifact.
- Do not retry blindly, register duplicate runners, weaken required gates or conflate hosted CI with G02.
- Acceptance: hosted CI lane passes; G02 separately passes its complete contract. Otherwise mark blocked with owner-side action.

### Phase 3 — Secure publication boundary and edge runtime
- Reconcile Cloudflare Workers, Pages projects, custom domains, DNS records, routes, exact-root vs wildcard routing, active deployments, versions, build triggers, deploy hooks, bindings, assets, logs and health probes.
- Verify Wrangler configuration against actual live resources. Review `assets.directory`, allowlists/exclusions and protected-path handling before any publication.
- Keep Firebase Hosting quarantined until its public directory points only to a curated, generated build output and the exact Firebase project identity is proven.
- Keep Vercel retired unless a deliberate, approved architecture decision reverses that posture.
- Stage route/version corrections with preflight, backup, canary, rollback and readback.
- Acceptance: route-to-runtime map, active-version provenance, restricted-path tests, health probes and rollback all agree.

### Phase 4 — Backend, API, identity and data
- Inventory Firebase, Supabase and all existing data projects read-only; compare purpose, ownership, data, auth, schema, environment and consumers.
- Select one transactional source of truth. Do not implement dual-primary writes.
- Define API contracts, validation, authorization, idempotency, rate limits, event delivery, tenant isolation and audit events.
- Reconcile Lingo ID, OAuth/OIDC, Firebase Auth or other identity providers only after project identity and environment mappings are verified.
- For wallet/economy: server-authoritative append-only ledger, balanced entries, idempotency, reconciliation, abuse controls and restore drill before value-bearing features.
- Acceptance: staging migrations, contract tests, cross-tenant isolation, auth/session tests and restore evidence pass.

### Phase 5 — Web, mobile, games and content
- Build web from verified output only; test routing, headers, assets, responsive behavior, accessibility and supported browsers.
- Build Flutter/iOS/Android reproducibly; validate static analysis, tests, signing boundaries, deep links, session expiry, offline/retry and physical devices.
- Validate game sessions, save/load, progression, deterministic state, moderation and anti-cheat. Keep demo currency non-redeemable.
- Verify asset ownership/licensing, privacy, localization, accessibility, performance budgets and cache invalidation.
- Acceptance: correlated artifacts and user-journey QA on each supported surface.

### Phase 6 — Commerce, monetization and legal
- Audit Shopify catalog, supplier/inventory, pricing, fulfillment, taxes, shipping, refunds and customer support.
- Keep Stripe test mode until checkout, webhooks, idempotency, refunds, disputes, fraud controls and accounting reconciliation pass.
- Do not activate wagering, sweepstakes, payouts, prizes or stored value until jurisdiction-specific legal/compliance and provider approval is recorded.
- Acceptance: test-mode end-to-end evidence, reconciliation and required legal/provider signoffs; production activation separately authorized.

### Phase 7 — Security, privacy and operational resilience
- Implement secret scanning, dependency/SBOM/license checks, SAST, IaC/container scanning, pinned CI actions and build provenance.
- Review CSP, CORS, request validation, SSRF/XSS/CSRF/IDOR, session lifecycle, rate limits, App Check, database/storage rules and upload scanning.
- Establish logs, metrics, traces, SLOs, alert routing, incident ownership, backup schedules, RPO/RTO and demonstrated restore/rollback.
- Verify workforce and operational domains use scoped roles, jurisdictional compliance, privacy boundaries, asset registries and segregated financial data.
- Acceptance: independent security/privacy review, exercised alerts, restore drill, rollback drill and incident playbooks.

### Phase 8 — Product-by-product acceptance and launch
- Move each product through INVENTORY → RESTORE → IMPLEMENT → LOCAL PASS → CI PASS → PREVIEW PASS → SECURITY REVIEW → QA PASS → ACCEPTED → MERGED → DEPLOYED → LIVE VERIFIED → RUNNING.
- Publish only products with accepted route, runtime, data, privacy, support and rollback evidence.
- Maintain explicit release decisions, change windows and post-release monitoring.
- Acceptance: all applicable criteria pass for the specific product; no portfolio-wide blanket status.

### Phase 9 — Live-service operations
- Maintain service catalog, dependency graph, owner/operator roster, support route, on-call escalation, SLO/SLI, incident log, change calendar, backup/restore evidence, vulnerability queue and cost ledger.
- Run synthetic checks, route/health probes, error/latency monitoring, security alerts and scheduled recovery exercises.
- Every incident or change must include impact, start/end, evidence, owner, remediation, rollback and follow-up.
- Acceptance: services are continuously monitored and supportable, not merely deployed.

## 6. Current verified audit findings (2026-11-21)

### GitHub source and PR inventory
- The canonical repository is reachable; it is public, default branch `main`, repository ID `1279436411`; connected GitHub permissions report admin/maintain/push/pull.
- Main HEAD observed during this audit: `3fe099eb11329cc333ffa5a1ea36affcd0375343`.
- Current open PR search includes new work #638, #639, #640, #641 and continuing proposals #594–#617. Search results are an inventory, not merge approval.
- PR #640 (canonical portfolio/world directory) is draft and explicitly says Node regression tests/workflow are authored but not executed; public links are disabled where route/privacy verification is incomplete.
- Recent Actions runs include IDs `44941902126`, `44941900973`, `44941900065`, `44941899121` and earlier runs; the observed conclusions are `startup_failure`. This is an admission/startup blocker, not evidence of test failures or passes.
- The repository currently has a large branch inventory; branch names alone do not establish useful or mergeable work. Compare ancestry and diffs before consolidation.

### Private web implementation repository — fresh read-only check
- `thelingolegacy-blip/TheLingoLegacy-Web` is reachable as a private repository; default branch `main`; main HEAD observed: `84a4d65282aef3c6fec7149d8aaa6f13402165da`.
- Recent Actions runs in this repository also show `startup_failure` before usable job evidence; examples include `44941701315` and `44941697410` on head `0d914cda0da60a26f3f496ca82347e5f2b9a8914`. CI is therefore blocked in both repositories, not only the public control repository.
- Open PR #49 is non-draft and mergeable at the API metadata layer, head `0d914cda0da60a26f3f496ca82347e5f2b9a8914`, base main `84a4d65282aef3c6fec7149d8aaa6f13402165da`; it includes Cloudflare Worker target alignment and public-copy/demo-safety changes. It is **not accepted for merge** while required CI is unexecuted and source/runtime/preview evidence remains incomplete.
- PR #46 (hosted/staging verification) is draft and currently reported non-mergeable; PR #43 (Supabase foundation) is draft and non-mergeable; PR #42 (private-site reconstruction) is draft. PR descriptions are design/source claims, not independent runtime evidence.
- Cloudflare has a distinct `thelingolegacy-web` Worker with a deployment pointer, but that does not prove the private app repository's accepted SHA, build artifact, Worker upload provenance, or full end-to-end journey is correlated. Establish that mapping before integration or cutover.

### Publication and runtime configuration
- Main `wrangler.jsonc` names Worker `thelingolegacyv-5`, entrypoint `worker.js`, compatibility date `2026-09-01`, and routes for apex and www.
- Main Wrangler assets directory is `.`; this is a critical publication-boundary concern until a curated asset allowlist and protected-path guard are verified.
- Main `firebase.json` is currently `{}`; Firebase Hosting scope/project identity must be verified before any deploy or activation.
- `SYSTEM-ACTIVATION-AUTHORITY.md` is explicitly marked a superseded historical record and grants no current permissions. Its historical “all active/live” claims must not be reused.
- PR #615 contains a dated provider readback that reports Cloudflare Workers Build triggers and deploy hooks were removed and read back empty, while the active production Worker deployment remained at 100% at the time of that observation. Re-read live provider state before acting; the PR remains draft and its evidence is not a substitute for current checks.
- The same PR #615 evidence reports a hosted canary dispatch limitation in the current connector and zero runs for the one-time recovery branch; hosted admission and G02 remain unverified.

### Known active blockers carried forward
- GitHub Actions `startup_failure`; hosted job admission unproven.
- G02 runner identity/host/service/job/artifact evidence incomplete.
- Main publication asset boundary: `assets.directory: "."`; protected path allowlist/guard needs verification and acceptance.
- Firebase project identity and safe Hosting output remain unverified.
- Cloudflare exact-root/wildcard routes, current active version and all bindings require fresh readback before any mutation.
- Backend authority and Firebase/Supabase identity/data boundaries require decision and proof.
- Public privacy, especially Kotton’s Code, remains gated.
- Browser/device, end-to-end, security, backup/restore, rollback and independent acceptance are incomplete for multiple products.
- Payments, wallet value, sweepstakes and wagering remain disabled pending their own gates.

## 6A. Fresh Cloudflare live-provider readback (2026-11-21)

Read-only Cloudflare API calls in this session authenticated successfully and returned one account and one active zone for `thelingolegacy.com`. No Cloudflare mutation was performed.

- Account contains **10 Worker scripts**; zone status is `active`, not paused.
- Zone route inventory returns **27 routes**. The apex wildcard `thelingolegacy.com/*` maps to `thelingolegacyv-5`; a separate exact-root route `thelingolegacy.com/` maps to `lingo-flagship-root`. `www.thelingolegacy.com/*` maps to `thelingolegacyv-5`. Six integration-configurations path variants map to `lingo-integration-config-404`. Preserve this split while reviewing route precedence and path coverage; do not consolidate or retarget by assumption.
- `thelingolegacyv-5` latest uploaded version observed is **378**, ID `cf7059ef-a9af-47f0-8f9f-49c5a3cad759`, created `2026-11-21T18:33:17Z`. Its most recent deployment readback still reports **100% on version** `2d161fa5-598f-4998-ada8-7ac4c72c3461`, deployment ID `ecd71a70-e476-4318-92a7-35249ced360b`, created `2026-10-25T16:21:58Z`. This is a material uploaded-versus-active deployment drift. Upload is not deployment; do not activate version 378 until source, asset boundary, compatibility, health and rollback are accepted.
- `lingo-flagship-root` has deployment `31ccefbb-ddf4-4a62-974b-3ee9d0bc81d3` at 100% on version `658acd1a-997b-45cd-b8fc-e59c59b26b45`, created `2026-10-25T16:38:23Z`.
- A distinct `thelingolegacy-web` Worker exists. Its latest returned deployment is `e4fd09e9-1b0d-4ffb-88bb-81f84fab5782`, 100% on version `58fe63ed-dc52-48d9-b12c-cfea4bc36c8d`, created `2026-11-19T22:28:34Z`. This does not establish that the private web repository is fully integrated or that the public user journeys pass.
- Cloudflare Pages currently lists five projects: `lingo-flutter-firebase-preview`, `lingo-execution-center-preview`, `lingo-legacy-github-integration-test`, `thelingolegacy-static-backup`, and `my-flutter-app`. The `my-flutter-app` project currently specifies a build command that clones Flutter stable at build time and a root directory of `/`; this needs source/provenance and environment review before treating it as a trusted release path. The project named preview is not itself proof of preview isolation.
- The Pages list API rejected explicit pagination parameters in this account context; the successful unparameterized list returned the five projects above. This is a connector/API query limitation, not evidence that more projects do not exist.

**Cloudflare acceptance status:** INVENTORY PARTIAL / DEPLOYMENT PROVENANCE GAP. The readback establishes configured resources and selected deployment pointers only. It does not establish request-level route behavior, binding health, secrets correctness, end-to-end application behavior, current error rates, backup/restore, or rollback readiness. Those remain separate gates.

## 7. Evidence schema and status vocabulary

Every evidence record must include: workstream; product/system; repository; branch; source SHA; file/PR/issue; command/test; timestamp; environment; run/job ID; runner identity; artifact ID and checksum; provider resource/deployment/version ID; URL/route; observed result; reviewer; rollback reference.

Use only:
- **NOT STARTED**
- **IN PROGRESS**
- **BLOCKED**
- **PASS — EVIDENCE LINKED**
- **ACCEPTED**

For product lifecycle, additionally use the phase names in Phase 8. A documentation-only change cannot be marked runtime PASS. A queued or startup-failed workflow cannot be marked CI PASS. A deployment API response cannot be marked LIVE VERIFIED.

## 8. Next-action queue — ordered by dependency and risk

1. Refresh both repository heads and responsibility matrix; inspect `TheLingoLegacy-Web` without copying or migrating.
2. Read current main workflows and Actions runs; isolate the startup-failure cause and obtain a real hosted canary through an available authorized dispatch path.
3. Keep G02 blocked until host-side runner and artifact evidence are complete.
4. Review PRs #638–#641 and #613–#617 for overlap, base/head drift, privacy and unexecuted checks; do not merge drafts.
5. Inspect publication boundary files and candidate allowlist/guard PRs; run tests in an actual supported environment before merge.
6. Refresh Cloudflare resource state and route/version provenance; do not mutate production routes or versions during discovery.
7. Verify Firebase project identity and build-output path; keep Hosting blocked until curated artifact boundary passes.
8. Inventory backend projects and auth; choose one transactional authority before migrations or wallet integration.
9. Advance privacy, browser/device, game-session, commerce and operational-domain acceptance in parallel where dependencies permit.
10. Publish a live-service operations ledger with verified state, owners, alerts, rollback and support for each accepted service.

## 9. Change record

This document was created on an isolated documentation branch from the observed main SHA above. It does not change production code, infrastructure, DNS, routes, secrets, payment settings, runner registration or deployment configuration. Merge only after review confirms it is consistent with current issue #625 and no duplicate master artifact supersedes it.
