# Integration matrix — evidence required

| Connection | Target | Proof before CONNECTED |
|---|---|---|
| Web → API | Go API | Browser E2E, auth propagation, contract tests |
| Flutter → API | Go API | Device build, refresh, offline/failure tests |
| API → Cognito | OIDC/JWKS | issuer, audience, signature, expiry, key rotation |
| API → PostgreSQL | RDS | migrations, transactions, isolation, restore |
| API → Redis | ElastiCache | TLS/auth, expiry, failover |
| API → Kafka | MSK | schema compatibility, idempotency, replay, DLQ |
| Services → S3 | S3 | private access, signed URL expiry, upload validation |
| Cloudflare → ALB | canonical origin | TLS, host routing, origin restriction, failover |
| GitHub → AWS | OIDC | subject restrictions, role trust, plan/apply separation |
| Services → Datadog | OpenTelemetry | trace continuity, redaction, alert delivery |
| Payment adapter → provider | provider sandbox | webhook signature/replay, lifecycle, ledger reconciliation |

## Status vocabulary
NOT STARTED = no implementation/proof. BUILT = code exists, not integration-certified. CONNECTED = non-production connection with automated proof. CERTIFIED = security, resilience, operations, and E2E gates passed. PRODUCTION = approved release and post-deploy verification. Config files, secrets, deploy success, or health endpoints alone do not prove a connection.
