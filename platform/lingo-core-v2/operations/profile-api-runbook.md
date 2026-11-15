# Profile API — non-production runbook

## Startup configuration
Required environment variables:
- `DATABASE_URL`
- `OIDC_ISSUER_URL`
- `OIDC_CLIENT_ID`

Optional:
- `HTTP_ADDR` (default `:8080`)

## Probes
- `GET /healthz`: process liveness only; does not prove dependencies.
- `GET /readyz`: PostgreSQL ping; 503 means not ready.

## Common failures
- Startup fails at OIDC discovery: verify issuer URL, outbound DNS/TLS, and provider availability.
- Startup fails at database configuration: verify the connection string and network route.
- Readiness returns 503: verify database reachability and credentials.
- Auth returns 401: verify token issuer, audience/client ID, expiry, and JWKS availability.
- Profile returns 404: the authenticated subject has no profile yet.
- Profile write returns 500: inspect redacted server-side database/outbox logs; never log bearer tokens or full profile payloads.

## Recovery
Restart only after correcting the dependency/configuration fault. Do not bypass readiness. Do not run production migrations from this development runbook. Preserve failed request correlation IDs when added to the runtime.

## Current limitations
No outbox publisher/consumer, Kafka connection, rate limiter, metrics exporter, alert, production secrets manager binding, or restore drill is implemented yet.
