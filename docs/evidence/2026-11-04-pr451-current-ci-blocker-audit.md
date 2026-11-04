# PR #451 — Current CI and Evidence Integrity Audit

**Audit scope:** read-only verification of the open draft PR head and its latest pull-request workflow attempts.  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**PR:** [#451 — Staging: LINGO Studio Hub, playable previews, and free-mode safety](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/451)  
**Inspected PR head:** `9250325fed02167638bbc4af42ece8541bef3d47`  
**Branch:** `studio-hub/recovery-preview-2026-11-04`  
**Disposition:** CI BLOCKED; PR MUST REMAIN DRAFT; NO PRODUCTION PROMOTION.

## Latest workflow attempts inspected

All six latest pull-request workflow runs associated with the inspected head returned `completed / startup_failure`:

| Workflow | Run ID | Jobs | Artifacts |
|---|---:|---:|---:|
| Studio Static Validation | 41929501544 | 0 | 0 |
| G02 Runner Image Build (no publish) | 41929499472 | 0 | 0 |
| Studio Sandbox Guard | 41929497432 | 0 | 0 |
| Studio Preview Package | 41929495912 | 0 | 0 |
| Crimson Smoke UI — static validation | 41929494169 | 0 | 0 |
| Lingo Legacy Static CI | 41929492223 | 0 | 0 |

The job-list and artifact-list endpoints independently returned empty arrays for each run. Therefore there is no job ID, runner assignment, step execution, job log, or workflow artifact to use as execution evidence. This is a workflow startup failure, not a failed test assertion and not a source-level PASS.

## Commit status

The combined commit status endpoint returned one successful context: `Vercel – the-lingo-legacy`. That status is not accepted as evidence for the approved Cloudflare deployment architecture, the six blocked GitHub Actions workflows, G02 runner qualification, or release acceptance.

## Evidence-version integrity

The PR head inspected for this audit is `9250325fed02167638bbc4af42ece8541bef3d47`. The qualification document currently present in the branch identifies its own source commit under test as `ad51371c4e56ae8dd8dcd93c718038fd109d91ec`. These are different commits. The browser and runtime evidence in that document must therefore be treated as evidence for its explicitly named source commit and tested preview—not silently attributed to the current PR head.

The PR description also references multiple Pages preview deployment IDs and source commits. Each preview is an isolated static-preview result; none by itself proves the current PR head has passed GitHub Actions, G02, backend integration, or production acceptance.

## Release controls and required next evidence

1. Keep PR #451 open and in draft; do not merge.
2. Diagnose the GitHub Actions startup failure at the workflow/check-suite/account execution layer. Do not alter workflow logic merely to convert a startup failure into a green status.
3. Obtain at least one actual job with a positive runner ID/name, executed steps, retrievable logs, and a retrievable artifact; separately qualify the persistent G02 host and canonical sentinel.
4. Re-run the static validation, preview package, sandbox guard, and smoke workflows on the exact candidate commit; bind every result to its exact SHA.
5. Reconcile preview deployment source SHAs and evidence records before making any acceptance claim.
6. Continue to keep production DNS, Worker routes, Firebase configuration, billing, and LKG unchanged until all release gates pass and explicit promotion authorization is recorded.

## Independent verification boundary

This audit records the API results retrieved for the listed workflow runs and commit status. It does not claim the cause of `startup_failure`; no job was created from which a runner log could establish that cause. It does not qualify G02, accept PR #451, or authorize a production change.
