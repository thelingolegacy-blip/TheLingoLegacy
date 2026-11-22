# LINGOlegacy Reset Center

**Status:** Prototype v0.1 · feature branch only · not deployed  
**Canonical repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Entry point:** [`index.html`](./index.html)

## Purpose

The Reset Center is the recovery and release-governance workspace for LINGOlegacy. It gives operators one consistent view of known incidents, recovery priorities, system lanes, evidence quality, and change boundaries.

It is designed around a simple rule:

> Diagnose first. Preserve last-known-good. Make the smallest reversible change. Verify with evidence. Promote only after independent acceptance.

## Current implementation

The current deliverable is a responsive, self-contained HTML/CSS/JavaScript prototype.

- Overview: readiness posture, critical findings, release gates, and prioritized recovery queue.
- Diagnostics: recorded GitHub, Cloudflare, Firebase, Supabase, and AppDeploy findings.
- Recovery plans: staged waves from security containment through enterprise release certification.
- System lanes: eight LINGO divisions and their acceptance boundaries.
- Governance: release gates, action authorization matrix, and six-step safe recovery protocol.
- Utilities: copyable recovery checklist and text snapshot export.
- Accessibility basics: semantic landmarks, labeled navigation, keyboard-focus styles, and responsive layouts.

The prototype is intentionally **not connected to live systems**. Its status values are the assessment baseline, not live telemetry. It does not execute resets, repairs, deployments, runner actions, database mutations, identity changes, payment actions, or DNS/Worker changes.

## Run locally

Open `index.html` in a modern browser. No package installation or build step is required for this static prototype.

## Current governing baseline

- Production: **PROTECTED HOLD**.
- G02: **FAIL / UNVERIFIED**.
- G03–G11: **HELD**.
- Public operational asset boundary: **FAIL — remediation required**.
- Integration acceptance: **BLOCKED**.
- Independent review: **NOT ACCEPTED**.
- Rollback readiness: **UNVERIFIED**.
- Incremental spend: **$0 target**.

Re-check all live systems before treating these values as current. Do not silently convert an unavailable source into a passing result.

## Status semantics

| Status | Meaning |
|---|---|
| PASS | Test executed and passed with retrievable evidence |
| FAIL | Test executed and failed |
| BLOCKED | Known dependency or permission prevents the test |
| NOT RUN | Test has not been attempted |
| UNVERIFIED | Available evidence cannot establish the result |
| HELD | Release or action is intentionally paused by governance |

A plan, draft PR, uploaded artifact, preview URL, or green-looking dashboard is not acceptance evidence by itself.

## Recovery workflow

1. **Identify scope:** exact component, environment, owner, incident, and dependencies.
2. **Capture baseline:** source commit, configuration, deployment ID, logs, backup, and health.
3. **Classify impact:** security, data integrity, availability, cost, and customer exposure.
4. **Authorize:** named approver, narrow scope, change window, and rollback trigger.
5. **Execute and verify:** one controlled change followed by automated and human checks.
6. **Close with evidence:** immutable artifacts, correlated run/job/commit identifiers, reviewer, and rollback disposition.

## Recovery waves

- **Wave 0 — Protect and establish truth:** contain public asset exposure; diagnose CI startup; verify branch protection; retain G02 hold; reconcile source and production deployment provenance.
- **Wave 1 — Shared foundations:** identity and API contracts; primary transactional data ownership; public/private asset separation; evidence-producing CI.
- **Wave 2 — App restoration:** re-test Universe Gateway, Kotton's Code, LINGO Travel, flagship web, and Flutter.
- **Wave 3 — Product acceptance:** certify each division independently, including games, commerce, privacy, rights, accessibility, browser and device journeys.
- **Wave 4 — Enterprise release certification:** security, operations, backup/restore and rollback rehearsal, evidence review, independent acceptance, and explicit release authorization.

## Planned integration architecture

Live integration is a separate, gated phase. The intended direction is:

- GitHub remains source of truth for code, review, CI evidence, and release provenance.
- Cloudflare remains the intended authoritative edge; deployments must be traceable to a canonical commit and immutable artifact.
- Firebase and Supabase responsibilities must be explicitly decided before either is treated as a production writer. Avoid competing identity or transactional data authorities.
- The Reset Center backend should expose narrowly scoped, authenticated read-only diagnostics first.
- Write actions must be separate commands with least-privilege credentials, server-side authorization, idempotency, audit logging, approval checks, and explicit rollback handling.
- Secrets must never be rendered in the browser, logs, exported snapshots, or client-side source.
- The dashboard must distinguish cached assessment data from live, timestamped source results.

## Integration gates

Before enabling any live connector:

- Define the source of truth and exact read scopes for each provider.
- Keep provider credentials server-side; never embed tokens in `index.html`.
- Add authentication, role-based authorization, and audit trails.
- Add freshness timestamps, request IDs, source links, and explicit stale/unavailable states.
- Test pagination, rate limits, partial failures, permission denials, and malformed provider responses.
- Add contract tests and fixture-based tests before live credentials are used.
- Keep all write APIs disabled until their separate approval model is reviewed.
- Never use the dashboard as a shortcut around GitHub branch protection or release controls.

## Minimum acceptance checklist

### Security and privacy
- [ ] Public build contains only explicitly allowlisted public files.
- [ ] Operational pages, logs, configuration, source maps, and integration registers are not publicly exposed.
- [ ] No credentials or secrets exist in client bundles or exported files.
- [ ] Authentication and authorization are tested for every protected route.
- [ ] Security negative-path tests prove unauthenticated access is denied.

### Reliability and evidence
- [ ] Every status is tied to a source, observation timestamp, and evidence reference.
- [ ] Stale data is visibly marked; source outages do not appear as green.
- [ ] Each test result is correlated to repository, commit, run, job, and artifact where applicable.
- [ ] CI startup failures are repaired and independently verified.
- [ ] G02 evidence meets the governing runner and sentinel-job requirements; no duplicate registration.
- [ ] G03–G11 remain held until their dependencies and acceptance criteria are satisfied.

### Recovery and release
- [ ] Last-known-good artifact and configuration are identified.
- [ ] Backup restoration has been rehearsed and evidenced.
- [ ] Rollback trigger, owner, and procedure are documented.
- [ ] Browser, mobile, accessibility, integration, and regression checks pass.
- [ ] Independent reviewer accepts the evidence.
- [ ] Release authorization is explicit and recorded.

## Non-goals for this prototype

This branch does not authorize or implement production reset buttons, automatic rollback, runner registration, workflow dispatch, DNS changes, Worker promotion, database migration, identity migration, payment activation, purchases, or repository consolidation.

## Change policy

Keep work on this feature branch until review. Do not merge to `main`, deploy, or change live infrastructure as part of prototype completion. A feature-branch commit is not a production release.
