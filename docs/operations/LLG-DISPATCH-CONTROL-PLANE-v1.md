# LLG Dispatch Control Plane v1

**Status:** Draft for review  
**Canonical owner:** LINGOlegacy_MASTER / Master Recovery  
**Source of truth:** GitHub repository and linked evidence  
**Release posture:** Protected HOLD; preview/staging only until release gates pass

## 1. Mission

Coordinate LINGO engineering, infrastructure, AI agents, creative production, product delivery, recovery and quality through one auditable dispatch system. The system must make work parallel where dependencies permit, prevent duplicate or unauthorized side effects, and prove completion through independent evidence.

This document operationalizes the existing LINGO Master Execution Router and 15-agent readiness plan. It does not create a second product registry or agent identity registry.

## 2. Operating topology

```text
LINGOlegacy_MASTER
  └── LLG DISPATCH CENTER
      ├── Portfolio registry + dependency graph
      ├── Policy / authorization / budget engine
      ├── Job queue + scheduler + lease manager
      ├── Event bus + correlation / audit ledger
      ├── Evidence store + acceptance ledger
      └── Independent review / release control
          ├── Infrastructure & Cloudflare workers
          ├── GitHub / CI / build engineering
          ├── Firebase / identity / data engineering
          ├── AI gateway / agent runtime engineering
          ├── Web / mobile / application engineering
          ├── Games / simulation engineering
          ├── Commerce / wallet / order logistics
          ├── Creative / video / asset production
          ├── Security / privacy / compliance
          ├── QA / accessibility / performance
          └── SRE / observability / recovery
```

The dispatch center is a logical control plane, not a single privileged machine. Use redundant queue/event persistence and independently recoverable state. Product workloads remain isolated by environment and service identity.

## 3. Workstream roles and deliverables

| Workstream | Accountable role | Primary deliverable |
|---|---|---|
| Master control | Program controller | Priority queue, dependency graph, change ledger, status rollup |
| Cloudflare / edge | Edge engineer | Route/Worker inventory, source-to-version provenance, Access and rollback evidence |
| GitHub / CI | Build engineer | Reproducible workflows, policy-compatible actions, checksummed artifacts |
| Firebase / identity | Identity/data engineer | Verified project/app map, environment-specific config, Auth and rules tests |
| AI / agent runtime | Agent platform engineer | Provider adapters, agent registry validation, tool allow-lists, kill switch |
| Web / mobile | Application engineer | Preview builds, route journeys, Flutter builds, responsive/device evidence |
| Games | Gameplay engineer | Deterministic state, wallet separation, game QA and asset manifests |
| Commerce / orders | Commerce engineer | Catalog/order workflow in test mode, webhook and reconciliation tests |
| Creative / video | Creative technology lead | Approved asset pipeline, rights/consent manifest, video renders and review |
| Security / privacy | Security reviewer | Threat model, least privilege, secrets boundary, privacy and abuse tests |
| QA / accessibility | Independent QA | Browser/device, functional, accessibility and regression reports |
| SRE / recovery | Reliability engineer | SLOs, monitoring, backup/restore, incident and rollback drills |
| Release authority | Human owner | Explicit release decision after evidence and independent acceptance |

These are role assignments, not claims that external people or live agents have been assigned.

## 4. Job contract

Every job must carry a validated envelope. Example:

```json
{
  "job_id": "stable-unique-id",
  "parent_id": "portfolio-or-epic-id",
  "workstream": "github-ci",
  "owner_role": "build-engineer",
  "reviewer_role": "independent-qa",
  "repository": "thelingolegacy-blip/TheLingoLegacy",
  "branch": "feature-or-fix-branch",
  "commit_sha": "immutable-commit",
  "environment": "preview",
  "risk_class": "low|medium|high|critical",
  "scope": ["explicit", "bounded", "tasks"],
  "input_refs": [],
  "dependency_ids": [],
  "allowed_tools": [],
  "permission_profile": "least-privilege-profile",
  "idempotency_key": "stable-side-effect-key",
  "acceptance_tests": [],
  "timeout_seconds": 1800,
  "lease_seconds": 300,
  "heartbeat_seconds": 60,
  "retry_budget": 2,
  "cost_ceiling_usd": 0,
  "start_condition": "dependencies satisfied and dispatch accepted",
  "stop_condition": "scope drift, failed policy, expired lease, budget or safety trigger",
  "output_refs": [],
  "evidence_refs": [],
  "status": "PROPOSED"
}
```

The sample is a schema illustration, not a credential, actual job ID, or live dispatch.

## 5. Lifecycle and two-sided handshake

Allowed transitions:

