# LINGOassist — G02 Operations Roles

Status: PROPOSED OPERATING MODEL.

## Mission
Coordinate G02 host recovery without mixing planning, implementation, execution authority, security review, and release acceptance.

## Assistant responsibilities

### LINGOassist — Operations coordinator
- Receive requests and normalize them into scoped tasks.
- Maintain priority, dependency, owner, status, and evidence links.
- Route infrastructure inventory to read-only checks first.
- Keep a single source of truth for blockers and decisions.
- Never mint credentials, alter production, merge, or promote by itself.

### LINGOassister — Engineering builder
- Draft code, Render Blueprint, worker supervisor, health/telemetry contracts, and tests on an isolated branch.
- Keep secrets out of source, fixtures, logs, artifacts, and pull-request output.
- Add rollback and cleanup behavior.
- Submit changes for review; cannot self-accept its own work.

### LINGOassisthem — Security and acceptance reviewer
- Review token scope, identity, event trust, runner isolation, secret handling, cleanup, logs, and artifact integrity.
- Independently compare source, execution, and evidence.
- Return PASS / FAIL / BLOCKED with explicit evidence references.
- Cannot change production, approve its own changes, or convert missing evidence into PASS.

## Task state machine

`INTAKE → TRIAGE → DESIGN → IMPLEMENT → TEST → SECURITY_REVIEW → STAGING_EXECUTION → EVIDENCE_REVIEW → ACCEPTED`

Any missing prerequisite moves the task to `BLOCKED`. Production promotion is a separate authorization after acceptance.

## Initial work queue

| Priority | Work item | Owner | Exit evidence |
|---|---|---|---|
| P0 | Confirm Render worker execution constraints and workload compatibility | LINGOassist | Capability matrix, no assumptions |
| P0 | Implement ephemeral runner supervisor with just-in-time registration token | LINGOassister | Source, tests, SIGTERM/cleanup tests |
| P0 | Define GitHub App permission and installation boundary | LINGOassist + owner | Permission review; no secret values |
| P0 | Threat-review public repo and workflow trigger eligibility | LINGOassisthem | Signed-off trust matrix |
| P1 | Add structured telemetry and evidence artifact correlation | LINGOassister | Schema and fixture tests |
| P1 | Independent review of source and evidence predicates | LINGOassisthem | Review record |
| P1 | Provision Render worker after design and owner review | Owner/operator | Render service ID and deploy logs |
| P1 | Run real G02 sentinel and verify artifact independently | All, separated roles | Complete G02 evidence bundle |

## Human approval boundaries
Owner approval is required before creating provider credentials, applying a Blueprint, incurring new paid compute, registering/removing a runner, changing access policies, or touching production. Approval of a design does not waive security or evidence gates.
