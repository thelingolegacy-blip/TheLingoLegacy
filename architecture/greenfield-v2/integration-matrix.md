# Integration matrix — evidence required

| Connection | Boundary | Proof before CONNECTED |
|---|---|---|
| Web → API | Versioned Go API | Browser E2E, auth propagation, contract tests |
| Flutter → API | Same versioned API | Reproducible device build, refresh, offline/failure tests |
| API → identity | OIDC issuer/JWKS adapter | issuer, audience, signature, expiry, key rotation, issuer+subject mapping |
| API → PostgreSQL | Transactional store | migrations, transactions, isolation, TLS, least privilege, backup/restore |
| API → outbox publisher | Database outbox | atomic write, claim/lease, bounded retries, idempotency, poison-event handling |
| Publisher → consumer | Versioned event contract | schema compatibility, deduplication, replay, dead-letter and trace continuity |
| Services → object storage | Private asset adapter, if needed | private access, signed URL expiry, upload validation |
| Cloudflare → application origin | Verified canonical origin | TLS, host routing, origin restriction, failover and route ownership |
| GitHub → deployment identity | OIDC federation, if approved | subject restrictions, least privilege, plan/apply separation |
| Services → telemetry | OpenTelemetry-compatible destination | trace continuity, redaction, alert delivery |
| Payment adapter → provider | Provider sandbox only | webhook signature/replay, lifecycle, ledger reconciliation |

## Provider-selection gate
Every external provider remains a candidate until workload fit, data residency, security, portability, quota/free-tier limits, full monthly cost and exit strategy are documented and owner-approved. A row is not CONNECTED because a configuration file or credential exists.

## Status vocabulary
NOT STARTED = no implementation/proof. BUILT = code exists, not integration-certified. TESTED = automated checks executed and passed. CONNECTED = non-production systems exchanged data with automated evidence. CERTIFIED = security, resilience, operations and end-to-end acceptance passed. PRODUCTION = separately approved release and post-deploy verification.
