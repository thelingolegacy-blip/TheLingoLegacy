# Dependency and safety reconciliation — 2026-11-20

**Disposition:** PROTECTED HOLD. Read-only GitHub source inspection; no workflow was dispatched and no runner was started.

## G02 quarantine: source branch does not equal effective main

PR #589 (`safety/2026-11-14-g02-push-trigger-quarantine`, head `940695bb39cdf7802617e13dd1626e8fac8ff110`) contains forced-false job conditions across the 11 workflows that directly target the G02 or staging self-hosted runner labels, plus a forced-false hosted dispatch wrapper.

A direct read of all 12 corresponding files on **main** shows the quarantine branch has not been integrated:
- The 11 direct self-hosted workflows on main do not have the forced-false conditions present on PR #589's branch.
- Several still expose `workflow_dispatch`; several retain push triggers.
- The two staging-target workflows on main retain only the typed `STAGING` confirmation condition, not the additional forced-false hold.
- The hosted wrapper on main does not have the forced-false job condition added on PR #589's branch.

This means source-level quarantine is **present on PR #589's branch but not verified on main**. It does not prove a runner is online or that any job has run; it means the repository source on main still contains manually triggerable runner-target jobs. Keep G02 unexecuted. An authorized repository/org administrator must verify runner groups and disable/offline state, or approve a separately reviewed safe source integration after CI/review requirements can be met. Do not dispatch any of these workflows.

## Hosted Actions canary trigger mismatch

PR #618's description says the canary is triggered by pushes to `recovery/**` and manual dispatch. The actual workflow file `.github/workflows/hosted-canary-zero-uses.yml` contains only `workflow_dispatch`; it has no `push` or `pull_request` trigger. The file is also absent from main. Therefore the branch push will not trigger the workflow as the PR description claims, and manual dispatch may not be available until the workflow exists on the default branch. Do not add an automatic trigger or dispatch now: the master work order requires resolving Actions admission and authorizing isolated execution first. Correct the workflow/description mismatch during the controlled canary step.

## Duplicate startup-probe candidates

- PR #592 and PR #613 both change `.github/workflows/actions-startup-probe.yml`.
- PR #592 uses an `ubuntu-latest` job and uploads evidence with `actions/upload-artifact@v4`; it does not query GitHub's provider job API to independently capture runner/job IDs.
- PR #613 is a more detailed inline probe: it queries the run's Jobs API, records provider job/runner identity and head SHA, and writes a manifest/checksums, but still requires `actions/upload-artifact@v4`.
- Neither is a zero-third-party-action probe. Both remain blocked by the unresolved Actions admission/allowed-actions policy. PR #618 is a separate zero-uses design but its trigger mismatch must be fixed before a future authorized run.

Do not keep multiple independent definitions for the same workflow path. Select one artifact-bearing implementation only after Actions policy is known and its acceptance criteria are reviewed.

## Stacked branch ancestry is stale/diverged

The active child PRs have advanced parent branches. GitHub commit comparison confirms divergence, not simple fast-forward ancestry:

| Child PR | Parent PR / current parent head | Child head | Merge base | Relationship |
|---|---|---|---|---|
| #596 | #594 head `acc338b37482c07e952bd0b5f236e4365a0208a5` | `08bb8da400dc347919e4aeecf777506d989000da` | `4267f348ea9a58f94cfbdb241667c5ce9045b9b3` | diverged; child is 55 commits ahead and 8 behind |
| #602 | #548 head `9444bdda707e2573bd3e80e7fb585b708aaa251c` | `832a21ffef50e01c6fc0507402cc6ceabd7f5bcc` | `41b7418a229c894c5c4b279ff368b5f7a1621c33` | diverged; child is 14 commits ahead and 21 behind |

These are not safe merge-ready stacked PRs. Preserve #594 → #596 and #548 → #602 dependency intent, but reconcile the parent history and revalidate file overlap before any rebase/retarget. No branch was rebased or moved.

## Related publication/security work

- Main `firebase.json` still sets Hosting `public` to repository root `.`; this is unsafe as a broad publication boundary.
- PR #579 is closed and unmerged; its earlier `build/web` change is superseded by the stronger generated `build/firebase-public` allowlist boundary in PR #614.
- PR #574 remains open/draft/unmerged and explicitly describes its static publication policy as a guard, not a complete generated public-file allowlist. It is complementary to, not a substitute for, #614's generated-output boundary.
- PR #614 and #613 still overlap on 37 exact paths; their shared `firebase.json` candidate value is `build/firebase-public`, unlike main's repository-root publication setting.

## Current source statuses

- #574: open/draft/unmerged; security boundary source only; tests not executed in CI.
- #589: open/draft/unmerged; branch quarantine source exists, but not on main.
- #592: open/draft/unmerged; duplicate startup workflow candidate.
- #594: open/draft/unmerged; architecture documentation parent.
- #596: open/draft/unmerged; stacked implementation child diverged from current #594.
- #602: open/draft/unmerged; stacked ecosystem/site child diverged from current #548.
- #611: open/draft/unmerged; dispatch contract source/tests committed, but hosted workflow has not executed.
- #548: open/draft/unmerged; exact-root flagship/website candidate, independent browser QA remains required.

## Required next actions

1. Treat G02 as **not source-quarantined on main** until a safe integration or owner-side runner-group disable is verified. No runner dispatch.
2. Owner resolves Actions admission and policy; then correct #618 trigger mismatch and choose one artifact-bearing startup workflow.
3. Reconcile #596 against current #594 and #602 against current #548 without force-push or loss of unique commits; run actual tests after Actions admission.
4. Keep #614 as the stronger generated Firebase Hosting boundary candidate; integrate #574's worker/static-publication protections only after overlap and full asset inventory review.
5. Record exact new heads and CI results before any rebase, merge, or release disposition change.

No main-branch changes, PR merges, workflow dispatches, runner registration/restart/activation, provider changes, deployments, DNS changes, payment activation, or production operations were performed.
