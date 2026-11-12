# LINGO Operations Control Plane — API and Data Contract

**Version:** 1.0.0  
**Mode:** Read-only first; mutation endpoints are not enabled by this contract.  
**Authority:** GitHub source control; adapters report provider state with evidence.

## 1. Contract rules

- All responses include `schema_version`, `source`, `environment`, `observed_at`, `fresh_until`, `status` and `evidence_refs`.
- `status` is one of `verified`, `configured_unverified`, `scaffold_only`, `blocked`, `stale`, `unknown`, `retired`.
- Missing provider permissions, partial pagination, timeouts, rate limits and stale data must be visible and must never become a healthy result.
- All list endpoints are cursor-paginated and return `next_cursor`, `has_more`, and `complete`.
- Every record is scoped to an environment and tenant/product boundary.
- Never return secret values, tokens, private keys, raw credentials, or unnecessary personal data.
- Read-only adapters use least-privilege credentials. Write scopes are separate and disabled until RBAC, approval, audit and rollback are implemented.

## 2. Canonical resource model

```json
{
  "id": "edge.cloudflare",
  "name": "Cloudflare edge and Worker runtime",
  "kind": "edge",
  "provider": "Cloudflare",
  "environment": "production",
  "criticality": "critical",
  "owner": "unassigned",
  "lifecycle_state": "active",
  "integration_state": "stale",
  "observed_at": "2026-11-04T00:00:00Z",
  "fresh_until": "2026-11-04T01:00:00Z",
  "source_ref": "docs/release/2026-11-04-cloudflare-production-cutover-runbook.md",
  "evidence_refs": [],
  "dependency_ids": [],
  "secret_references": [],
  "recovery": {
    "primary_route": "Cloudflare",
    "secondary_route": null,
    "restore_runbook": "docs/release/2026-11-04-cloudflare-production-cutover-runbook.md",
    "rollback_reference": "last-known-good deployment"
  }
}
```

## 3. Read-only endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/ops/v1/overview` | Portfolio status counts, critical blockers and freshness |
| GET | `/api/ops/v1/centers` | Main Hub, Resource Center, Release Center and specialist centers |
| GET | `/api/ops/v1/resources` | Filterable resource registry |
| GET | `/api/ops/v1/resources/{resource_id}` | Resource detail, dependencies, owner and evidence |
| GET | `/api/ops/v1/dependencies` | Directed service dependency graph |
| GET | `/api/ops/v1/environments` | Environment inventory and drift state |
| GET | `/api/ops/v1/work-orders` | Recovery, maintenance, security and construction queue |
| GET | `/api/ops/v1/incidents` | Incident list, severity, timeline and recovery state |
| GET | `/api/ops/v1/releases` | Release candidates and evidence status |
| GET | `/api/ops/v1/releases/{release_id}/evidence` | Commit-bound checks, artifacts, approvals and rollback |
| GET | `/api/ops/v1/integrations` | Provider adapters, scopes, last sync and errors |
| GET | `/api/ops/v1/audit` | Append-only audit event search for authorized roles |

All list endpoints accept `limit`, `cursor`, `environment`, `status`, and relevant category/provider filters. Unknown filter values return validation errors rather than broadening the query.

## 4. Provider adapter contracts

### GitHub adapter
Read repositories, default branches, branches, commits, pull requests, reviews, workflows, runs, jobs, logs, artifacts, environments, rulesets and security alerts. Paginate until the provider confirms completion. Bind each result to repository, ref, commit SHA and observation timestamp. A workflow run with no jobs or startup failure is a dispatch failure, not a passing test.

### Cloudflare adapter
Read accounts, zones, DNS, Worker routes, Worker versions/deployments, bindings, asset manifests, health probes, rules and audit events. Keep route precedence and active deployment IDs. Never apply DNS or Worker mutations through the read adapter.

### Firebase adapter
Read project/app identity, Hosting sites/targets, deployment versions, Auth providers, database and Storage rules, indexes, quotas and backup/restore records. Keep project and environment identities explicit. Do not infer live Firebase state from `.firebaserc` or a local config file.

### Observability adapter
Read logs, metrics, traces, uptime, alerts, SLOs, error budgets and incident timelines. Redact tokens, sensitive payloads and user data before indexing.

### Resource adapter
Reconcile provider inventory with the registry; identify orphaned, duplicate, unowned, stale and quota-constrained resources. Never delete or recreate resources automatically.

## 5. Work order and incident state machines

Work order states:
`proposed → triaged → approved → in_progress → blocked | ready_for_verification → verified → closed`.

A work order must include ID, title, site/workstream, severity, scope, owner, dependencies, affected environment, acceptance tests, evidence, rollback plan and change reference. A task cannot be `verified` without retest evidence.

Incident states:
`detected → acknowledged → contained → recovering → monitoring → resolved → postmortem`.

Incident records include severity, impact, affected resources, incident commander, timeline, containment, customer communication, recovery action, verification, follow-up work orders and postmortem link.

## 6. Release evidence envelope

Every release candidate must bind:
- repository, branch, exact 40-character commit SHA;
- workflow run, attempt, job and runner contract;
- completed step logs and job conclusion;
- artifact name, immutable identifier, SHA-256 and provenance;
- static analysis, dependency, secret, malware and policy scan results;
- staging test results and live probes;
- data migration plan and backup/restore proof where applicable;
- approver identity, scope, timestamp, expiry and authorization reference;
- rollback artifact/route and tested recovery procedure.

A release is blocked when any required evidence is missing, stale, contradictory or bound to another commit/artifact. Diagnostic hosted-runner evidence cannot be substituted for canonical G02 release-runner evidence.

## 7. Authorization model for future mutations

Read-only is the default. Future commands such as deploy, restart, scale, rotate, migrate, delete, failover, change DNS, enable billing or activate a feature require:
1. authenticated operator identity and MFA;
2. role and environment scope check;
3. explicit resource/action/reason;
4. impact preview and dependency check;
5. approval appropriate to risk (dual approval for break-glass and destructive actions);
6. immutable audit event;
7. pre-change snapshot and rollback target;
8. post-change health verification.

No endpoint in this contract grants production mutation authority.

## 8. Failure behavior

- Provider unavailable: return `unknown` plus error class and retry guidance.
- Permission denied: return `blocked`; never report zero resources.
- Partial pagination: set `complete=false` and show the next cursor.
- Stale observation: return `stale` and preserve the last observation timestamp.
- Evidence mismatch: return `blocked` and identify mismatched commit/resource.
- Adapter exception: redact secrets and personal data; include correlation ID.

## 9. Implementation milestones

1. Validate registry against its JSON Schema in CI.
2. Implement GitHub read adapter and cursor-complete inventory.
3. Implement overview/centers/resources/dependencies APIs.
4. Add Cloudflare and Firebase read adapters.
5. Add incidents, work orders, audit and release evidence APIs.
6. Add role-aware UI and accessible mobile layouts.
7. Add approval-gated mutations only after threat modeling, tests and rollback exercises.
