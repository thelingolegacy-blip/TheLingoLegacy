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

## Independent source audit (not the Node validator)

- Audited registry content at blob SHA `dc8f308ac18c93f4585fb5b54c37b220d266c8f1` directly through the GitHub file interface.
- Registry consistency checks performed independently in a separate execution: 13 game records, 76 asset records, 52 unique registered paths, allowed statuses, duplicate game/asset/path detection, and required metadata for any entry marked approved/integrated/verified. Result: zero findings.
- Read all 52 referenced SVG files and checked SVG root/closing tag, viewBox presence and positive dimensions, non-empty title and description elements, and absence of embedded script elements. Result: zero findings in these checks.
- This is an independent source-content audit, not execution of `node studio-sites/art-refresh/validate-registry.mjs`. It does not prove browser rendering, spec-path existence in the current checkout, exact registry-to-viewBox dimension agreement for each record, visual quality, rights approval, or GitHub Actions success. Those gates remain open.

## Current evidence record

- Registered game specifications: 13
- Registered asset records: 76
- Asset records with paths: 52
- SVG concept files in the branch: 52
- Registry path audit: all 13 spec paths and 52 referenced concept paths were found in the recursive branch tree.
- Validator enhancement: checks registered paths, duplicate paths, SVG root/closing tag, viewBox validity and dimensions, accessible title/description, and embedded scripts.
- Latest observed GitHub Actions run: [Game Art Registry Validation #45](https://github.com/thelingolegacy-blip/TheLingoLegacy/actions/runs/40796940801) ended with `startup_failure`; the jobs endpoint returned an empty list. This is a runner/dispatch failure, not a validator result. No successful validator execution is evidenced. Earlier run #39 is superseded as the latest observed attempt.
- Gallery source enhancements committed at `3977d7fd2d00ddf23d9d87b82924c233e063f447` and live asset-load audit added at `8697926f5479a6e309352f383229bf921b036395`.
- Parallel retry attempt: six latest startup-failure runs were submitted to the GitHub retry endpoint; all returned HTTP 403 `This workflow run cannot be retried`. These were not successful retries and created no new execution evidence.
- Runner inventory and repository Actions-permission endpoints were not accessible through the connected GitHub interface. The public workflow-run jobs endpoint confirmed `total_count: 0` for run #45. The available connection therefore cannot change runner capacity, inspect live runner inventory, or dispatch a fresh workflow run from this attempt.
- No workflow run was returned for the latest gallery commit by the PR-run lookup; this does not prove that no run exists elsewhere in GitHub Actions.
- Browser rendering/accessibility acceptance: open; no browser screenshots or rendered QA results are claimed.
- Game-screen integration: open.
- 56-title catalog reconciliation: open.
- Production status: protected; no production promotion authorized.

## Runner and capacity recovery runbook

See [RUNNER-RECOVERY-AND-CAPACITY.md](./RUNNER-RECOVERY-AND-CAPACITY.md) for the administrator checklist covering larger hosted-runner eligibility and approval, self-hosted runner download/registration/service checks, validation workflow requirements, host/bot/API-token inventory, billing/quota, and fail-closed acceptance evidence.

No runner registration, larger-runner purchase, secret/token change, or billing/quota change is claimed by this documentation update. Those actions require authorized administrator access and explicit cost/security approval where applicable.

## Workflow instrumentation update

The `.github/workflows/game-art-registry-validation.yml` workflow now includes a first-step runner sentinel and an always-attempted evidence artifact upload for the sentinel, validator output, exit-code report, and registry counts (where generated). This instrumentation is committed but remains unverified until a real workflow run starts, instantiates steps, and produces retrievable logs/artifacts. A pre-job `startup_failure` can still prevent every step from executing.

