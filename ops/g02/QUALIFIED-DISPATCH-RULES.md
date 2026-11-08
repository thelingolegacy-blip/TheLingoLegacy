# G02 Qualified Runner Dispatch Rules

Status: RECOVERY POLICY PROPOSAL — NOT ACCEPTANCE EVIDENCE
Scope: `thelingolegacy-blip/TheLingoLegacy`, existing runner `lingo-legacy-g02`
Required labels: `self-hosted`, `linux`, `x64`, `lingo-g02`

## Safety invariants
- Preserve the existing runner registration; do not create a duplicate registration as a first-line fix.
- Do not weaken required checks, add a hosted-runner fallback, broaden permissions, disable enforcement, or change production/deployment configuration to make a queued job appear successful.
- Do not claim G02 PASS from a green job condition, queued run, online/idle UI alone, or an uncorrelated artifact.
- Keep deployment, activation, and promotion blocked until all acceptance predicates below are independently verified.

## Dispatch qualification rules
1. **Identity:** Confirm the intended existing runner is the one under investigation.
2. **Eligibility:** Verify runner is enabled, online, not busy, has all four required labels, and is assigned to a runner group that grants this repository access.
3. **Host service:** On the authorized host, verify the existing service status and inspect sanitized diagnostics for connection/listener/authentication errors. Do not mutate the host until evidence identifies a justified action and an operator authorizes it.
4. **Assignment:** A real workflow job must be assigned to the expected runner; `runner_id > 0` and a populated `runner_name` are mandatory.
5. **Execution:** The job must instantiate steps and execute a sentinel that records success.
6. **Evidence:** Logs and the evidence artifact must be retrievable. Record run ID, job ID, exact commit SHA, runner identity, step outcomes, artifact name, and SHA-256.
7. **Independent verification:** A separate verification pass must confirm that the evidence is authentic, complete, intact, in scope, and correlated to the same run/job/commit.
8. **Acceptance:** G02 passes only when every predicate above is true. Otherwise it remains BLOCKED.

## Diagnostic decision rules
- **Runner offline or service stopped:** Preserve registration; inspect service and runner diagnostic logs; repair the existing service only when the failure is established.
- **Online/idle but labels mismatch:** Correct only the confirmed label mismatch and re-check eligibility.
- **Labels correct but group/repository access denied:** Adjust only the narrow, verified repository access rule through an authorized administrator.
- **Host service healthy and eligibility correct, but jobs remain queued:** Inspect Actions policies, runner-group restrictions, account usage/limits, and GitHub service restrictions. If no local restriction explains the failure, escalate to GitHub Support with run/job IDs and sanitized evidence.
- **Unknown cause:** Do not guess, reset, re-register, broaden permissions, or repeatedly enqueue diagnostic jobs. Gather the missing evidence first.

## Monitoring signals
Record and correlate these signals when available:
- `runner_status`: online/offline and busy/idle, timestamped.
- `runner_labels`: exact observed labels, not merely labels requested by the workflow.
- `runner_group_access`: group identity and repository access result; if not exposed by the connector, mark UNKNOWN.
- `host_service_status`: output from the authorized host, or UNKNOWN.
- `job_assignment`: queued/in-progress/completed, runner ID/name, run ID/job ID/commit SHA.
- `execution_evidence`: steps, sentinel conclusion, logs retrieval, artifact retrieval, and SHA-256.
- `gate_state`: PASS only after independent evidence verification; otherwise BLOCKED.

## Current known state at policy authoring
The latest inspected G02 Sentinel run `38384546405`, job `115252962720`, and Fresh Assignment Probe run `38384546406`, job `115252962888`, were queued with no instantiated steps and no retrievable job logs. This is evidence of unassigned jobs, not proof of a specific root cause. Actual runner status, observed label list, runner-group membership/access, and host service state require direct inspection and must not be inferred.

## Authorized host-side collection
Run only on the authorized runner host:
```bash
cd /opt/actions-runner
sudo ./svc.sh status
ls -lt /opt/actions-runner/_diag/Runner_*.log | head -3
```
Inspect the newest log's final lines locally and share only sanitized output. Never share registration tokens, credentials, environment secrets, or private key material.

## Gate
Until real assignment, successful sentinel execution, retrievable correlated logs/artifact, and independent verification are complete:
`G02=BLOCKED`, `DEPLOYMENT=BLOCKED`, `ACTIVATION=BLOCKED`, `PRODUCTION_HOLD=ACTIVE`.
