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

## Support escalation packet

If the evidence collector confirms repeated pre-job failures after Actions policy and runner eligibility are reviewed, prepare `ops/g02/github-support-escalation.md`. Refresh all run details and timestamps before filing; the checked-in run IDs are a starting point, not a claim that those runs are still the latest. Attach redacted job/step snapshots and the administrator's policy/runner findings. Do not attach tokens, credentials, private keys, or unredacted environment dumps.

## Administrator evidence collection (read-only)

The connector in this recovery session cannot reliably inspect the repository Actions permissions or runner inventory endpoints. An authorized repository/account owner should run the following from a trusted workstation with GitHub CLI authenticated to the correct account. This collector makes read-only API calls and does not dispatch/retry jobs, change settings, or register/delete runners.

```bash
gh auth status
bash ops/g02/collect-admin-evidence.sh
```

The script writes a timestamped, permission-restricted evidence directory containing a status report, filtered Actions policy, runner inventory, workflow inventory, and job/step snapshots for recent failing runs. A `BLOCKED` entry means the endpoint was not accessible; it is not evidence that the setting or runner does not exist. Review outputs and redact account-identifying details before sharing. Never share tokens, credential files, or full environment dumps.

### Decision sequence — do not skip gates

1. **Policy gate:** inspect repository Settings → Actions → General and any account-level restrictions. Confirm Actions are enabled and the applicable policy permits the workflows and required actions. Record screenshots or API output with timestamps and secrets redacted.
2. **Dispatch classification:** inspect recent run records and job snapshots. If runs still have zero jobs/steps and no logs, stop retrying. The failure is pre-job and does not establish an application-test failure. Escalate to GitHub Support with run IDs, timestamps, `startup_failure`, zero job/step counts, and log retrieval errors.
3. **Runner gate:** inspect Settings → Actions → Runners. Record exact runner ID, name, OS/architecture, status, busy/disabled/ephemeral flags, labels, and last-seen details where available. Do not create a duplicate when a matching registration exists.
4. **Host gate:** only on the approved dedicated Linux x64 host, run `bash ops/g02/diagnose-runner.sh`. Inspect the redacted report locally. If an existing service is stopped or failing, review the service/journal evidence and repair that exact service under administrator control. Do not restart blindly, remove a registration by name alone, or paste credentials into chat.
5. **Eligibility gate:** confirm the runner has the exact labels `self-hosted, linux, x64, lingo-g02`, is repository-scoped, and is actively polling. If the host is absent or unknown, provision it only through the approved infrastructure owner and official GitHub runner instructions; this repository connector cannot create a VM.
6. **Execution gate:** after policy and host readiness are evidenced, an authorized operator dispatches only the canonical sentinel. Accept G02 only with a positive runner ID, matching runner name, initialized/completed steps, actual sentinel PASS, retrievable logs and artifact, and matching run/job/commit identifiers independently reviewed.
7. **Release gate:** keep production frozen until every required gate is independently accepted. Do not merge the draft PR or enable promotion merely to test dispatch.

## Workflow inventory and authority

The canonical workflow for current G02 acceptance is `.github/workflows/g02-self-hosted-sentinel.yml`. The repository also retains two legacy diagnostic workflows, `.github/workflows/g02-sentinel.yml` and `.github/workflows/runner-self-hosted-g02.yml`; they are intentionally not deleted or disabled by this repair. Their successful completion alone does not satisfy the current acceptance contract. The AWS-named workflow was replaced by the provider-neutral canonical workflow on the repair branch; do not infer that any workflow name proves host provisioning or runner readiness.

## Acceptance gate

The canonical, provider-neutral sentinel for this recovery is `.github/workflows/g02-self-hosted-sentinel.yml`. The other historical G02 sentinel workflows remain untouched by this repair and must not be treated as substitutes for this contract without review.

Run `.github/workflows/g02-self-hosted-sentinel.yml` only after host/service readiness is independently established. G02 passes only when every predicate is proven:

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
