# LINGO Foundation Operations Centers
Version: 1.0 | Status: Proposed operating blueprint — not production authorization
Owner: LINGOlegacy_MASTER | Source of truth: GitHub | Date: 2026-11-12

## 1. Purpose
Establish one coordinated recovery, construction, maintenance and release system for The LINGO Legacy portfolio. Every work item must map to a repository/service, environment, owner, dependency, change record and evidence. Production remains protected until all release gates pass.

## 2. Three operating centers
### Main Hub — command and control
Portfolio/service map; live health states (healthy, degraded, blocked, maintenance, unknown); work orders; incident command; dependency graph; change calendar; risk register; decision log; cost controls; owner/escalation directory. UNKNOWN must never be represented as healthy. Queued CI is not a successful test.

### Resource Center — controlled inventory
Catalog repositories, branches, packages, artifacts, cloud accounts, projects, zones, domains, DNS, Workers, Firebase services, databases, APIs, integrations, environments, tools, licenses, quotas, budgets, backups, runbooks and vendor contacts. Credentials are represented only by secret references and metadata; secret values remain in approved secret stores. Every resource needs a unique ID, owner, environment, criticality, dependencies, lifecycle state, last verified date and evidence.

### Release Center — delivery and certification
Own build orchestration, immutable artifact promotion, lint/tests, accessibility, compatibility, security/dependency/secret/malware scans, SBOM/provenance, staging validation, release candidate review, approvals, maintenance window, canary rollout, health probes, rollback and post-deployment acceptance. A green build alone is not production approval. Missing, stale or mismatched evidence blocks release.

## 3. Construction sites and work crews
| Site | Scope | First deliverable |
|---|---|---|
| S0 Command & Governance | Main Hub, ownership, status and decisions | Portfolio/service registry |
| S1 Source & Repository | Inventory, duplicates, branches and PRs | Canonical source map and safe cleanup plan |
| S2 CI/CD & Build | Actions startup, runners, reproducible builds | Hosted smoke and runner evidence |
| S3 Edge & Network | Cloudflare Worker, routes, DNS, assets, headers, failover | Verified edge and asset boundary |
| S4 Firebase & Data | Hosting, config, Auth, DB, Storage, rules | Environment contract and restore proof |
| S5 Identity & Security | IAM, least privilege, secrets, scanning | Security baseline and remediation queue |
| S6 Product & Application | Web, Flutter, APIs, games and SDKs | Product readiness matrix |
| S7 Trust & Content Safety | Moderation, reporting, appeals, age/privacy | Policy test matrix and false-positive review |
| S8 Observability & Reliability | Logs, metrics, traces, alerts, SLOs | Health dashboard and runbooks |
| S9 Resource & Cost | Inventory, quotas, free-tier controls | Resource register and spend limits |
| S10 Release & Recovery | Staging, gates, backups, rollback, DR | Release Center and tested recovery plan |

A work crew is a logical ownership group until real people or automation agents are assigned. Do not invent staffing or claim a site is staffed when it is not.

## 4. Primary and alternate routes
Side doors mean approved secondary access and recovery paths, not hidden backdoors or authentication bypasses. For every critical service document the primary traffic/deploy path, secondary provider/region path where supported, MFA-protected least-privilege admin path, tested recovery path and emergency break-glass path. Break-glass requires dual authorization, time limits, alerting and post-use review. No alternate route may bypass authentication, authorization, rate limits, safety, privacy, logging or release approvals. Do not create duplicate DNS authorities or production writers without an architecture decision.

## 5. Environmental Management System
Provision from reviewed version-controlled configuration; record owner/purpose/region/data classification; apply least privilege and environment-specific secret references; validate configuration and drift; monitor availability, latency, errors, security, capacity and cost; patch through reviewed changes; back up and test restores; promote immutable artifacts; retire only after dependency checks, retention and approval; record evidence, exceptions and expiry dates.

