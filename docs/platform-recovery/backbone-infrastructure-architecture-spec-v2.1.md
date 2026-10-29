# Backbone Infrastructure Architecture Specification v2.1

**Status:** source-backed specification; implementation branch only  
**Baseline commit:** `8a3de0166a6cca3ea51c82fb48bc161fb0d3e4ca`  
**Branch:** `infra/backbone-architecture-v2.1`  
**Protected work:** PR #402 remains open, draft, and unmerged. Production remains protected. No production deployment, DNS/Worker routing changes, merge, or gate promotion is authorized.

## 1. Executive architecture contract

This document records what the checked-in source says, what is not yet proven operationally, and what implementation acceptance requires. Source declaration, preview success, and a health response are not substitutes for runtime or release evidence.

### 1.1 Canonical ownership

| Plane | Current source-backed owner | Contract / caveat |
|---|---|---|
| Source and review control plane | GitHub repository and reviewed branches/PRs | Source commit SHA is the immutable join key for all build and acceptance evidence. |
| CI and runner control plane | GitHub Actions plus intended self-hosted Linux x64 runner | G02 remains BLOCKED. Workflow dispatch must produce an assigned runner, instantiated steps, a sentinel, retrievable logs, and an artifact. |
| Runtime and edge | Cloudflare Workers | Checked-in production config names `thelingolegacyv-5`; it declares apex and www wildcard routes. |
| Static content | Worker Static Assets binding `ASSETS`, directory `.` | Static publication scope must be checked; repository presence alone does not prove a file is published. |
| Product modules | `PLATFORM_MODULES` in `worker.js` | This is a runtime catalog, not proof that every product has a healthy backend or verified live route. |
| Data services | Optional bindings/environment variables `DB`, `STUDIO_KV`, `ASSET_BUCKET`, and Firebase project ID | The current runtime manifest exposes configured/not-configured booleans. It does not prove data integrity, rules, backups, or production readiness. |
| Payments and notifications | Stripe checkout and Beacon Alerts integrations in `worker.js` | Secret presence gates specific features; external provider behavior requires separate tests. |
| Observability | Cloudflare Worker observability and runtime response headers/endpoints | Existing observability setting is source-backed; complete structured telemetry, retention, alerting, and trace correlation are not certified by that declaration. |
| Release authority | Fail-closed gate contract and independently inspectable evidence | A gate may pass only for the exact tested commit and only when its predicate and evidence are present. |

### 1.2 Current source inventory

The inventory below is pinned to the reviewed PR #402 head at the time of inspection. Recompute these digests if the branch changes.

| Source | Observed fact |
|---|---|
| `wrangler.jsonc` — blob `cac19cf0aac2ca4a7369de407d7eff9fdb9c5afa` | Worker `thelingolegacyv-5`, entrypoint `worker.js`, `workers_dev=false`, routes `thelingolegacy.com/*` and `www.thelingolegacy.com/*`, assets directory `.` with binding `ASSETS`, observability enabled. |
| `wrangler.flagship-preview.toml` — blob `e8491e8ebcdc16dbc264569485fa878932b3f62d` | Separate Worker name `lingo-legacy-flagship-preview`, preview entrypoint `cloudflare/flagship-root/preview-worker.js`, `workers_dev=true`, no custom-domain route block, assets binding `ASSETS`. |
| `worker.js` — blob `34acd00591ec493f79746689bd508d4f903d99a1` | Runtime version `5.0.0-studio-platform`; security headers; health, manifest, status, gates, modules and site-context endpoints; fail-closed release gate constants; module registry; Stripe and Beacon Alerts handlers. |
| `config/landing-page-contract.json` — blob `a2ff2d572a3d9f057032a8f2cbc2b82247859ffa` | Static-first landing contract; preview does not establish live-production availability; separate preview Worker identity and no-production-routes expectation. |
| `config/release/lingo-legacy-v1.0.0-rc.json` — blob `34f04ce8407a9fba007bb72871571bdb4a8cb800` | Release-candidate manifest explicitly lists unresolved Firebase, Cloudflare bindings, and live interaction/accessibility evidence. |

Blob SHAs identify Git objects, not runtime deployments. They are recorded for reproducibility and are not themselves proof that the corresponding source is deployed.

## 2. Runtime contracts

### 2.1 Existing endpoints

These paths are present in the checked-in Worker source. This is a source inspection, not a fresh live request or readiness certification.

