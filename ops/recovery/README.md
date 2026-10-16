# LINGO Legacy Recovery Foundation

**Mode:** isolated recovery branch; fail-closed; no production mutation.

This directory provides a controlled recovery bridge for CI/runner diagnostics, evidence acceptance, and cleanup triage. It is intentionally separate from application code and does not deploy, activate, merge, reset, or delete production resources.

## Recovery checkpoints

1. **C0 — Source identity:** record repository, branch, full commit SHA, workflow run ID, and job ID.
2. **C1 — Dispatch:** job is assigned to the intended runner; `runner_id > 0`, runner name is populated, and runner group/labels match policy.
3. **C2 — Execution:** at least one real step executes and emits `RUNNER_EXECUTION_SENTINEL=PASS`.
4. **C3 — Evidence:** logs are retrievable and a non-empty artifact is attached to the same run/attempt/SHA.
5. **C4 — Independent verification:** an operator verifies source/run/job/attempt/SHA correlation and the artifact contents.
6. **C5 — Public reachability:** an independent external client verifies apex and www responses and redirect behavior.
7. **C6 — Authorization:** only after C0–C5 pass may a separately approved promotion plan be considered. This repository workflow never performs promotion.

A missing field, API error, queued job, zero runner ID, empty steps, missing log, missing artifact, SHA mismatch, or unknown state is **BLOCKED**, never PASS.

## Read-only incident collector

`incident_collector.py` gathers a specific Actions run, attempt, job, runner assignment, step summary, job logs, and run-associated artifact metadata using GitHub GET requests only. Supply a least-privilege read-only `GITHUB_TOKEN`; never use a deployment-capable credential for this task.

Example:

```bash
GITHUB_TOKEN=<read-only-token> python3 ops/recovery/incident_collector.py \
  --repository thelingolegacy-blip/TheLingoLegacy \
  --run-id <run-id> --attempt <attempt> --job-id <job-id> \
  --commit-sha <full-40-character-sha> --output incident-report.json
```

Collector outcomes are diagnostic classifications, not gate acceptance:
- `BLOCKED`: request invalid, run/job missing, metadata inaccessible, or identity/attempt/SHA inconsistent.
- `RUNNER_UNASSIGNED`: job is queued without a runner assignment.
- `EXECUTION_UNVERIFIED`: runner assigned but no executed step is evidenced.
- `EVIDENCE_INCOMPLETE`: execution exists but logs or run-associated artifact metadata are missing/inaccessible.
- `EVIDENCE_VERIFIED`: run/job identity correlates and non-empty logs plus run-associated artifact metadata are available.

The report always leaves G02, promotion, and activation blocked; LKG protected; independent verification false; and repair authorization false. Artifact metadata alone is not artifact-content verification. This collector does not change production routing, trigger workflows, repair source, or authorize a patch. Use `checkpoint_gate.py` and the existing independent acceptance process separately.

## Trigger behavior

`.github/workflows/recovery-foundation.yml` is a diagnostic pipeline. It can validate the evidence-gate code and archive a diagnostic report. It has no deployment credentials, does not mutate DNS/Cloudflare/Firebase/AWS, does not merge pull requests, and does not install/register a runner. A successful diagnostic workflow is not evidence that G02 has passed.

## Cleanup / “trash chute”

Use `quarantine-manifest.json` to record candidate stale resources and their evidence. The manifest is an inventory, not an instruction to delete. Capture owner, exact resource ID/path, dependency scan, last-seen timestamp, backup/export hash, and rollback method before approving retirement. Prefer disable/quarantine, observe, then separately authorize deletion. Never delete a runner registration, workflow, DNS record, Worker route, artifact, or deployment merely because it looks duplicated.

## Operator commands

```bash
python3 ops/recovery/checkpoint_gate.py --evidence ops/recovery/evidence-template.json --expected-sha <full-40-char-sha>
python3 -m unittest discover -s ops/recovery/tests -v
```

The evidence template is deliberately incomplete and must fail closed. Do not replace missing telemetry with guessed values.

## Current known blocker

The latest recorded G02 job was queued with `runner_id=0`, empty `runner_name`, no runner group, and `steps=[]`. The hosted sidecar CI job also failed before step initialization. These facts demonstrate unassigned jobs, but do not conclusively identify why dispatch failed. An authorized repository/org administrator and host operator must inspect runner availability, service polling, group access, and Actions policy.

## Destructive-operation containment

The runner bootstrap has been hardened to remove only its local temporary `.env` file automatically. It no longer issues a broad DELETE across every registration matching the runner name. Runner registration removal, host reboot, service restart, DNS/Worker retirement, and artifact deletion require exact target identity plus separate operator approval. The quarantine manifest remains inventory-only. This is intentional: preserve forensic evidence and avoid deleting an active or unrelated resource during recovery.


## Signed authorization envelope (proposed)

The unified C0–C6 evaluator now requires an externally verified approval flag for C6. The proposed verifier is `ops/recovery/verify_approval.py`; the schema is `ops/recovery/schema/lingo-approval-v1.schema.json`.

The signer must keep its private key offline. Supply the verifier's public-key path, approver identity, key ID, and nonce-registry path only from protected operator configuration. Never take these values from a pull-request-controlled workflow input. The approval envelope is bound to one full commit SHA and one action, has an expiry window no longer than 24 hours, and must be signed over canonical JSON excluding the `signature_base64` field. After signature verification, the verifier atomically consumes the nonce using exclusive file creation in a pre-existing protected registry directory. A repeated nonce is rejected. The registry must be durable and shared by every verifier that accepts the same approval; a host-local registry is not sufficient for a multi-host release system.

Example invocation (paths and identities below are placeholders and must come from trusted operator configuration):

```bash
python ops/recovery/unified_gate.py \
  --evidence /secure/evidence.json \
  --expected-sha <full-40-character-sha> \
  --action release \
  --approval-envelope /secure/approval.json \
  --trusted-approval-public-key /etc/lingo/trust/release-approval-public.pem \
  --trusted-approver <allowlisted-approver-identity> \
  --trusted-key-id <pinned-key-id>
```

Without the full trusted verifier configuration, authorization remains BLOCKED. The nonce registry directory must already exist, must not be a symlink, must not be group/world writable, and must be durable/shared across all verifiers accepting the same approvals. Atomic file creation prevents duplicate consumption only among processes sharing that registry filesystem; it is not a distributed ledger. This path has not yet been executed or certified in CI. It does not bypass the canonical runner contract, evidence verification, or the production lock.
