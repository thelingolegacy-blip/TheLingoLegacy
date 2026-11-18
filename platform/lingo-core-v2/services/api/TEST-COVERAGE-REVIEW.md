# CORE V2 Go Test Coverage Review

**Branch:** implementation/lingo-core-v2-foundation  
**Review date:** 2026-11-18  
**Status:** STATIC REVIEW ONLY — no Go test, race, vet, or build command was executed in this review.

## 1. Executive finding

The API has a useful initial safety-focused test set, but no measured coverage result is available. The current workflow invokes go test -race -cover ./..., which prints package summaries but does not retain a coverage profile, function-level report, or durable coverage artifact. Hosted attempts have failed before job creation, so no hosted test or coverage evidence exists.

Do not state a coverage percentage until a completed run produces coverage.out and go tool cover -func output.

## 2. Static test inventory

Inspected Go files under platform/lingo-core-v2/services/api:

| Package / file | Source inventory | Test inventory |
|---|---|---|
| internal/httpapi/server.go | HTTP routes, security headers, health/readiness, bearer verification, profile read/write, transaction and outbox | 9 unit test functions in server_test.go; 3 integration test functions in server_integration_test.go |
| cmd/api/main.go | Environment validation, PostgreSQL TLS policy, OIDC issuer policy/discovery/verifier, server timeouts and shutdown | No *_test.go file in the inspected package directory |

The 2 `cmd/api` test functions cover PostgreSQL TLS policy (12 table cases) and OIDC issuer policy (10 table cases). They cover verified TLS, loopback development exceptions, remote plaintext rejection, duplicate sslmode, malformed/wrong-scheme URLs, HTTPS enforcement, loopback HTTP exceptions, remote HTTP rejection, credentials/query strings, and relative issuer URLs.

The 9 `internal/httpapi` unit test functions cover liveness/security header, nil-DB readiness, missing/invalid bearer, missing issuer, unknown JSON fields, multiple JSON values, display-name over-limit, and nil-DB write fail-closed.

The 3 integration test functions cover issuer/subject isolation and committed outbox records; outbox insert failure rolling back the profile mutation; and integration DSN safety validation with 7 table-driven DSN cases.

The two PostgreSQL-dependent integration functions call t.Skip when TEST_DATABASE_URL is absent. The API workflow defines a PostgreSQL 16 service and supplies a loopback lingo_test DSN, but current hosted workflows have not instantiated jobs. The separate bootstrap workflow permits DB-less integration skips; its result must not be confused with a full PostgreSQL integration pass.

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

The source inventory is not a Go coverage profile. The current workflow's -cover option would emit package summaries if it ran, but does not create a retained profile for function-level inspection or trend comparison.

## 4. Static coverage gaps — prioritized

### P0 — startup and identity configuration (cmd/api)

No tests currently exercise:
- required environment-variable behavior;
- PostgreSQL URL parsing, scheme and hostname validation;
- duplicate or malformed sslmode query parameters;
- loopback-only sslmode=disable exception for development/test;
- remote database requirement for sslmode=verify-full;
- HTTPS-only OIDC issuer policy and localhost HTTP exception;
- user-info/query/fragment rejection in issuer URLs;
- startup failure on OIDC discovery errors;
- verifier configuration and server timeout/shutdown wiring.

Extract pure validation helpers into a testable package or add main_test.go table-driven tests. Add a local test HTTP OIDC discovery/JWKS fixture for verifier behavior without contacting a production identity provider. Never test with production credentials.

### P0 — authenticated HTTP and request validation (internal/httpapi)

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
- rollback behavior and required PostgreSQL extension support for gen_random_uuid().

### P2 — robustness and operations

Add cancellation/deadline behavior, concurrent profile writes, request-size boundary, malformed DSN corpus, fuzz tests for URL/JSON validation, and deterministic shutdown tests where practical.

## 5. Recommended coverage workflow

The API workflow should retain a profile and readable report, not only print -cover output. Recommended command sequence:

    set -euo pipefail
    go test -race -count=1 -coverpkg=./... -coverprofile=coverage.out -covermode=atomic ./... 2>&1 | tee go-test-coverage.log
    go tool cover -func=coverage.out | tee coverage-summary.txt

Upload coverage.out, go-test-coverage.log, and coverage-summary.txt as one run-correlated artifact, including commit SHA, workflow run ID, Go version, package list, and whether PostgreSQL integration tests ran or skipped. Use if: always() for artifact retention, but do not label a missing profile as passing coverage.

Keep the separate bootstrap job's DB-less run classified as unit/smoke-only. Only the API workflow with its healthy PostgreSQL service can provide full database integration coverage.

## 6. Acceptance thresholds — proposed, not adopted

Do not optimize for one global percentage. First require all security-sensitive validation branches to have explicit tests; all transaction success/failure branches to have integration tests; no critical branch left uncovered without documented rationale; race tests to pass on concurrent identity/profile operations; coverage deltas to be reviewed alongside changed code; and no decrease in security-critical package coverage without an approved exception.

Adopt numerical minimums only after the first trustworthy baseline profile exists. Establish baseline, review uncovered branches, then set package-specific floors based on reachable code and testability rather than an arbitrary repository-wide target.

## 7. Verification commands for a clean Go environment

Run from platform/lingo-core-v2/services/api:

    go version
    gofmt -l .
    go mod tidy -diff
    go test -race -count=1 -coverpkg=./... -coverprofile=coverage.out -covermode=atomic ./...
    go tool cover -func=coverage.out
    go vet ./...
    go build ./...

For full integration coverage, TEST_DATABASE_URL must target an isolated disposable loopback PostgreSQL database named lingo_test. Never point tests at shared, staging, or production data. Retain logs and artifacts tied to the exact commit SHA.

## 8. Evidence disposition

- Source review: E1 / static.
- Test inventory: E1 / static.
- Coverage percentage: NOT MEASURED.
- Unit/integration/race/vet/build execution: NOT RUN in this review.
- Hosted CI: blocked before job creation; not a test failure and not a pass.
- Acceptance: HELD pending execution evidence, coverage review, and independent approval.