| Endpoint | Existing behavior | Contract limitation |
|---|---|---|
| `GET /healthz` | Returns plain-text `ok` with HTTP 200. | Liveness only. It does not verify downstream dependencies or release authorization. |
| `GET /api/v1/runtime` | Returns runtime manifest. | Compatibility alias for platform manifest. |
| `GET /api/v1/platform/manifest` | Returns version, hostname, canonical domain, integration-presence booleans, and runtime attributes. | Presence booleans are not dependency health checks. Never expose secret values. |
| `GET /api/v1/platform/status` | Returns platform status, module catalog, control-plane labels, release policy, and gate state. | Static declarations do not independently prove infrastructure state. |
| `GET /api/v1/platform/gates` | Returns current release gate constants and fail-closed flags. | Gate state must be tied to evidence records; a string constant alone is not certification. |
| `GET /api/v1/platform/modules` | Returns module catalog. | Catalog membership is not a product acceptance test. |
| `GET /api/v1/site/context` | Returns runtime/domain context and feature flags. | Feature flags must not be interpreted as service readiness. |

### 2.2 Versioning and readiness

1. Keep the current endpoint response shapes backward compatible during this branch.
2. Keep `/healthz` as a liveness check. Add a readiness contract only with explicit dependency rules and environment-specific requirements; do not silently redefine health.
3. Include a schema version in any newly introduced or materially changed machine-readable contract.
4. A readiness failure must identify a dependency by name and state without returning credentials, secret values, internal tokens, or unnecessary personal data.
5. Required secret validation must distinguish absent optional integrations from absent secrets required by the selected environment. The current manifest’s booleans do not implement a complete secret policy.
6. Structured telemetry should record UTC timestamp, runtime version, environment, request/correlation ID when available, route class, HTTP status, duration, and outcome. Do not log secret values, authorization headers, or full sensitive request payloads.
7. Runtime version and deployment identity must be discoverable in evidence; response headers alone are not enough to certify a release.

## 3. G02 runner recovery contract

**Current state: BLOCKED.** Prior runs have shown startup failures or empty job/step evidence. An online/idle runner label or a completed workflow record without an assigned job is not acceptance.

### 3.1 Dispatch prerequisites

- A runner daemon is actively polling the intended repository or authorized runner group.
- Runner is online and has labels `self-hosted`, `linux`, `x64`, and `lingo-g02` (or the workflow and runner labels are intentionally aligned and independently verified).
- Repository Actions policy, runner-group access, organization/enterprise restrictions, concurrency, and workflow permissions permit the job to be assigned.
- Workflow run targets the exact candidate commit SHA and contains a non-empty job with explicit sentinel steps.
- A single controlled diagnostic run is used after any runner or policy repair; avoid retry storms.

### 3.2 Required sentinel and evidence

The sentinel must emit machine-readable evidence including run ID, job ID, runner ID, runner name, operating system/architecture, workflow ref, tested commit SHA, start/end UTC timestamps, and sentinel result. It must fail if runner ID is absent/zero, runner name is blank, or the checkout SHA differs from the requested SHA.

Required acceptance evidence:
1. Workflow run URL and numeric run ID.
2. Job record with numeric job ID and non-empty runner ID/name.
3. Instantiated step list, including sentinel execution.
4. Retrievable raw logs containing the sentinel and exact commit SHA.
5. Validator exit status and a machine-readable result artifact.
6. Downloadable artifact identity and SHA-256 digest.
7. Independent verification that all records refer to the same run and commit.

### 3.3 G02 acceptance predicate

G02 becomes PASS only when every item above is true and independently inspectable. Missing jobs, zero runner ID, empty steps, inaccessible/missing logs, missing artifact, or commit mismatch means FAIL or BLOCKED—never PASS. G03 CI execution remains blocked until G02 passes.

## 4. Preview and production isolation

### 4.1 Known identities

- Production config: `wrangler.jsonc`; Worker `thelingolegacyv-5`; apex/www wildcard routes.
- Preview config: `wrangler.flagship-preview.toml`; Worker `lingo-legacy-flagship-preview`; `workers_dev=true`; no custom-domain route declarations.
- Preview entrypoint imports the default export from `../../worker.js`, so preview reuses runtime source while retaining a distinct Worker identity.

### 4.2 Mandatory isolation predicates

Before any preview deployment command:
- Parse both configurations and assert Worker names differ.
- Assert preview `workers_dev=true`.
- Assert preview has no `routes`, `[[routes]]`, production hostname pattern, or custom-domain route declaration.
- Assert preview entrypoint resolves to the intended preview wrapper and runtime source.
- Assert the production configuration and route inventory are unchanged from the reviewed baseline.
- Assert all target names and environment bindings are explicit; never infer the deployment target from a default.
- Stop on parser ambiguity, unexpected config keys, unrecognized deployment target, or a failed assertion.

