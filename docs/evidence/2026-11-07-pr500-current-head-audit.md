# PR #500 — Current-head execution and adapter boundary audit

**Audit date:** 2026-11-07  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Audited branch:** `feat/llg-tech-corps-ai-gateway-foundation-2026-11-07`  
**PR:** [#500](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/500)  
**Scope:** exact-source identity, workflow startup evidence, adapter boundary review  
**Disposition:** source review only; no independent acceptance.

## 1. Exact source identity

The current branch still contains the exact source blobs previously used for the local test execution:

| File | Git blob SHA-1 |
|---|---|
| `src/ai/provider-adapters.mjs` | `c11a0a076410ae7ff1e50f056cc9417dcd7b5071` |
| `src/ai/provider-adapters.test.mjs` | `61d4f577296f5801fd17490aa1f82018ad525796` |

This establishes that the adapter and test source files have not changed since the recorded 15/15 local mocked test run. It does not establish that the current PR head executed in GitHub Actions.

## 2. Actions startup evidence

Six workflows associated with the current PR head completed with `startup_failure`. Each returned zero jobs and zero artifacts. The dedicated provider adapter test workflow is one of the six; five unrelated workflows show the same pre-job failure pattern. GitHub rejected a failed-job retry for run `42407437725` because the run cannot be retried.

This evidence establishes a common pre-job startup symptom. It does not identify the underlying GitHub, repository policy, or runner-provisioning cause. See [the detailed workflow evidence](2026-11-07-ai-provider-adapter-test-startup-failure.md) and existing infrastructure recovery issue [#437](https://github.com/thelingolegacy-blip/TheLingoLegacy/issues/437).

## 3. Adapter source review — positive controls observed

- Provider identifiers map to fixed first-party endpoints; callers cannot supply arbitrary URLs.
- Provider and global enable flags must both be explicitly set to `true`.
- Credentials and model identifiers are read from server-side environment bindings.
- Prompt input is type-checked, non-empty and limited to 2,000 characters.
- Requests have a bounded timeout (1–60 seconds; default 20 seconds).
- Upstream errors are normalized; upstream error bodies and thrown exception messages are not returned.
- Comparison accepts 2–4 unique providers and independently submits the same prompt; provider outputs are not passed between providers.
- OpenAI, Gemini and xAI request bodies explicitly set `store: false`.
- The tests inject mocked fetch functions and use test-only credentials; no live provider call is required.

## 4. Remaining production-hardening requirements

These are limitations of the current adapter foundation, not claims that a production service is already exposed:

1. **No HTTP route or authentication boundary is included in this module.** The caller must enforce authenticated identity, authorization scopes, CSRF/origin policy where applicable, and tenant isolation.
2. **No rate limiting, quota enforcement, per-user budget, spend ceiling or concurrency control is implemented here.** Provider enable flags are not a billing guard.
3. **No request/response body byte ceiling is enforced.** The prompt character limit is useful but does not bound upstream response payload size.
4. **Model configuration uses a syntactic allow-pattern, not a maintained approved-model allowlist.** Model access, availability and price must be checked in the deployment environment before activation.
5. **No moderation, prompt-injection policy, output classification, retention policy or application-specific data minimization is implemented here.** These must be designed at the gateway/application boundary.
6. **No provider request ID is captured.** The returned `request_id` is locally generated and should be treated as an internal correlation token, not an upstream provider request identifier.
7. **No provider-specific integration smoke test or contract test against live official SDK/API responses was executed.** Mocked response fixtures do not validate live credentials, account access, quota, billing, model names or provider terms.
8. **Claude statelessness and provider-side retention terms require current provider policy review.** A stateless Messages request does not replace a contractual privacy/retention assessment.

## 5. Acceptance matrix

| Gate | Current result | Evidence needed to close |
|---|---|---|
| Local mocked adapter tests | PASS — 15/15 on unchanged source blobs | Retain source hashes and test output |
| GitHub-hosted adapter test | NOT VERIFIED | A real job, completed steps, exit code and retrievable artifact on exact head |
| Adapter security review | PRELIMINARY | Independent reviewer signoff and route-level threat model |
| Live provider connectivity | NOT RUN / NOT AUTHORIZED | Explicit provider account, secret, privacy and spend authorization |
| Application integration | NOT IMPLEMENTED by this module alone | Per-app route, auth, consent, data and budget contracts |
| Game runtime acceptance | NOT RUN | Per-title builds and gameplay/device/accessibility/security artifacts |
| G02 release gate | FAIL / UNVERIFIED | Canonical runner assignment, sentinel execution, logs/artifacts and independent acceptance |
| Production promotion | PROTECTED HOLD | All required gates accepted and explicit release authorization |

## 6. Governance

PR #500 remains draft and unmerged. No independent PR review is recorded. No production route, Firebase project, secret, billing setting, provider flag, payment path, game economy, or G02 runner was changed by this audit. Do not promote any product status based on this document.
