# LINGO Master Execution Router — 2026-11-08

Status: EXECUTION PLAN / ROLE ASSIGNMENTS / NOT A COMPLETION CERTIFICATE
Repository: thelingolegacy-blip/TheLingoLegacy
Control branch: feat/lingo-master-registry-wave0-2026-11-08
Current observed head before this artifact: a74525f1e4898e7edc9997eb2ed76ba7790b5450
PR: #511 (open, draft, unmerged)
Master recovery issue: #480 (open)
Production: PROTECTED HOLD
Release promotion: NOT AUTHORIZED

## 1. Operating rules

1. Workstreams execute in parallel where their inputs are independent. Shared foundations are serialized by explicit dependency gates.
2. Role names below are functional assignments, not claims that a human or agent has been added to GitHub as an assignee.
3. Every work item must produce a repository artifact, reproducible command/test, evidence record, and named acceptance decision.
4. A task is not complete because a document exists, a provider shows a ready label, a build is proposed, or a workflow is green without retrievable job evidence.
5. Use GitHub as canonical source. Keep provider state read-only until the specific change has a reviewed diff, rollback plan, and required approval.
6. No secrets in source, no credential values in evidence, no duplicate runner registration, no direct client writes to wallet/reward balances.
7. No production route/DNS/Worker/Firebase/auth/payment/billing/secret/policy/runner mutation in this plan. These require change-specific approval after preflight.
8. Free-tier-first. No new paid service, usage top-up, or billing change without cost approval.
9. The user remains executive decision owner. Release manager cannot self-approve a production promotion.

## 2. Workstream assignments

| ID | Functional owner | Parallel scope | Required output | Acceptance owner |
|---|---|---|---|---|
| MC-01 | Master Control / Chief of Staff | Product registry, cross-surface matrix, dependencies, risk and decision logs, priority queue | Registry deltas, dependency graph, daily control brief | Executive decision owner |
| GOV-02 | Governance & Release Manager | Branch protections, evidence standards, change records, release gates, exception register | Gate definitions, protected-change templates, signed acceptance record | Independent reviewer + executive |
| CI-03 | GitHub CI/SRE Lead | Workflow syntax, startup-failure root cause, hosted smoke, G02 evidence, artifacts | Reproducible CI diagnosis, passing jobs with logs/artifacts and commit correlation | Independent CI reviewer |
| RUN-04 | Runner/Build Infrastructure Lead | Runner image, host prerequisites, service health, registration lifecycle, token hygiene | Host inventory, service evidence, registration proof, smoke evidence | SRE reviewer |
| EDGE-05 | Cloudflare Edge Lead | 21 route inventory, wildcard/root overlap, Worker versions, DNS/origin, observability | Route matrix, version provenance, origin validation, rollback map | Independent edge reviewer |
| DATA-06 | Firebase/Data Platform Lead | Project/app identity, config placeholders, rules, indexes, Auth, App Check, backups | Project identity proof, ruleset, emulator/security tests, backup/restore evidence | Security/data reviewer |
| API-07 | Platform API Architect | API contracts, schema/versioning, error model, idempotency, authZ, rate limits | OpenAPI/contracts, compatibility tests, threat model | API reviewer |
| ID-08 | Identity & Access Lead | LINGO ID, session lifecycle, MFA/recovery, roles, consent, audit events | Identity flows, abuse cases, authorization tests | Security reviewer |
| WAL-09 | Wallet/Ledger Lead | Immutable ledger, idempotency, balance projection, reconciliation, non-cash-out controls | Ledger schema, invariants, property tests, reconciliation report | Finance/compliance + security |
| WEB-10 | Web Platform Lead | Next/React surfaces, routing, responsive UI, accessibility, performance, browser QA | Surface test matrix, screenshots, network/error logs, accessibility results | Product QA |
| MOB-11 | Flutter Mobile Lead | iOS/Android builds, Firebase binding, deep links, secure storage, offline behavior | Reproducible builds, device matrix, crash/network/security evidence | Mobile QA |
| GAME-12 | Game Systems Lead | Shared engine contracts, deterministic loop, economy boundaries, saves, telemetry | Per-game build/test packs and feature acceptance | Game QA + product owner |
| ART-13 | Art/Audio/Asset Pipeline Lead | Original visual/audio assets, LFS, naming, provenance, compression, licensing | Asset manifests, license/provenance records, platform validation | Creative director + legal |
| CONTENT-14 | Library/Media & Privacy Lead | Books, film/media, age/privacy, family/minor data, editorial rights | Content QA, rights register, privacy sign-off | Legal/privacy reviewer |
| BIZ-15 | Business Operations Lead | Commerce, subscriptions, donations, apparel, support, bookkeeping, vendor costs | Operating procedures, unit economics, vendor/cost register | Executive + finance |
| SEC-16 | Security/Privacy Lead | Threat modeling, secrets, access control, dependency risk, incident response | Security findings, remediation proof, residual-risk acceptance | Independent security reviewer |
| QA-17 | Independent Quality Lead | Cross-product test design, regression, accessibility, browser/device verification | Test reports linked to commit/build/deployment | Independent reviewer |
| LAUNCH-18 | Launch/Support Lead | Launch checklist, support readiness, analytics, rollback, incident communications | Launch dossier and rollback rehearsal | Executive release authority |

