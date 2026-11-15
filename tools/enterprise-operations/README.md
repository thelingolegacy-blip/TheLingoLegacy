# LINGO Enterprise Operations Center

**Status:** Feature-branch implementation · v0.1 · not deployed · no live provider actions  
**Canonical repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `feature/lingo-enterprise-operations-centers`  
**Parent foundation:** `feature/lingo-reset-center`  
**Production disposition:** PROTECTED HOLD

## Purpose

This is the operating system blueprint and navigation hub for completing, operating, recovering, verifying, accepting, distributing and delivering every LINGO site, realm, product, service and infrastructure component. It extends the existing Reset, Test, Release and Production Center prototypes rather than replacing them.

The Center is an operational governance layer. It does not become a second source of truth: GitHub remains authoritative for code, issues, reviews, commits, CI runs and release provenance. Provider systems remain authoritative for their own live resource state. The Center records source references, freshness, decisions and evidence pointers.

## Center directory

| Center | Primary responsibility |
|---|---|
| Enterprise Control Tower | Portfolio command, system map, priorities, blockers, dependencies and operating posture |
| Evidence Center | Evidence ledger, provenance, artifact index, run/job/commit correlation and retention |
| Execution Center | Approved work queue, task dispatch, runbooks, execution logs and checkpoints |
| Recovery Center | Incident intake, diagnostics, containment, restore, rollback and post-incident review |
| Verification Center | Test plans, independent checks, security validation and acceptance evidence |
| Distribution Center | Artifact/package/channel/catalog distribution, signing and audience eligibility |
| Delivery Center | Environment promotion, deployment coordination, cutover, release notes and post-delivery checks |
| Authentication Center | Login, identity provider, session, MFA, OIDC/OAuth, account lifecycle and federation |
| Access & Authorization Center | RBAC/ABAC, least privilege, approvals, scoped grants, separation of duties and revocation |
| Integration & Handshake Center | Provider connections, service contracts, API/webhook checks, connectivity and reconciliation |
| Build & CI Center | Toolchains, reproducible builds, GitHub Actions, runners, tests and artifact generation |
| Configuration & Secrets Center | Environment configuration, secret references, rotation, validation and exposure response |
| Security & Privacy Center | Threat models, vulnerability management, privacy controls, data classification and security exceptions |
| Data & Memory Governance Center | Data ownership, retention, lineage, user memory boundaries, deletion and consent controls |
| Documentation & Training Center | Runbooks, architecture records, SOPs, onboarding, role-based training and competency records |
| Observability & Incident Center | Health, logs, metrics, traces, SLOs, alerts, incidents and service ownership |
| Backup & Continuity Center | Backup policy, restore tests, disaster recovery, business continuity and RPO/RTO |
| Acceptance & Release Center | Quality gates, independent acceptance, release decisions, change records and release authorization |
| Production & Environment Center | Environment inventory, runtime posture, operational readiness and production safeguards |
| Asset & Content Center | Code/assets/content manifests, licensing, provenance, public/private boundaries and publishing rights |
| Resource & Cost Center | Provider inventory, quotas, spend, free-tier controls, budgets and teardown evidence |
| Support & Maintenance Center | Service desk, knowledge base, defects, maintenance windows, lifecycle and customer support |

## Shared operating lifecycle

`DISCOVER → INVENTORY → RECONCILE → PLAN → CLASSIFY RISK → AUTHORIZE → EXECUTE → VERIFY → ACCEPT → DISTRIBUTE → DELIVER → OBSERVE → MAINTAIN`

A failure or drift routes to `CONTAIN → RECOVER → RESTORE/ROLL BACK → VERIFY → REVIEW → CLOSE`. No stage may be silently skipped.

## Universal record contract

Every operational record must include, where applicable:

- Stable record ID and record type.
- Product/realm, service, repository and component IDs.
- Environment and region.
- Owner and accountable operator.
- Source system and exact source URL/identifier.
- Created, observed and last-verified timestamps (UTC).
- Source commit, build, workflow run, job, artifact digest and deployment ID.
- Status, severity, confidence and freshness.
- Dependencies, change scope, impact and rollback reference.
- Approver(s), authorization scope, expiry and separation-of-duties evidence.
- Verification result, acceptance decision and reviewer.
- Retention class, data classification and access policy.

Never fabricate a source reference, timestamp, test result, approval, owner or provider state. Unknown is `UNVERIFIED`, not PASS.

## Status vocabulary

