# Manual Control Operator Runbook

## Purpose

This runbook operates the G02/Fallgate-independent manual advancement workflow in `.github/workflows/manual-advancement.yml`.

## Start a transition

1. Open the repository's **Actions** tab.
2. Select **LINGO Manual Advancement**.
3. Select **Run workflow** on the intended branch.
4. Enter the project key, command, current stage, target stage, HTTPS evidence URL, and rationale.
5. For `approve`, enter `APPROVE <PROJECT_KEY>`.
6. For `record-release`, enter `RELEASE <PROJECT_KEY>` and provide deployed/live verification evidence.
7. Inspect the run result and the created transition-record issue.
8. Update the project board/registry only after reviewing the record and confirming that the transition is accepted.

## Supported commands

- `advance`
- `hold`
- `resume`
- `request-review`
- `approve` (repository owner only)
- `request-release`
- `record-release` (repository owner only; requires deployed/live evidence)
- `reject`
- `rollback`

See [the charter](../../docs/manual-advancement-charter.md) for the transition matrix and governance rules.

## Important limits

- The workflow creates a traceable GitHub issue record. It does not automatically mutate a product's runtime or deployment state.
- The workflow never dispatches G02, registers a runner, waits for Fallgate, or reads G02 artifacts.
- No production deployment is performed by this workflow.
- Do not put secrets or personal data in inputs or evidence.
- An issue record is not proof that a project is functionally complete. Evidence must be reviewed.
