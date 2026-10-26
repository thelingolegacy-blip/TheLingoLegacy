# Enterprise Agent Mesh — Operating Model

**Status:** Proposed / review required  
**Mode:** Read-only recovery  
**Change boundary:** no live activation, production writes, runner changes, or deployment

## 1. Desired architecture

Use a control-plane / worker-plane split. The first implementation remains a declarative specification; it does not imply that services are deployed.

- **Control plane:** task intake, policy evaluation, dependency graph, budget/deadline, assignment, status aggregation, audit events, and human approval.
- **Agent workers:** isolated, single-purpose workers for repository inventory, GitHub CI, Jira planning, Docker/container review, Kubernetes configuration review, platform surfaces, OS compatibility, security, evidence, and independent acceptance.
- **Evidence store:** append-only records with source URI, source SHA or resource ID, run/attempt ID when applicable, UTC observation time, method, limitations, integrity digest, reviewer, and acceptance state.
- **Task/event adapter:** normalized GitHub/Jira events; deduplication by provider + event ID; replay-safe idempotency key; signature verification for webhooks; no unauthenticated task execution.
- **Policy engine:** allowlist-first capabilities, least privilege, deny-by-default network egress, bounded retries, deadlines, concurrency caps, and explicit human approvals.
- **Human control:** release authority stays separate from agents, CI results, Jira status, and the orchestration service.
- **Observability:** structured redacted logs, trace/task IDs, health/readiness endpoints, audit records, alerting only after separately authorized setup.

## 2. Trust boundaries

1. External content (Jira descriptions/comments, PR text, issues, docs, artifacts, logs, container labels, manifests) is untrusted input. It may inform a task but cannot override system policy.
2. Agents cannot access raw secrets. Use short-lived, scoped credentials injected only into the component that needs them; redact before logging.
3. Do not mount the Docker socket into general-purpose agent workers. A Docker socket often grants host-equivalent control.
4. Do not give workers Kubernetes cluster-admin. Prefer namespace-scoped service accounts, read-only RBAC for inventory, and short-lived credentials.
5. Do not allow worker pods to use privileged mode, hostPath, host network/PID/IPC, host mounts, or unrestricted egress by default.
6. No worker may execute repository code from an untrusted branch on a trusted/self-hosted runner.
7. Agent-to-agent messages are data, not authority. A worker cannot grant another worker capabilities.
8. Gate states are read-only projections of accepted evidence; they cannot be edited directly by agents.

## 3. Enterprise task lifecycle

`RECEIVED → NORMALIZED → POLICY_CHECKED → PLANNED → APPROVED_IF_REQUIRED → ASSIGNED → RUNNING → EVIDENCE_CAPTURED → INDEPENDENTLY_REVIEWED → ACCEPTED_OR_REJECTED`

Terminal states: `BLOCKED`, `CANCELLED`, `EXPIRED`, `FAILED`, `NEEDS_HUMAN`. A timeout or provider outage must never become a success.

Every task must include:
- task ID, request ID, parent/child relationships, source provider and event ID;
- goal, scope, environment, repository/commit/resource identity;
- assigned role, allowed capabilities, denied capabilities, data classification;
- prerequisites, deadline, retry budget, cost/token budget and concurrency limit;
- expected artifacts, acceptance predicate, reviewer identity and audit URI;
- recovery action, escalation target, cancellation semantics, and idempotency key.

## 4. Task modes / options

- **Inventory:** read-only discovery and evidence capture.
- **Diagnose:** correlate records and propose root-cause hypotheses, clearly separated from confirmed causes.
- **Plan:** dependency-ordered tasks, alternatives, risks, and rollback plan.
- **Validate:** run only pre-approved, isolated, non-production checks.
- **Patch proposal:** prepare an isolated branch/diff for human review; no merge.
- **Reconcile:** compare desired configuration with observed state, report drift only.
- **Recover memory/state:** restore from versioned authoritative sources; do not synthesize missing facts.
- **Escalate:** produce a concise evidence package for an authorized administrator.
- **Release acceptance:** independent review only; never self-approve and never bypass a critical gate.

## 5. Retry and failure policy

- Retry only transient, idempotent read operations with bounded exponential backoff and jitter.
- Do not automatically retry non-idempotent writes, Jira transitions, deploys, payment actions, runner changes, or cluster mutations.
- Treat HTTP 401/403, permission errors, unavailable endpoints, and truncated evidence as `UNKNOWN`/blocked—not as empty inventory.
- Dead-letter exhausted tasks with evidence and a human-readable next step.
- Deduplicate webhook delivery; verify signatures and timestamp/replay windows.
- Circuit-break repeated provider failures; preserve raw response metadata without secrets.
- No automatic fallback from one environment to production.

## 6. Endpoint classes

Only enable the endpoint groups needed by a task. Use provider base URLs from connected account configuration; never hard-code credentials or assume tenant IDs.

- **GitHub read:** repository, tree, file contents, PR metadata, checks, workflow runs/jobs/artifacts where authorized.
- **Jira read:** projects, issue metadata, JQL search, issue types, transitions metadata.
- **Jira write:** issue creation/comments/transitions only as a separate capability, with per-action approval and idempotency. Read/write OAuth scopes do not mean every action is enabled.
- **Docker:** local daemon/API is disabled for general workers. Use rootless isolated build runners or a remote builder with constrained credentials; publish is a separate permission.
- **Kubernetes:** cluster API read-only, namespace scoped. Mutations (apply/delete/scale/rollout/secret changes) are disabled. Production context is denied to the agent service account.
- **Internal service endpoints:** authenticated, private network only, explicit allowlist, TLS, rate limits, schema validation, and request IDs.

## 7. Service health endpoints

If a service is implemented later, standardize:
- `GET /healthz` — process liveness only; no external dependency assumptions.
- `GET /readyz` — readiness after required configuration/schema checks; must not disclose secrets.
- `GET /version` — build SHA, version, build timestamp, schema version.
- `GET /metrics` — aggregate metrics only, authenticated/private where required; no task bodies, tokens, or personal data.
- `GET /v1/tasks/{taskId}` — authorized task status and redacted evidence pointers.
- `POST /v1/tasks` — disabled until authentication, authorization, schema validation, rate limits, idempotency and audit logging are reviewed.
- `POST /v1/tasks/{taskId}:cancel` — cancellation only; must not trigger deployment or rollback implicitly.
- `GET /v1/policies/effective` — read-only, redacted effective policy.
- `GET /v1/evidence/{evidenceId}` — access-controlled evidence metadata; raw artifacts require separate authorization.

These are proposed contracts, not existing or live endpoints.

## 8. Activation ladder

0. **OFF:** no service, scheduler, webhook receiver, or cluster integration.
1. **DESIGN:** schemas and policy only.
2. **LOCAL VALIDATION:** deterministic unit/schema tests, no credentials or network writes.
3. **SANDBOX READ-ONLY:** approved provider reads and non-production inventories.
4. **ISOLATED VALIDATION:** ephemeral containers or namespace, no production credentials.
5. **LIMITED WRITE:** only a named, approved Jira issue/comment capability if required; no release controls.
6. **PRODUCTION OBSERVABILITY:** read-only, separately authorized, privacy-reviewed.
7. **PRODUCTION CHANGE:** outside this plan; requires a separate change request, owner approval, tested rollback, all critical gates accepted, and explicit authorization.

Do not skip levels. A green readiness endpoint is not production release acceptance.
