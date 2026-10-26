# Implementation Roadmap and Release Gates

Status is **proposed** until evidence is attached. This plan does not assert that infrastructure has been provisioned or any test has passed.

## Phase 0 — Establish truth
- Record default branch, recovery branch, current commit, open PRs, workflow status, and deployment target.
- Inventory package manifests, build commands, routes, runtime APIs, assets, auth, persistence, and current hosting.
- Preserve known-good recovery artifacts.
- Record blockers with timestamps and source links.

**Exit:** baseline inventory, repeatable build/test instructions, known-blocker register.

## Phase 1 — Architecture contracts
- Validate the Surface Matrix against registry.schema.json.
- Replace placeholder owners/contracts with repository-backed facts.
- Add ADRs for stack, tenancy, identity, data, CI/CD, DR, and product compliance.
- Map existing application surfaces to registry IDs.

**Exit:** no unexplained active surface; unknown values explicitly marked unknown.

## Phase 2 — Secure application baseline
- Establish common error envelope, request correlation, input validation, resource authorization, rate limiting, and audit events.
- Derive tenant context from verified identity and authorized membership.
- Test object-level authorization and cross-tenant denial.
- Define migration and backup policies.
- Keep secrets out of client bundles, source control, and diagnostic artifacts.

**Exit:** automated tests cover positive and negative authorization paths.

## Phase 3 — Reliable delivery
- Separate CI verification from deployment authorization.
- Qualify GitHub-hosted or self-hosted runners using documented trust controls.
- Use least-privilege OIDC/federation for cloud deployment when supported.
- Build once; scan; generate SBOM/provenance; sign where supported; deploy immutable digests.
- Run staging smoke tests and migration compatibility checks.

**Exit:** successful workflow evidence, reproducible artifact identity, staging verification, rollback plan.

## Phase 4 — Platform runtime
- Size workloads and select cloud/region/account topology.
- Use private data services, segmented networks, restricted egress, managed secrets, centralized audit logs.
- Introduce managed Kubernetes only if container operations and scale justify it; a smaller managed application runtime may be a better first deployment.
- Define budgets and alerts before creating costly resources.

**Exit:** approved infrastructure plan, owner-approved apply, tested health checks and access boundaries.

## Phase 5 — Operations and recovery
- Define SLO measurement windows, request classes, exclusions, and burn-rate alerts.
- Test backup restoration and regional recovery.
- Confirm identity, keys, images, configuration, queues, and data are recoverable.
- Conduct load, dependency-failure, and rollback exercises.

**Exit:** measured RTO/RPO meets approved targets or targets are transparently revised.

## Phase 6 — Production release
- Security review, privacy/data review, product/legal review where relevant.
- Confirm support/on-call coverage, incident escalation, user-facing status and rollback.
- Canary or gradual rollout with explicit abort thresholds.
- Post-deploy smoke tests and heightened monitoring.

**Exit:** signed go/no-go record and linked production evidence.

## Initial quality gates
| Gate | Required evidence |
|---|---|
| Build | Exact command, exit code, environment/runtime version |
| Tests | Report with pass/fail/skipped counts |
| Contracts | Schema validation and compatibility report |
| Security | Dependency, secret, static, IaC, tenant-isolation results as applicable |
| Artifact | Immutable digest and build provenance |
| Deployment | Environment, revision, timestamp, deployment identifier |
| Runtime | Health checks, synthetic journey, telemetry links |
| Recovery | Restore timestamp, measured data loss, elapsed recovery time |
| Approval | Accountable approver and release decision |

## Release blockers
Unresolved critical/high security finding without approved exception; unknown tenant boundary; exposed secret; untested destructive migration; inability to restore critical data; missing owner/on-call; no rollback or mitigation plan; or no evidence that the intended artifact is running in the target environment.
