# G02 — Host Provisioning and Runner Recovery

## Current boundary

The connected Cloudflare account can publish isolated Workers, but no VM/compute-provider provisioning API is connected in this session. Therefore **no Linux host has been created by this change**. The read-only Cloudflare control agent is not a runner host.

Do not claim host provisioning is complete until a dedicated Linux x64 VM or machine is actually created, reachable, inventoried, and running the matching GitHub Actions runner daemon.

## Host requirements

- Dedicated, disposable Linux x64 VM owned by the project.
- Outbound HTTPS access to GitHub Actions runner endpoints.
- Disk and RAM adequate for the project CI.
- A non-root service account for the runner.
- Repository-scoped registration for `thelingolegacy-blip/TheLingoLegacy`.
- Runner name `lingo-legacy-g02`; labels `self-hosted`, `linux`, `x64`, `lingo-g02`.
- No production credentials, Docker host socket exposure to untrusted PR code, or unrelated workloads.
- Do not execute untrusted pull-request code on this runner. Review trigger and permissions before enabling jobs.

## Before registering anything

1. In GitHub Settings → Actions → Runners, inspect the real runner inventory. If `lingo-legacy-g02` exists, repair the existing service instead of creating a duplicate.
2. Confirm Actions policy and repository scope.
3. On the approved host, run from the repository root:

   ```bash
   set +e
   hostname
   uname -a
   id
   command -v systemctl
   command -v docker
   docker --version
   docker compose version
   bash ops/g02/diagnose-runner.sh
   rc=$?
   echo "G02_DIAGNOSTIC_EXIT_CODE=$rc"
   ```

4. Inspect runner service state and recent `_diag` logs. Redact tokens and credential material. Do not paste runner credential files, registration tokens, PATs, or environment dumps.
5. If no matching runner exists, register it using the current official GitHub runner instructions and a short-lived repository-scoped registration token obtained by an authorized repository administrator. Do not store the token in this repository or this Worker. Do not place a token in chat.
6. Install and start the runner service on the host. Confirm it is Online and actively polling; a UI badge alone is not sufficient.

## Acceptance gate

Run `.github/workflows/g02-sentinel.yml` only after host/service readiness is independently established. G02 passes only when every predicate is proven:

- A real matching runner is assigned.
- `runner_id > 0`.
- `runner_name` is populated and matches the approved runner.
- Job is assigned and steps are instantiated.
- Sentinel executes and records its actual exit code.
- Logs are generated and retrievable.
- Evidence artifact is retrievable.
- Run/job/full commit SHA correlate and are independently verified.

A queued job, `runner_id=0`, empty runner name, empty steps, missing logs, or absent artifact is not a pass.

## Credential and token policy

- No new API token is required by the read-only control Worker.
- Do not mint a broad Cloudflare API token or GitHub PAT as a workaround.
- If a future integration genuinely requires a token, create a narrowly scoped credential in the owning provider's console, store it only in that provider's secret store, use the minimum permissions and expiry available, and never commit or echo its value.
- The connected Cloudflare control plane's existing authorization was used to publish the isolated Worker; it was not exported or copied into source.
- Do not alter DNS, production Worker routes, secrets, deployment configuration, billing, or activation as part of host recovery.

## State at this checkpoint

- Read-only Cloudflare control Worker: created; workers.dev subdomain enabled; no bindings or secrets configured.
- Public runtime probe from the connected tool: blocked by the tool's outbound-request policy (HTTP 403 from the tool egress layer). This is not an independent health result; probe from an authorized network.
- Dedicated Linux host: NOT CREATED / NOT VERIFIED.
- GitHub runner daemon: NOT VERIFIED.
- G02: FAIL / UNVERIFIED.
- Production: FROZEN; last-known-good PROTECTED.
