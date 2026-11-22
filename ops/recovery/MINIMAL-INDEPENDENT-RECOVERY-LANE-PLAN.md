# LINGO Minimal Independent Recovery Lane
**Date:** 2026-11-14  
**Status:** PROPOSAL — isolated draft; not production-authorized  
**Owner:** LINGO recovery governance

## Objective
Create the smallest independently testable recovery path that can produce trustworthy build/test evidence while the existing cross-stack recovery continues. Reuse existing GitHub-hosted infrastructure before adding another host, service, runner, or control plane.

## Current verified starting point
- Canonical repository: `thelingolegacy-blip/TheLingoLegacy`; default branch: `main`.
- Existing `.github/workflows/recovery-foundation.yml` targets `ubuntu-latest` and is scoped to `ops/recovery/**` plus itself for pull requests to `main`.
- Its current checks parse the recovery JSON manifests, run `bash -n` on the read-only bridge adapter, compile and run the Python fail-closed gate tests, verify that the incomplete evidence template remains blocked, and upload diagnostic artifacts.
- This is a promising foundation, not proof that GitHub Actions is currently starting jobs successfully. The previous Actions startup failures remain unresolved until a new run completes with logs and artifacts.

## Minimal design
1. **Isolated change lane:** use branch `recovery/minimal-independent-lane-2026-11-14`; do not write to `main`.
2. **One existing execution engine:** reuse the current GitHub-hosted `ubuntu-latest` foundation workflow. Do not add a self-hosted runner or dispatch any G02 workflow.
3. **One small scope:** keep this first test limited to recovery manifests, read-only bridge syntax, gate unit tests, and fail-closed behavior. Do not mix Firebase, app builds, production configuration, or secrets into the sentinel.
4. **Evidence output:** require a completed workflow run, non-empty job and steps, run/commit correlation, test logs, and the named recovery artifact. A queued run, startup failure, empty job, or missing artifact is a failed test.
5. **Independent review:** have the QA evidence auditor review the run and artifact before expanding the lane.

## Test sequence
- T0 — Confirm branch and PR point to the intended base and commit.
- T1 — Open a draft PR containing this plan under `ops/recovery/`; this path should select the existing foundation workflow.
- T2 — Observe the actual Actions run. Record run ID, attempt, head SHA, job ID, runner name, completed steps, conclusion, artifact name, and artifact availability.
- T3 — Inspect artifact contents and confirm all expected checks ran. Confirm the incomplete template returns `RESULT=BLOCKED` and exit code 1; that negative test must pass.
- T4 — Have the QA auditor independently review evidence. Mark the lane VERIFIED only if T0–T4 pass.

## Fallback routes if GitHub-hosted Actions still fails
Use this order; do not assume any alternative is already connected or authorized:
1. **Repair GitHub-hosted Actions control plane:** inspect repository/org Actions policy, hosted-runner availability, concurrency, quotas/billing state, and provider incidents. Keep G02 isolated and inactive.
2. **Existing approved CI provider:** if an already-connected GitLab CI, CircleCI, or Jenkins host can run the same read-only checks without new spend or secret exposure, mirror only this minimal test and retain GitHub as source of truth. Do not delete dormant configurations.
3. **Existing approved build host:** use an already-authorized ephemeral workspace (for example, an existing Replit or Render workflow) for a one-off, non-production validation only if its access, cost, isolation, and artifact export are confirmed first.
4. **Local reproducible validation:** if no CI host is available, run the exact documented commands in an authorized disposable local environment, capture command output and environment versions, and label the result LOCAL-ONLY. It does not restore GitHub Actions or satisfy hosted CI acceptance.

Do not create a new paid runner, cloud service, database, persistent host, or new control plane for this minimal lane. Any new spend or account connection requires separate owner approval.

## Expansion gate
Only after the minimal lane is VERIFIED:
- Add one independent product/build check at a time (Firebase config validation, Flutter analyze/test/build, then Gateway/Studio route tests).
- Keep each check isolated, deterministic, least-privilege, and artifact-producing.
- Do not let one product's credentials or deployment permissions leak into the foundation sentinel.
- Reuse the same evidence contract and independent QA review.

## Non-negotiable controls
- G02: PROTECTED; FAIL/UNVERIFIED. Never dispatch, register, reset, or activate it as a workaround.
- G03–G11: HELD.
- Production: HOLD. No merge, production deploy, DNS/Worker/Firebase mutation, secret change, payment activation, billing change, irreversible deletion, or last-known-good replacement.
- No test result is VERIFIED without a completed job, completed steps, commit-correlated logs, artifact inspection, and independent review.
- This plan is a proposal for isolated validation; it does not authorize release or prove any repair is complete.

## Decision after the test
- **PASS:** retain the lane and add the next smallest independent check.
- **FAIL — provider startup:** stop adding workflow complexity; diagnose provider/repository policy and evaluate fallback route 2.
- **FAIL — test/code:** fix only the failing check in this branch, rerun, and preserve the failure evidence.
- **BLOCKED — access/approval:** keep the lane isolated, record the exact dependency, and continue unrelated recovery work.
