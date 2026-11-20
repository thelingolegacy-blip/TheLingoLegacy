# Website / ecosystem branch ancestry — 2026-11-20

## PR #548 versus current main

- Current main: `1a60e2314cb3f9b5e3efe648ade83121080cb7b2`
- PR #548 head: `9444bdda707e2573bd3e80e7fb585b708aaa251c`
- Merge base: `aaa9cd8462ced19ea86cb4d8bfd21672409c8b6e`
- GitHub compare status: **diverged**
- PR #548 head is 33 commits ahead and 13 behind current main.

The diff includes homepage README/index/CSS/JS, flagship Worker documentation, build scripts, sitemap/robots, studio production, That’s My Lingo, and worlds directory. Preserve these unique changes; do not assume fast-forward ancestry or overwrite main.

## PR #602 stacked on #548

- Current #548 head: `9444bdda707e2573bd3e80e7fb585b708aaa251c`
- PR #602 head: `832a21ffef50e01c6fc0507402cc6ceabd7f5bcc`
- Merge base: `41b7418a229c894c5c4b279ff368b5f7a1621c33`
- GitHub compare status: **diverged**
- PR #602 head is 14 commits ahead and 21 behind current #548 head.

This creates two stacked ancestry layers to reconcile: #548 against main, then #602 against the reconciled #548 parent. Preserve both PRs' unique changes and route work; no rebase, retarget, merge, or ref update was performed.

## Required path

1. Inventory and preserve unique commits/files from #548 and #602.
2. Compare overlapping homepage, worlds directory, route manifest, and ecosystem registry changes.
3. Reconcile #548 to current main using a new isolated integration branch; do not force-push.
4. Rebase/retarget #602 only after #548's exact accepted parent SHA is fixed.
5. Re-run static registry checks, actual Actions tests, browser/accessibility QA, and route verification at the final exact SHAs.
6. Keep both PRs draft/unmerged until evidence and independent review are complete.

No main mutation, ref movement, merge, deployment, DNS/Worker change, or production promotion occurred.
