# Studio VNext — Agent, Job, Runner & Hosting Operations

Status: design and operational contract only. This document does not create a live agent service or authorize production deployment.

## Operating model

Separate the control plane (job definitions, policy, scheduling, approvals and audit records) from the execution plane (ephemeral runners/workers that execute one bounded task). The Studio UI is an operator console, not an execution engine.

### Job lifecycle

`DRAFT → VALIDATED → QUEUED → CLAIMED → RUNNING → SUCCEEDED | FAILED | CANCELLED | TIMED_OUT`

Every transition must be recorded with a UTC timestamp, job ID, workflow/version, actor or runner identity, attempt number, correlation ID, and reason. Invalid transitions fail closed. Retries are bounded, idempotent, and only allowed for classified transient errors. A cancelled, expired, untrusted, or unauthorized job must not start.

### Runner lifecycle

`REGISTERED → HEALTHY → ELIGIBLE → CLAIMED → EXECUTING → IDLE`; unhealthy runners transition to `QUARANTINED` and must not claim work.

Runner health signal fields:
- `runner_id`, `runner_name`, `runner_version`, `labels`, `online`, `busy`
- `last_heartbeat_at`, `queue_latency_ms`, `active_job_id`
- `workspace_ephemeral`, `credential_scope`, `network_policy`
- `image_digest`, `capacity_slots`, `health_status`

Never treat an API saying “online” as proof that a job executed. Acceptance requires a real assigned job, initialized steps, a sentinel output, retrievable logs, and correlated evidence.

## Required workflow signals

Emit structured JSON lines for:
1. `workflow.queued`
2. `runner.heartbeat`
3. `job.claimed`
4. `job.started`
5. `step.started` and `step.completed`
6. `sentinel.executed`
7. `artifact.created` and `artifact.verified`
8. `job.completed` or `job.failed`

Common envelope: `schema_version`, `event_type`, `event_id`, `timestamp_utc`, `repository`, `commit_sha`, `workflow_run_id`, `job_id`, `runner_id`, `correlation_id`, `result`. Redact tokens, environment secrets, personal data, and sensitive payloads. Never place secrets in event text or artifacts.

## Recommended job definitions

- `studio-contract-check`: Node.js syntax and dependency-free contract tests.
- `studio-build`: reproducible build with pinned runtime and lockfile.
- `studio-preview-deploy`: preview-only deployment with explicit target allowlist.
- `studio-browser-acceptance`: desktop/mobile browser tests, keyboard and accessibility checks.
- `studio-security-check`: dependency, secret, headers, and permission checks.
- `agent-evaluation`: deterministic test cases and regression scoring for each agent version.
- `release-evidence-package`: collect evidence and verify checksums; never authorize release by itself.

Each job must declare owner, purpose, inputs, outputs, timeout, retry policy, permissions, runner requirements, network policy, and acceptance predicate. Default permissions are read-only. Grant write access only to a narrowly scoped job that needs it.

## Agent and bot hosting pattern

1. API/control service validates identity, policy, schema, quotas, and approvals.
2. Durable queue stores job metadata; payloads reference versioned artifacts rather than embedding secrets.
3. Ephemeral worker pulls one authorized job, verifies its signed/versioned definition, and runs in an isolated workspace/container.
4. Tools are allowlisted by agent role. External side effects require explicit approval or pre-authorized narrow scopes.
5. Results are schema-validated, sanitized, signed/hashed, and stored with audit metadata.
6. Worker is destroyed or reset after the job. Revoke short-lived credentials and clear workspace data.
7. Evaluation and monitoring review failures, latency, cost, tool calls, policy denials, and regression rates.

Do not run arbitrary model-generated shell commands with broad credentials. Do not expose production secrets to preview jobs or agent evaluation workers. Never allow an agent to grant itself tools, permissions, network access, or additional training rights.

## Observability and alert thresholds

Track queue depth, oldest queued job, queue-to-claim latency, runner heartbeat age, startup failures, job success/failure, timeout rate, retry count, artifact verification failures, policy denials, token/cost budgets, and evaluation pass rate.

Alert on: no eligible runner while jobs are queued; heartbeat expiry; zero initialized jobs after dispatch; missing sentinel; inaccessible logs; artifact checksum mismatch; repeated permission denials; unexpected network egress; and production-target mismatch.

## Acceptance gates

A runner/job path is verified only when:
- an authorized workflow run exists;
- a job is assigned to a nonzero runner ID with a populated runner name;
- steps are instantiated and a sentinel step executes;
- logs are retrievable and contain no secrets;
- an evidence artifact is produced and checksum-verified;
- the signal envelope links the run, job, runner, commit, and artifact;
- a second reviewer confirms the evidence.

A green workflow badge without these facts is insufficient for the G02 gate.

## Hosting environments

- Local: developer sandbox; synthetic data only.
- CI: isolated ephemeral runner; least privilege; no production credentials.
- Preview: separate project/hostname, separate environment variables and backend resources.
- Production: separate credentials, reviewed promotion, approved change window, rollback target, and explicit authorization.

Production remains Protected HOLD until all required gates pass independently. This document does not change DNS, deployment configuration, secrets, branch protection, or release status.
