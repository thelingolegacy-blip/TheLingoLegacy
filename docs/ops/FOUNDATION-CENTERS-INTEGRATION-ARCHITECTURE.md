# LINGO Foundation Centers — Integration Architecture

**Status:** implementation blueprint and inventory baseline; not production activation.
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`, `main`.
**Related:** EMS charter #550, center blueprint PR #551, control-plane implementation issue #552.

## Architecture rule

ONE LEGACY → shared production spine → distinct worlds → one quality bar.

The shared spine is: source control → CI/build → artifact/evidence registry → edge/runtime → identity/data → observability → safety/QA → release/rollback. Product worlds retain separate data boundaries, permissions, feature flags, deployment paths and audit trails.

The lifecycle is CREATE → CONNECT → TEST → VALIDATE → DEPLOY → OBSERVE → LEARN → IMPROVE. Every transition must have evidence. A UI scaffold or a configured resource is not a live integration.

## Center map

| Center | Existing source surface | Operational role | Current integration truth |
|---|---|---|---|
| Main Hub / Admin Command Center | `/admin-command-center/` | Portfolio command navigation, studios, projects, publishing and work lanes | Existing UI scaffold; live provider-backed status must be proven |
| Studio OS | `/studio-os/` | Creative operations, themes, campaigns, events and studio controls | Existing UI scaffold; automation must remain off absent authorization |
| Trust & Compliance Center | `/trust-compliance/`, `docs/lingo-safety-core.md` | Reports, moderation, fraud, economy safeguards, privacy and launch gates | Policy blueprint and UI; live queues/integrations not established |
| Economy Command Center | `/economy-command-center/` | Demo economy monitoring and recommendations | Recommendation-only scaffold; no unapproved wallet mutations |
| Integration OS | `/integration-os/` | Integration inventory and connection workflows | Existing surface; provider connectivity needs evidence |
| Release Center | `/release-notes/`, `docs/release/`, `release/evidence/`, `ops/recovery/` | Build evidence, gates, release records, rollback and acceptance | Distributed source artifacts; unified live release UI not yet established |
| Resource Center | `config/ops/resource-registry.json`, schema and resource docs | Resource, environment, provider, quota, owner and backup catalog | Registry baseline created in this change; live sync not yet connected |
| Sonic Boom Nexus | Cross-cutting orchestration concept | Diagnostics, analytics, event triggers, dispatch, permissions, release gates, dependency graph and audit history | Architecture concept; do not claim runtime exists until located and verified |

## Source-of-truth boundaries

1. GitHub is authoritative for source code, change history, pull requests, workflows and commit-linked evidence.
2. Cloudflare is the intended authoritative edge for DNS/routes/Workers/assets. GitHub configuration alone does not prove live Cloudflare state.
3. Firebase is the designated identity/data backend for assigned ecosystem capabilities. Repository config does not prove project health, deployed rules or successful data restore.
4. Flutter is the mobile application framework; Unity remains project-specific for games. A source folder or manifest does not establish a shipped application.
5. External services are integrations, not sources of truth for GitHub source or release authority.

## Cross-cutting orchestration and field operations

### Sonic Boom Nexus
Sonic Boom Nexus is the planned orchestration layer across engines, analytics, diagnostics/recovery, triggers/automation, dispatch, permissions, release gates, dependency mapping and audit history. It coordinates services without collapsing their data boundaries or bypassing product ownership. Its runtime state is currently unknown; this architecture must not be represented as an already deployed control plane.

### Loyalty Lane Cycles and Beacon
Loyalty Lane Cycles requires three service hubs covering Philadelphia sections and Cumberland County. Each hub needs an approved identity, street address, operating hours, service boundary, contact method, staffing/coverage owner, safety procedures and escalation route before public routing is enabled.

The Beacon alert workflow is planned to support:
- Location-aware intake and assignment to the correct hub.
- Staff notification, acknowledgment, assignment, escalation and resolution.
- Central operational dashboard and case timeline.
- Retry with bounded backoff, duplicate detection/idempotency and delivery receipts.
- Audit events, privacy/data minimization and retention controls.
- Fallback routing when a hub or notification provider is unavailable.

Beacon remains feature-flagged and not live until the official hub registry and boundaries are approved, notification provider and consent model are verified, privacy review passes, and an end-to-end test proves primary and fallback routing. Do not invent hub names, addresses, hours or service boundaries.

## Shared service catalog

Each resource is recorded with:
- stable resource ID and category;
- canonical name and purpose;
- source provider and authoritative reference;
- environment and criticality;
- owner and escalation contact (unknown until assigned);
- dependency IDs and data classification;
- lifecycle state and last-verified timestamp;
- integration state and evidence links;
- secret reference metadata only (never secret values);
- recovery path, backup reference, retention and rollback target;
- cost/quota and renewal metadata when verified.

Allowed status values: `verified`, `configured_unverified`, `scaffold_only`, `blocked`, `stale`, `unknown`, `retired`. No status may be promoted based on a label, static page, stale report or assumed provider state.

## Control-plane data flow

- GitHub adapter reads repositories, branches, PRs, commits, workflows, jobs, artifacts and security alerts.
- Cloudflare adapter reads zones, DNS, routes, Worker deployments, bindings, asset manifests and health probes.
- Firebase adapter reads project/app identity, Hosting targets, Auth providers, database/storage rules, indexes, usage and backup/restore evidence.
- Observability adapter reads logs, metrics, traces, alerts, uptime, SLOs and incidents.
- Human change-control adapter records approval, reason, scope, expiration, rollback and two-person authorization for privileged actions.

Adapters must be read-only by default, least-privilege, paginated, rate-limit aware and resilient to missing permissions. Provider errors, incomplete pagination and stale timestamps must remain visible. Mutations are separate commands behind RBAC, explicit confirmation and audit records.

## Recovery and alternate access routes

For each critical system, map primary user route, secondary route/provider where supported, admin route, disaster-recovery route and break-glass procedure. These are controlled recovery routes, not hidden side doors. Every route retains authentication, authorization, logging, rate limits, safety and data-protection requirements. Break-glass requires dual approval, expiry, alerting and retrospective review.

## Implementation order

1. Registry schema and baseline resource inventory.
2. Read-only GitHub adapter and repository/branch/PR pagination.
3. Main Hub portfolio and incident/work-order view.
4. Resource Center inventory, environment and dependency views.
5. Release Center commit-bound evidence, quality gates, staging, approvals and rollback.
6. Cloudflare and Firebase read-only adapters.
7. Observability and incident adapters.
8. Role-controlled mutations only after audit, permission and rollback tests.

## Acceptance contract

- Every displayed status includes source, environment, checked-at time and evidence.
- Missing access is `unknown`, never `healthy`.
- All pages are responsive and keyboard accessible.
- Secret values never enter UI, repository, logs, issue bodies or artifacts.
- Every privileged action is role-checked, reason-coded, auditable and reversible where possible.
- No automatic DNS, hosting, database, payment, runner, production or repository deletion changes.
- Staging validation and rollback are proven before production activation.
