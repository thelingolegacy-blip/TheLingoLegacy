# Integration matrix — target vs proof required

| Connection | Target authority | Proof required before status becomes CONNECTED |
|---|---|---|
| Web → API | Versioned Go API | Browser E2E, auth propagation, contract tests |
| Flutter → API | Versioned Go API | Device build, token refresh, network-failure tests |
| API → Cognito | OIDC/JWKS | Issuer/audience/signature/expiry/rotation tests |
| API → PostgreSQL | RDS | Migration, transaction, isolation, backup/restore tests |
| API → Redis | ElastiCache | TLS/auth, expiry, failover, cache-stampede tests |
| API → Kafka | MSK Serverless | Schema compatibility, idempotency, replay, DLQ tests |
| API/worker → S3 | S3 | Private access, signed URL expiry, malware validation |
| Cloudflare → ALB | Audited DNS/WAF | Origin allowlist, TLS, host routing, health and failover tests |
| GitHub → AWS | GitHub OIDC | Subject restrictions, role trust, plan/apply separation |
| Services → Datadog | OpenTelemetry | Trace continuity, redaction, alert delivery |
| Payment adapter → provider | Adapter only | Sandbox lifecycle, webhook signature, replay, ledger reconciliation |
| Notifications → providers | Adapter only | Delivery status, retries, bounce/failure handling |

## Status vocabulary

- NOT STARTED: no implementation or proof.
- BUILT: code exists, not yet integration-certified.
- CONNECTED: live non-production connection with successful automated proof.
- CERTIFIED: security, resilience, operations, and end-to-end gates passed.
- PRODUCTION: approved release and production verification completed.

Do not label an integration connected based only on configuration files, secrets existing, a successful deploy, or a health endpoint.
