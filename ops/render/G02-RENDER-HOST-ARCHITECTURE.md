# LINGOlegacy G02 — Render Host Architecture (Proposal)

Status: DESIGN ONLY — NOT DEPLOYED, NOT ACCEPTED.

## Objective
Provide a dedicated Render-hosted Linux x64 execution service for the repository-scoped GitHub Actions runner `lingo-legacy-g02`, with an auditable control plane and separate assistant roles.

## Important platform boundary
A Render Background Worker is a long-running container process, not a general-purpose VM with systemd or a guaranteed Docker daemon/socket. The current G02 sentinel checks Docker availability but does not require Docker to pass its runner-identity predicate. Workflows that require a privileged Docker daemon or host-level system services must use a separately provisioned VM/runner pool; do not expose a host Docker socket to untrusted jobs.

The existing runner image uses an ephemeral GitHub Actions runner. The current `entrypoint.sh` requires a pre-supplied `RUNNER_TOKEN`, registers once, then executes `run.sh`. It is not a continuously renewing Render worker supervisor. Do not deploy the current image as a permanent service without implementing and reviewing the supervisor lifecycle.

## Target topology

```text
GitHub repository: thelingolegacy-blip/TheLingoLegacy
        |
        | workflow_dispatch / trusted event only
        v
GitHub Actions control plane
        |
        | short-lived runner registration token
        | (minted just-in-time; never stored in source)
        v
Render Background Worker: lingo-legacy-g02
  - non-root runner process
  - ephemeral runner registration (one job)
  - guarded workspace cleanup
  - graceful SIGTERM / drain
  - bounded retry/backoff
  - no public inbound listener
        |
        +--> GitHub Actions job + logs
        +--> retrievable evidence artifact
        +--> redacted operational telemetry

LINGOassist / LINGOassister / LINGOassisthem
        |
        v
Task registry + approval gates + evidence ledger
        |
        +--> read-only inventory and diagnosis
        +--> source/config proposals
        +--> security/evidence review
        +--> approved execution request
```

## Service inventory

| Component | Responsibility | Initial authority |
|---|---|---|
| Render worker `lingo-legacy-g02` | Poll GitHub Actions and execute one assigned job per ephemeral runner lifecycle | No production credentials |
| LINGOassist | Intake, classify, prioritize, assign work, maintain task state | Read-only |
| LINGOassister | Implementation planning, source/config drafting, test preparation | Branch-scoped changes only |
| LINGOassisthem | Security review, policy checks, evidence correlation, independent acceptance recommendation | Read-only; cannot approve its own implementation |
| Evidence ledger | Store run/job/commit/runner identifiers, hashes, artifact references, review outcomes | Append-only preferred |
| Secret manager | Hold provider credentials outside Git/source/logs | Least privilege; owner-controlled |

## Worker lifecycle (required before deployment)
1. Start with a clean, isolated workspace and verify runtime identity.
2. Authenticate to GitHub using a dedicated GitHub App installation identity (preferred) or a narrowly scoped, owner-managed credential if App auth is not feasible.
3. Request a short-lived repository runner registration token just in time.
4. Check for an existing runner registration and prevent duplicate same-name registration.
5. Register the runner as ephemeral with the canonical labels: `self-hosted,linux,x64,lingo-g02`.
6. Execute exactly one eligible trusted job.
7. Capture run ID, job ID, runner ID/name, commit SHA, step results, timestamps, and artifact reference.
8. Remove local credentials and workspace contents using a path-guarded cleanup routine.
9. Exit cleanly; Render restarts the worker process and the supervisor repeats with bounded backoff.
10. On SIGTERM, stop requesting new work, allow the current job to finish within the configured drain window, redact logs, and exit.

The lifecycle above is a target contract, not an implemented or verified feature.

## Workload trust boundary
- Restrict the runner to the G02 sentinel and explicitly approved trusted workflows.
- Do not run public-fork pull-request code or untrusted workflow payloads on this host.
- Do not mount production secrets, Cloudflare account tokens, user data, or unrelated application credentials into the runner.
- Avoid privileged Docker access. If Docker-in-Docker becomes a hard requirement, isolate it on a dedicated VM and perform a separate threat review.
- Limit concurrency to one job until isolation and cleanup are proven.
- Treat caches as performance hints only; never trust prior-job workspace state.

## Release and acceptance gates
`SOURCE → ACTUAL EXECUTION → RETRIEVABLE EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION`

G02 acceptance requires a real positive runner ID, exact runner name, Linux/x64 runtime, instantiated steps, sentinel pass, correlated run/job/commit identifiers, retrievable logs and artifact, hashes, and independent review. Render service status `live` alone is not G02 acceptance.

## Current blockers
- The current runner entrypoint expects a static `RUNNER_TOKEN`; it does not mint a fresh token.
- No reviewed supervisor loop exists yet.
- Render worker creation is not exposed through the connected Render actions in this session.
- Render Background Worker is not a VM/systemd host; Docker daemon requirements need workload-by-workload validation.
- No GitHub App credentials have been created or installed.
- No G02 runner host, daemon, or actual assignment is currently verified.

## Explicit non-actions
This proposal does not create provider tokens, set secret values, provision a Render service, modify DNS/Workers, enable production deployment, register a GitHub runner, or authorize promotion.
