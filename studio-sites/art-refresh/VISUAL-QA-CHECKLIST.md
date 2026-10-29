# LINGO Legacy Art Refresh — Visual QA Acceptance Checklist

Status: OPEN — concept review only  
Branch: `studio/game-art-refresh-phase-a`  
Scope: 13 currently verified game specifications; 52 original SVG concept files.

## Gate 1 — Automated source checks

- [ ] Run `node studio-sites/art-refresh/validate-registry.mjs` from the repository root.
- [ ] Confirm the GitHub Actions workflow completes successfully on the art-refresh pull request.
- [ ] Resolve all registry, path, duplicate-path, SVG structure, viewBox, accessibility-title/description, and embedded-script findings.
- [ ] Save the run URL and commit SHA as evidence. A commit or a locally authored workflow is not a successful run.

## Gate 2 — Render and responsive review

For every key-art, wordmark, launcher-icon, and environment concept:
- [ ] Render in a current browser at native dimensions and at 320 px, 390 px, 768 px, and desktop widths.
- [ ] Confirm no clipping, unintended overflow, malformed gradients, broken text, missing shapes, or unexpected transparent backgrounds.
- [ ] Check title legibility at thumbnail size and launcher icon legibility at small sizes.
- [ ] Check aspect ratio and safe-area/crop behavior for each intended consumer.
- [ ] Confirm title-specific identity is distinct while collection-level Industrial Noir styling remains coherent.
- [ ] Record screenshot/evidence path, viewport, reviewer, date, and outcome.

## Gate 3 — Accessibility and content

- [ ] Confirm each informative SVG has a meaningful title/description and its consumer has appropriate alternative text.
- [ ] Check contrast for text and important symbols; do not infer WCAG compliance from palette names.
- [ ] Verify keyboard focus, visible focus indicators, link names, and sensible reading order in the gallery.
- [ ] Check reduced-motion behavior if motion is introduced later; current SVG concepts should not require animation.
- [ ] Confirm no embedded scripts or unreviewed external asset references.
- [ ] Review spelling, punctuation, canonical product names, and brand-specific wording.

## Gate 4 — Rights and creative approval

- [ ] Record the creative reviewer and approval date for each asset.
- [ ] Confirm original-work provenance and any required trademark/character/likeness review.
- [ ] Keep `sourceRightsStatus` pending until the responsible reviewer explicitly approves it.
- [ ] Keep status `concept` or `needs-review` until review is documented. Never infer approval from file existence or a passing validator.

## Gate 5 — Integration and release

- [ ] Identify the actual consuming screen/component for every approved asset in each game.
- [ ] Add consumer references to the registry and capture before/after screenshots.
- [ ] Verify desktop/mobile rendering and existing gameplay/navigation behavior after integration.
- [ ] Run relevant tests and record exact commit, checks, and preview URL.
- [ ] Promote only after required independent evidence is accepted. Production remains protected until all release gates pass.

## Current catalog boundary

This checklist covers the 13 game specifications currently verified in the source repository. The wider 56-title collection claim remains unreconciled. Do not invent or silently add titles; reconcile the authoritative catalog before declaring the full collection complete.

## Gallery implementation update

- Added title search, asset-type filtering, alphabetical sorting, and a reset control.
- Added a live asset-load audit showing loaded, missing, and not-yet-checked counts; missing files remain explicit review findings.
- Added visible keyboard-focus styling, a live result count, reduced-motion handling, and a named gallery region.
- Missing SVGs now show an explicit per-file warning instead of silently disappearing from review.
- These are source-level changes only. Browser-based keyboard, responsive, contrast, and rendered-art acceptance remains unchecked until captured evidence is available.

## Current evidence record

- Registered game specifications: 13
- Registered asset records: 76
- Asset records with paths: 52
- SVG concept files in the branch: 52
- Registry path audit: all 13 spec paths and 52 referenced concept paths were found in the recursive branch tree.
- Validator enhancement: checks registered paths, duplicate paths, SVG root/closing tag, viewBox validity and dimensions, accessible title/description, and embedded scripts.
- Latest observed GitHub Actions run: [Game Art Registry Validation #45](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40796940801) ended with `startup_failure`; the jobs endpoint returned an empty list. This is a runner/dispatch failure, not a validator result. No successful validator execution is evidenced. Earlier run #39 is superseded as the latest observed attempt.
- Gallery source enhancements committed at `3977d7fd2d00ddf23d9d87b82924c233e063f447` and live asset-load audit added at `8697926f5479a6e309352f383229bf921b036395`.
- No workflow run was returned for the latest gallery commit by the PR-run lookup; this does not prove that no run exists elsewhere in GitHub Actions.
- Browser rendering/accessibility acceptance: open; no browser screenshots or rendered QA results are claimed.
- Game-screen integration: open.
- 56-title catalog reconciliation: open.
- Production status: protected; no production promotion authorized.
