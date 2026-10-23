# Contributing to LINGO Legacy

## Change workflow

1. Work on an isolated branch.
2. Keep changes focused and document the rationale.
3. Run the relevant lint, syntax, and validation checks.
4. Open a pull request for review; do not merge your own infrastructure changes without the required approval.
5. Include validation evidence and clearly identify checks that were not run.

## Infrastructure safety

- Never commit credentials, tokens, private keys, local state files, or secret-bearing logs.
- Do not run Terraform apply, mutate hosts with Ansible, deploy to Kubernetes, or change production routing from a validation job.
- Do not treat GitHub-hosted CI success as evidence that the canonical self-hosted G02 runner is healthy.
- G02 acceptance requires real runner assignment, instantiated/executed steps, retrievable logs, correlated artifacts, and independent verification.
- Preserve the production and last-known-good release boundaries.
- Mark unknown evidence as BLOCKED or UNVERIFIED; never infer a pass.
