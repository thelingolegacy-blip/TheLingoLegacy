# Feature Flags, Blockers, and Alternatives

## Decision rule

Distinguish an **unnecessary process blocker** from a **safety or acceptance gate**. Improve the workflow around a blocker; do not remove a control whose predicate has not been satisfied.

## Feature-flag baseline

| Capability | Desired state now | Rationale / enablement condition |
|---|---|---|
| Repository inventory | ON for approved read scopes | Can be performed without changing external state |
| Static registry/schema checks | NEXT, not yet implemented | Add after review; validate locally before claiming pass |
| Jira read-only inventory | AVAILABLE, not mesh-activated | Jira site and project list were discoverable; confirm the intended project before creating issues |
| Jira issue creation | OFF | Enable only for a named project, approved issue type, duplicate check and per-task authorization |
| Jira transitions/bulk edits | OFF | Not needed for initial inventory; require separate approval |
| Dockerfile/Compose review | ON as a read-only task definition | No daemon or host access required |
| Docker daemon / socket | OFF | Host-equivalent risk; use rootless isolated build or remote builder only after review |
| Image build | OFF until sandbox runner is approved | Requires reproducible isolated build and scan pipeline |
| Image publishing/registry writes | OFF | Requires separate registry identity, provenance, SBOM and approval |
| Kubernetes manifest review | ON as a read-only task definition | Static review can proceed without cluster access |
| Kubernetes API connection | OFF | No cluster/namespace/identity has been authorized |
| Production Kubernetes context | DENY | Never grant to the general-purpose mesh |
| Scheduler / periodic jobs | OFF | Do not introduce background work before runtime policy and operational ownership are accepted |
| Webhooks / task intake endpoint | OFF | Requires signature verification, authentication, replay defense, schema validation and rate limiting |
| Agent runtime / worker service | OFF | No runtime exists in this proposal; deploy only after Phase 1–3 review |
| Production read-only telemetry | OFF pending separate approval | Read-only can still expose sensitive operational data |
| Production mutations / deployment | DENY | Outside current authorization and blocked by release posture |
| Gate mutation / self-approval | DENY | Violates independent acceptance |

## Safe blocker reduction

1. Replace vague manual steps with explicit owners, predicates, timeouts, and evidence links.
2. Parallelize independent read-only inventory tasks.
3. Cache immutable repository metadata with source SHA and freshness bounds.
4. Add a single incident index linking runs, attempts, PRs, issues, and artifacts.
5. Distinguish unavailable permission from empty resource list.
6. Add preflight checks that explain exactly which prerequisite is missing.
7. Permit sandbox validation after isolation is demonstrated; do not run it on production.
8. Keep one authoritative status per gate, derived from accepted evidence.

## Blockers that must not be disabled

- G02 runner execution/identity/log/artifact acceptance.
- Required security, secrets, build, test, API, identity, commerce, accessibility, performance, live-probe and rollback acceptance.
- Branch protection and independent review.
- Explicit authorization for deployment, DNS, Worker routing, Firebase, payments, production data, or cluster mutations.
- Last-known-good protection and fail-closed release logic.

## Alternatives

### Option A — GitHub-only, no runtime (recommended first)
Use branch-based policy files, deterministic local checks, PR review, and GitHub issues. Lowest operational risk; does not require a running service.

### Option B — GitHub + Jira read-only adapter
Read Jira projects and issues, map issue keys to tasks, and emit proposed task lists. No issue creation or transitions. Best next integration once the intended Jira project is confirmed.

### Option C — Ephemeral container validation
Run tests in rootless ephemeral containers on an approved isolated runner. No long-lived cluster, daemon socket sharing, or production credentials.

### Option D — Kubernetes sandbox
Only after a cluster owner provides a dedicated non-production namespace, namespace-scoped service account, quota, network policy, Pod Security enforcement, workload identity, audit policy, and cleanup procedure. Not required for current inventory.

### Option E — Managed agent service
Consider only after threat model, data residency, retention, tenant boundaries, cost controls, provider approvals, and exit strategy are reviewed. No vendor selection is implied here.

## Explicit enablement sequence

`DOCS/REGISTRY REVIEW → STATIC VALIDATION → READ-ONLY GITHUB → JIRA READ-ONLY → EPHEMERAL CONTAINER TESTS → KUBERNETES SANDBOX (OPTIONAL) → INDEPENDENT ACCEPTANCE`

Every transition requires evidence and review. No sequence step authorizes production deployment. The current stage remains design/review; runtime, scheduler, webhook, Docker daemon, Kubernetes connection, Jira writes, and production access remain off.
