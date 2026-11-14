# Two-Layer Public-Surface Security Implementation Plan

**Date:** 2026-11-14  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Working branch:** `security/two-layer-public-surface-repair-2026-11-14`  
**Target:** `main` through a draft PR only  
**Design authority:** `docs/superpowers/specs/2026-11-14-two-layer-public-surface-security-design.md`

## Execution status — 2026-11-14

- The implementation plan is committed on the working branch.
- The shared route-policy module, Worker gate, static exclusions, release-manifest cleanup, focused tests, and two independent PR workflow files have been added.
- Draft PR #574 is open against `main`; it remains unmerged and in draft state.
- Local test execution is unavailable in this environment because the GitHub host cannot be reached from the local shell.
- The PR's existing Actions runs ended in `startup_failure` before job creation; no job steps or test evidence were produced. The newly added workflow files have not yet produced run evidence.
- Therefore implementation is present but verification remains **BLOCKED / UNVERIFIED**. No production changes or release promotion have occurred.

## 1. Current branch and baseline inspection

The canonical repository is confirmed and the working branch exists. The branch currently points to commit `65fffeed24dc33c91a292905ec79b1cd7abc0fcd`. The repository default branch is `main`. No merge or production mutation is part of this plan.

The following implementation-relevant facts were confirmed on the working branch:

- `wrangler.jsonc` names `worker.js` as the Worker entry point and configures `assets.directory` as `.` with binding `ASSETS`.
- `worker.js` handles the API and health routes, then calls `env.ASSETS.fetch(request)` for every other path. There is currently no restricted-path gate before that call.
- `.assetsignore` excludes broad internal areas such as `.github/`, `config/`, `docs/`, `ops/`, `scripts/`, `cloudflare/`, `admin-command-center/`, and `economy-command-center/`, but does not yet encode the complete approved exact-route/prefix policy.
- `config/release/lingo-legacy-v1.0.0-rc.json` still lists the internal register and identity implementation routes as included surfaces.
- `scripts/verify-asset-publication-scope.mjs` and `scripts/test-verify-asset-publication-scope.mjs` already provide a Node built-in test pattern. Extend them; do not replace them wholesale.
- The existing asset validator checks configured ignore entries and manifest conflicts. It is not a complete generated public-file allowlist.
- `scripts/verify-legacy-gateway-security.mjs` is an unrelated legacy identity/CORS static guard; do not conflate it with the new Worker route boundary.
- The repository has no root `package.json` in the inspected branch tree. New CI must invoke Node directly rather than assume npm scripts.
- The existing `.github/workflows/studio-surface-integrity.yml` is push/dispatch-oriented and is not a substitute for either new PR security workflow.

## 2. Implementation sequence

### Step 0 — Preserve and establish the working baseline

1. Reconfirm the working branch and parent commit before code changes.
2. Record the design document SHA and this plan's commit SHA.
3. Confirm no production configuration, active Worker version, DNS/route, secret, or G02 runner setting is touched.
4. Keep changes limited to the approved restricted-path list and its directly related tests/workflows.

**Exit condition:** branch and baseline are recorded; no production mutation has occurred.

### Step 1 — Implement the shared restricted-path policy

Add a small Worker-compatible policy module (proposed path: `cloudflare/security/restricted-public-paths.mjs`) or an equivalently isolated module if repository conventions require a different location.

The policy must:

- Define the approved exact routes: `/integration-configurations/`, `/integration-ids-register/`, `/integration-links-register/`, `/dashboard-integration-links/`, `/exact-dashboard-links/`, `/auth0-details/`, `/auth0-implementation/`, `/admin-command-center/`, and `/economy-command-center/`.
- Define the approved segment-boundary prefixes: `/ops/`, `/config/ops/`, `/docs/ops/`, and `/docs/superpowers/`.
- Normalize trailing slashes and case consistently without using substring matching.
- Handle percent-encoding exactly once. Reject malformed encoding and encoded slash/backslash or traversal ambiguity rather than permissively decoding or repairing it.
- Avoid double-decoding and avoid changing the meaning of non-restricted public paths.
- Return only a boolean/policy result; response construction remains in the Worker.

Do not expand the restricted list based on names alone. Any additional route requires direct evidence and review.

### Step 2 — Enforce the Worker boundary before static lookup

Update `worker.js` to invoke the shared policy after URL parsing and before the static asset binding is accessed.

- Restricted and malformed-ambiguous paths receive a generic 404 response with no route name, internal metadata, redirect target, or filesystem detail.
- The restricted-path decision must occur before `env.ASSETS.fetch(request)`.
- Preserve existing health and API behavior, canonical-host handling, response security headers, and all non-restricted static behavior.
- Do not alter bindings, Worker name, compatibility date, routes, DNS, deployment settings, or production state.

### Step 3 — Align static publication policy and release manifest

Update `.assetsignore` with the precise approved restricted route/directory exclusions supported by the existing Cloudflare static-assets tooling.

