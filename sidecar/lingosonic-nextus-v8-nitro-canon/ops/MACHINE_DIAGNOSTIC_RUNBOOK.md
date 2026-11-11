# LINGOsonic Nexus — Machine Diagnostic Runbook

## Purpose
Organize all known execution hosts and service targets into a controlled diagnostic inventory. This file is a plan and status ledger, not proof that a machine exists, is online, or is authorized.

## Safety boundary
- Production mutation freeze remains active. Do not alter main, DNS, Cloudflare Workers, Firebase, or production resources.
- Do not merge PR #249 or mark it ready based on a queued job or an accepted retry request.
- Do not provision AWS resources. AWS checks are identity/template validation only until account, permissions, costs, security and explicit deployment authorization are verified.
- Never paste runner registration tokens, cloud keys, environment values, cookies or secret-bearing logs into issues or chat.
- An "Online/Idle" UI label is not sufficient proof of runner polling or assignment. Require a job with runner_id > 0, populated runner name, executed steps, sentinel output and retrievable logs.

## Diagnostic groups and order

### Group A — GitHub control plane (M01)
1. Correlate repository, PR #249, exact head SHA, workflow run ID and job ID.
2. Read run and job status; do not infer runner identity from a job status.
3. Capture runner_id, runner_name, runner_group_id, labels, steps, timestamps, conclusion and artifact IDs.
4. If steps are empty, capture the returned response and investigate runner dispatch before changing application code.

### Group B — Runner hosts (M02/M03)
1. Inspect repository/org Actions policy, runner group access, hosted runner availability and restrictions.
2. On the authorized self-hosted host, inspect service state, process, outbound connectivity and last check-in locally.
3. Confirm the configured labels include self-hosted, linux, x64 and lingo-g02 if that runner is intended for the gated job.
4. Never expose registration tokens or environment variables in logs.
5. Run only a no-secret sentinel before the test workflow.
6. Accept G02 only when every required predicate is independently evidenced.

### Group C — Isolated code execution (M04/M05/M06/M07)
1. Check out the exact PR head into an isolated working tree.
2. Record OS, tool versions, clean/dirty status and git SHA.
3. Run npm lock generation, npm ci, frontend build, Python compile and unit tests.
4. Run Docker build only if Docker is installed and its daemon is available.
5. Capture each command exit code and sanitized log; calculate SHA-256 digests for logs and artifacts.
6. Report unavailable tools as SKIP, never PASS. Preserve failures; do not rewrite them as success.

### Group D — Cloud targets (M08/M09/M10/M11)
1. AWS: verify caller identity without exposing secrets; validate CloudFormation template only. Do not deploy.
2. Cloudflare: read-only DNS/Worker inspection and independent HTTP probes only.
3. Firebase: read-only identity/health/rules inspection only.
4. Vercel: inspect account/project/deployment block. Do not create another project or retry billing-blocked deployment.
5. Redact account IDs, principal data, domains' sensitive tokens and request headers where needed.

### Group E — Evidence collector (M12)
Every evidence record must include:
- correlation_id
- repository, branch and exact head SHA
- run_id and job_id where applicable
- machine_id and check_name
- started_at_utc and finished_at_utc
- status: PASS, FAIL, BLOCKED, UNVERIFIED or SKIP
- exit_code for executed commands
- log and artifact SHA-256 where available
- evidence location and independent verifier
- limitations and follow-up action

## G02 acceptance predicate
All must be true:
1. A real matching runner exists.
2. runner_id > 0.
3. runner_name is populated.
4. The job is assigned to that runner.
5. Steps are instantiated.
6. Sentinel executes and its exit code is captured.
7. Logs are generated.
8. Logs are retrievable.
9. Evidence is independently verified and correlated to the tested SHA.

If any predicate is false or unknown, G02 remains FAIL/BLOCKED.

## Current known correlation set
- Repository: thelingolegacy-blip/TheLingoLegacy
- PR: #249 (draft, open)
- Head SHA at last inspection: 211785618ed01f293f58f08dcaf07fd4786d09e1
- Sidecar run: 38051426812
- Static CI run: 38051426777
- Prior sidecar job: 114211170660
- Latest observed retry job: 114211436513
- Latest observation: queued, steps empty, logs unavailable with BlobNotFound, no artifacts.
- Vercel commit status: failure / account deployment blocked.
- Test results for latest SHA: not established.

## Exit criteria
This inventory is useful only when each machine record is updated from real evidence. Never change currentStatus to ONLINE, PASS or ACCEPTED based on intended configuration, a successful API request to rerun a job, or a planned workflow. Keep release, deployment and production promotion on HOLD until independent acceptance.
