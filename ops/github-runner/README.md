# Lingo Legacy G02 Self-Hosted Runner

Purpose: provide the canonical repository-scoped G02 self-hosted runner. Current bootstrap is ephemeral; the frozen target architecture is a persistent, dedicated Linux x64 runner with approved local package-manager/Docker caches and a disposable, path-guarded workspace per job. Persistent mode is NOT implemented or accepted yet. Do not infer that the runner is active from this documentation.

## Verified repository scope
The repository owner `thelingolegacy-blip` is a personal account, not an organization. GitHub's custom runner groups are an organization/enterprise feature; this package therefore registers a repository-level runner and does not pass `--runnergroup`. The repository itself is the access boundary. See the official [runner groups documentation](https://docs.github.com/en/actions/concepts/runners/runner-groups).

## Security
- Never commit runner registration tokens or local `.env` files.
- Use a short-lived repository-scoped registration token.
- Runner uses `--ephemeral` and should unregister automatically after one job.
- Dedicated custom label: `lingo-g02`.
- Use only for this repository and the G02 sentinel workflow.
- Do not run untrusted pull-request code on this host. The repository is public; enable only the necessary workflow triggers and keep the host isolated.

## Host requirements
- Dedicated Linux x64 host.
- Docker Engine and Docker Compose plugin.
- GitHub CLI authenticated as a repository administrator.
- Outbound HTTPS access to GitHub and Docker image/package registries.

## Bootstrap
1. Open repository Settings → Actions → Runners: https://github.com/thelingolegacy-blip/TheLingoLegacy/settings/actions/runners
2. Inspect the existing runner inventory first. If `lingo-legacy-g02` is already registered, repair that daemon or remove the stale registration through the Settings UI; do not create a duplicate.
3. On the dedicated host, check out the reviewed recovery commit/branch that contains the approved `ops/github-runner/` package. Verify `git rev-parse HEAD` against the reviewed source before bootstrap; do not blindly use a historical recovery branch.
4. From the repository root, run the read-only container diagnostic first:
   `bash ops/g02/diagnose-runner-compose.sh`
   Review the redacted report and SHA-256 sidecar. Resolve Docker daemon, DNS, HTTPS, and stale-container findings before registration.
5. After the GitHub runner inventory and host are reconciled, run from `ops/github-runner`:
   `bash ./bootstrap.sh`
6. The script checks for a same-name runner, requests a short-lived token, builds the container, starts the ephemeral runner, and removes its local `.env` on exit. It does not delete remote registrations automatically; after an interruption, inspect the exact runner ID and creation context in Settings before any manual removal.
7. Confirm the runner is online with labels `self-hosted, linux, x64, lingo-g02`.
8. Dispatch the canonical **G02 Runner Execution Sentinel** only after the runner is Online and its labels/scope match. Do not interrupt it while it is working.

The container build pins Ubuntu 24.04 and installs `libssl3t64`, the OpenSSL runtime package available in Ubuntu 24.04. The runner is configured at repository scope, so no custom runner-group argument is used.

## G02 evidence predicate
Accept only when all evidence is actual, complete, retrievable, correlated, independently verified, and formally accepted:
- `runner_id > 0`;
- `runner_name = lingo-legacy-g02`;
- Linux/x64/self-hosted runtime;
- exact GitHub run ID, job ID, and commit SHA;
- instantiated and completed steps;
- sentinel PASS;
- retrievable logs and the `g02-execution-evidence-<run_id>` artifact;
- independent verification and formal acceptance outside the artifact.

The artifact records execution data. It cannot self-assert independent verification or formal acceptance.

## Recovery if interrupted
The bootstrap deletes only its local `.env` file and does not issue runner-deletion API calls. An ephemeral runner should unregister after a completed job. If an interruption leaves a registration behind, inspect repository Settings → Actions → Runners, correlate the exact runner ID and last-seen state, and remove only that verified stale registration. Never delete by name alone or publish token values/logs containing credentials.

## Authority boundary
```text
SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION
```
No acceptance means no G02 PASS and no downstream production promotion.


## Architecture decision

See [CI Locality, Cache Integrity, and Workload Economics ADR-001](../../docs/architecture/CI-LOCALITY-AND-INTEGRITY-ADR-001.md). The target preserves cache stores on local drives but never treats a previous job's workspace as trusted state. Persistent-runner migration requires a security review, guarded cleanup, exclusive workspace ownership, trusted-event policy, measured cache benefit, and full G02 acceptance. Until those conditions pass, the operational gate remains blocked.

## Runner diagnostics: Compose versus systemd

The canonical package in this directory uses Docker Compose and an ephemeral runner container. It does not install the host-side `svc.sh` service and does not create a persistent `actions.runner.*.service` unit.

- For the canonical Compose runner, run `bash ops/g02/diagnose-runner-compose.sh` from the repository root. It records Docker daemon/Compose state, the `github-runner` container state, redacted container log tail, and unauthenticated GitHub DNS/HTTPS probes. It does not restart or mutate the container.
- Use `bash ops/g02/diagnose-runner.sh` only when a separately installed bare-metal runner exists at the configured `RUNNER_DIR` and has a real `.service` file.
- Do not run `svc.sh` or restart `actions.runner.*.service` for the Compose package unless host inspection proves that a separate systemd runner installation exists.
- A Compose container that has exited after one job may be expected for an ephemeral runner; correlate its exit with the GitHub run, runner inventory, logs, and artifact before diagnosing it as a failure.
