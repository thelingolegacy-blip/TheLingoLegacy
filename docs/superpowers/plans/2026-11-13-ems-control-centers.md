# LINGO EMS Control Centers Wave 1 Implementation Plan

> **For agentic workers:** Use the native execution path task-by-task; preserve read-only mode and verify every displayed value against the registry.

**Goal:** Build a responsive Main Hub / Resource Center / Release Center interface from the existing evidence-qualified resource registry.

**Architecture:** Extend the PR #553 registry branch with a same-origin static console that reads `config/ops/resource-registry.json`. Derive all counts and detail views from actual records; clearly identify the UI as a snapshot, not a live provider integration.

**Tech Stack:** HTML, CSS, browser JavaScript, JSON Schema 2020-12, Node.js built-in `node:test` for source-level tests.

**Spec:** `docs/superpowers/specs/2026-11-13-ems-control-centers-design.md`

## Global Constraints
- GitHub remains source authority; extend PR #553 rather than duplicate its registry.
- Read-only mode only; no secrets, provider writes, production deploys, DNS changes, runner registration, payment or Firebase mutation.
- Provider sync and runtime health must remain UNKNOWN / STALE / BLOCKED unless live evidence is available.
- Free-tier-first; no new paid service or dependency.
- All list and detail values must originate from the registry or be explicitly marked unavailable.

## Review Focus
- Registry unavailable or invalid: show a visible error, not an empty healthy dashboard.
- Stale registry timestamp: show stale status and timestamp.
- Partial/unknown provider state: never normalize to healthy.
- Empty search/filter results: show an explicit empty state.
- Secret references: show metadata only, never values.

---

### Task 1: Define the console’s source contract

**Files:**
- Create: `ops/ems-console/registry-view.test.cjs`
- Test: `ops/ems-console/registry-view.test.cjs`

**Interfaces:**
- Reads: `config/ops/resource-registry.json`.
- Produces: tests for required schema fields, unique IDs, dependency resolution, snapshot notice and secret-value exclusion.

- [ ] **Step 1:** Write failing tests for unique resource IDs and dependency references resolving to registered resources.
- [ ] **Step 2:** Add tests requiring explicit snapshot/freshness labeling and forbidding mutation/secret-value fields in the UI contract.
- [ ] **Step 3:** Run RED with `node --test ops/ems-console/registry-view.test.cjs`.
- [ ] **Step 4:** Keep test fixtures synthetic and free of credentials or personal data.

### Task 2: Build the read-only control-center UI

**Files:**
- Create: `ops/ems-console/index.html`
- Test: `ops/ems-console/registry-view.test.cjs`

**Interfaces:**
- Fetches: `/config/ops/resource-registry.json`.
- Displays: overview counts, resource table/cards, filters, evidence detail, source metadata and freshness.
- Produces: no write controls and no external provider calls.

- [ ] **Step 1:** Implement the HTML shell and accessible navigation for Main Hub, Resource Center and Release Center.
- [ ] **Step 2:** Implement registry parsing and schema-shape validation; show a visible error if fetch/parse fails.
- [ ] **Step 3:** Derive all counts from the loaded resource array.
- [ ] **Step 4:** Add search/filter by category, provider, environment, lifecycle state and integration state.
- [ ] **Step 5:** Add detail view for dependencies, authoritative reference, evidence and secret-reference metadata only.
- [ ] **Step 6:** Add responsive layout, keyboard focus, status text and reduced-motion behavior.
- [ ] **Step 7:** Run RED/GREEN tests and source checks.

### Task 3: Verify evidence semantics and handoff

**Files:**
- Review: `ops/ems-console/index.html`, `ops/ems-console/registry-view.test.cjs`.
- Reference: `config/ops/resource-registry.json`, `config/ops/resource-registry.schema.json`, `docs/ops/CONTROL-PLANE-API-CONTRACT.md`.

- [ ] **Step 1:** Confirm displayed totals equal the number of registry records and per-status counts.
- [ ] **Step 2:** Confirm every resource card maps to a unique registry ID.
- [ ] **Step 3:** Confirm missing provider sync, security scan and release approval evidence are visibly unknown/blocked.
- [ ] **Step 4:** Run the test suite and inspect the complete diff.
- [ ] **Step 5:** Request review; keep the stacked PR draft and production HOLD until parent registry PR and CI evidence are accepted.

### Task 4: Record the non-destructive portfolio inventory

**Files:**
- Create: `docs/ops/PORTFOLIO-REPOSITORY-AND-CHANGE-INVENTORY-2026-11-13.md`

**Interfaces:**
- Consumes: owner-scoped repository listing and paginated canonical-repository branches/open pull requests.
- Produces: dated Markdown inventory with repository visibility/default branch/size, branch and PR counts, pagination scope, and safe reconciliation order.

- [ ] **Step 1:** Retrieve all repository pages until the next page is empty.
- [ ] **Step 2:** Retrieve all canonical branch and open-PR pages until the next page is empty; record page counts and totals.
- [ ] **Step 3:** Separate observed facts from heuristic duplicate candidates; treat zero-size repositories and branches with a false legacy protection flag as review-only.
- [ ] **Step 4:** Write the inventory and state that no repository, branch or PR was deleted, archived, renamed or merged.
- [ ] **Step 5:** Reconcile totals against the pagination results and review the document for overclaims.
