# LINGO LEGACY — Contributor Quickstart
**Purpose:** Make it easy for every authorized contributor to find the right work, use the right tools and hand off safely.

## Before starting
1. Confirm your assigned product, workstream owner and task.
2. Use the canonical repository and exact branch supplied by the owner. Do not create a replacement project.
3. Confirm your named account, MFA and least-privilege access.
4. Read the product README, architecture decisions, security policy and relevant runbook.
5. Confirm the target environment: local, development, test, staging or production.

## Safe working sequence
1. Pull the latest approved branch and record the commit SHA.
2. Follow the repository's pinned runtime and package-manager versions.
3. Install from the committed lockfile.
4. Run documented local checks.
5. Create a focused branch and make a small, reviewable change.
6. Add or update tests and documentation.
7. Open a pull request with purpose, scope, risks, tests, evidence and rollback notes.
8. Wait for required review and CI checks.
9. Never merge or deploy around a failed or missing required gate.

## Never do these
- Put passwords, API keys, tokens or private customer data in code, prompts, tickets, logs or screenshots.
- Point a staging build at production data or credentials.
- Run destructive migrations, change DNS, rotate production secrets, delete assets or promote production without explicit approval.
- Treat an empty CI run, preview URL, local test or uploaded artifact as production acceptance.
- Copy a product into a new app because its canonical repository is blocked.
- Make a manual infrastructure change without recording it and opening the corresponding reconciliation task.

## Handoff template
- Product/workstream:
- Task and owner:
- Repository / branch / commit:
- Environment:
- Changes made:
- Commands and tests run:
- Exact results and evidence links:
- Remaining risks / blockers:
- Rollback or recovery:
- Next action and next owner:

## Ask for help
Escalate access problems, unclear ownership, missing documentation, security findings, data loss risk, failing deployments and production-impacting issues to the designated workstream owner. Stop unsafe work; continue independent safe tasks.