The source check does not prove the Cloudflare account’s active route inventory. Cloudflare API/read-only inventory and a captured result are required before any future routing-related certification. This task authorizes no deployment or route mutation.

## 5. Machine-readable release gates

Allowed states are exactly `PASS`, `FAIL`, and `BLOCKED`.

Each gate evidence record must include:
- `gateId`
- `status`
- `commitSha`
- `workflowRunId`
- `jobId`
- `artifactName`
- `artifactSha256`
- `verifiedAt` (UTC)
- `verifier`
- gate-specific predicate results and evidence references

Rules:
- **PASS:** every gate-specific predicate passed and the evidence is inspectable and bound to the tested commit.
- **FAIL:** a predicate was executed and failed, or a contradiction was observed.
- **BLOCKED:** prerequisite, execution, or trustworthy evidence is missing.
- No PASS by default, no inferring a PASS from a previous commit, and no promotion from an aggregate status alone.
- A missing log/artifact is an evidence failure even if a workflow reports a top-level completion state.
- Promotion/merge/deployment/activation remain unauthorized while any required gate is FAIL or BLOCKED.

The existing `worker.js` gate constants intentionally continue to report G02 as `FAIL / UNVERIFIED` and later gates as BLOCKED. Do not change those statuses as a substitute for recovering the runner.

## 6. Implementation against this specification

### 6.1 This branch’s bounded scope

This implementation branch adds:
1. This source-backed specification.
2. A machine-readable architecture and acceptance contract.
3. A static verifier that checks the specification’s source-backed invariants.
4. A test harness for positive and negative contract cases.

It does **not** change `worker.js`, `wrangler.jsonc`, production routes, production secrets, Cloudflare account configuration, DNS, PR #402, or any release gate. The G02 recovery workflow/runner repair remains a separate action requiring verified runner and policy access.

### 6.2 Validation commands

Run in an environment with the exact branch checkout:
```sh
node scripts/verify-backbone-infrastructure-contract.mjs
node scripts/test-verify-backbone-infrastructure-contract.mjs
npx wrangler deploy --dry-run --config wrangler.flagship-preview.toml
```

The Wrangler dry run is not a deployment, but it still must run only against the isolated preview config. Do not run `wrangler deploy` without `--dry-run` as part of this task.

### 6.3 Acceptance predicates

- Contract JSON parses and its schema version is supported.
- Source files exist and their critical identities match the contract.
- Production and preview Worker identities differ.
- Preview config has no production custom-domain route declarations.
- Required runtime endpoints are present in the source.
- G02 remains BLOCKED until its external runner acceptance evidence is captured.
- Gate records accept only PASS/FAIL/BLOCKED and reject PASS without complete commit-bound evidence.
- Negative tests prove the validator rejects production-route leakage and malformed/missing evidence.
- All test commands must be executed in an environment with captured output before their result can be called PASS.

### 6.4 Rollback and stop conditions

Revert only the isolated branch’s commits if the verifier or tests reveal a design defect. Do not “rollback” by editing production configuration. Stop immediately if a proposed change would alter production Worker identity/routes, DNS, secrets, deployment, traffic, merge state, or gate authorization. Preserve all existing fail-closed behavior.

## 7. Evidence ledger at specification authoring

| Item | State | Evidence interpretation |
|---|---|---|
| PR #402 | OPEN / DRAFT / UNMERGED | Verified PR metadata at specification authoring. |
| Production config identity/routes | SOURCE-VERIFIED | Checked-in `wrangler.jsonc`; not proof of active account state. |
| Preview config isolation | SOURCE-VERIFIED | Checked-in preview TOML; not proof that deployment was executed. |
| Runtime endpoint definitions | SOURCE-VERIFIED | Inspected `worker.js`; not a live endpoint probe. |
| G02 runner acceptance | BLOCKED | No accepted evidence chain meeting the full predicate is present in this task. |
| Browser interaction acceptance | NOT VERIFIED | Existing DOM scrape did not establish JavaScript interaction execution. |
| Accessibility acceptance | PENDING | Real-browser keyboard, forced-colors, reduced-motion, and full contrast audit still required. |
| Wrangler dry run | NOT RUN | Must not be reported as passing until executed. |
| Production deployment/routing | NOT AUTHORIZED | No mutation performed by this specification. |

**Certification rule:** This specification and its verifier are implementation artifacts, not certification of the production platform. Only independently inspectable evidence can move a gate.
