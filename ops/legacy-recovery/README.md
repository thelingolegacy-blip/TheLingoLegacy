# LINGO Legacy Recovery Infrastructure Framework

Status: DESIGN / SAFE MODE. This framework is not proof of provisioned hosts, registered runners, running bots, or a successful deployment.

## Non-negotiable safety boundary

- Work only from `dev/isolated-workspace-2026-10-10` until review and explicit merge approval.
- Preserve `main`, production DNS, Cloudflare Worker routes, production secrets, and current last-known-good (LKG) state.
- No covert backdoor, hidden persistence, bypass credential, or unaudited access path. "Back door entry" is implemented as a documented, authenticated, least-privilege break-glass recovery procedure with MFA, named human approval, time limits, audit logging, and revocation.
- No global "turn all switches on." Enable capabilities one at a time after a preflight and rollback plan.
- No production merge, deploy, DNS mutation, secret rotation, or automation with external side effects without a separate scoped approval and gate evidence.
- Never execute untrusted pull-request code on a privileged/self-hosted runner. Do not expose a Docker socket to untrusted jobs.
- Do not put credential values in source, artifacts, issue comments, or logs.

## Target architecture

1. **Source of truth** — GitHub repository and isolated feature branches; GitLab can be a separately verified mirror, not a competing authority.
2. **Infrastructure as code** — Terraform/OpenTofu modules, reviewed plans, environment-specific state, remote state with locking, encryption, least-privilege IAM, and protected state backups.
3. **Provisioning/configuration** — Ansible playbooks with explicit inventories, idempotent tasks, check mode before apply, encrypted secret references (never plaintext), and a recorded diff.
4. **Runner plane** — dedicated, ephemeral, isolated Linux x64 runners; initially one manually provisioned runner, then scale only after assignment and evidence acceptance. Runner identity/labels: `lingo-legacy-g02`, `self-hosted`, `linux`, `x64`, `lingo-g02`.
5. **Container plane** — Docker Compose for a small isolated runner host where appropriate; rootless or hardened runtime where compatible, read-only mounts where possible, CPU/memory/PID limits, no host networking, no Docker socket mounted into job containers, and explicit image pinning.
6. **Workflow plane** — YAML workflows with least-privilege permissions, concurrency groups, timeouts, bounded retries, artifact retention, and fail-closed promotion gates.
7. **Observability** — Prometheus metrics and alert rules, structured redacted logs, traceable workflow/run/job/attempt/commit identifiers, and retention limits. Slack is notification-only until channel and app scopes are reviewed; no secrets or raw sensitive logs in messages.
8. **Cloud/runtime** — Cloudflare remains the canonical production edge. AWS/Azure/Gigatech or any other host provider can be evaluated for an isolated runner only after an account is verified, a cost ceiling is set, region and network boundaries are approved, and resource inventory/teardown are documented. No infrastructure was provisioned by this document.
9. **Recovery control plane** — runbooks and a signed evidence bundle; no autonomous bot may merge, deploy, change DNS, expose an origin, grant privileges, or alter identity policy. Bots can inventory read-only, validate plans, run safe tests, redact logs, and open proposed patches/PRs.

## Fail-closed acceptance gates

- G00: source and required branch confirmed.
- G01: credentials handled by approved provider identity, without being printed or committed.
- G02: actual matching runner registered and assigned; positive runner ID and name; steps instantiated; sentinel succeeds; logs are generated and retrievable.
- G03: artifact is retrievable and correlates run ID, job ID, attempt, commit SHA, runner ID/name, timestamp, and workflow path.
- G04: independent verifier checks authenticity, integrity, completeness, scope, and correlation.
- G05: CI/security checks and infrastructure plan pass.
- G06: draft PR reviewed; no unresolved blockers; explicit merge decision.
- G07: deployment uses isolated staging and produces independently retrievable health evidence.
- G08: production gate separately authorized; DNS/routes unchanged until explicit approved cutover.
- G09: after activation, verify externally from independent network/client and preserve rollback path.

A missing item is BLOCKED, not inferred PASS. Queued jobs, blank runner IDs, empty steps, absent artifacts, and unavailable logs are not execution evidence.

## Timeouts, retries, and capacity

- Workflow timeout: finite per job; never infinite.
- Retry only transient, idempotent operations; exponential backoff with jitter; bounded attempts; no retries for authorization, configuration, or policy errors.
- Concurrency: one controlled infrastructure mutation per environment; cancel-in-progress disabled for protected apply/release jobs.
- Runner capacity: start with one isolated runner; observe queue latency, utilization, and job duration before increasing. No unbounded auto-scaling.
- Space: artifacts/logs retain only required evidence; expire ephemeral workspaces; reserve capacity for diagnostics; do not delete backups or state to free space.
- Timers/schedules: disabled by default until owner, cadence, timezone, run window, overlap behavior, failure notification, and stop condition are recorded.

## Break-glass ("backdoor replacement") procedure

1. Named on-call human starts a tracked incident/issue and states purpose.
2. Authenticate through the normal identity provider with MFA; request the narrowest short-lived role/session.
3. Require independent approval for privileged or production scope.
4. Record session start/end, ticket, commands/actions, scope, and outputs in a redacted audit record.
5. Disable/revoke temporary access immediately after recovery; verify revocation.
6. Run post-incident review and rotate only implicated credentials under separate approval.
7. Any unlogged or hidden access path is prohibited.

## Immediate execution sequence

1. Confirm the isolated branch and inspect this patch.
2. Read-only inventory: GitHub runner settings/Actions policy, CI runs/jobs, GitLab project identity, Cloudflare Workers/routes/zones/storage bindings, provider accounts/cost limits, and existing host inventory.
3. Reconcile duplicate runner registrations before any registration attempt.
4. Provision a dedicated host through an explicitly verified non-Vercel provider or an authorized existing host operator. The connected GitHub interface cannot provision a host shell by itself.
5. Run preflight/check mode; review the plan; provision host; configure runner; prove actual sentinel job execution.
6. Independently retrieve and verify logs and artifact; record G02 decision.
7. Run static and security tests on isolated branches; build a draft PR; review before merge.
8. Staging deployment only after gates pass. Production activation remains blocked until public reachability and rollback are independently verified.

## Current honest state (at time this framework was authored)

- Isolated development branch: created.
- Host provisioning: not performed.
- Runner registration/assignment: not verified; previous G02 evidence indicated queued job, runner ID 0, no instantiated steps, no retrievable logs/artifacts.
- Cloudflare production edge was previously internally traced, but independent public reachability was failed/unverified.
- Terraform/Ansible/Prometheus/Slack automation: design only; no live integration or deployed agent asserted.
- Mainline merge, production deployment, DNS change: not performed.
