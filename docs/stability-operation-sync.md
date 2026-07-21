# Stability operation sync command expansion

This runbook keeps the complete activation system stable after every Vercel production push.

## Load

- Open the active activation branch or production deployment notes before making changes.
- Confirm the current activation scope is phase 1–12.
- Load the latest homepage, landing page, deployment notes, and activation docs.
- Check whether a prior operation-sync note already exists before adding a new one.

## Verify stability

- Confirm the preview deployment is `Ready` before promotion.
- Parse the static HTML pages before publishing changes.
- Verify local links from the root homepage and landing page resolve to existing files.
- Confirm all phase markers remain present across the homepage, landing page, README, and activation docs.
- Keep the site static unless a future build step is intentionally introduced and documented.

## Operation sync

- Keep `README.md`, `docs/deploy.md`, `docs/activation-phase-1-12.md`, and the homepage aligned.
- Record changes in the pull request summary with validation notes.
- Treat the root homepage as the source of truth for public activation status.
- Treat `docs/activation-phase-1-12.md` as the source of truth for operating phases.
- Treat this file as the source of truth for stability and command expansion checks.

## Command expansion

Use this expansion sequence for every future activation update:

1. Load the active activation branch.
2. Inspect the current activation docs and public pages.
3. Apply the requested expansion to docs and visible site surfaces.
4. Parse HTML and verify local links.
5. Verify required markers or command terms are present.
6. Commit with a focused message.
7. Update the active pull request with summary and validation.

## Required command terms

Every stability-sync pass should preserve these terms so future checks can verify the runbook is still represented:

- Load
- Verify stability
- Operation sync
- Command expansion
- Production push
- Pull request update

## Completion criteria

- Stability runbook exists.
- Homepage and landing page link to the stability runbook.
- README references the stability and operation-sync procedure.
- Deployment notes include the stability verification step.
- Static HTML, local links, activation phase markers, and command terms are verified.

## Doctrine link

Use [`os-execution-doctrine.md`](os-execution-doctrine.md) to decide when to intervene and when to continue execution without interrupting momentum.

## Wave 0 link

Use [`wave-0-foundation.md`](wave-0-foundation.md) as the foundation baseline when checking repo structure, build pipeline expectations, and Vercel production flow.

## Wave 1–5 links

Use Wave 1–5 plans to verify that core systems, command systems, ecosystem, experience, and deployment changes stay aligned with the OS execution doctrine.

## Wave 1 scaffold checks

Verify `os/core/xp-events.schema.json`, `os/core/wallet-ledger.schema.json`, and `os/core/identity-roles.json` before continuing core-system implementation.

## Auto mode checks

Verify [`../os/auto-mode/entirety.json`](../os/auto-mode/entirety.json), [`auto-mode-execution.md`](auto-mode-execution.md), [`sprint-activation-map.md`](sprint-activation-map.md), and [`deploy-activation-runbook.md`](deploy-activation-runbook.md) before deployment promotion.

## Wave 2 scaffold checks

Verify `os/command/admin-actions.schema.json`, `os/command/ai-ops-boundaries.json`, and `os/command/event-bus.schema.json` before continuing command-system implementation.