## 3. Priority queue and dependency order

### P0 — Restore trustworthy execution (parallel diagnosis; no production changes)
- CI-03: investigate repeated GitHub Actions startup_failure events; inspect workflow definitions, runner groups/labels, repository policy, service boundary and GitHub-side control-plane evidence.
- RUN-04: verify whether the required runner exists and is healthy using an authorized host path; do not register or reset a runner until existing registration and token exposure are reconciled.
- GOV-02: establish effective branch protection/ruleset requirements and identify the authorized control path; current connected GitHub read access has not demonstrated a working write path.
- SEC-16: inspect token/secret exposure history and define rotation/revocation plan without printing secret values.
- MC-01: maintain evidence ledger and correlate each run, commit, job, artifact and actor.

Exit: at least one hosted static validation job actually instantiates and completes with logs; G02 separately proves runner_id > 0, non-empty runner_name, executed steps, logs/artifacts and commit correlation. Until then G02 remains FAIL/UNVERIFIED.

### P1 — Certify infrastructure foundations (can proceed in parallel after P0 diagnosis)
- EDGE-05: reconcile the 21 routes, apex root/wildcard overlap, Worker active deployment IDs vs uploaded versions, DNS records and origin validity. The observed apex A record 192.0.2.0 is TEST-NET-1 and must be treated as an origin blocker until explained.
- DATA-06: identify the authoritative Firebase project and app IDs; replace placeholders only after project identity is verified; define least-privilege rules and emulator tests; narrow Hosting publication scope from repository root.
- API-07: finalize versioned API contracts and auth/error/rate-limit behavior.
- SEC-16: threat model public surfaces, auth, storage, secrets and supply chain.

Exit: source-to-runtime identity is proven, config is non-placeholder, rules are tested, routes resolve to intended runtime, origin is valid, observability is available, and rollback is documented.

### P2 — Shared platform services
- ID-08 depends on DATA-06 and API-07.
- WAL-09 depends on ID-08 and API-07.
- WEB-10 and MOB-11 consume the versioned contracts; they may build isolated UI shells in parallel but cannot claim integrated readiness until identity/API tests pass.
- MC-01 maps every product to its surface, repo path, runtime, route, API, identity/data dependencies, assets, test pack and release gate.

Wallet invariants: append-only ledger, idempotent mutations, server-authoritative balance, atomic transaction semantics, reconciliation, audit trail, anti-abuse controls, no cash-out, and non-redeemable virtual Lingo Coins unless separately approved by legal/compliance.

### P3 — Product-world completion
- GAME-12 creates a product-by-product feature/test matrix for LINGOslots, LINGOarcade and relevant interactive worlds.
- ART-13 builds original asset pipelines and verifies rights/provenance; licensed characters/assets remain excluded until rights are established.
- CONTENT-14 handles KottonsCode and LINGOlibrary/media editorial, privacy and rights review.
- WEB-10/MOB-11 integrate each product only against certified shared services.
- Product owners supply acceptance criteria, not just feature requests.

Exit: every product has an executable build/test, deterministic gameplay or journey tests as applicable, asset provenance, privacy/security checks, accessibility checks and independent QA.

### P4 — Business and launch readiness
- BIZ-15 verifies pricing, provider dependencies, costs, tax/bookkeeping and support processes.
- LAUNCH-18 assembles per-product launch dossiers, telemetry, support coverage, rollback and incident runbooks.
- QA-17 performs independent end-to-end verification.
- GOV-02 checks all mandatory release gates.
- Executive release authority makes the promotion decision.

