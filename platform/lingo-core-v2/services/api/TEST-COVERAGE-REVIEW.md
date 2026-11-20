# CORE V2 Go Test Coverage Review

**Branch:** implementation/lingo-core-v2-foundation  
**Review date:** 2026-11-19  
**Status:** STATIC REVIEW ONLY — no Go test, race, vet, or build command was executed in this review.

## 1. Executive finding

The API has an initial safety-focused test set, and the current API workflow is configured to produce a coverage profile, function-level summary, test log, and run-correlated artifact. No measured coverage result or hosted artifact is available because the latest hosted attempts failed before job creation. Workflow configuration is not execution evidence.

Do not state a coverage percentage until a completed run produces `coverage.out` and `go tool cover -func` output. Do not describe the Go tests as passing or failing until a job actually executes them.


### Dependency lock evidence

The current branch contains `go.mod` but no `go.sum`. The workflow's `go mod tidy -diff` step is expected to fail until a checksum file is generated from the exact module graph and committed. Do not hand-author checksums. Generate `go.sum` with the pinned Go toolchain in a controlled dependency-fetch environment, review the full module graph, then rerun `go mod tidy -diff` and `go mod verify` before claiming reproducibility.

## 2. Static test inventory

Inspected Go files under `platform/lingo-core-v2/services/api`:

| Package / file | Source inventory | Test inventory |
|---|---|---|
| `internal/httpapi/server.go` | HTTP routes, security headers, health/readiness, bearer verification, profile read/write, transaction and outbox | 12 unit test functions in `server_test.go`; 3 integration test functions in `server_integration_test.go` |
| `cmd/api/main.go` | Environment validation, PostgreSQL TLS policy, OIDC issuer policy/discovery/verifier, server timeouts and shutdown | 2 table-driven test functions in `main_test.go` |

The 2 `cmd/api` test functions cover PostgreSQL TLS policy (12 table cases) and OIDC issuer policy (10 table cases). They cover verified TLS, loopback development exceptions, remote plaintext rejection, duplicate `sslmode`, malformed/wrong-scheme URLs, HTTPS enforcement, loopback HTTP exceptions, remote HTTP rejection, credentials/query strings, and relative issuer URLs.

The 12 `internal/httpapi` unit test functions cover liveness/security header, nil-DB readiness, missing/invalid bearer, missing issuer, unknown JSON fields, multiple JSON values, display-name over-limit, nil-DB write fail-closed, required JSON media type, malformed JSON, and the 4 KiB request-body limit with HTTP 413.

The 3 integration test functions cover issuer/subject isolation and committed outbox records; outbox insert failure rolling back the profile mutation; and integration DSN safety validation with 7 table-driven DSN cases.

The two PostgreSQL-dependent integration functions call `t.Skip` when `TEST_DATABASE_URL` is absent. The consolidated API workflow defines a PostgreSQL 16 service and supplies a loopback `lingo_test` DSN. The duplicate DB-less bootstrap workflow was removed so there is one canonical hosted validation lane. Current hosted workflows have not instantiated jobs.

## 3. Coverage status and metric semantics

| Metric | Current evidence |
|---|---|
| Go statement coverage percentage | NOT MEASURED |
| Per-function coverage | NOT MEASURED |
| Race-detector result | NOT RUN |
| Unit tests executed in this review | NOT RUN |
| PostgreSQL integration tests executed in this review | NOT RUN |
| Vet / build | NOT RUN |
| Hosted coverage artifact | NONE |

The source inventory is not a Go coverage profile. The API workflow is configured to run `go test -race -count=1 -coverpkg=./... -coverprofile=coverage.out -covermode=atomic ./...`, generate `coverage-summary.txt` with `go tool cover -func`, and upload the profile, test log, and summary. Those artifacts do not exist until a hosted job completes and uploads them.

## 4. Static coverage gaps — prioritized

### P0 — startup and identity configuration (`cmd/api`)

No tests currently exercise:
- required environment-variable behavior and startup failure when a required variable is absent;
- OIDC discovery failure handling and verifier behavior against a local test discovery/JWKS fixture;
- explicit positive/negative token verification for signature, issuer, audience, expiry, and key rotation;
- server timeout, signal handling, and graceful-shutdown wiring;
- remaining URL edge cases such as missing `sslmode`, malformed query encoding, unsupported SSL modes, IPv6 database loopback, and issuer URL fragments.

