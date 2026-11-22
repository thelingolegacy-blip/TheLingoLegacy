# LINGO Unified Operations Control Runbook v1

**Status:** Operational procedure proposal; use for controlled execution and evidence capture.  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`  
**Control tower:** Issue #517  
**Control interface proposal:** PR #523 (read-only; draft; not deployed)  
**Registry / execution router proposal:** PR #511 (draft; unmerged)  
**Release posture:** PROTECTED HOLD; G02 FAIL / UNVERIFIED; no production promotion.  
**Cost posture:** $0 incremental spend unless separately approved.

## 1. Purpose and precedence

This runbook unifies the operating cadence, control runs, verification evidence, change procedures and escalation path. It is an index and execution procedure, not a replacement for the detailed standards below.

Precedence when documents overlap:
1. Approved architecture decision records and current repository policy.
2. `docs/enterprise/VERIFICATION_SECURITY_AND_RELEASE_GATES.md` (G00–G11 and release acceptance).
3. `docs/operations/G02-CI-EVIDENCE-INTAKE.md` (runner/CI evidence and startup-failure diagnosis).
4. `docs/operations/LINGO-MASTER-EXECUTION-ROUTER-2026-11-08.md` (workstream ownership and dependencies).
5. `docs/operations/WAVE-0-4-EXECUTION-CHECKLIST.md` (wave exit criteria).
6. This runbook (cadence, orchestration, control-run records and operational handoff).
7. Control Room UI, if deployed, is a presentation surface only; it never overrides raw provider evidence or release gates.

Conflicts are recorded in the decision log and resolved through an ADR. Do not silently reconcile conflicting architecture claims.

## 2. Operating principles

- GitHub is the source of truth for code, approved procedures, change records and evidence references.
- Cloudflare is the intended authoritative DNS/edge platform; verify live provider state before any route or deployment action.
- Firebase and Supabase remain an unresolved authority decision until an approved ADR names identity, profile, transactional data, authorization and environment ownership. No dual-write or second identity system.
- Read-only discovery is the default. A control run may inspect and report; it does not imply permission to mutate.
- Every result is scoped to an exact repository, commit, environment, resource, timestamp and test.
- Distinguish CONFIGURED, REACHABLE, EXECUTED, VERIFIED, INDEPENDENTLY ACCEPTED and PRODUCTION. Never promote one state to another by inference.
- Preserve last-known-good, backups, logs, artifact hashes and rollback references.
- No secrets, tokens, private customer data or personal identifiers in GitHub artifacts or logs.
- Free-tier-first. No paid plan, credits, seat, resource, usage top-up or spend without separate approval.
- No merge, deployment, DNS/Worker/Access policy change, backend migration, runner registration, payment activation or production release without change-specific approval and evidence.

## 3. Control-run types

### CR-DAILY — Daily operational control run
Purpose: detect drift and new blockers without changing state.

1. Capture UTC timestamp, operator/agent, repository default branch and current main SHA.
2. Review open P0/P1 issues, open/draft PRs, recent commits, failed workflow runs and required-check state.
3. Inspect latest relevant workflow runs: run ID, event, commit SHA, conclusion, jobs, runner ID/name, labels, step outcomes, logs and artifacts.
4. Refresh read-only provider observations for Cloudflare, AppDeploy, backend, monitoring and integrations only where access is already authorized.
5. Compare route/runtime/deployment observations with the source registry and identify drift.
6. Review error/availability evidence, security alerts, data/backup freshness and budget/credit status where connected.
7. Update the evidence ledger and control tower with findings, unknowns, owner, next action and blocked dependencies.

Output: daily control brief, evidence links, risk deltas and prioritized queue. A daily run does not restart services or dispatch workflows automatically.

### CR-EXTENDED — Extended verification run
Purpose: perform deeper, commit-bound validation for one named workstream or candidate.

1. Freeze the target SHA and environment; record the scope and exclusions.
2. Validate source manifests, schemas, route tables, dependency references and configuration consistency.
3. Run local/portable tests where possible without provider credentials; preserve exact commands, tool versions and outputs.
4. For CI, verify actual job creation before inspecting steps; capture runner assignment and artifact retrieval independently.
5. For web/runtime, classify routes as public, authenticated-user, operator-only or internal; probe only approved paths.
6. For backend/identity, validate project identity, environment separation, rules, authorization and negative tests; do not infer from a healthy project label.
7. For integrations, verify provider identity, scopes, environment, data direction, contract, health check, cost ceiling and rollback.
8. Review security, privacy, accessibility, performance, data integrity and recovery evidence relevant to the candidate.
9. Record each check as PASS, FAIL, BLOCKED, NOT RUN or UNKNOWN with evidence reference and expiry.
10. Obtain independent review before marking VERIFIED or ACCEPTED.

Output: extended verification report bound to source SHA, artifact digest and environment. No production action is implied.

### CR-CHANGE — Controlled repair / change run
Purpose: make one narrowly scoped, reversible change after authorization.

1. Open or update a change record with owner, exact resource, environment, reason, risk and approval reference.
2. Capture before-state, current version, route/binding/configuration and relevant logs.
3. Confirm backups, rollback path, budget, least-privilege credentials and change window.
4. Review exact diff/commands; isolate staging from production.
5. Execute only the approved change. Do not bundle unrelated repairs.
6. Capture after-state, logs, hashes, test outcomes and provider resource IDs.
7. Run smoke, regression, security and negative checks appropriate to the change.
8. Roll back immediately if safety, security, data integrity, route ownership or release invariants fail.
9. Obtain independent acceptance; update inventory, runbooks and next maintenance date.

A restart is an attempted remediation, not proof of recovery. No runner restart or re-registration until host identity, existing registration and credential exposure have been reconciled.

### CR-INCIDENT — Incident / recovery run
Purpose: contain and restore service while preserving evidence.

1. Declare severity, incident commander, affected surfaces, UTC start and user impact.
2. Stop unrelated changes and preserve current state.
3. Determine whether the incident is availability, security, data integrity, deployment drift, provider outage or cost abuse.
4. Protect users and data; revoke/disable only under authorized incident procedures.
5. Restore from last-known-good or execute approved rollback; do not improvise production mutations.
6. Verify health, routes, auth, data integrity, payments-disabled behavior and monitoring.
7. Preserve logs, hashes, timestamps, provider references and communications.
8. Complete root-cause analysis, corrective actions, owner and due date.

### CR-RELEASE — Release-candidate acceptance run
Purpose: decide whether a specific candidate may be considered for promotion.

Run G00–G11 in order. Upstream missing evidence blocks downstream acceptance. Confirm exact commit and artifact digest, environment, route ownership, security/privacy, backup/restore, monitoring, rollback, independent review and explicit executive authorization. The Control Room's aggregate status is never the release decision.

## 4. Workstream orchestration and dependency order

Parallelize independent discovery and static analysis; serialize shared foundations.

| Priority | Workstream | Parallel / dependent work | Exit evidence |
|---|---|---|---|
| P0 | Governance and source control | Reconcile PRs #510–#523, duplicate fixes, main protection, owners and ADRs | One canonical plan, effective branch policy, evidence ledger |
| P0 | CI / G02 | Inspect Actions service boundary, runner policy and host inventory; keep hosted smoke separate | Instantiated job, runner identity, steps, logs, artifact/hash, independent acceptance |
| P0 | Website / edge integrity | Classify public/private routes; reconcile DNS, Worker routes, assets and versions | Reviewed route matrix, exact asset manifest, active version provenance, safe public probe |
| P0 | Firebase Hosting publication | Trace build output and inspect artifact; no assumed public directory | Reproducible build, reviewed allowlisted manifest, route tests |
| P1 | Identity / backend | Resolve Firebase-vs-Supabase ADR before verifier or schema implementation | Approved authority, staging project proof, authN/authZ negative tests |
| P1 | API / security | Endpoint inventory, cryptographic auth, shared rate limits, CSP report-only | Threat model, negative tests, reviewed policy, no production mutation |
| P1 | Data / wallet | Server-owned ledger, idempotency, backup/restore and reconciliation | Property/concurrency tests, immutable ledger invariants, restore evidence |
| P1 | Observability | Map Datadog/Amplitude to named services and privacy-approved events | SLOs, alert routes, sanitized telemetry, retention/cost limits |
| P2 | Web / mobile / games | Product vertical slices against stable contracts | Product-specific build, browser/device/gameplay QA, accessibility and support |
| P2 | Commerce / creative / AI | Shopify, Stripe sandbox, creative tools and AI adapters under individual approvals | Rights, legal, security, quota/cost, functional and rollback evidence |

## 5. Current blockers to carry forward

Refresh each item before action; this list is a control index, not a claim of live status:
- GitHub Actions pre-job `startup_failure`; no jobs/logs/artifacts in the last inspected run set. Provider/account attribution remains UNKNOWN.
- G02 persistent runner identity, host/service state and assignment remain FAIL / UNVERIFIED.
- PRs #510–#516 and #523 are proposals; review overlaps and source SHAs before consolidation.
- Cloudflare route inventory, Worker route drift, asset publication scope, active deployment provenance and public-vs-Access route intent require provider-side verification.
- Firebase Hosting root publication scope is unresolved; do not deploy while output path is ambiguous.
- Gateway authentication verifier is intentionally unconfigured; do not call Bearer-header presence authentication.
- Shared API rate limits and CSP require endpoint inventory and staging/report-only evidence.
- Firebase/Supabase authority and environment ownership require an ADR.
- AppDeploy account ambiguity, Render workspace selection and Vercel retirement/rate-limit history require explicit reconciliation.
- Payments, live commerce, cash-out, billing and production release remain disabled/held unless separately approved.

## 6. Standard evidence record

Every control run records:
- `control_run_id`, run type, UTC start/end, operator/agent and authorization reference.
- Repository, branch, exact commit SHA, PR/issue, environment and resource identifiers.
- Scope, exclusions, commands/tool versions, raw result references and provider observation timestamps.
- For CI: workflow/run/attempt/job IDs, runner ID/name/labels, step results, log URL, artifact ID/name and SHA-256.
- For builds/deployments: build ID, artifact digest, deployment/version ID, route/binding snapshot and rollback reference.
- For security/data: finding ID, severity, affected asset, sanitized evidence, remediation and residual risk.
- Result per check: PASS / FAIL / BLOCKED / NOT RUN / UNKNOWN; reviewer; acceptance; expiry/recheck date.
- Follow-up issue, accountable role, due condition and next control run.

Do not fabricate missing values or hashes. If a log/artifact cannot be retrieved, record NOT AVAILABLE and keep the gate blocked.

## 7. Operational cadence

- Daily: CR-DAILY; failed jobs, service health, critical security alerts, drift, cost/credit thresholds and open P0/P1.
- Per change: CR-CHANGE before/after record, test evidence, rollback and independent review.
- Weekly: CR-EXTENDED for active critical workstreams; vulnerability/dependency review, access changes, backup freshness, cost/quota and registry drift.
- Monthly: restore drill, access recertification, provider/vendor reconciliation, SLO/performance review and incident tabletop.
- Quarterly: security/continuity review, disaster recovery exercise, vendor exit review and qualified physical-site/equipment inspection where applicable.
- Release candidate: CR-RELEASE; repeat on any source SHA, artifact, environment or material configuration change.

Cadence is a procedure, not a scheduled automation. Create monitoring/reminder automations only after the user opts in and the required schedule/timezone are confirmed.

## 8. Stop conditions and escalation

Stop and preserve evidence if:
- Actions fails before job creation and no provider-level cause is known.
- Runner identity, host or token safety is uncertain.
- A route/Worker deployment could alter un-reconciled production routes.
- Public artifact contents or Firebase Hosting output scope are unknown.
- Backend authority, identity issuer/audience or authorization model is unresolved.
- Backup/restore or rollback cannot be demonstrated.
- Secrets, personal data or restricted diagnostics may be exposed.
- Cost is unapproved, account/workspace identity is ambiguous, or required permission is absent.
- A physical/electrical/mechanical hazard or permit/licensing issue exists.

Escalate provider/account controls to the authorized account administrator or provider support. Escalate physical work to licensed professionals. Never bypass access controls, safety interlocks, approval gates or release requirements.

## 9. Final control state vocabulary

- `OBSERVED`: a source/provider returned a value at a recorded time.
- `CONFIGURED`: a setting or binding exists; behavior is not yet proven.
- `REACHABLE`: an endpoint answered; business function is not certified.
- `EXECUTED`: a real job/process ran and has retrievable evidence.
- `VERIFIED`: defined checks passed against exact source/artifact/environment.
- `ACCEPTED`: independent reviewer accepted evidence and residual risks.
- `PRODUCTION`: separately authorized and confirmed live.
- `BLOCKED`: a required dependency, permission or control is absent.
- `UNKNOWN`: evidence is insufficient or stale.

**Current default remains PROTECTED HOLD.** A control run may update truth; it cannot grant itself authority to promote a release.
