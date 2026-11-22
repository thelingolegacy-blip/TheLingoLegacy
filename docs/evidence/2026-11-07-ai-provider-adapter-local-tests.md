# AI Provider Adapter — Local Executable Test Evidence

**Execution time (UTC):** 2026-11-07T19:40:38Z  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Branch:** `feat/llg-tech-corps-ai-gateway-foundation-2026-11-07`  
**Branch head at execution:** `6406c6b5de7a4dedb181ac5fd812805e7aa1d922`  
**Runtime:** Node.js v22.16.0  
**Execution environment:** isolated local Node.js test environment; no GitHub Actions runner  
**Command:** `node --test --test-reporter spec src/ai/provider-adapters.test.mjs`

## Exact-source verification

The source and test files were fetched from the feature branch and their Git blob IDs were verified against the local test inputs before execution.

| File | Git blob SHA-1 |
|---|---|
| `src/ai/provider-adapters.mjs` | `c11a0a076410ae7ff1e50f056cc9417dcd7b5071` |
| `src/ai/provider-adapters.test.mjs` | `61d4f577296f5801fd17490aa1f82018ad525796` |

SHA-256:
- Adapter source: `f2907286a39df8e83d652e727847fe82c1f5f3bb1b04bd077aab1211e71ba15a`
- Test source: `dbf1538e61621fa90b8884e38108cafef738230e457307ded01b73d4b467d96f`
- Test output log: `68cc18dcc793b9b366b850959b324f46c2c10d6be4d720fd2f2984cefcbb0f65`

## Result

```text
tests 15
suites 0
pass 15
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 1183.18182
```

The 15 passing tests cover:
- fixed provider endpoints and response normalization for OpenAI, Claude, Gemini and Grok;
- disabled-by-default behavior and missing credentials/model configuration;
- invalid provider and prompt rejection;
- upstream error normalization and no upstream error-body leakage;
- independent comparison prompt delivery and invalid comparison selections;
- provider-specific credential headers;
- invalid JSON and empty response handling;
- network exception normalization;
- partial comparison failure behavior;
- timeout cancellation.

## Scope and limitations

- These are mocked adapter contract tests using injected fetch implementations and test-only credentials.
- No paid provider API was called and no real provider credential was used.
- This local execution is not a GitHub Actions runner assignment or G02 acceptance.
- The dedicated GitHub Actions workflow run `42407155959` ended in `startup_failure`, with zero jobs and zero artifacts. The test process did not execute in that workflow.
- The local test result does not prove live provider authentication, current model availability, provider billing configuration, data-processing terms, or production gateway integration.

## Acceptance

**Local mocked adapter tests:** PASS (15/15).  
**GitHub-hosted CI execution:** NOT VERIFIED.  
**Live provider smoke tests:** NOT RUN / NOT AUTHORIZED.  
**Independent security/API review:** PENDING.  
**G02 and production release authority:** unchanged — FAIL / UNVERIFIED; PROTECTED HOLD.