`PROPOSED → READY → DISPATCHED → ACCEPTED → RUNNING → VERIFYING → COMPLETE`

Exception states: `BLOCKED`, `REJECTED`, `FAILED`, `CANCELLED`, `EXPIRED`, `QUARANTINED`.

1. **Prepare:** dispatcher validates scope, owner, dependencies, environment, permissions, budget, expiry and acceptance tests.
2. **Dispatch:** issue a traceable assignment containing job_id, payload digest, allowed tools, environment and lease expiry.
3. **Worker validation:** worker validates identity, signature/issuer, payload digest, policy, inputs, capacity and idempotency key.
4. **Accept / reject:** worker returns ACCEPT or REJECT with a machine-readable reason. Silence is not acceptance.
5. **Acknowledgement:** dispatch center records worker acceptance and returns an acknowledgement with a bounded lease.
6. **Start:** worker emits STARTED with timestamp, runtime identity and commit/image digest before executing.
7. **Heartbeat:** worker reports progress, lease renewal, resource usage and current step.
8. **Output:** worker emits OUTPUT_READY with logs, artifacts, checksums, test results and environment correlation.
9. **Review:** independent reviewer accepts or requests changes. A worker cannot approve its own consequential work.
10. **Complete:** dispatch center marks COMPLETE only after all required checks and evidence are retrievable.

Duplicate deliveries must be safe: the same idempotency key must not repeat a non-idempotent action. Lease expiry triggers reconciliation before redispatch.

## 6. Signals and event vocabulary

| Signal | Meaning | Dispatch response |
|---|---|---|
| GREEN | Dependencies and required checks pass | Allow next eligible stage; not production approval |
| AMBER | Waiting, partial evidence, warning or lease near expiry | Hold promotion; continue safe work or request input |
| RED | Security, policy, data integrity or critical test failure | Stop, isolate, preserve evidence and escalate |
| BLUE | Independent review required | Route to reviewer; no self-approval |
| GREY | Queued, disabled or intentionally held | Do not execute |
| PURPLE | Cross-workstream dependency handoff | Require receiver acknowledgement |

Events: `DISPATCHED`, `ACCEPTED`, `REJECTED`, `ACKNOWLEDGED`, `STARTED`, `HEARTBEAT`, `PROGRESS`, `BLOCKED`, `OUTPUT_READY`, `REVIEW_ACCEPTED`, `CHANGE_REQUESTED`, `STOP_REQUESTED`, `CANCELLED`, `FAILED`, `EXPIRED`, `COMPLETE`.

Every event includes job_id, correlation_id, actor identity, UTC timestamp, environment, sequence number and payload digest. Reject stale, replayed or out-of-order state transitions.

## 7. Worker/container execution boundary

- Use ephemeral containers or short-lived workers for untrusted/build/test workloads.
- Pin container image by immutable digest; pin dependencies and record SBOM where supported.
- Default-deny outbound network; allow only required registries, APIs and artifact stores.
- Use per-job, short-lived identity and credentials; never bake secrets into images, logs or artifacts.
- Mount source read-only unless a build step requires a disposable workspace.
- Separate build, test, signing, deploy and production identities.
- Apply CPU, memory, disk, execution-time and concurrency quotas.
- Do not attach a privileged persistent runner to the public application repository.
- Quarantine artifacts and workers on suspected compromise; preserve forensic logs.
- Production credentials and deployment capabilities are unavailable to ordinary build/test workers.

## 8. Scheduling, mathematics and capacity

Dependencies form a directed acyclic graph (DAG). A job is READY only when all mandatory predecessor jobs are COMPLETE or an explicit, documented waiver exists.

Effective priority is ordered by risk tier first, then critical-path impact, age and estimated duration. Aging prevents starvation. Use weighted fair queues across workstreams so one product cannot consume all capacity.

Safe concurrency is bounded by:

`C_active ≤ min(C_runner, C_provider, C_rate_limit, C_budget, C_risk)`

For each job, expected completion time is:

`T_job = T_queue + T_setup + T_execute + T_verify + T_handoff`

Track actual p50/p95 queue and execution latency by workstream; do not promise wall-clock completion from estimates alone.

Transient retry delay uses capped exponential backoff with jitter:

`delay_n = min(cap, base × 2^n) + jitter`

Retries require an idempotent operation or a successful reconciliation proving the prior attempt had no side effect. Never blindly retry payments, migrations, DNS, deployment, runner registration or credential rotation.

Budget guard: default `cost_ceiling_usd = 0` for recovery jobs unless the owner explicitly approves a non-zero ceiling. Stop before a paid operation if pricing or credit impact is unknown.

## 9. Time clocks and service targets

