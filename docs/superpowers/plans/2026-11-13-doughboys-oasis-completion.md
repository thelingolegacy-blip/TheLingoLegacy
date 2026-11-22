# Doughboy’s Oasis Completion Wave 1 Implementation Plan

> **For agentic workers:** Use the native execution path task-by-task; keep each task isolated and verify the exact source contract before moving on.

**Goal:** Repair the existing Money Mile racing UI and connect the Oasis prototypes through a single responsive game entry point.

**Architecture:** Preserve the static HTML/Canvas 2D architecture and existing campaign-state module. Add a launcher page, restore missing racing mission elements, and add source-level regression tests without introducing dependencies or production services.

**Tech Stack:** HTML, CSS, browser JavaScript, Canvas 2D, Node.js built-in `node:test` for source-level tests.

**Spec:** `docs/superpowers/specs/2026-11-13-doughboys-oasis-completion-design.md`

## Execution status — 2026-11-13

Implementation is committed on draft PR #555. Thirteen committed game/campaign test bodies were executed against freshly fetched branch source in an in-memory V8 compatibility harness, and all seven inline scripts were parsed. This is not a native `node --test` run or browser/device playtest. GitHub Actions starts no jobs (`startup_failure`), so the plan remains open pending native test execution, browser screenshots/playtest, asset-rights and accessibility review.

## Global Constraints
- No new runtime dependencies or build system in Wave 1.
- Guest-local persistence only; clearly disclose its limitations.
- No real-money wagering, cash-out, redeemable prizes, payment activation or live wallet integration.
- Do not use unapproved licensed characters, audio or artwork.
- Preserve GitHub `main`; work only on the isolated feature branch.
- Production promotion remains blocked until CI, browser QA, rights, accessibility and release evidence pass.

## Review Focus
- Missing DOM nodes: every `$('id')` selector must resolve.
- Duplicate DOM IDs: fail if an ID occurs more than once.
- Story-state corruption: invalid or duplicate events must not grant progress.
- Mobile controls: pointer cancellation and leaving a control must release held keys.
- Navigation drift: every launcher destination must exist in the canonical source tree.

---

### Task 1: Pin the racing DOM contract

**Files:**
- Create: `studio-sites/games/doughboys-oasis-racing/racing-ui.test.cjs`
- Test: `studio-sites/games/doughboys-oasis-racing/racing-ui.test.cjs`

**Interfaces:**
- Reads: sibling `index.html`.
- Produces: a Node built-in test suite that fails when a JavaScript DOM selector is unresolved or an ID is duplicated.

- [ ] **Step 1: Write the failing test** named `every racing DOM selector resolves exactly once`; extract literal IDs used by `$('...')`, compare them with HTML IDs, and assert every reference has one matching element.
- [ ] **Step 2: Run RED** with `node --test studio-sites/games/doughboys-oasis-racing/racing-ui.test.cjs`; expected failure names the five missing mission IDs.
- [ ] **Step 3: Keep the test dependency-free** using `node:assert/strict`, `node:fs`, `node:path` and `node:test`.
- [ ] **Step 4: Commit the test-only change** after confirming the expected failure.

### Task 2: Restore the mission and progression panel

**Files:**
- Modify: `studio-sites/games/doughboys-oasis-racing/index.html`
- Test: `studio-sites/games/doughboys-oasis-racing/racing-ui.test.cjs`

**Interfaces:**
- Consumes: existing campaign model and `ui()` selectors.
- Produces: unique elements `jobState`, `inviteState`, `qualState`, `qualProgress`, `finalState`.

- [ ] **Step 1: Add failing assertions** for the five required mission elements and progress element.
- [ ] **Step 2: Add semantic mission markup** to the existing campaign panel, preserving all existing IDs and copy.
- [ ] **Step 3: Verify GREEN** with the same `node --test` command.
- [ ] **Step 4: Review the diff** to ensure no campaign reward, race-unlock or currency rules changed.

### Task 3: Add a single Doughboy’s Oasis game floor

**Files:**
- Create: `studio-sites/games/doughboys-oasis.html`
- Create: `studio-sites/games/doughboys-oasis-hub.test.cjs`

**Interfaces:**
- Links to: `doughboys-oasis-vertical-slice.html`, `doughboys-oasis-racing/index.html`, `doughboys-oasis-store.html`, `doughboys-oasis-856-region.html`.
- Produces: one responsive, accessible entry page with explicit prototype labels and no payment claims.

- [ ] **Step 1: Write failing route assertions** named `game floor exposes all six existing destinations`; verify all six hrefs and ensure each linked source file exists.
- [ ] **Step 2: Run RED** using `node --test studio-sites/games/doughboys-oasis-hub.test.cjs`.
- [ ] **Step 3: Implement the static game floor** with accessible cards, clear Story / Race / Exchange / Atlas entry points, mobile layout and reduced-motion handling.
- [ ] **Step 4: Run GREEN** and inspect all destination paths against the canonical tree.

### Task 4: Full source verification and handoff

**Files:**
- Review: all files changed by Tasks 1–3.
- Update: this plan only if actual scope changes.

- [ ] **Step 1:** Run both Node test files.
- [ ] **Step 2:** Run the existing campaign-state suite with `node --test studio-sites/games/doughboys-oasis-racing/campaign-state.test.js`.
- [ ] **Step 3:** Inspect HTML for missing/duplicate IDs, invalid local links, and reduced-motion behavior.
- [ ] **Step 4:** Record exact test outputs and any unavailable browser/CI checks in the PR.
- [ ] **Step 5:** Request independent review; do not merge or deploy under the production HOLD.
