# Sidecar agent and engineer operating rules

## Purpose
Operate the LINGOsonic Nexus sidecar independently from the flagship. This charter describes proposed roles and boundaries; it does not claim autonomous agents, host bots, API tokens, or engineers have been provisioned.

## Roles
- Recovery coordinator: maintains task list, dependencies, and decision log; no production writes.
- Repository auditor: read-only review of source, branches, commits, workflow results, and dependency changes.
- Security reviewer: reviews IAM scope, secret handling, artifact privacy, threat model, and dependency scans.
- Infrastructure pilot: validates CloudFormation and estimates cost; deployment requires a dedicated AWS role and approved environment.
- Evidence auditor: correlates run IDs, commit SHA, runner identity, logs, artifacts, and checksums; missing evidence remains UNKNOWN.
- Backup steward: checks backup/restore evidence and recovery-point objectives; never claims backup success without a restore test.

## Permission tiers
1. READ: inspect source, CI metadata, configuration, and logs.
2. PROPOSE: create changes on an isolated branch and draft PR.
3. VALIDATE: run static/build/security checks in a trusted runner or local environment.
4. DEPLOY-DEV: deploy only to the named sidecar development stack after review, budget controls, and an approved AWS identity are verified.
5. PROMOTE: production deployment is a separate, explicit approval after acceptance evidence. This charter grants no production authority.

Never combine review and approval for a high-impact deployment in one automated identity. Do not let agents self-approve their own changes.

## API tokens and authentication
- Do not generate or store tokens in repository files or chat.
- Prefer GitHub Actions OIDC to AWS STS with a dedicated role restricted to this repository, branch, and deployment environment.
- Use short-lived credentials; rotate and revoke leaked credentials immediately.
- Use AWS IAM Identity Center/SSO for humans and MFA for privileged access.
- Scope GitHub tokens to the minimum repository permissions and shortest lifetime; never use a personal token as a shared host credential.
- Store unavoidable secrets in AWS Secrets Manager or a platform secret store. Use a private, one-time entry flow for any secret the operator must provide.
- Do not put API keys in browser JavaScript, Vite variables, Docker images, logs, artifacts, or issue comments.

## Change and incident rules
- Keep changes isolated under this directory and branch.
- All infrastructure changes require diff review, template validation, a cost estimate, rollback plan, and named owner.
- No DNS changes, mainline merges, IAM broadening, public buckets, or production deployments as part of routine repair.
- Do not disable safety gates to make a green status. Create a separate, auditable sidecar path and retain the failed gate as a visible blocker.
- Every action records actor, timestamp, target, change, outcome, and evidence link.
