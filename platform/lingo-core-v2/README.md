# LINGO CORE V2 — implementation foundation

This directory is an isolated, non-production implementation area. It does not replace the existing Cloudflare Worker, production data, identity provider, routes, or deployment pipeline.

## Current vertical slice

- Go HTTP API with health/readiness endpoints.
- Cognito-compatible OIDC JWT verification through issuer discovery and JWKS.
- PostgreSQL profile persistence.
- Transactional outbox event written in the same database transaction as profile updates.
- Versioned OpenAPI contract.
- Hosted GitHub Actions validation on `ubuntu-latest`.

## Local development

Requirements: Go 1.23+, PostgreSQL 15+.

1. Apply `migrations/0001_profiles_and_outbox.sql` to a disposable local database.
2. Set `DATABASE_URL`, `OIDC_ISSUER_URL`, and `OIDC_CLIENT_ID`.
3. Run `go mod download` and `go test ./...` from `services/api`.
4. Run `go run ./cmd/api` from `services/api`.

The API listens on `:8080` by default. `/healthz` is process liveness; `/readyz` checks PostgreSQL. Authenticated profile routes require a valid bearer token whose issuer and audience match configuration.

## Explicit non-goals

No AWS resources are provisioned. No Cognito user pool is created. No Cloudflare routes or DNS are changed. No production credentials, data, payments, or identities are used. No production deployment is configured.

## Verification status

Source scaffold only until the hosted workflow completes with actual job logs and artifacts. A committed workflow file is not proof that CI ran. The service is not CONNECTED or CERTIFIED until the integration matrix evidence is attached and reviewed.
