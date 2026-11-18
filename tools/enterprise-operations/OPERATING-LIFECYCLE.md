# End-to-End Operating Lifecycle

This procedure covers the full lifecycle for a LINGO website, mobile application, game, service, infrastructure resource or realm.

## 1. Discover and inventory

Capture the asset/service/repository, owner, purpose, business criticality, environment, provider, region, data classes, dependencies, lifecycle state, public endpoint and source of truth. Classify each entry as canonical, active spoke, shared engine, documentation, legacy, duplicate candidate, empty/placeholder or investigate. Never delete or archive based on name similarity alone.

## 2. Reconcile and establish baseline

Compare GitHub source and branch state with provider inventory, deployed artifact, configuration, DNS/routes, identity, database and monitoring. Capture current commit SHA, workflow runs, deployment IDs, artifact digests, configuration version, health, backup point and last-known-good. Record drift as a defect. If access is unavailable, mark UNVERIFIED.

## 3. Plan and classify risk

Define objective, exact scope, expected outcome, affected users/data, dependencies, blast radius, outage window, security/privacy impact, cost, success criteria, abort thresholds, rollback plan, operator and independent reviewer. Categorize as read-only, routine reversible, sensitive, privileged, destructive, financial or production-critical.

## 4. Authenticate, authorize and approve

Authenticate the individual and service identity. Evaluate RBAC/ABAC policy for the exact action, resource, environment and time window. Obtain required approvals from authorized roles. Confirm separation of duties, approval expiry, conflict checks and audit correlation. A user saying they have broad permissions does not replace provider-issued access or required independent approvals.

## 5. Execute in bounded stages

Prefer isolated local/dev, then test, then staging. Use immutable artifacts, pinned dependencies, reproducible commands, idempotency keys and change records. Capture command/actor/time/result without logging secrets. Stop on unexpected drift, missing precondition, policy denial, failed health check or threshold breach.

## 6. Verify independently

Run static analysis, unit, integration, contract, security, accessibility, browser/device, performance, resilience and data-integrity checks as relevant. Verify from a clean environment where practical. Evidence must identify source commit, workflow run, job, test suite, artifact digest, environment, timestamp and result. Independent verification must not rely only on the executor's assertion.

## 7. Accept

Acceptance requires all mandatory gates, no unresolved critical/high risk without an approved exception, named product owner, independent reviewer, operational owner, support/runbooks, recovery proof and explicit decision. Record ACCEPTED or REJECTED; never infer acceptance from merge or deployment.

## 8. Distribute

Build once and promote the same immutable artifact. Generate checksum/digest, SBOM, provenance/attestation, license manifest and release notes. Sign packages using protected signing keys. Publish only to approved channels, registries or audiences. Validate package identity, compatibility, permissions and rollback availability.

## 9. Deliver and cut over

Delivery requires a separate release authorization. Confirm environment, deployment target, approved artifact digest, traffic strategy, health gates, migration compatibility, backup and rollback. Use staged/canary rollout where supported. Observe health and user journeys after each stage. Abort and roll back when thresholds are breached.

## 10. Operate and maintain

Monitor SLOs, error budgets, uptime, latency, saturation, security alerts, costs and customer support. Rotate secrets, patch dependencies, rehearse recovery, review access, refresh documentation and retire obsolete assets through approved change control.

## 11. Recovery loop

1. Declare incident, severity, incident commander and scope.
2. Preserve evidence and establish timeline.
3. Contain exposure without destroying forensic data.
4. Identify last-known-good and recovery point.
5. Obtain emergency or standard authorization.
6. Restore service or roll back the smallest safe unit.
7. Validate integrity, identity, security and customer journeys.
8. Independently verify recovery.
9. Communicate status and residual risk.
10. Complete post-incident review and corrective actions.

## Release gate matrix

| Gate | Required evidence | Reject/hold condition |
|---|---|---|
| G0 Ownership & scope | Owner, asset, environment, scope | Unknown owner/scope |
| G1 Identity & access | AuthN, AuthZ, MFA, least privilege | Unauthorized or shared identity |
| G2 Source & build | Commit, lockfiles, reproducible build | Untraceable artifact |
| G3 Tests | Executed tests and logs | Not run, startup failure or missing artifacts |
| G4 Security & privacy | Scan results, threat review, data boundary | Critical exposure or unreviewed exception |
| G5 Integration | Contract and provider evidence | Unavailable or unverified critical dependency |
| G6 Recovery | Backup, restore and rollback rehearsal | No viable recovery |
| G7 Operations | SLO, alerts, owner, runbooks | No monitoring/on-call |
| G8 Independent acceptance | Reviewer and recorded decision | Self-approval or missing evidence |
| G9 Release authorization | Scoped approval, expiry, change record | No separate release authorization |

## Site-specific completion checklist

- [ ] Domain, DNS, TLS, edge and route ownership.
- [ ] Public/private asset separation and allowlisted build output.
- [ ] Responsive web, accessibility and browser compatibility.
- [ ] Authentication, account recovery, session expiry and MFA.
- [ ] Authorization, role boundaries, tenant isolation and admin controls.
- [ ] API contracts, rate limits, validation, error handling and idempotency.
- [ ] Database migrations, backup, restore, retention and audit.
- [ ] Secrets, config, rotation and environment separation.
- [ ] Build, CI, test, artifact provenance and signing.
- [ ] Integration handshakes, webhooks and reconciliation.
- [ ] Observability, SLOs, alerts, incident response and support.
- [ ] Security, privacy, legal/rights and data governance.
- [ ] Distribution channels and delivery/rollback.
- [ ] Documentation, training, ownership and maintenance.