Use UTC for all machine records; display local time only as a presentation layer. Record:
- created_at, dispatched_at, accepted_at, started_at;
- heartbeat_at, lease_expires_at, checkpoint_at;
- stop_requested_at, stopped_at, completed_at, reviewed_at.

Initial operational targets (provisional, not measured SLOs):
- dispatch acknowledgement within 5 minutes during an active work window;
- heartbeat every 60 seconds for active jobs;
- 5-minute lease-renewal grace before quarantine;
- review request emitted immediately after outputs are stored;
- critical RED signal escalated immediately;
- stale job reconciled before any retry or duplicate dispatch.

Tune these values from observed workload and provider limits before declaring an SLO.

## 10. Start, stop, pause and kill triggers

**Start only when:** job schema validates; owner and reviewer exist; dependencies are met; correct environment is selected; identity and permissions are valid; budget is within limit; acceptance tests are defined; dispatch is accepted.

**Pause when:** dependency changes; provider outage; incomplete inputs; rate limit; reviewer unavailable; budget nearing ceiling; non-critical test failure.

**Stop / quarantine when:** scope drift; production target mismatch; expired or revoked credential; unexpected network destination; secret exposure; data integrity threat; repeated failure; missing heartbeat; policy violation; permission escalation; unsafe artifact.

**Kill switch:** dispatch center can revoke job lease and credentials, stop new tasks, disable a worker pool and quarantine outputs. The kill switch must be tested in a non-production environment before the worker fleet is considered accepted.

## 11. Initial dispatch waves

### Wave 0 — preserve and inventory
Snapshot current known-good state; reconcile repo/branch/PR inventory; inventory provider identities, permissions, routes, versions, app snapshots, backups and costs. No destructive reset.

### Wave 1 — control-plane blockers
Resolve Actions allow-list with the authorized GitHub policy owner; restore main branch protection; define reproducible CI actions strategy; keep G02 unregistered until isolated host and token boundaries are proven.

### Wave 2 — environment and integration repair
Reconcile Firebase project/app IDs; separate staging and production configuration; validate Cloudflare route ownership and active Worker versions; reproduce Gateway/Studio asset failures in preview; verify Supabase/Firebase ownership rather than assuming one is authoritative.

### Wave 3 — one-worker proof
Run one disposable, non-privileged worker against a read-only fixture. Prove signed dispatch, accept/reject handshake, lease, heartbeat, timeout, cancellation, idempotency, audit log and artifact verification.

### Wave 4 — agent and product pilots
Validate one read-only AI agent, then one narrowly scoped tool adapter. In parallel, execute preview QA for web/mobile/product journeys, games and creative asset pipelines. Keep payments and wallets in test/demo mode.

### Wave 5 — controlled expansion
Expand by dependency-ready batches. Require independent review for each workstream. Production promotion remains a separate human release decision.

## 12. Evidence and acceptance ledger

Each completed job stores:
- exact repository, branch, commit and source snapshot;
- environment, worker/container identity and immutable image digest;
- UTC lifecycle timestamps and actor identities;
- command/test results, logs and artifact references;
- SHA-256 for source bundles and produced artifacts;
- dependency results, security review, independent acceptance;
- rollback/recovery procedure and state-change manifest.

Completion rule: source → executed build/test → retrievable logs/artifacts → checksum → environment/version correlation → independent functional/security review → owner acceptance.

## 13. Current blockers and release controls

- GitHub Actions startup failure / restricted external actions: BLOCKED pending policy-compatible workflow path or authorized policy update.
- Main branch protection: reported disabled; governance repair requires authorized settings mutation.
- G02: FAIL / UNVERIFIED; no runner registration or service activation until host, identity, token and isolation evidence exist.
- Firebase: production and staging contract mismatch; actual project/app IDs must be verified before config changes.
- Cloudflare: reconcile route ownership and uploaded-vs-active Worker versions; no blind activation or DNS edits.
- AppDeploy: account/credit state and intended account must be verified before writes; no top-up without approval.
- AI agents: registry identities are documented, runtime connection is not yet proven.
- Production: PROTECTED HOLD; no promotion, production data migration, live payment or wallet activation under this draft.

## 14. Definition of operational readiness

The platform is operational only when each product has:
1. a named source repository and owner;
2. reproducible build and passing automated tests;
3. working API/auth/data paths in the correct environment;
4. browser/device functional journey evidence;
5. security, privacy and accessibility review;
6. monitoring, backup and tested rollback;
7. commit-to-artifact-to-deployment provenance;
8. independent acceptance and recorded release authorization.

A queued job, draft PR, ready deployment label, screenshot, HTTP 200 or agent self-report is not proof of operational readiness.
