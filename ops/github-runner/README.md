# Lingo Legacy G02 Self-Hosted Runner

Purpose: provide a repository-scoped, ephemeral self-hosted runner for the G02 execution gate.

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
3. On the dedicated host, check out branch `infra/g02-runner-recovery-clean-2026-10-09`.
4. Run from `ops/github-runner`:
   `bash ./bootstrap.sh`
5. The script checks for a same-name runner, requests a short-lived token, builds the container, starts the ephemeral runner, and removes its local `.env` on exit. Automatic runner deletion is intentionally disabled; if an interruption leaves a registration behind, inspect its exact identity in Settings before any manual removal.
6. Confirm the runner is online with labels `self-hosted, linux, x64, lingo-g02`.
7. Let the queued **G02 Self-Hosted Runner Sentinel** execute. Do not interrupt it while it is working.

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
The bootstrap deletes only its local `.env` file and does not issue runner-deletion API calls. An ephemeral runner should unregister after a completed job. If an interruption leaves a registration behind, inspect repository Settings → Actions → Runners, correlate its ID and last-seen state, and remove only the exact stale registration after independent verification. Never publish token values or logs containing credentials.

## Authority boundary
```text
SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION
```
No acceptance means no G02 PASS and no downstream production promotion.