- `BACKLOG`: captured but not ready.
- `READY`: prerequisites and owner are defined.
- `ASSIGNED`: owner accepted the work.
- `IN_PROGRESS`: execution started with an authorized scope.
- `REVIEW`: execution completed; evidence awaits review.
- `VERIFIED`: defined checks passed with retrievable evidence.
- `ACCEPTED`: authorized independent acceptance recorded.
- `BLOCKED`: a named dependency or permission prevents progress.
- `FAILED`: an executed operation or test failed.
- `NEEDS_APPROVAL`: explicit authorization is required.
- `REJECTED`: reviewer declined the submission.
- `NOT_RUN`: no execution evidence exists.
- `UNVERIFIED`: available information cannot establish the result.
- `HELD`: governance intentionally pauses the action.

A workflow startup failure with zero jobs is an infrastructure/startup failure, not a code test failure. A draft, preview, static validation, screenshot or plan is not proof of live operation.

## Security and authority boundary

1. Read-only integrations first; provider credentials remain server-side.
2. Deny by default; least privilege; scoped, time-limited grants.
3. Authentication proves identity; authorization determines permitted action. They are never interchangeable.
4. Approval is a recorded decision, not an access token. Authorization is a policy decision, not a checkbox.
5. High-risk changes require independent approval and separation of duties.
6. Emergency override cannot bypass authentication, privacy, tenant isolation, security policy or immutable audit. It must be narrowly scoped, time-limited, independently reviewed and automatically expire.
7. No credentials, private memory, tokens or sensitive payloads in browser storage, logs, screenshots, issue text or exported evidence.
8. Production mutations require separate change authorization and release acceptance.
9. Preserve last-known-good and rollback capability.
10. G02 remains quarantined; do not activate it as a CI workaround.

## Known baseline carried forward

- GitHub is the source of truth; canonical repository is `thelingolegacy-blip/TheLingoLegacy`.
- Cloudflare is the intended production edge.
- Production remains PROTECTED HOLD.
- G02 remains FAIL / UNVERIFIED; G03–G11 remain held.
- GitHub Actions startup failures remain a P0 blocker; tests with no instantiated jobs have not run.
- Firebase Hosting root publication boundary, Flutter reproducibility/release signing, Cloudflare apex/www route parity, Oasis backend readiness and Vercel retirement remain tracked recovery items.
- The existing Reset Center, Test Center, Release Center and Production Center are static feature-branch prototypes. They are not live-connected operational services.
- The CORE V2 control-plane contract states that a live UI/database/provider runtime is not yet provisioned or connected.

Refresh all live facts before displaying them as current.

## Operating rules for the site

- Every status tile must display source, last observed time and freshness.
- Provider outage, missing permission, pagination truncation or stale cache must show as unavailable/stale/partial—not green.
- All write actions are disabled until a server-side policy engine, authenticated operator, scoped authorization, approval workflow, idempotency key, audit event and rollback path exist.
- No center may bypass branch protection, provider controls, payment controls, release gates or tenant boundaries.
- Exports must redact secrets and personal data by default.
- Training, documentation and acceptance are part of the deliverable, not optional follow-up work.

## Local prototype

Open `index.html` in a modern browser. It is a navigation and workflow-design prototype only. It does not authenticate users, persist authoritative operational records, connect to providers, dispatch jobs, grant access, approve changes, distribute packages or deploy applications.

## Exit criteria for a real operational site

1. Product and infrastructure inventory reconciled.
2. Approved architecture, threat model, data classification and ownership.
3. Server-side identity, MFA and authorization with negative-path tests.
4. Read-only connectors with least-privilege scopes, freshness and partial-failure handling.
5. Evidence ledger with immutable provenance and retention.
6. CI restored; actual jobs, logs, test steps and artifacts correlated to commits.
7. Build, verification, recovery, distribution and delivery runbooks tested.
8. Independent acceptance and production change authorization.
9. Backup/restore and rollback rehearsed.
10. Monitoring, on-call ownership, support, training and maintenance in place.
11. Accessibility, privacy, security, performance and device QA complete.
12. Explicit release acceptance and post-release observation.

## Related centers

See [Operations Centers](../CENTERS-README.md), [Operating Lifecycle](./OPERATING-LIFECYCLE.md), [Identity, Access & Approval](./IDENTITY-ACCESS-APPROVAL.md), [Evidence & Acceptance Standard](./EVIDENCE-ACCEPTANCE-STANDARD.md), and [Documentation, Training & Memory Governance](./DOCUMENTATION-TRAINING-MEMORY.md).
