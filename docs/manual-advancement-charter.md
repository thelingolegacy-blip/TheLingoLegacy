# LINGO Legacy — G02-Independent Manual Advancement Charter

**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Operating mode:** Human-controlled, project-scoped advancement  
**Effective scope:** Development, repair, integration, verification, review, and release-record administration  
**Explicit exclusion:** G02/Fallgate is not an enterprise-wide prerequisite or advancement dependency.

## 1. Authority and boundaries

GitHub is the source of truth for this repository. The charter establishes an independent advancement path; it does not declare the repository, products, or production runtime operational by itself.

G02/Fallgate may continue as a separate infrastructure-recovery workstream. Its runner registration, availability, workflow completion, artifacts, and evidence are not prerequisites for unrelated project work or for using the manual advancement workflow in this repository.

This charter does **not** bypass applicable product-specific controls. Security, privacy, licensing, data integrity, functional QA, deployment verification, and explicit production authorization remain required where relevant.

No workflow in this manual-control path deploys to production, changes Cloudflare, modifies Firebase, changes secrets, or merges a pull request.

## 2. Project lifecycle

Canonical stages:

1. `NOT_ASSESSED` — inventory baseline; not a claim of completion or failure.
2. `PLANNED`
3. `READY`
4. `IN_PROGRESS`
5. `REPAIR`
6. `VERIFICATION`
7. `REVIEW`
8. `APPROVED`
9. `COMPLETED`
10. `RELEASE_READY`
11. `RELEASED`

Exceptional states: `BLOCKED`, `PAUSED`, `REJECTED`, and `ROLLBACK`.

A project can move independently of other projects when its own dependencies and evidence are satisfied. A global enterprise status must never be inferred from one project’s status.

## 3. Permitted transitions

| Command | Required source | Target | Authority / evidence |\n| `assess` | NOT_ASSESSED | PLANNED | Inventory, scope, owner, and dependencies reviewed |
|---|---|---|---|
| `advance` | PLANNED | READY | Project scope and dependencies recorded |
| `advance` | READY | IN_PROGRESS | Work owner and plan identified |
| `advance` | IN_PROGRESS | REPAIR or VERIFICATION | Work evidence or repair scope |
| `advance` | REPAIR | VERIFICATION | Repair evidence |
| `advance` | VERIFICATION | REVIEW | Test/evidence summary |
| `advance` | APPROVED | COMPLETED | Acceptance criteria satisfied |
| `advance` | COMPLETED | RELEASE_READY | Release checklist and risk review |
| `request-review` | VERIFICATION | REVIEW | Verification evidence |
| `approve` | REVIEW | APPROVED | Repository owner approval and evidence |
| `hold` | Any non-terminal state | PAUSED | Rationale |
| `resume` | PAUSED | A valid active stage | Rationale and evidence |
| `request-release` | COMPLETED | RELEASE_READY | Release candidate evidence |
| `record-release` | RELEASE_READY | RELEASED | Repository owner confirmation plus deployed/live evidence URL |
| `reject` | REVIEW | REJECTED | Review findings |
| `rollback` | RELEASED or RELEASE_READY | ROLLBACK | Incident/change record and recovery evidence |

The validator rejects unsupported transitions. A hold is not an approval. A request for review or release is not approval. A release record documents an already completed, independently verified release; it does not perform a deployment.

The initial catalog is `ops/manual-control/projects.json`. All nine top-level divisions begin at `NOT_ASSESSED`; this is an honest inventory baseline, not a claim that any product is incomplete or complete. Assess actual status, ownership, and dependencies before advancing each project to `PLANNED`. Only registered project keys are accepted by the validator.\n\n## 4. Manual control workflow

Run **Actions → LINGO Manual Advancement → Run workflow** and supply:

- Project key (for example, `LINGOlegacy`, `LINGOslots`, or a repository workstream key).
- Command.
- Current stage and target stage.
- Evidence URL (HTTPS).
- Rationale.
- Exact confirmation phrase for privileged commands.

The workflow validates the requested transition and creates a GitHub issue as an immutable-by-convention transition record. The issue includes actor, run URL, timestamp, project, source/target stages, evidence, and rationale. The workflow does not silently update application state: the project owner must reconcile the latest accepted transition records into the project board/registry.

Privileged commands `approve` and `record-release` are restricted to the repository owner account. `record-release` additionally requires the exact confirmation `RELEASE <PROJECT_KEY>`.

## 5. Evidence contract

Every transition must cite an HTTPS evidence URL and state what the evidence proves. Suitable evidence includes a commit or PR, test report, QA artifact, security review, deployment record, live probe, incident record, or approved project decision.

A green build alone does not prove production is live. A release record requires evidence of the deployed version and successful live verification. Evidence must not contain credentials, tokens, private keys, personal data, or other secrets.

## 6. Operating rules

- Preserve last-known-good versions and use reviewed, scoped changes.
- Keep project dependencies explicit and project-local.
- Parallelize independent work; serialize only genuine shared-resource dependencies.
- Record blocked work with the exact blocker and an owner.
- Do not manufacture test results, runner telemetry, approvals, deployment results, or artifacts.
- Do not use G02/Fallgate as a global hold on independent work.
- Do not treat manual advancement as permission to bypass legal, security, privacy, or production controls.
- Keep changes on feature branches and use pull requests for review.
- Never expose secrets in issues, workflow inputs, logs, or artifacts.

## 7. Definition of operational

The manual advancement system is operational when:
1. The workflow is visible and manually dispatchable.
2. Invalid transitions are rejected.
3. Valid transitions create traceable GitHub issue records.
4. Privileged actions enforce the owner check and confirmation phrase.
5. No G02/Fallgate dependency is present in this workflow.
6. The workflow has been executed and its result inspected.

Repository configuration and workflow dispatchability do not prove product readiness or production readiness. Those are assessed independently for each product.
