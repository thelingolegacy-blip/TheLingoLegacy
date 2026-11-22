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


## 10. Late-run reconciliation addendum — 2026-11-21 ET / 2026-11-22 UTC

This section supersedes earlier inventory counts where newer read-only evidence differs. It records source/provider observations, not release acceptance.

### GitHub Actions, G02 and governance

- Canonical repository main remains `3fe099eb11329cc333ffa5a1ea36affcd0375343`.
- The latest 100 canonical-repository Actions runs all concluded `startup_failure`: 92 on `feat/asklingo-v2-foundation-2026-11-21`, 7 on `feat/lingo-master-registry-wave0-2026-11-08`, and 1 on `feat/asklingo-v2-saaae-policy-engine-2026-11-22`. Representative runs: [44972354812](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/44972354812), [44972353995](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/44972353995), [44972235599](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/44972235599). The sampled Jobs and Artifacts APIs return empty arrays. These are startup/admission failures, not test results.
- The private [TheLingoLegacy-Web](https://github.com/thelingolegacy-blip/TheLingoLegacy-Web) repository independently shows 50/50 latest runs as `startup_failure`; its main SHA is `84a4d65282aef3c6fec7149d8aaa6f13402165da` and its branch API reports `protected=false`.
- Canonical main also reports `protected=false`. Active ruleset `27403956` does not demonstrate required PR approvals or required status checks. Branch-protection, Actions-permission, runner and runner-group administrative reads remain inaccessible to this integration. G02 is still **FAIL / UNVERIFIED**.
- Cloudflare account MFA is a current P0 owner issue: `enforce_twofactor=false`; the single accepted account member has Super Administrator / all-privileges role and `two_factor_authentication_enabled=false`. Owner must enroll MFA and recovery, then enable and independently verify account enforcement. No setting was changed.

### Dispatch validator and isolated-host evidence

- [PR #611](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/611), head `f246d69053e1aa0e80a30b7c9763c17e91eea75e`, now contains 33 test methods. Static source readback confirms the cost ceiling is constrained to exactly zero and `COMPLETE` is excluded from the initial envelope schema and must be reached through the evidence-gated transition. The PR comment reports 33/33 in a local reconstruction; this run did not independently execute Python tests.
- Exact-head run [44926126766](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/44926126766) concluded `failure` with job `136912496343`, but the job has zero steps, no usable log URL, a log retrieval `BlobNotFound`, and zero artifacts. Classify it as pre-step execution failure, not a validator assertion failure.
- [PR #615](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/615), head `60c5c349a6f613e62600ad71766acbc61907e562`, contains the 1,055-line restoration orchestrator (blob `3c726e83`). Source review confirms exact-source SHA gates, temporary HOME, symlink refusal, environment allowlisting and manifest hashing. It was not executed: no disposable unprivileged host with deny-by-default egress is available. Its five associated runs, including [44926891540](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/44926891540), all failed before job creation with zero artifacts. Do not run it in the ChatGPT/container host or treat the operator attestation flag as technical isolation proof.

### Flutter and CORE V2 dependency reconciliation

- [PR #613](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/613) and [PR #614](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/614) now have 37 overlapping changed paths, 15 shared paths with different blobs, 6 #613-only paths and 7 #614-only paths. Relative to current main, #613 is 69 ahead / 15 behind and #614 is 94 ahead / 15 behind. Keep #614 as the more complete preview candidate, but do not merge either independently or in sequence. The last recorded successful #614 Pages preview is for older head `86a4a6e7904c41d045a99c6774578b88658c5747`; current head `54e2cb8171a8cb1a3135838056c92f99df4fbaf1` has no new source-correlated successful preview in this readback.
- [PR #594](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/594) is 13 ahead / 15 behind current main. Its provider-neutral Go/PostgreSQL authority direction is recorded in the draft ADR, with Firebase as a specialist integration and Cloudflare as edge, not a provider-provisioning authorization.
- [PR #596](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/596) is 56 ahead / 8 behind its current #594 parent. The escaped JSON test literal is source-repaired, but `go.sum` is absent and no gofmt, Go build or Go test has run. Exact-head run [44822526118](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/44822526118) has zero jobs/artifacts.
- [PR #605](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/605) is 2 ahead / 35 behind its current #596 parent. It remains a stale hosted-evidence lane; do not dispatch before provider admission is restored and ancestry is reconciled.
- The Option 2 slot-engine source was merged through [PR #628](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/628), merge commit `316a9965eb9b0519a077319313ad8f5e510e6dfc`. Its exact-head contract workflow [44935696895](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/44935696895) failed before job creation, with zero jobs and artifacts. The 14-test result remains local-only. Original [PR #606](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/606) stays draft for its separate recovery-foundation workflow only; do not merge it wholesale.
- [PR #608](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/608) remains an eight-commit static prototype stacked on `feature/lingo-reset-center`; it has no live registry, identity, persistence, approval or execution integration.

### Campaign, product and realm registry acceptance

- [PR #511](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/511) adds the canonical 31-name campaign baseline. Read-only structural re-evaluation confirms 31 unique IDs and names, expected family counts, Dusse included as an independent identity, and Loyalty Lane Cycle preserved as a nested operating line rather than double-counted. This is structural inspection, not a Node/CI test pass.
- The same branch's master product registry contains 40 products across 9 groups but omits **THE PRESTIGIOUS HOUSE OF DUSSE**. It is 55 ahead / 32 behind current main; four exact-head workflow runs are startup failures with no jobs/artifacts. Pages attempts for this branch are skipped by `path_config`, not built.
- [PR #602](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/602) contains 14 unique realm records and 8 unique routes, but the registry has no `node_type` or parent-realm ownership. LINGOcampus and LINGOshield appear as LINGOworld products and as separate realm records; Studio/Core/Identity/Wallet/Campus/Shield have no explicit parent mapping. The branch is 26 ahead / 28 behind current main. Treat the registry as unaccepted until public portfolios, subproducts and shared platform services are typed and reconciled.
- [PR #640](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/640) presents eight public portfolio cards and eight operational-domain cards, but omits Dusse. Add a separate independent identity card or explicitly record a governed gated state; do not nest it under Avalon or another LINGO brand.
- [PR #638](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/638) defines 22 read-only Studio modules, including separate workforce, HR/payroll, residential, hospitality, transport, street-lighting, water and wastewater/drainage scopes. Eleven tests are authored but its six workflows all failed before job creation. The `cloud-studio` module is labeled `LIVE_VERIFIED` without an actual evidence object; the validator checks required-evidence labels, not evidence values. Do not treat that status as live acceptance.
- [PR #641](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/641) has 14 Destiny Engine tests authored; its five exact-head workflows are startup failures with zero jobs/artifacts. Deterministic FNV-1a hashing is documented as non-cryptographic; persistence, identity, wallet and multiplayer integration remain absent.

### askLINGO and SAAAE

- [PR #643](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/643) head `07e58381dccf3d4c03a550a2b01c7ffd38735f21` has 69 authored tests; only 11 earlier policy cases have isolated-harness evidence and 58 remain unrun. Four exact-head workflows are startup failures with empty Jobs APIs. Source blockers include global rather than tenant/product-partitioned audit head, no separately persisted nonce marker, no idempotency lease/reconciliation, no trusted approval issuance/key custody, and no SAAAE wiring into Oasis purchases.
- [PR #644](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/644) head `923d0718348af55bb0f602d12a043785c0d45346` contains 13 modes, 12 specialist agents and bounded policy/request modules. The 29 local tests were reported on an earlier head, not rerun on this head; the latest current-head Actions sample is startup-failed with zero jobs. Full repository tests and runtime integration remain unverified.
- [PR #645](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/645) is 1 ahead / 20 behind its current #644 base and non-mergeable. Child [#646](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/646) and [#647](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/647) remain draft on that old planning head. #646 has 11 local policy tests plus 3 targeted regressions; #647 has 6 local registry tests plus 1 targeted regression. Neither has hosted acceptance. The separate #643, #644 and #646 policy implementations must be reconciled into one canonical SAAAE enforcement layer before wiring.
- Cloudflare now contains an `asklingo-v2-staging` Worker (version `33d8f27e-5272-4b63-b673-fd2a06eccf81`, 100% of that script deployment) with tags `staging`, `disabled`, `no-inference`, and a D1 binding. It has no custom route and no GitHub commit provenance in deployment metadata. Its bound D1 database `e041e690-2a45-4c82-8b46-6e012d739972` has six application tables (`principals`, `grants`, `approvals`, `audit_events`, `idempotency_keys`, `rate_limit_buckets`) and zero rows in each. Read-only SELECTs reported zero rows written and `changed_db=false`. The schema still lacks explicit approval nonce/signature/key lifecycle fields, product/resource/operation/environment idempotency scope, and audit-chain/checkpoint fields. This is an empty staging scaffold, not a connected identity/approval/audit service. Its creation is observed provider state, not an action in this audit.
- The D1 staging model conflicts with the ratified PostgreSQL-authority direction unless explicitly scoped as a non-authoritative disposable adapter. The #643 Firestore adapter, #644 D1 schema and #646 pure policy kernel also represent competing persistence/enforcement slices. Select one authority per domain before data writes.

### Cloudflare, Firebase and AppDeploy live state

- Cloudflare currently returns **11 Worker scripts, 27 routes and 34 DNS records**. The apex wildcard and www wildcard still map to `thelingolegacyv-5`; the exact apex root maps to `lingo-flagship-root`; six integration-configurations variants map to `lingo-integration-config-404`.
- `thelingolegacyv-5` latest uploaded version is **378**, ID `cf7059ef-a9af-47f0-8f9f-49c5a3cad759`; its active deployment remains **100% on version** `2d161fa5-598f-4998-ada8-7ac4c72c3461`, deployment `ecd71a70-e476-4318-92a7-35249ced360b`. The separate `thelingolegacy-web` Worker is 100% on version `58fe63ed-dc52-48d9-b12c-cfea4bc36c8d` but has no custom route. Do not infer integration or promote an uploaded version.
- Main source now has the restricted-path guard before `ASSETS.fetch`, the 13 `run_worker_first` patterns, and `.assetsignore` exclusions. This is source-level evidence only: the active production Worker still runs the older version above. Do not call the live site production-fixed.
- Pages projects `lingo-flutter-firebase-preview` and `lingo-execution-center-preview` have production deployments disabled. Their latest attempts for the master-registry branch were skipped with `path_config`; no build/test result is implied.
- Main `firebase.json` and `.firebaserc` are empty objects. `firebase.client.json` still contains a production project identifier with placeholder client credentials; no approved staging Firebase identity/alias or root ruleset is established. Firebase integration remains BLOCKED.
- AppDeploy's primary connected account reports 18/18 app deployments `ready` and 694.118 monthly credits on the Free plan. Selected Gateway and LINGOtravel apps are ready; Hello's media-health cron currently reports success / failure_count 0, while its stored error history still contains a Request aborted event.
- Studio Hub and Kotton's Code source snapshots contain the referenced image files (11 Studio visual assets; 4 Kotton world images). Their latest QA snapshots are stale (Studio 2026-11-05; Kotton 2026-10-04) and later image-load errors remain in the stored logs (Studio 2026-11-17; Kotton 2026-11-06). Do not upload or overwrite assets; verify URL/path serving with a fresh exact-source QA run. Kotton's privacy scan still finds family/minor profile-pattern matches in 8 source files; keep the public-bundle privacy gate open and do not copy personal details into public docs.
- Fresh Supabase project detail/migration/function reads were not available through the connected tool in this run. The last recorded #597 inspection remains the authoritative prior evidence: healthy PostgreSQL project with system tables only, no LINGO application schema/migrations/Edge Functions. Do not infer a current integration.

### Private web repository and Dusse canon

- Private [TheLingoLegacy-Web PR #49](https://github.com/thelingolegacy-blip/TheLingoLegacy-Web/pull/49) is non-draft and mergeable but unmerged. Its Cloudflare preview build/deploy succeeded for commit `0d914cda0da60a26f3f496ca82347e5f2b9a8914`, deployment `308d0b13-3bef-4f4f-b261-5c98b10f3638` (13 routes, 88 assets read, 38 uploaded). This is a provider-reported preview only; GitHub Actions remains startup-failed and no production route/cutover is proven. The private repo's latest 50 Actions runs are all `startup_failure`.
- Main retains `docs/brand/the-prestigious-house-of-dusse.md` and the separate `docs/archive/house-of-avalon/README.md`. Preserve the exact Dusse identity and its independent status; House of Avalon remains a separate historical archive. Do not infer legal-status transfer. Reconcile the omission of Dusse from the master product registry and public directory before portfolio acceptance.

### Owner/operator handoff and disposition

1. GitHub owner/admin: inspect Actions admission, hosted-runner entitlement/quota, org restrictions, runner groups and effective branch protection; obtain provider-side evidence or GitHub Support escalation. Do not activate G02.
2. Cloudflare owner: resolve Super Administrator MFA/recovery and enforce account MFA; independently verify.
3. Host operator: provide an existing disposable unprivileged execution host with no host mounts and deny-by-default egress before running PR #615 or any isolated validation.
4. Architecture/product owner: ratify one data authority per domain, canonical SAAAE implementation, registry node types/parentage, and Dusse's public/gated presentation.
5. Firebase owner: provide an approved non-production project identity/alias and rules path; no production project may be selected by inference.
6. AppDeploy owner: run fresh native QA for Studio/Kotton asset-serving and complete Kotton public-bundle privacy review without replacing existing assets.

No runner, workflow, secret, branch rule, provider setting, database schema, route, DNS record, production Worker, payment, wallet, reward, or production deployment was changed by this audit. **PROTECTED HOLD remains; G02 remains FAIL / UNVERIFIED.**
