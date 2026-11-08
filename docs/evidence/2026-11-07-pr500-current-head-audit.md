# PR #500 — Current-head execution and adapter boundary audit

**Audit date:** 2026-11-08  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Audited branch:** `feat/llg-tech-corps-ai-gateway-foundation-2026-11-07`  
**PR:** [#500](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/500)  
**Scope:** exact-source identity, workflow startup evidence, adapter boundary review  
**Disposition:** source review only; no independent acceptance.

## 1. Exact source identity

The current branch still contains the exact source blobs previously used for the local test execution:

| File | Git blob SHA-1 |
|---|---|
| `src/ai/provider-adapters.mjs` | `e40efffd63d3bca9ef48c1afdea3bf7c5cda2115` |
| `src/ai/provider-adapters.test.mjs` | `640f4eed7d3fcfa019d1eb517e57cad5e1bc30b1` |

These are the current source blob identifiers after the 2026-11-08 hardening commits. The earlier 15/15 local mocked test result applies only to the previous source blobs; it must not be represented as execution evidence for these changed files. Current changes require fresh local or hosted execution.

## 2. Actions startup evidence

Six workflows associated with the current PR head completed with `startup_failure`. Each returned zero jobs and zero artifacts. The dedicated provider adapter test workflow is one of the six; five unrelated workflows show the same pre-job failure pattern. GitHub rejected a failed-job retry for run `42407437725` because the run cannot be retried.

This evidence establishes a common pre-job startup symptom. It does not identify the underlying GitHub, repository policy, or runner-provisioning cause. See [the detailed workflow evidence](2026-11-07-ai-provider-adapter-test-startup-failure.md) and existing infrastructure recovery issue [#437](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/437).

## 3. Adapter source review — positive controls observed

- Provider identifiers map to fixed first-party endpoints; callers cannot supply arbitrary URLs.
- Provider and global enable flags must both be explicitly set to `true`.
- Credentials and model identifiers are read from server-side environment bindings.
- Prompt input is type-checked, non-empty and limited to 2,000 characters.
- Requests have a bounded timeout (1–60 seconds; default 20 seconds).
- Upstream response parsing now enforces a 1 MiB byte ceiling, checking both declared content length and streamed bytes before JSON parsing.
- Each provider requires an explicit server-side approved-model allowlist; a selected model absent from that allowlist is rejected before network access.
- Local correlation IDs are distinct from a sanitized upstream request identifier when the provider returns one.
- Upstream errors are normalized; upstream error bodies and thrown exception messages are not returned.
- Comparison accepts 2–4 unique providers and independently submits the same prompt; provider outputs are not passed between providers.
- OpenAI, Gemini and xAI request bodies explicitly set `store: false`.
- The tests inject mocked fetch functions and use test-only credentials; no live provider call is required.

## 4. Remaining production-hardening requirements

These are limitations of the current adapter foundation, not claims that a production service is already exposed:

1. **No HTTP route or authentication boundary is included in this module.** The caller must enforce authenticated identity, authorization scopes, CSRF/origin policy where applicable, and tenant isolation.
2. **No rate limiting, quota enforcement, per-user budget, spend ceiling or concurrency control is implemented here.** Provider enable flags are not a billing guard.
3. **Request and response limits are partial.** Upstream response bodies are now capped at 1 MiB before JSON parsing. Prompt length is limited to 2,000 characters, but a full route-level request-byte, per-user quota, concurrency and cost budget remains unimplemented.
4. **Model access is constrained but operational allowlists are not yet populated/verified.** Each provider requires its own `*_ALLOWED_MODELS` server binding and exact model match; actual approved IDs, availability and prices still need an owner-reviewed configuration.
5. **Moderation, prompt-injection policy, output classification, retention policy and application-specific data minimization are not implemented here.** These must be designed at the gateway/application boundary.

6. **Provider request correlation is partial.** `request_id` is locally generated; `upstream_request_id` is captured only when a recognized, syntactically safe response header is present. Provider-specific header coverage and operational tracing still need validation.
7. **No provider-specific integration smoke test or contract test against live official SDK/API responses was executed.** Mocked response fixtures do not validate live credentials, account access, quota, billing, model names or provider terms.
8. **Claude statelessness and provider-side retention terms require current provider policy review.** A stateless Messages request does not replace a contractual privacy/retention assessment.

## 5. Acceptance matrix

| Gate | Current result | Evidence needed to close |
|---|---|---|
| Earlier local mocked adapter tests | PASS — 15/15 on prior source blobs only | Do not transfer this result to current changed blobs |
| Current source mocked adapter tests | NOT EXECUTED / NOT VERIFIED | Run the updated suite on the exact current head and retain output/hash |
| GitHub-hosted adapter test | NOT VERIFIED | A real job, completed steps, exit code and retrievable artifact on exact head |
| Adapter security review | PRELIMINARY | Independent reviewer signoff and route-level threat model |
| Live provider connectivity | NOT RUN / NOT AUTHORIZED | Explicit provider account, secret, privacy and spend authorization |
| Application integration | NOT IMPLEMENTED by this module alone | Per-app route, auth, consent, data and budget contracts |
| Game runtime acceptance | NOT RUN | Per-title builds and gameplay/device/accessibility/security artifacts |
| G02 release gate | FAIL / UNVERIFIED | Canonical runner assignment, sentinel execution, logs/artifacts and independent acceptance |
| Production promotion | PROTECTED HOLD | All required gates accepted and explicit release authorization |

## 6. Current hardening delta — 2026-11-08

- Added bounded upstream response reading with a 1 MiB ceiling. Both an oversized `content-length` and an oversized streamed body are rejected before JSON parsing.
- Added distinct upstream request-ID capture (when a recognized safe header is supplied) alongside the internally generated correlation ID.
- Added per-provider server-side model allowlist requirements; missing allowlists fail configuration and unlisted models are rejected before any upstream call.
- Added a regression case proving an unapproved model cannot reach the provider.
- Hardened response normalization for all four providers so malformed `output`, `content`, or `steps` shapes return a normalized empty-response failure rather than throwing.
- Added regression tests for declared-length rejection, streamed-byte rejection, request-ID separation, allowlist enforcement and malformed provider payload shapes.
- These are source changes only. The new tests have not been executed because the GitHub Actions startup issue persists; no updated local test result is claimed.

## 7. LLG Command Center interface prototype

Added `llg-tech-corps/index.html` (blob `0978b6a7c7b85fed11b4de0f33114326bd3288e5`) to the branch. It presents four distinct modes: AI Chat, AI Compare, AI Agents, and AI Developer. Provider status is explicitly labeled as adapter source only; the UI displays a persistent prototype/no-live-AI notice. Provider-send controls are disabled. Local preview actions only construct and display request/plan shapes in the page; source inspection confirms the page contains no `fetch()`, `localStorage`, `sessionStorage`, or IndexedDB use.

The page is a static front-end prototype only. Browser/device/accessibility QA has not been executed. It does not connect to the provider adapters or implement authentication, an API route, model selection, live agents, repository tools, or persistence. It must not be represented as a live AI product.

The existing `lingo-ai/index.html` navigation on this feature branch now links to `/llg-tech-corps/` (blob `b93d461482455a46bcca7f839ff398a6ba203f40`). This creates a source-level navigation path only; no deployment or public availability is claimed.

## 8. Static command-center safety tests

Added `scripts/test-llg-ai-command-center.mjs` (blob `70ac15a02c908939950917ac099bf7bf6ea12d91`) with seven Node built-in tests covering:
- presence of all four workspace modes;
- explicit no-live-provider disclosure;
- disabled provider execution controls;
- absence of outbound provider endpoints/network APIs;
- absence of browser storage for prompt/user data;
- safe `textContent` rendering for local previews;
- absence of provider credential-like literals.

Updated `.github/workflows/ai-provider-adapter-tests.yml` (blob `bbf133b8c6f314e7f051fdc1ed280fb00e143b52`) to include the new page and test script in its path filter and execute the static safety suite after adapter tests. Both logs are configured for artifact upload.

The adapter test file contains 17 test cases; the new static page suite contains seven. **Neither current suite has executed on the current source.** The workflow change prepares future validation only and does not cure the repository's hosted-runner startup issue.

## 9. Governance

PR #500 remains draft and unmerged. No independent PR review is recorded. No production route, Firebase project, secret, billing setting, provider flag, payment path, game economy, or G02 runner was changed by this audit. Do not promote any product status based on this document.

## 10. Authenticated gateway boundary — source-only progress (2026-11-08)

Added `src/ai/gateway-auth.mjs` (blob `237dbd98c09eecf65645b776c66acf8c56698ac3`) and `src/ai/gateway-auth.test.mjs` (blob `c24dc5ce8649715626321d6e7dca8513227c36d3`). The helper is dependency-injected and fails closed unless supplied with a cryptographic token-verification function, expected issuer/audience, required scopes, and a tenant-membership resolver. It validates issuer/audience, expiration/not-before, user and tenant identifiers, required scopes, and tenant membership. Identity identifiers reject path separators. Membership-service failures return an unavailable result rather than granting access.

This is **not** a production identity integration or complete gateway. The helper does not verify JWT signatures itself, discover or pin an issuer's keys, implement session revocation, resolve entitlements, apply billing budgets, expose HTTP routes, or connect to provider adapters. The caller-supplied verifier and membership service have not been bound to a verified LINGO ID deployment. No provider execution is enabled.

Eight Node test cases were added for successful principal construction, malformed/missing bearer headers, verifier failure, issuer/audience/time/identity rejection, missing scopes, tenant mismatch, membership-service failure, and missing auth configuration. The workflow now includes this suite and uploads `gateway-auth-test.log`. Workflow blob: `192552503a6c89fc5d4fa1000b8fbe6d61890749`.

The gateway contract now documents the helper's limits (blob `0bca3b815662905e99461f6c3660ff364e22a488`). The API contract itself is design-only and does not authorize implementation or activation.

### Exact-head execution check

Latest PR #500 head checked: `cd8d7f7bc866317b962b035ae44e76df08e4d6e4`. GitHub returned six workflow runs associated with this commit; all six have conclusion `startup_failure`, including **LLG AI Provider Adapter Tests** (run `42471237270`). The combined commit status contains a Vercel success context, which is not evidence that the Node test job ran. No job-level test logs or passing artifacts were established. Therefore the current 17 adapter tests, 8 gateway-auth tests, and 7 static Command Center tests (32 test cases total) remain **NOT EXECUTED / NOT VERIFIED** on this head.

PR #500 remains draft/open/unmerged with 21 changed files. No identity provider, secrets, provider flags, provider calls, billing, Firebase, Cloudflare production, merge, or deployment changes were made. G02 remains FAIL / UNVERIFIED; production remains protected.
