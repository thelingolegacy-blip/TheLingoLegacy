# LINGOlegacy Operations Centers

**Current status:** Feature-branch prototypes and operating specifications · not deployed · not connected to live provider APIs.

## Enterprise operations hub

- [Enterprise Operations Center](./enterprise-operations/index.html) — unified navigation and operating overview for all centers.
- [Enterprise Operations Charter](./enterprise-operations/README.md) — scope, center directory, status semantics, security boundaries and completion criteria.
- [Operating Lifecycle](./enterprise-operations/OPERATING-LIFECYCLE.md) — discover through operate, plus recovery loop and G0–G9 release gates.
- [Identity, Access & Approval](./enterprise-operations/IDENTITY-ACCESS-APPROVAL.md) — authentication, authorization, access, approvals, emergency access and revocation.
- [Evidence & Acceptance Standard](./enterprise-operations/EVIDENCE-ACCEPTANCE-STANDARD.md) — evidence quality levels, provenance, independent verification and acceptance.
- [Documentation, Training & Memory Governance](./enterprise-operations/DOCUMENTATION-TRAINING-MEMORY.md) — controlled docs, runbooks, role-based training, memory separation and retention.

## Existing operational prototypes

- [Reset Center](./reset-center/index.html) — recovery planning, diagnostics baseline, system lanes and release-control boundaries.
- [Test Center](./test-center/index.html) — test suite register, CI evidence requirements, QA coverage and exportable evidence manifest.
- [Release Center](./release-center/index.html) — release gate matrix, candidate lifecycle, approval requirements and exportable change request.
- [Production Center](./production-center/index.html) — environment inventory, operational safeguards and exportable change record.

## Additional centers defined by the enterprise charter

Enterprise Operations Center defines the following coordinated responsibilities: Enterprise Control Tower; Evidence; Execution; Recovery; Verification; Distribution; Delivery; Authentication; Access & Authorization; Integration & Handshake; Build & CI; Configuration & Secrets; Security & Privacy; Data & Memory Governance; Documentation & Training; Observability & Incident; Backup & Continuity; Acceptance & Release; Production & Environment; Asset & Content; Resource & Cost; Support & Maintenance.

These are logical centers and responsibility boundaries. Their definition does not claim each has a separately provisioned UI, database, service, staffing model or live integration.

## Shared operating contract

1. GitHub remains source of truth for source, reviews, CI and release provenance.
2. Production remains PROTECTED HOLD until all release gates have evidence and an independent reviewer accepts them.
3. Distinguish PASS, FAIL, BLOCKED, NOT RUN, UNVERIFIED, STALE, PARTIAL and HELD.
4. Read-only provider integrations must be authenticated, least-privilege, server-side, timestamped and auditable before being enabled.
5. Do not place credentials, private memory or sensitive payloads in client code, logs or exports.
6. Write operations require separate approval, server-side authorization, idempotency, audit trail and rollback plan.
7. Preserve last-known-good, G02 quarantine, branch protections, and no unapproved paid resources or production mutations.
8. Authentication, authorization, approval, acceptance and release authorization are separate controls.
9. Training, runbooks, data/memory governance, support and maintenance are completion requirements.

## Current known constraints

The existing pages are static prototypes. No live provider inventory/health aggregation, authentication, operational database, approval engine, workflow dispatch or production action surface is connected. Refresh live systems before using any historical dashboard state as current.

## Acceptance before production use

- Browser/mobile QA, accessibility and security review.
- CI startup repair and evidence-producing test execution.
- Public/private asset-boundary verification.
- Authenticated read-only integrations with freshness, provenance and partial-failure handling.
- Server-side identity, access policy, approval workflow and immutable audit.
- Independent review and explicit release authorization.
- Backup/restore and rollback rehearsal.
- Role-based training, controlled documentation, operational ownership and support readiness.
