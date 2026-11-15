# LINGO CORE V2 — implementation foundation

This directory is an isolated, non-production implementation area. It does not replace the existing Cloudflare Worker, production data, identity provider, routes or deployment pipeline.

## Current vertical slice

- Go HTTP API with health/readiness endpoints and bounded HTTP server timeouts.
- OIDC ID-token verification against a configured issuer and client audience.
- Profile identity keyed by verified issuer plus subject.
- PostgreSQL profile persistence.
- Transactional outbox event written in the same database transaction as profile updates.
- Versioned OpenAPI contract.
- Hosted GitHub Actions validation on `ubuntu-latest`, with a disposable PostgreSQL service for integration tests.

## Local development

Requirements: Go 1.23+, PostgreSQL 15+.

1. Apply `migrations/0001_profiles_and_outbox.sql` to a disposable local database.
2. Set `DATABASE_URL`, `OIDC_ISSUER_URL` and `OIDC_CLIENT_ID` for the API.
3. Set `TEST_DATABASE_URL` to a disposable PostgreSQL database to run database integration tests.
4. For non-development runtime, set `DATABASE_URL` with `sslmode=verify-full`; local development may explicitly set `APP_ENV=development`.
5. Run `go test ./...` from `services/api`.
5. Run `go run ./cmd/api` from `services/api`.

The API listens on `:8080` by default. `/healthz` is process liveness; `/readyz` checks PostgreSQL. Authenticated profile routes accept OIDC ID tokens whose issuer and audience match configuration. The verified issuer and subject are both part of the profile key. OAuth access-token semantics are not implemented by this slice.

## Explicit non-goals

No cloud resources are provisioned. No identity pool is created. No Cloudflare routes or DNS are changed. No production credentials, data, payments or identities are used. No production deployment is configured. The outbox is persisted transactionally, but a publisher/consumer, delivery retries, dead-letter queue and replay controls are not yet implemented.

## Verification status

Source changes and tests are authored, but they remain unverified until the hosted workflow creates jobs, executes the steps and produces commit-correlated logs/artifacts. A committed workflow file is not proof that CI ran. The service is not CONNECTED or CERTIFIED until the integration matrix evidence is attached and reviewed.
