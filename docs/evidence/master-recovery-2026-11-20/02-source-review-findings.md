# Source review findings — 2026-11-20

**Scope:** source-level review of PR #596 CORE V2 API and PR #611 dispatch contract. No local build, test suite, workflow, or runtime was executed. These are review findings to remediate before acceptance.

## PR #596 — CORE V2 Go API

Source inspected on branch `implementation/lingo-core-v2-foundation` at PR head `08bb8da400dc347919e4aeecf777506d989000da`.

### Compile-blocking test-source defect

In `platform/lingo-core-v2/services/api/internal/httpapi/server_test.go`, the 4 KiB request-body test constructs its 5,000-character payload using two consecutive backslashes before each embedded quote in a Go double-quoted string:

```go
body := "{\\"display_name\\":\\" " + strings.Repeat("x", 5000) + "\\"}"
```

The doubled backslash encodes a literal backslash; the following quote is not escaped and terminates the Go string. The remaining source is not a valid Go expression. This differs from the preceding 81-character test, which uses a single escape before each embedded quote. Correct the literal to construct valid JSON, then run `gofmt` and `go test ./...`. A source review comment was posted on PR #596 (comment 7051198865).

### Acceptance remains incomplete

- The API slice has OIDC verifier wiring, issuer/client ID configuration, HTTPS issuer validation, PostgreSQL TLS validation, profile scoping by verified issuer+subject, bounded JSON input, and profile/outbox writes in one transaction.
- Unit tests exercise TLS/issuer configuration validation and HTTP behavior with injected verifier functions; they do not yet establish full end-to-end OIDC signature, audience, issuer, JWKS rotation, or real-provider behavior.
- The outbox table and transactional insert exist, but the API description explicitly says event delivery is not implemented. Dispatcher, retries/backoff, dead-letter, replay, and idempotent delivery remain future acceptance work.
- No Go formatting, unit tests, race test, vet, build, PostgreSQL integration test, or security review was run in this environment.

### Stacked dependency

PR #596 is based on an older #594 parent commit. Current #594 head `acc338b37482c07e952bd0b5f236e4365a0208a5` compared with #596 head `08bb8da400dc347919e4aeecf777506d989000da` is **diverged**: 55 commits ahead / 8 behind, with merge base `4267f348ea9a58f94cfbdb241667c5ce9045b9b3`. Reconcile parent ancestry after correcting the test defect; no rebase/retarget was performed.

## PR #611 — fail-closed dispatch contract

Source inspected on branch `feat/dispatch-contract-v1-2026-11-16` at head `026eab54b461453059c29857bf002f16819118c3`.

### Test/validator message mismatch

- `contract.py` rejects any nonzero or non-finite cost ceiling with the message `cost_ceiling_usd must be exactly zero until a separately approved budget policy exists`.
- `test_negative_cost_rejected` and `test_non_finite_cost_rejected` still expect `finite non-negative`.
- Align the tests or implementation; as authored, those assertions are inconsistent and should fail.

### Direct COMPLETE envelope bypass

- `validate_job()` accepts any status in `STATUSES`, including `COMPLETE`, without requiring completion evidence or independently verified owner/reviewer identities.
- `transition()` checks evidence and distinct owner/reviewer ID strings only when the caller uses that transition function. A caller can bypass it by supplying an envelope already marked `COMPLETE`.
- The JSON Schema also allows `COMPLETE` and has no owner/reviewer identity fields or signed completion record.
- Fail closed by rejecting `COMPLETE` as an initial envelope status, or require a separately validated completion record with evidence references and independently verified human identities. Add regression tests for direct COMPLETE envelopes and schema alignment.

A source review comment was posted on PR #611 (comment 7051202896).

### Contract boundary

The package is a validator/catalog only, not a live scheduler or runtime. Roles are templates with no identity assignments; it does not authenticate users, enforce permissions in a service, dispatch work, or establish audit-log integrity. Hosted CI has not executed the tests. Do not treat this source contract as an operational control plane until a separately secured runtime and independent review exist.

## Consolidated disposition

- PR #596: **SOURCE REVIEW FAIL — compile-blocking test-source issue to correct; parent ancestry diverged; runtime unverified.**
- PR #611: **SOURCE REVIEW FAIL — cost-error assertion mismatch and direct COMPLETE bypass; runtime unverified.**
- Both remain draft/unmerged. No code was changed by this review, no workflow was dispatched, no runner was used, and no production/provider mutation occurred.
