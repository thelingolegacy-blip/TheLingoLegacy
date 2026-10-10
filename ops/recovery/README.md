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