Exit: every critical gate is evidenced and independently accepted; no unresolved critical/high security, privacy, legal, data-loss, payment or routing blocker.

## 4. Relative execution schedule

This schedule is elapsed work windows, not a claim that work has already been scheduled in external calendars.

| Window | Parallel assignments | Required checkpoint |
|---|---|---|
| T+0–2 hours | MC-01, CI-03, RUN-04, GOV-02, SEC-16 | Baseline refresh, workflow/job diagnosis, runner/policy access gap, security exposure triage |
| T+2–8 hours | EDGE-05, DATA-06, API-07, WEB-10, MOB-11 | Route/version map, Firebase identity plan, API contract review, web/mobile build inventory |
| T+8–24 hours | ID-08, WAL-09, GAME-12, ART-13, CONTENT-14, BIZ-15 | Shared service specs, per-product feature and asset matrices, business/control gaps |
| T+24–48 hours | QA-17, LAUNCH-18, all workstream leads | Integrated staging evidence, regression, privacy/security, rollback and support dossier |
| T+48 hours onward | GOV-02 + executive release authority | Gate-by-gate acceptance; promote only after all required evidence and approvals |

If an upstream dependency fails, downstream teams continue only on isolated mock/emulator/staging work and label it clearly as non-integrated. No workstream may silently bypass a failed gate.

## 5. Routing and change-control rules

- Source changes: GitHub feature branch → pull request → CI → independent review → merge only after required controls are restored.
- Edge changes: inventory → intended route map → isolated route probe → reviewed diff → approved maintenance window → health checks → rollback readiness.
- Firebase changes: authoritative project verification → emulator tests → rules/index review → backup/restore check → approved staging deployment → production only after gate.
- Identity and wallet: contract/security review → emulator/integration tests → abuse and idempotency tests → reconciliation → no cash-out invariant verification.
- Mobile: reproducible iOS/Android build → signed artifact custody → device matrix → privacy/security checks → staged rollout.
- Games: original assets and deterministic test harness → feature acceptance → economy/age/legal review → isolated release candidate.
- Launch: independent QA report → release dossier → explicit executive decision.

## 6. Required evidence schema

Every work item records:
- Work item ID and functional owner
- UTC timestamp and environment
- Repository, branch, commit SHA
- Change type and exact paths/resources
- Command or test executed and exit status
- Workflow run/job IDs, runner ID/name where relevant
- Logs and artifact references
- SHA-256 for retained artifacts
- Expected vs observed result
- Reviewer and acceptance decision
- Rollback plan and residual risk
- Authorization/actor for any state change

## 7. Current verified blockers at router creation

- PR #511 is open, draft and unmerged.
- Latest observed branch head before this router: a74525f1e4898e7edc9997eb2ed76ba7790b5450.
- Latest three observed CI runs on that head: 42537744279 Static CI, 42537744955 Crimson Smoke UI, 42537745692 G02 Runner Image Build; all completed with startup_failure. These runs did not provide evidence of job execution.
- Issue #480 remains open.
- The connected GitHub surface has not provided runner inventory, runner reset/registration, workflow dispatch or branch-protection write capability.
- Cloudflare route/DNS/Worker state remains inventory-only; no mutations authorized or performed.
- Firebase project/app identity and runtime security remain unverified; placeholder config and broad root Hosting scope remain blockers.
- AppDeploy build credits are exhausted; no top-up or billing action is authorized.
- Production remains PROTECTED HOLD; G02 FAIL/UNVERIFIED; downstream release gates remain held.

## 8. Definition of done

The ecosystem is not "complete" until each registered product has:
1. A named functional owner and accepted scope.
2. A source-controlled implementation tied to a commit.
3. A reproducible build and passing automated tests.
4. A retrievable artifact with integrity hash.
5. Verified runtime, route and API integration.
6. Identity, data, authorization and privacy controls.
7. Accessibility, device/browser and regression evidence.
8. Legal/content/asset rights clearance where applicable.
9. Monitoring, support, incident and rollback readiness.
10. Independent QA acceptance and explicit release authorization.

This router assigns responsibility by role and sequence. It does not assert that external agents, people, schedules, runners or deployments have been activated.
