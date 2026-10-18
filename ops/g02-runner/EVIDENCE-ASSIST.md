# G02 External Evidence Assistant

## Purpose

This host-side collector exists to close the **post-execution evidence-location gap** without treating queue state, execution, or artifact presence as production authority.

Run it **on the real `lingo-g02` host after GitHub has assigned the G02 sentinel job**:

```bash
./ops/g02-runner/collect-evidence.sh <GITHUB_RUN_ID>
```

The host must have:

- GitHub CLI (`gh`)
- authenticated `gh` access to `thelingolegacy-blip/TheLingoLegacy`
- network access to GitHub Actions APIs
- the actual G02 run ID

## Collector captures

1. Workflow run metadata.
2. Latest-attempt job payload.
3. `job_id`.
4. `runner_id`.
5. `runner_name`.
6. Runner labels.
7. Job status/conclusion.
8. Exact step summaries.
9. GitHub-rendered run logs via `gh run view --log`.
10. Workflow artifacts and the G02 sentinel evidence artifact when available.
11. Retrieval failures, including missing/unavailable logs.

## Evidence boundary

The collector may establish that evidence was **located/retrieved** for later independent review. It does **not** establish:

- G02 acceptance
- production authority
- promotion
- activation

Those remain separate governance transitions.

Required chain:

```text
REAL lingo-g02 RUNNER
        ↓
JOB ASSIGNED
        ↓
STEPS INSTANTIATED
        ↓
SENTINEL EXECUTES
        ↓
LOGS GENERATED
        ↓
COLLECTOR RETRIEVES EVIDENCE
        ↓
INDEPENDENT VERIFICATION
        ↓
ACCEPTANCE
        ↓
SEPARATE AUTHORITY ESTABLISHMENT
```

If the job has no `runner_id`, no `runner_name`, or no steps, the collector records the failure and exits without manufacturing evidence.

If GitHub returns a log-storage error such as `BlobNotFound`, that error is preserved as evidence of failed log retrieval; it is **not** converted into a successful execution claim.
