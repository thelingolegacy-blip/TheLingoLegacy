# G02 Host Recovery Policy

**Status:** Proposed governance package; not yet approved or production-active  
**Canonical runner:** `lingo-legacy-g02`  
**Required labels:** `self-hosted, linux, x64, lingo-g02`  
**Canonical host path:** `/opt/actions-runner`  
**Production posture:** FAIL-CLOSED; LKG protected; mutation freeze remains active  
**Billing posture:** NO NEW PAID RESOURCES WITHOUT EXPLICIT COST APPROVAL

## 1. Purpose and authority

This policy governs provisioning, recovery, operation, evidence collection, and retirement of the canonical G02 GitHub Actions runner. A runner is an execution boundary, not a release authority. A green UI status, queued workflow, proposed patch, runner-online indicator, or successful syntax check is not acceptance evidence.

The required chain is:

`SOURCE → ACTUAL EXECUTION → RETRIEVABLE EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION`

No stage may be skipped or inferred from a later stage.

## 2. Identity contract

The canonical runner must satisfy all of the following simultaneously:

- Exact registered name: `lingo-legacy-g02`.
- Exact labels: `self-hosted`, `linux`, `x64`, `lingo-g02`.
- Linux x86_64 host; supported runner version; approved OS image and patch level.
- Dedicated non-root service account for runner execution.
- Runner installation under `/opt/actions-runner`; no competing or duplicate canonical registration.
- A persistent, independently inventoried host with known owner, region, image digest, resource limits, service manager, and recovery contact.
- Runner registration token is short-lived and never stored in source, artifacts, logs, image layers, or job environment.
- Job workloads must not inherit GitHub App private keys, installation tokens, cloud account credentials, or host bootstrap credentials.

A candidate runner with a different name or label is not G02 and must never be silently substituted.

## 3. Host security baseline

- Use a dedicated, isolated host; do not share with production application workloads.
- Keep the runner process unprivileged. No Docker socket, host PID namespace, host filesystem mounts, or broad sudo access for job steps.
- Restrict inbound network access; allow only required outbound HTTPS and explicitly approved service endpoints.
- Pin runner image and bootstrap dependencies; record image digest and package inventory.
- Apply security updates through a documented maintenance window.
- Encrypt host storage where persistent storage exists. Do not persist job workspaces across jobs unless explicitly required and approved.
- Clear workspaces, temporary files, credentials, and job-scoped caches between jobs.
- Keep secrets in provider secret stores; use least-privilege, short-lived credentials.
- Do not place production Cloudflare tokens, Firebase service credentials, payment credentials, or signing keys on the runner.
- Preserve host audit logs and runner diagnostics without exposing secrets.

## 4. Billing and resource policy

No paid host, database, disk, bandwidth commitment, subscription, or usage-based service may be created or scaled under this policy without an explicit cost approval that identifies provider, plan, recurring maximum, usage charges, region, and cancellation procedure.

Free-tier or trial claims must be verified against current provider terms before use. A free static site is not a compute host and cannot execute a persistent self-hosted Actions runner. Cloudflare Workers are edge runtimes, not a general-purpose persistent Linux host. A workflow using GitHub-hosted runners can validate portable scripts, but it does not prove canonical G02 execution.

If no compliant zero-cost persistent host is available, record `HOST_NOT_PROVISIONED_COST_GATE` and stop. Do not create a substitute identity or bypass the G02 label boundary.

## 5. Separation of duties

- **Requester / business owner:** defines outcome and authorizes scope/cost.
- **Infrastructure operator:** provisions and maintains the host; cannot self-accept release evidence.
- **Workflow operator:** dispatches approved probes and preserves raw execution records.
- **Independent verifier:** checks runner identity, host inventory, execution, logs, artifacts, hashes, and correlation.
- **Release authority:** accepts evidence and separately authorizes any promotion.

Where one person performs multiple roles, independent evidence review remains mandatory.

## 6. Evidence acceptance contract

A G02 execution is eligible for review only when all are retrievable and mutually consistent:

1. Workflow source commit SHA and workflow file path.
2. GitHub run ID, attempt number, numeric job ID, job name, event, and commit SHA.
3. Positive numeric `runner_id` and exact `runner_name=lingo-legacy-g02`.
4. OS, architecture, runner version, labels, and host inventory identity.
5. Instantiated job steps with start/end timestamps and terminal conclusions.
6. Sentinel output showing the expected identity and bounded diagnostic results.
7. Raw job logs and downloadable artifact(s).
8. Evidence manifest containing SHA-256 hashes for all evidence files.
9. Independent recomputation of hashes and run/job/commit correlation.
10. Explicit acceptance record with verifier, UTC timestamp, scope, and decision.

Missing, contradictory, inaccessible, or uncorrelated evidence means `UNVERIFIED`, not PASS.

## 7. Fail-closed states

Use only these states:

- `NOT_PROVISIONED`
- `PROVISIONING_PENDING`
- `ONLINE_UNQUALIFIED`
- `ASSIGNMENT_UNVERIFIED`
- `EXECUTION_UNVERIFIED`
- `EVIDENCE_INCOMPLETE`
- `INDEPENDENT_REVIEW_PENDING`
- `ACCEPTED`
- `QUARANTINED`
- `RETIRED`

Only `ACCEPTED` may satisfy the G02 acceptance gate. A status-only API response cannot produce that state.

## 8. Prohibited actions

- Do not merge a PR or promote a Worker solely to repair runner availability.
- Do not change DNS, routes, production secrets, production bindings, payment settings, or AI activation as part of runner recovery.
- Do not use automatic runner replacement or delete registrations as a recovery shortcut.
- Do not run untrusted pull-request code on a host containing credentials.
- Do not weaken required labels, skip sentinel steps, or accept GitHub-hosted execution as canonical G02.
- Do not claim a host exists based only on a Render static-site record or a Cloudflare Worker deployment.

## 9. Change control and audit

Every host or runner mutation requires a pre-change snapshot, explicit authorization, operator identity, UTC timestamp, change record, rollback plan, and post-change verification. Preserve raw outputs and SHA-256 hashes. Record:

- timestamp_utc
- environment
- host_id / provider_resource_id
- runner_id / runner_name
- source_commit
- change_type
- operator / authorizer
- approval_reference
- before_state_hash
- after_state_hash
- verification_hash
- rollback_reference

## 10. Recovery exit criteria

Recovery is complete only after a fresh workflow dispatch is actually assigned to the canonical runner, a positive runner ID and exact name are visible, job steps execute, sentinel passes, logs and artifacts are retrievable, hashes independently verify, and a separate reviewer records acceptance. Production remains protected until separate release authorization.