## 6. Checkpoint sequence
CP-00 Scope/ownership inventory. CP-01 Git integrity/source authority/branch protection. CP-02 Isolated malware scan. CP-03 Secret exposure/credential hygiene. CP-04 Dependencies/licenses/SBOM/supply chain. CP-05 Moderation, overblocking, age and appeal tests. CP-06 Static analysis, tests and accessibility. CP-07 Environment, DNS, edge and configuration drift. CP-08 Identity, authorization, privacy and data rules. CP-09 API and third-party contracts. CP-10 CI/CD and artifact provenance. CP-11 Runtime, observability, capacity and cost. CP-12 Repair, restore, rollback and regression. CP-13 Acceptance and maintenance.

Each checkpoint records exact scope and commit/environment, method/tool version, timestamp, result, severity, confidence, evidence URI/hash, owner, remediation change, rollback and retest. Not-run and unavailable remain explicit states.

## 7. Recovery sequence
### P0 Preserve and contain
Keep production promotion and destructive cleanup disabled. Preserve last-known-good refs, backups and artifacts. Capture DNS, Cloudflare, Firebase and GitHub state before edits. Rotate only confirmed exposed credentials through approved secret management.
### P1 Unblock source and build
Reconcile competing Firebase Hosting fixes into one reviewed patch. Publish only a built public output directory, never repository root. Replace Cloudflare root asset scope with a narrow tested public build directory/allowlist. Diagnose GitHub Actions startup failures from runner/service/organization evidence; separate hosted smoke from G02 certification. Build Flutter web and validate Firebase options without exposing credentials.
### P2 Security and runtime
Run actual isolated malware scanning; record tool/version/scope/results. Run secret and dependency scanning; disposition findings and rotate confirmed exposures. Verify Firebase rules, Auth, database access, Cloudflare routes, Worker bindings and CSP. Add health probes, structured logs, alerts and SLOs.
### P3 Portfolio consolidation
Inventory all repositories, branch/PR pages, workflows, deployments and unique commits. Classify canonical, supporting, archived, duplicate candidate or unknown. Compare diffs before consolidating. Delete no branch/repository until unique work is preserved and owner approval recorded.
### P4 Controlled release
Validate staging with synthetic data; test restore and rollback; produce commit-bound evidence; obtain explicit release acceptance; use phased rollout with automatic stop/rollback criteria.

## 8. Service readiness contract
Each service documents liveness/readiness, version/commit/build ID/environment, dependency status without secret leakage, latency/error thresholds, capacity, safe degraded mode, owner, escalation, runbook and rollback target. A service is not READY if a critical dependency is unavailable, configuration is unknown or evidence is stale.

## 9. Definition of done
Every repository and production service has an owner and lifecycle state; CI produces successful reproducible commit-correlated artifacts; Firebase and Cloudflare publish only intended public artifacts; scans have real execution evidence and findings are dispositioned; identity/data rules/backups/restore tests pass; Main Hub, Resource Center and Release Center have authoritative records; alternate access/recovery is tested and audited; staging passes functional/security/accessibility/performance acceptance; rollback and incident response are exercised; production release is separately approved and post-release checks pass.

## 10. Current known blockers
Firebase Hosting on main uses public: .; existing repair proposals require reconciliation. Firebase project config points to lingo-legacy-production while Flutter Firebase option placeholders remain. Cloudflare Worker assets use repository root; .assetsignore is a denylist, not proof of a safe public build. Sampled Actions workflows show startup_failure with no job steps; CI is not certified. G02 remains FAIL / UNVERIFIED. Malware scan execution and GitHub code-scanning/Dependabot alert visibility have not been verified. These are observed facts, not proof that all other systems are safe or unsafe.

## 11. Change control
Changes go through a branch, reviewable diff, linked issue, automated checks and rollback note. Never bypass protected review, delete branches/repositories before preservation and dependency analysis, publish repository root, put secret values in source/tickets/logs/artifacts, bypass safety/privacy controls, or activate billing/real-money functions/production data migrations without separate approval.

## 12. Immediate work orders
1. Create authoritative repository/service/environment inventory.
2. Reconcile Firebase PRs #545, #542, #541, #539 and #533.
3. Repair and prove hosted Actions smoke; separately certify G02.
4. Establish a dedicated public build output for Cloudflare Worker assets.
5. Build Main Hub, Resource Center and Release Center views from the registries.
6. Execute checkpoint scans and open severity-ranked remediation issues.
7. Produce staging, backup/restore and rollback evidence before release review.