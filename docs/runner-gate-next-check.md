# Runner Gate — Next Check

Canonical runner contract remains `ubuntu-latest`.

The repository-side gate is fail-closed until GitHub Actions produces all required evidence:

1. runner_id > 0
2. non-empty runner name
3. hosted ubuntu-latest execution
4. executable step created
5. step reaches in_progress/completed
6. step logs available
7. smoke workflow succeeds

No deployment, activation, or Last Known Good mutation is authorized by this document. This file exists only to record the current diagnostic boundary after removal of the obsolete ubuntu-24.04 isolation workflow.