Update `config/release/lingo-legacy-v1.0.0-rc.json` by removing only the approved restricted routes from `includedSurfaces`. Keep the following customer-facing routes public unless a separate evidence-backed decision changes their classification:

- `/integrations-readiness/`
- `/shopify-readiness/`
- `/exa-readiness/`
- `/integration-management/`

Extend `scripts/verify-asset-publication-scope.mjs` to assert that every restricted route/prefix is excluded and absent from `includedSurfaces`, while the required public entrypoints and named customer-facing readiness routes remain present and are not excluded.

Extend `scripts/test-verify-asset-publication-scope.mjs` with positive and negative fixtures for missing exclusions, restricted manifest entries, accidental public-readiness exclusion, and valid public routes.

Do not change `assets.directory: "."` in this phase. Do not replace the root asset directory or claim that the repository has a complete generated public allowlist. That migration requires a separate full file/route/shared-asset inventory and dry-run.

### Step 4 — Add independent PR CI boundaries

Create two separate workflow files:

1. `.github/workflows/worker-route-security.yml`
   - Trigger on `pull_request` (opened, synchronize, reopened) for relevant Worker/policy/test/workflow paths.
   - Use `ubuntu-latest`, read-only `contents: read`, a bounded timeout, and no secrets.
   - Set up the repository's supported Node version and run the focused Worker policy and request-gating tests using Node's built-in test runner.
   - Validate JavaScript syntax for the Worker and policy module.

2. `.github/workflows/static-publication-policy.yml`
   - Trigger independently on `pull_request` (opened, synchronize, reopened) for asset-ignore, release-manifest, validator/test, and workflow paths.
   - Use `ubuntu-latest`, read-only `contents: read`, a bounded timeout, and no secrets.
   - Run the asset-publication validator and its focused Node tests.
   - Parse the release manifest and verify the public/restricted route assertions.

The workflows must be independently visible in GitHub Actions. A failure or startup outage in one must not suppress the other. Use supported major action versions and pin more tightly only where repository policy already provides a pinning convention. Do not dispatch or modify G02 self-hosted workflows.

### Step 5 — Local verification and evidence capture

Run the focused Node tests and syntax checks locally where the available environment permits. Record local results separately from GitHub Actions evidence.

Required test coverage:

- Exact restricted paths and all approved prefixes.
- Segment-boundary behavior (e.g. a restricted prefix must not match a similarly named unrelated public path).
- Trailing slash and mixed-case behavior.
- Malformed percent-encoding.
- Encoded slash/backslash and traversal ambiguity.
- Restricted request returns generic 404 and does not call the static asset binding.
- Public readiness/product routes reach the static asset binding unchanged.
- Manifest contains no restricted exact routes/prefixes.
- Manifest retains customer-facing readiness routes.
- Static publication policy excludes all approved restricted paths.
- Required public entrypoints remain unexcluded.

Then inspect both workflow definitions for independent triggers, read-only permissions, bounded execution, no secrets, and correct commands.

### Step 6 — Draft PR and review package

After implementation and local checks:

1. Open or update a draft PR from the working branch to `main`.
2. Include the design, plan, exact file list, test commands/results, and known limitations.
3. Keep the PR in draft state.
4. Collect each workflow run ID, job result, commit SHA, and artifact/log reference when GitHub creates jobs.
5. If Actions fails before job creation, report CI as blocked/unverified; do not classify it as a test pass or test failure.
6. Do not merge, deploy, promote, change DNS/routes, activate a runner, or replace protected production assets.

## 3. Acceptance checklist

- [ ] Restricted route policy is shared, narrow, and segment-aware.
- [ ] Worker denies restricted paths before static asset lookup.
- [ ] Malformed/ambiguous encoded paths fail closed.
- [ ] Public product and readiness routes remain available.
- [ ] Static ignore rules cover the approved restricted paths.
- [ ] Release manifest removes only approved restricted surfaces.
- [ ] Existing asset validator and tests are extended, not bypassed.
- [ ] Worker route security workflow is independent and PR-triggered.
- [ ] Static publication workflow is independent and PR-triggered.
- [ ] Both workflows use least privilege, no secrets, and bounded timeouts.
- [ ] Local tests and GitHub CI evidence are clearly distinguished.
- [ ] Complete asset inventory remains a prerequisite to any asset-directory migration.
- [ ] Draft PR only; no merge or production change.

## 4. Explicit stop conditions

Stop and report without attempting a workaround if:

- The approved route classification conflicts with observed production behavior.
- A proposed exclusion would remove a named customer-facing readiness/product route.
- The static-assets tooling cannot reliably exclude a required path using the current root directory.
- Tests require changing production bindings or exposing credentials.
- GitHub Actions cannot instantiate the hosted jobs; report the boundary as unverified.
- The implementation would require changing the Worker deployment, DNS, route assignment, active version, G02 runner, or protected release state.

## 5. Release posture

**PROTECTED HOLD remains in force.** This plan authorizes isolated implementation and verification on the working branch only. It does not authorize merge, production deployment, promotion, runner activation, or replacement of the last-known-good production state.
