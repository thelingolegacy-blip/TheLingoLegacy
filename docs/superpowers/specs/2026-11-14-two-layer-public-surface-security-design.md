# Two-Layer Public-Surface Security Repair

**Date:** 2026-11-14  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Target branch:** `main` (draft PR only; no merge or deployment)  
**Working branch:** `security/two-layer-public-surface-repair-2026-11-14`

## Intent

Prevent internal operational metadata, identity implementation details, and administrative consoles from being served through either the Cloudflare Worker request path or the static-assets binding. Preserve customer-facing product, marketing, support, and integration-readiness pages. The repair addresses the confirmed public exposure of the integration-configuration register without treating the observed identifiers as credentials or claiming credential compromise.

## Current-state evidence

- `worker.js` currently routes API endpoints and then forwards all other paths to `env.ASSETS.fetch(request)`; it has no internal-path deny gate.
- `wrangler.jsonc` sets `assets.directory` to the repository root (`.`), so the static asset binding has a broad source tree.
- `config/release/lingo-legacy-v1.0.0-rc.json` currently lists several integration and identity implementation routes as included surfaces, including `/integration-configurations/`, `/integration-ids-register/`, `/integration-links-register/`, `/dashboard-integration-links/`, `/exact-dashboard-links/`, `/auth0-details/`, and `/auth0-implementation/`.
- The existing publication-scope validator checks required exclusions against a static list and checks conflicts against the release manifest. It is a denylist validator, not a generated public-file allowlist.
- A public fetch of `/integration-configurations/` exposed integration provider identifiers and operational metadata. This establishes metadata exposure, not secret disclosure.

## Goals

1. Deny internal operational and identity-implementation paths before static asset lookup.
2. Make direct static publication rules consistent with the release manifest.
3. Preserve customer-facing product and integration-readiness pages unless explicitly classified as internal.
4. Add independent, pull-request CI checks for Worker route protection and static publication policy.
5. Make test failures actionable and fail closed.
6. Keep all work in a draft PR; do not change production state.

## Non-goals and anti-goals

- No production Worker deployment, route/DNS changes, Cloudflare setting changes, or secret rotation.
- No merge to `main`, no change to active Worker version 137, and no promotion of uploaded Worker version 324.
- No G02 runner registration, activation, or self-hosted job dispatch.
- No broad shutdown of customer-facing integration pages such as `/integrations-readiness/`, `/shopify-readiness/`, `/exa-readiness/`, or `/integration-management/` without separate evidence that they contain internal-only content.
- No claim that identifiers are credentials or that credentials were compromised.
- No switch to a new static asset directory until the repository's complete public route and shared asset inventory is reconciled.

## Restricted public paths

The initial restricted set is intentionally narrow and based on the approved classification:

- Exact internal registers: `/integration-configurations/`, `/integration-ids-register/`, `/integration-links-register/`, `/dashboard-integration-links/`, `/exact-dashboard-links/`.
- Identity implementation details: `/auth0-details/`, `/auth0-implementation/`.
- Administrative consoles: `/admin-command-center/`, `/economy-command-center/`.
- Internal operational prefixes already identified for protection: `/ops/`, `/config/ops/`, `/docs/ops/`, `/docs/superpowers/`.

The release manifest must stop declaring the restricted exact routes as included public surfaces. Existing public customer-facing readiness and product routes remain included.

## Approaches considered

1. **Worker-only blocking.** Fast mitigation at the request edge, but direct static asset publication may still expose the same files or bypass the Worker in another serving path. Rejected as incomplete.
2. **Static denylist only.** Reduces asset exposure, but does not protect routes served through the Worker or future alternate handlers. Rejected as incomplete.
3. **Two-layer protection with a shared route policy and independent CI.** The Worker blocks restricted paths before asset lookup; static publication rules exclude the same restricted content; the release manifest and tests enforce consistency. Selected because it closes both request paths while retaining the existing root asset directory until a full asset migration can be safely verified.

## Design

### 1. Shared restricted-path policy

Introduce a small source-controlled policy module containing the exact restricted routes and prefixes. It must:
- Normalize path segments safely, including trailing slashes and case handling.
- Reject malformed percent-encoding and encoded path-separator or traversal ambiguity rather than attempting permissive recovery.
- Avoid decoding a path repeatedly.
- Match exact restricted routes and path-segment prefixes, not loose substring matches.
- Return a generic not-found response with no internal route name, metadata, or redirect target.

### 2. Worker enforcement

Call the policy immediately after URL parsing and before any static asset fetch. Preserve existing API routes and health/runtime endpoints. Confirm the restricted route check runs before `env.ASSETS.fetch(request)`. Do not change Worker identity, bindings, CORS, route declarations, or deployment configuration.

### 3. Static publication enforcement

Update `.assetsignore` on the working branch with the restricted directory/path exclusions supported by the current asset tooling. Update the release manifest to remove only the approved restricted routes. Extend the existing validator so it verifies:
- Every restricted path is excluded from static publication.
- No restricted path remains in `includedSurfaces`.
- Existing required public entrypoints remain available.
- Customer-facing readiness routes are not accidentally excluded.

This phase remains a policy/denylist hardening step, not a claim that a complete generated public allowlist has been implemented. A full generated public directory is a separate migration requiring a complete route and asset inventory.

### 4. Independent CI workflows

Add separate PR-triggered workflows:
- **Worker security regression:** runs the focused Node test suite for path normalization and Worker request gating.
- **Static publication policy:** runs the asset-scope validator and its tests against the repository manifest and ignore rules.

Both workflows use GitHub-hosted Ubuntu runners, least-privilege read-only repository permissions, pinned major action versions where practical, bounded timeouts, and no secrets. They are independent so one workflow's failure does not hide the other result. They do not replace the existing G02 self-hosted sentinel. An optional hosted-runner diagnostic is not part of this change unless needed to isolate Actions service availability.

### 5. Evidence and release posture

Record workflow run IDs, job results, commit SHA, test output, and artifact references when available. If GitHub Actions again fails before job creation, mark CI as blocked/unverified; do not infer test failure or success. Local test execution may be recorded separately and must not be represented as GitHub CI evidence.

## Acceptance criteria

- Restricted Worker paths return a generic 404 before asset lookup.
- Encoded, mixed-case, trailing-slash, and traversal edge cases are covered by tests.
- Normal public routes and required static entrypoints continue to pass through.
- Restricted routes are absent from the release manifest and excluded from static publication policy.
- Existing customer-facing readiness pages remain in the public manifest.
- Both independent CI workflows are present and syntactically validated.
- No production deployment, merge, DNS/route change, or runner activation occurs.
- PR remains draft and production release posture remains PROTECTED HOLD; G02 remains FAIL / UNVERIFIED.

## Builder decisions

- Use the existing Node.js test conventions already present in the repository.
- Keep the first patch scoped to the approved route list; expand only with direct evidence and review.
- Preserve current Worker runtime behavior for all non-restricted paths.
- Do not migrate `assets.directory` from `.` until a separately reviewed public asset inventory and dry-run exist.

## Review notes

The current repository has no root `package.json` at the inspected path. CI should therefore invoke Node's built-in test runner directly rather than assuming npm scripts exist. The existing Actions startup-failure pattern means workflow execution may remain blocked independently of the quality of the changes.
