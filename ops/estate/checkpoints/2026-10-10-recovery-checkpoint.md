# Recovery Checkpoint — 2026-10-10

## Snapshot identity
- Canonical repository: `thelingolegacy-blip/TheLingoLegacy`
- Main base at checkpoint branch creation: `49e6b1f0848d5ebdd7d8f37ed5288bb5ee2e9450`
- Current separate infrastructure implementation PR: [#258](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/258)
- Current estate/control-plane branch: `ops/estate-recovery-control-plane-2026-10-10`
- Status: `PROTECTED HOLD`

## Observed G02 evidence
New Studio CI run: [38077538789](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38077538789), job `114287549867`.
Static CI run: [38077538716](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/38077538716), job `114287549696`.

Both actual job payloads reported:
- Requested labels: `ubuntu-latest`
- `runner_id=0`
- `runner_name=""`
- `steps=[]`
- Log retrieval returned `BlobNotFound`

Interpretation: the job failed before step initialization. The workflow commands did not execute. This does not prove a source-level test failure, nor does it prove the exact provider-side root cause.

## State matrix
| Area | State | Evidence required to advance |
|---|---|---|
| Source authority | PASS | Maintain main/commit correlation |
| Repository integrity | PASS | Continue reviewed changes |
| Runner dispatch G02 | FAIL / UNVERIFIED | Real runner ID/name, assigned job and executed steps |
| CI G03 | BLOCKED | Passing steps, retrievable logs/artifacts and independent verification |
| Host | NOT PROVISIONED / UNVERIFIED | Authorized Linux x64 host and daemon telemetry |
| Cloudflare diagnostic Worker | DEPLOYED, external runtime probe pending | Authorized-network HTTP response for health/status endpoints |
| Proposed new repositories | NOT CREATED | Authorized repo creation and ruleset evidence |
| GitHub Support case | NOT SUBMITTED | Actual support ticket and case ID |
| Production | FROZEN | Separate authorization after all required gates |
| Last-known-good | PROTECTED | Preserve rollback reference |

## Restoration procedure
1. Capture the current default-branch SHA and tag/reference used for the last-known-good release.
2. Record workflow run ID, attempt, job ID, runner ID/name, full commit SHA, UTC timestamp, step list, logs and artifacts.
3. Export repository workflow/ruleset configuration using authorized admin access before any change.
4. Provision or repair the actual runner host; do not treat the Cloudflare Worker as a runner.
5. Execute one controlled sentinel after verifying host, daemon, labels, and repository Actions policy.
6. Verify artifact checksums and correlate all identifiers.
7. Have a second reviewer accept the evidence.
8. Restore only through a reviewed branch/PR; never overwrite or force-push the protected last-known-good ref.
9. Re-run gates after restoration; keep activation disabled until every required gate passes.

## Credential handling
No PAT, runner registration token, API token, or private key was created by this checkpoint. Registration tokens must be short-lived and supplied directly to the approved host setup process, never committed or pasted into chat.
