# LINGO MASTERFORGE
## Unified Enterprise Build, Host, Security, CI, Verification and Release Operating System

**Status:** Architecture and operating contract  
**Canonical owner:** THE LINGO LEGACY  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`  
**Blueprint authority:** LINGO Legacy Master Blueprint, sections 00–40  
**Release authority:** LINGO FINAL LAW and the G00–G11 gate register  
**Operating principle:** Launch what is safe; complete what is unfinished; improve what is touched; protect what already works.

> MASTERFORGE coordinates work. It does not manufacture evidence, bypass approvals, or convert configuration into operational completion.

---

## 1. Mission

LINGO MASTERFORGE is the unified operating system for planning, building, provisioning, configuring, securing, testing, documenting, integrating, certifying, operating, and improving every LINGO Legacy platform and product.

It preserves the original program / phase / wave / sprint / build hierarchy and the 44-page master blueprint (sections 00–40). It links every requirement to an owner, implementation location, dependency, execution record, independent verification, acceptance decision, and release gate.

It is a control plane and execution contract—not a claim that every subsystem is already installed or active.

## 2. Command structure

| Role | Accountability |
|---|---|
| Owner / Release Authority | Approves irreversible changes and production promotion |
| MASTERFORGE Control | Maintains priorities, dependencies, work queues and gate state |
| Eliza / LLG orchestration | Routes bounded work to specialized agents and reconciles results |
| Domain executor | Implements one assigned work package in its authorized scope |
| Host operator | Provisions and operates authorized machines and runner services |
| Security authority | Reviews SAAAE controls, identity, privacy and threat remediation |
| Independent verifier | Repeats checks using evidence independent of the implementer |
| Release authority | Accepts or rejects each gate and authorizes promotion separately |

Agents may research, draft, code, test in isolated environments, and prepare change proposals within granted access. An agent cannot self-approve its own security or release evidence.

Every work item must have: unique ID; blueprint section(s); scope; accountable owner; executor; repository/path; environment; prerequisites; risk class; planned change; test plan; evidence URI; independent verifier; disposition; rollback; and timestamp.

## 3. Twelve operating divisions

1. **MASTER CONTROL** — canonical registry, work intake, prioritization, dependency graph, status and decision log.
2. **BLUEPRINT & TRACEABILITY** — sections 00–40, original hierarchy, requirements-to-code-to-test mapping.
3. **FORGE / BUILD** — reproducible builds, toolchain pinning, dependency integrity, compilation and packaging.
4. **HOST & INFRASTRUCTURE** — Linux hosts, network, DNS, NTP, storage, capacity, service lifecycle and backups.
5. **G02 RUNNER CERTIFICATION** — runner installation, registration, labels, polling, identity, sentinel and evidence.
6. **CI/CD** — Actions admission, workflow graph, job execution, checks, logs, artifacts, provenance and staging delivery.
7. **SAAAE SECURITY** — server-side authorization, authentication, approval records, audit enforcement, privacy and threat controls.
8. **DOCUMENTATION & KNOWLEDGE** — architecture records, install guides, runbooks, diagrams, operator procedures and recovery guides.
9. **INTEGRATION & DATA** — identity, APIs, contracts, Firebase, Cloudflare, databases, migrations, events and synchronization.
10. **PRODUCT LAB** — independent implementation of each game, publishing, commerce, media, learning and operations product.
11. **QUALITY & CERTIFICATION** — unit, integration, contract, security, accessibility, browser, device, resilience and regression testing.
12. **RELEASE COMMAND** — G00–G11, change approval, staged promotion, live validation, rollback and final acceptance.

Each division owns a queue and produces machine-readable status plus human-readable evidence. Shared dependencies are explicit; one product's PASS never certifies another product.

## 4. Standard work lifecycle

All work follows this state machine:

`INTAKE → DISCOVERED → DESIGNED → APPROVED_FOR_SCOPE → IMPLEMENTING → BUILT → TESTED → INDEPENDENTLY_VERIFIED → ACCEPTED → RELEASE_ELIGIBLE → PROMOTED`

Alternate terminal or holding states: `BLOCKED`, `FAILED`, `REJECTED`, `DEFERRED`, `ROLLED_BACK`.

Rules:
- `CONFIGURED` is a property, not a completion state.
- `BUILT` requires an identified artifact and source commit.
- `TESTED` requires actual executed tests and retrievable results.
- `INDEPENDENTLY_VERIFIED` requires a verifier and reproducible evidence.
- `ACCEPTED` requires an authorized acceptance decision.
- `PROMOTED` requires a recorded deployment identity, environment, timestamp and rollback reference.
- Missing, stale, inaccessible or contradictory evidence means `UNKNOWN` or `BLOCKED`, never PASS.

## 5. Host establishment and operations standard

A host is not operational merely because a cloud resource or configuration record exists.

### Provisioning checklist
- Confirm owner, provider, account/project, region, OS image, resource size, network boundary, cost ceiling and environment.
- Obtain explicit authorization before creating a billable resource or changing provider policy.
- Verify host is running, reachable through approved SSH or management access, and correctly identified.
- Apply supported OS updates; configure least-privilege operator access and SSH key authentication.
- Configure firewall ingress/egress allowlists, DNS, NTP/clock synchronization and TLS trust.
- Install required runtime dependencies from trusted package sources; record package versions.
- Configure disk and memory thresholds, log rotation, monitoring, backups and recovery access.
- Install service units with least privilege, restart policy, health checks and documented stop/start procedure.
- Record host ID, image, kernel, addresses (appropriately redacted), package inventory, service state, timestamps and operator.
- Run a post-install baseline and independent review before assigning production or privileged workloads.

### Host evidence bundle
Capture the host's actual state, not a desired-state template: machine identity; OS/kernel; uptime; clock/NTP; disk/memory; network/DNS; HTTPS reachability; installed dependency versions; service status; process identity; recent service logs; configuration fingerprint with secrets redacted; and evidence timestamp.

Never place private keys, registration tokens, PATs, API keys, or secret values in Git, workflow logs, artifacts, issues, or this documentation.

## 6. G02 runner installation and certification

G02 is a separately controlled host certification gate. It remains quarantined until the host is authorized, registered, reachable, and independently accepted.

### Installation sequence
1. Verify the approved host exists, is running, and is reachable through authorized administration.
2. Confirm Ubuntu release, architecture, disk/memory capacity, NTP, DNS, outbound HTTPS and supported dependencies.
3. Obtain a short-lived repository-scoped registration token through an authorized GitHub session. Never paste or persist it in source or logs.
4. Download the official runner package from the verified GitHub release endpoint; verify its published checksum/signature where available.
5. Configure the runner as `lingo-g02-runner-01` with labels `self-hosted`, `linux`, `x64`, `lingo-g02`. Confirm repository scope and runner-group access.
6. Install and start the runner service using the supported service procedure. Do not run an interactive process as a substitute for service acceptance.
7. Verify GitHub shows the exact runner as registered and online; capture runner ID, name, labels, group, scope and last-seen/polling evidence.
8. Keep the G02 sentinel protected until all preflight checks and authorization requirements are met.
9. Execute one approved manual sentinel; correlate host, workflow, run, job, runner, commit and artifact.
10. Independently validate all nine G02 predicates below. A scheduled cron entry is not execution evidence.

### Nine G02 acceptance predicates
- **P1 Identity:** registered runner ID is positive and belongs to the intended repository/group.
- **P2 Name:** actual runner name equals `lingo-g02-runner-01`.
- **P3 Labels:** actual assigned labels include all four required labels.
- **P4 Assignment:** GitHub assigned the job to this runner; host-side evidence corroborates it.
- **P5 Steps:** job was instantiated and named steps actually executed.
- **P6 Sentinel:** sentinel assertions passed on the target host.
- **P7 Logs:** run/job/step logs are retrievable and correlated to the execution.
- **P8 Artifact:** non-sensitive evidence artifact is retrievable, checksum-verified and correlated to the same run/commit.
- **P9 Independent verification:** a verifier other than the executor records PASS with evidence references.

Any missing predicate means G02 = FAIL / UNVERIFIED. Do not weaken the guard or route unrelated jobs to the self-hosted runner to make a test pass.

## 7. GitHub Actions admission recovery

When a workflow reports `startup_failure` with zero jobs, diagnose the pre-job admission layer first. Do not blame checkout, Node, application code, or G02 unless a job was actually created and evidence points there.

Read-only diagnostic order:
1. Capture repository, workflow ID/path, run ID, event, commit SHA, timestamps and conclusion.
2. Query run jobs, check runs, artifacts and available logs; preserve raw response evidence.
3. Inspect workflow syntax, trigger, job-level `if`, dependencies, reusable workflows, permissions and runner labels.
4. Ask an authorized owner to inspect account/organization/repository Actions enablement, allowed actions, hosted-runner policy, runner groups, concurrency, quota and billing state.
5. Compare a minimal no-secret `ubuntu-latest` workflow on Core and Web independently.
6. If policy and account state are clear but zero-job failures persist, submit a GitHub Support case with correlated run IDs, workflow IDs, check-suite IDs, commit SHAs, UTC timestamps and API evidence.
7. Do not raise budgets, alter org policies, broaden runner groups, rotate credentials, or change billing without separate approval.
8. Acceptance requires a real job, runner ID/name, executed steps, retrievable logs and a downloadable integrity-checked artifact. Repeat to establish stability.

Core and Web are separate acceptance targets. A pass in one repository does not certify the other.

## 8. CI/CD and build contract

Every pipeline must:
- Pin runtime/toolchain versions and dependencies; use deterministic lockfiles.
- Use least-privilege workflow token permissions and immutable action references where practical.
- Separate pull-request validation, trusted build, staging deployment and production promotion.
- Keep secrets in approved secret stores and use short-lived workload identity where supported.
- Build from a known commit and record source SHA, toolchain, dependency manifest, artifact digest and provenance.
- Run lint, type checks, unit tests, integration/contract tests, security/dependency scans and product-specific acceptance.
- Upload non-sensitive artifacts and preserve logs; never report a test as passing when it did not execute.
- Gate deploys on environment protections, independent approvals, smoke tests and rollback readiness.
- Keep staging and production credentials, data and provider targets separated.

A workflow YAML file, green syntax check, queued run, preview URL, or successful upload command alone is not proof of product acceptance.

## 9. SAAAE security and privacy baseline

SAAAE controls must be enforced server-side, not merely represented in UI or client configuration.

Minimum control families:
- Verified identity, issuer/audience/signature/JWKS validation, session lifecycle and key rotation.
- Default-deny authorization with role- and attribute-based policy evaluated at the trusted boundary.
- Explicit requester, reviewer, approver and workload identities; separation of duties.
- Durable approval records tied to action, target, scope, expiry and policy version.
- Append-only audit events for authorization decisions and sensitive operations.
- Least privilege for humans, services, runners, workflows, databases and provider credentials.
- Secret isolation, redaction, rotation/revocation procedures and access auditing.
- Input validation, rate limiting, abuse controls, secure headers, TLS, dependency and supply-chain review.
- Data minimization, purpose limitation, consent, retention/deletion policy, regional handling and privacy review.
- Migration dry-runs, backups, reconciliation, idempotency and tested rollback.
- Independent security review and documented residual-risk acceptance.

No production migration, secret rotation, DNS change, privileged policy change, destructive action or hold removal is implied by this operating system.

## 10. Documentation system

Documentation is a maintained product, versioned beside implementation. Required document set:
- Master blueprint and traceability register.
- System context, container, deployment and data-flow architecture.
- Service/product registry and dependency graph.
- Host provisioning and runner installation guides.
- CI admission troubleshooting and workflow runbooks.
- Security threat model, SAAAE policy model and privacy/data-retention assessment.
- Build/release procedures, environment matrix and rollback playbooks.
- API/data contracts, migration plans and integration runbooks.
- Product-specific test plans and acceptance reports.
- Incident records, decision log, change log and known limitations.

Every document states owner, scope, source commit, last verified date, status, prerequisites, procedure, expected result, failure recovery and evidence links. Mark stale instructions visibly; never describe proposed configuration as installed.

## 11. Product-by-product acceptance

Maintain an independent acceptance record for every product and surface: web, iOS, Android, tablet and supported smart-TV surfaces where applicable.

Each record covers:
- Ownership, IP/asset rights, routes, runtime and supported environments.
- Authentication, authorization, profile isolation and session behavior.
- API/data contracts, persistence, event delivery and synchronization.
- Functional journeys, empty/error/loading states and accessibility.
- Performance, resilience, observability, backups and recovery.
- Security/privacy review, legal/compliance constraints and operational support.
- Build/test artifacts, device/browser matrix, known defects and independent sign-off.

Virtual-credit experiences remain demo-only unless separately approved. No real-money wagering, cash-out or cash-equivalent redemption is enabled by implication.

## 12. G00–G11 gate model

- **G00 — Baseline:** source of truth, blueprint mapping, inventory and last-known-good preserved.
- **G01 — Foundation:** architecture, environments, ownership and prerequisites reconciled.
- **G02 — Host/runner:** all nine host and runner predicates independently pass.
- **G03 — CI execution:** Core and Web workflows execute with logs, artifacts and repeatable results.
- **G04 — Certification:** SAAAE, staging integration, migration safeguards and privacy review accepted.
- **G05 — Release candidate:** product-specific builds and tests accepted; candidate provenance complete.
- **G06 — Deployment readiness:** target, config, secrets, approvals, observability and rollback verified.
- **G07 — Staged deployment:** approved staging deployment and smoke tests pass.
- **G08 — Live validation:** production-like/live checks pass within authorized scope; no implicit traffic promotion.
- **G09 — Synchronization:** identity, data contracts, events and cross-surface consistency verified.
- **G10 — Activation:** explicitly authorized activation with monitoring and rollback.
- **G11 — Post-activation acceptance:** independent operational, security, product and owner acceptance.

Gates are sequential for promotion. Parallel work is allowed only among independent, non-conflicting work packages. A downstream gate cannot be marked passed because an upstream item is merely configured.

## 13. Risk classes and approval boundaries

- **R0 Read-only:** inventory, inspect, compare, document and diagnose.
- **R1 Reversible isolated change:** non-production code/docs/tests on an isolated branch.
- **R2 Shared configuration:** staging settings, runner registration, access policy or shared integrations; requires explicit scope and owner approval.
- **R3 Irreversible/high impact:** production DNS/routes, secrets rotation, data migration, deletion, billing increase, production deployment, last-known-good replacement or hold removal; requires specific explicit approval and a rollback/recovery plan.

A general instruction to “complete everything” authorizes bounded work within existing permissions; it does not silently authorize R2/R3 actions or spending.

## 14. Operating dashboard and reporting

The MASTERFORGE dashboard must show:
- Gate state and evidence freshness.
- Work queue by division, owner, priority and dependency.
- Repository/branch/commit and PR mapping.
- Host and runner online/registered/healthy state.
- Workflow admission, job, runner, step, log and artifact counts.
- Build/test/security results and unresolved defects.
- Product-by-product acceptance state.
- Risk/approval queue, provider access gaps and rollback readiness.

Use only these status values: `NOT_STARTED`, `IN_PROGRESS`, `PASS`, `FAIL`, `BLOCKED`, `UNKNOWN`, `ACCEPTED`. Every PASS must link to current evidence. Evidence older than its defined freshness window becomes stale and must be revalidated.

## 15. First execution wave — current recovery

1. Preserve PR #664 as the canonical reconstruction stream; reconcile rather than duplicate.
2. Continue #663 as the single Actions admission incident record; collect owner-only policy/billing diagnostics and escalate to GitHub Support if required.
3. Confirm host existence, power state and approved access before installing anything. A planned Droplet or Ubuntu 24.04 target is not proof the machine is reachable.
4. Establish host evidence and install/register the repository-scoped G02 runner only after authorized host access and short-lived token acquisition.
5. Keep the G02 workflow guard intact until preflight and activation approval.
6. Restore Core hosted CI, then independently Web hosted CI; preserve run/job/log/artifact evidence.
7. Execute G02 and independently evaluate P1–P9.
8. Proceed to G03/G04 only when prerequisites pass; parallelize independent documentation, design-system and product audit work without changing protected production state.
9. Complete G05–G11 in order, recording acceptance and rollback evidence at each gate.
10. Promote only after G11 and a separate, explicit production authorization.

### Current known state at adoption
The 2026-11-24 GitHub reconciliation records PR #664 as open/draft and unmerged; #663 records recurring pre-job `startup_failure` with zero jobs in observed runs and an undetermined provider-side root cause. G02 is FAIL / UNVERIFIED; G03–G11 remain blocked. This is a dated baseline and must be refreshed before action.

---

## 16. Reusable MASTERFORGE execution prompt

You are **LINGO MASTERFORGE**, the LINGO Legacy enterprise build and operations orchestrator.

Your mission is to complete the LINGO Legacy ecosystem from the authoritative 44-page blueprint (sections 00–40) without losing existing work, duplicating canonical systems, weakening security, or inventing evidence.

At the start of each execution cycle:
1. Read the current canonical master work order, traceability register, gate matrix, active PRs/issues and latest evidence.
2. Refresh live repository/provider/host state using authorized read-only tools. State what cannot be inspected.
3. Build a dependency-aware work queue. Preserve program, phase, wave, sprint and build hierarchy.
4. Execute all independent R0/R1 tasks in parallel when safe; serialize shared-file, dependency and approval-sensitive changes.
5. Prefer existing canonical PRs and branches. Do not create duplicate trackers or competing architecture.
6. For every change, record exact repository, branch, path, commit, test command, actual result and evidence reference.
7. For every host task, verify the actual host before installation; never infer reachability, registration or service health.
8. For every CI task, distinguish admission from job execution. Zero jobs means no steps ran.
9. For G02, prove P1–P9 on one correlated execution and obtain independent verification.
10. Enforce SAAAE server-side, privacy review, least privilege, approval records and audit trails.
11. Keep each product's acceptance independent. Do not generalize one product's pass to another.
12. Stop at missing access, ambiguous target, unapproved spend, destructive change or production boundary; prepare the exact owner action required.
13. Never merge, deploy production, change DNS, rotate secrets, migrate/delete data, remove protected hold or replace last-known-good without specific explicit approval.
14. Update the traceability register and master work order with truthful status, evidence, blockers and next action.
15. Continue until all authorized tasks are complete. Report completion only when independent evidence satisfies the applicable acceptance criteria.

Use the governing law: **Launch what is safe. Complete what is unfinished. Improve what is touched. Protect what already works.**

Your output for each work package must contain: objective; source requirement; current truth; dependency; authorized action; implementation; executed tests; evidence; independent verification; status; risk/approval needs; rollback; next action.

Never claim an operation succeeded because a plan, configuration, workflow file, PR, or command was created. Never invent access, host state, logs, artifacts, test results, approvals or completion.
