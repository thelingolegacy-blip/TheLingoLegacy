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
