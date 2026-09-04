# Lingo Legacy Production Gate Truth

## Fail-closed release rule

A successful API response, `READY`, `HEALTHY`, `VALIDATED`, or `QUEUED` status is not execution evidence.

The authoritative release progression is:

`DRAFT -> VALIDATED -> QUEUED -> RUNNER_ASSIGNED -> EXECUTING -> EVIDENCE_CAPTURED -> QA_PASSED -> DEPLOYMENT_STARTED -> DEPLOYMENT_VERIFIED -> LIVE_PROBED -> CERTIFICATION_READY -> CERTIFIED -> ACTIVATED`

Failure path:

`ANY_STATE -> FAILED -> ROLLBACK_REQUIRED -> LAST_KNOWN_GOOD`

## Activation invariant

`NO RUNNER EVIDENCE -> NO CERTIFICATION -> NO ACTIVATION`

Activation requires, at minimum:

1. An actual GitHub Actions runner executing a job.
2. Executable workflow-step evidence.
3. A successful production build with an artifact identity/digest.
4. Executable QA with recorded results.
5. Verified deployment evidence from the authoritative deployment provider.
6. Successful live probes against the deployed release.
7. Certification evidence tying the release ID, commit, QA, deployment, and probes together.

## Integration truth

Every integration is reported in four distinct layers:

`CAPABILITY -> CONFIGURATION -> EXECUTION -> VERIFICATION`

`CONNECTED` never means `DEPLOYED`.

## AppDeploy

AppDeploy deployment capacity is treated as an external release constraint. The production gate must not attempt deployment when the account ceiling is exhausted.

## Last-known-good

A failed candidate must never mutate the certified production release. Rollback targets the last-known-good release until a new candidate satisfies every gate.