The existing `main_test.go` does cover the core PostgreSQL TLS policy and OIDC issuer-scheme policy; do not list those tested branches as wholly uncovered. Add focused tests for the remaining edge cases and a local test HTTP OIDC discovery/JWKS fixture. Never test with production credentials.

### P0 — authenticated HTTP and request validation (`internal/httpapi`)

Add tests for:
- missing verifier returns 503;
- malformed Authorization header forms, empty token and case-insensitive Bearer scheme;
- verifier returning an empty subject as well as an empty issuer;
- malformed JSON, empty/whitespace display name, exact 80-rune boundary and 81-rune rejection;
- request body over 4 KiB;
- security headers on every route and JSON content type on error responses.

### P1 — database read/write branches

Use a disposable PostgreSQL service or transaction-aware test harness to cover:
- profile GET success, not-found and query failure;
- profile PUT successful insert and conflict/update path;
- begin, profile insert, outbox insert, and commit failures;
- profile/outbox atomicity and event payload contents;
- same subject under different issuers, same issuer/subject update, and concurrent requests;
- readiness when DB is healthy and when ping fails.

The existing integration tests already cover issuer isolation and rollback on outbox insert failure. Preserve these and add missing branches rather than replacing them.

### P1 — schema and migration

Add migration tests for:
- composite primary key (issuer, subject);
- display-name length constraint;
- outbox schema version and attempts constraints;
- unpublished-event index;
- migration idempotency / repeat application;
- rollback behavior and required PostgreSQL support for `gen_random_uuid()`.

### P2 — robustness and operations

Add cancellation/deadline behavior, concurrent profile writes, request-size boundary, malformed DSN corpus, fuzz tests for URL/JSON validation, and deterministic shutdown tests where practical.

## 5. Coverage workflow configuration

The single API workflow is configured to check out the exact PR head SHA, record runner/run identity, retain a profile and readable report, and execute PostgreSQL integration tests—not only print package coverage:

    set -euo pipefail
    go test -race -count=1 -coverpkg=./... -coverprofile=coverage.out -covermode=atomic ./... 2>&1 | tee go-test-coverage.log
    go tool cover -func=coverage.out | tee coverage-summary.txt

It also uploads `coverage.out`, `go-test-coverage.log`, and `coverage-summary.txt` as one run-correlated artifact, using an `always()` upload condition. The summary step is conditional on the profile existing. A missing profile must not be labeled as passing coverage.

Only the consolidated API workflow with its healthy PostgreSQL service can provide full database integration coverage. A job without an instantiated runner, completed steps, logs and artifact remains UNEXECUTED.

## 6. Acceptance thresholds — proposed, not adopted

Do not optimize for one global percentage. First require all security-sensitive validation branches to have explicit tests; all transaction success/failure branches to have integration tests; no critical branch left uncovered without documented rationale; race tests to pass on concurrent identity/profile operations; coverage deltas to be reviewed alongside changed code; and no decrease in security-critical package coverage without an approved exception.

Adopt numerical minimums only after the first trustworthy baseline profile exists. Establish baseline, review uncovered branches, then set package-specific floors based on reachable code and testability rather than an arbitrary repository-wide target.

## 7. Verification commands for a clean Go environment

Run from `platform/lingo-core-v2/services/api`:

    go version
    gofmt -l .
    go mod tidy -diff
    go test -race -count=1 -coverpkg=./... -coverprofile=coverage.out -covermode=atomic ./...
    go tool cover -func=coverage.out
    go vet ./...
    go build ./...

For full integration coverage, `TEST_DATABASE_URL` must target an isolated disposable loopback PostgreSQL database named `lingo_test`. Never point tests at shared, staging, or production data. Retain logs and artifacts tied to the exact commit SHA.

## 8. Evidence disposition

- Source review: E1 / static.
- Test inventory: E1 / static.
- Coverage percentage: NOT MEASURED.
- Unit/integration/race/vet/build execution: NOT RUN in this review.
- Hosted CI: blocked before job creation; not a test failure and not a pass.
- Acceptance: HELD pending execution evidence, coverage review, and independent approval.
