# Recovery Bots and Agent Boundaries

## Approved agent roles
- **Repository discovery agent:** reads branches, workflows, open PRs, issues, and commit status; produces a dated inventory.
- **Host telemetry agent:** executes `ops/estate/host-agent/diagnose-host.sh` on an authorized Linux host and returns the report plus checksum.
- **Evidence verifier:** correlates run, attempt, job, runner identity, commit, logs, artifacts, and checksums; may report PASS/FAIL but cannot authorize promotion.
- **Build agent:** runs lint/static validation/media-manifest generation in an isolated branch; no production credentials.
- **Restore planner:** compares a candidate to a verified checkpoint and writes a proposed diff; cannot force-push or overwrite LKG.
- **Release approver:** human-only responsibility for merge, deployment, activation, and production mutation.

## Permission boundaries
1. Discovery bots: read-only.
2. Build bots: write only to dedicated implementation branches through normal PR flow.
3. Self-hosted runners: ephemeral/isolated where possible; no production secrets; never execute untrusted fork code.
4. Restore tooling: dry-run by default and requires an explicit target SHA plus reviewed diff.
5. Activation and merge bots: disabled until policy is approved; no bypass tokens.
6. Secrets are supplied by a secret manager at runtime and must never appear in logs, manifests, artifacts, or source.

## Status semantics
`CREATED` means an artifact or config exists. `RUNNING` requires a real process/job. `PASS` requires observed successful evidence. A queued job is not running; a configured host is not registered; a registered runner is not assigned; a workflow file is not a successful pipeline.
