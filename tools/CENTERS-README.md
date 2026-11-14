# LINGOlegacy Operations Centers

Three coordinated control surfaces complement the Reset Center. All current pages are static feature-branch prototypes; none is connected to live provider APIs or authorized to perform production actions.

## Centers

- [Reset Center](./reset-center/index.html) — recovery planning, diagnostics baseline, system lanes and release-control boundaries.
- [Test Center](./test-center/index.html) — test suite register, CI evidence requirements, QA coverage and exportable evidence manifest. It does not dispatch workflows or claim unrun tests passed.
- [Release Center](./release-center/index.html) — release gate matrix, candidate lifecycle, approval requirements and exportable change request. It does not approve, merge or deploy.
- [Production Center](./production-center/index.html) — environment inventory, operational safeguards and exportable change record. It has no production mutation controls.

## Shared operating contract

1. GitHub remains source of truth for source, reviews, CI and release provenance.
2. Production remains PROTECTED HOLD until all release gates have evidence and an independent reviewer accepts them.
3. Distinguish PASS, FAIL, BLOCKED, NOT RUN, UNVERIFIED and HELD. A workflow startup failure is not a test pass; an unavailable source is not healthy.
4. Read-only provider integrations must be authenticated, least-privilege, server-side, timestamped and auditable before being enabled.
5. Do not place credentials in client code, logs or exports.
6. Write operations require a separate approval model, server-side authorization, idempotency, audit trail and rollback plan.
7. Preserve last-known-good, no unapproved paid resources, and no production DNS/Worker, database, identity, payment, runner or deployment changes.

## Current known constraints

The last checked Reset Center head had three GitHub Actions workflows end in startup_failure with zero jobs and zero artifacts. Browser/device QA was not completed. These are historical observations; refresh the live sources before using the dashboards as current status. No live integration or production acceptance is implied by the existence of these pages.

## Local use

Open each HTML file in a modern browser. No package install or build step is required for these static prototypes. The forms create local draft JSON/text and downloads only.

## Acceptance before production use

- Browser and mobile QA, accessibility review and security review.
- CI startup repair and evidence-producing test execution.
- Public/private asset-boundary verification.
- Authenticated read-only integrations with freshness, provenance and partial-failure handling.
- Independent review and explicit release authorization.
- Backup/restore and rollback rehearsal.
