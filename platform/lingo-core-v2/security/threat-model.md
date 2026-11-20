# LINGO CORE V2 — initial threat model

Scope: first non-production Go profile API slice only. This is an engineering working document, not a completed security assessment.

## Assets
- OIDC subject identifiers.
- User profile display names.
- PostgreSQL profile records.
- Pending outbox event payloads.
- OIDC issuer configuration and database credentials at runtime.

## Trust boundaries
1. Internet/client to API.
2. API to OIDC discovery/JWKS.
3. API to PostgreSQL.
4. Future outbox publisher to Kafka.

## Primary threats and controls
| Threat | Control in this slice | Remaining proof |
|---|---|---|
| Forged or expired bearer token | OIDC verifier validates signature, issuer, expiry and client audience | Automated issuer/audience/signature/expiry tests |
| Profile IDOR | Subject comes from verified token, not request input | Multi-user integration test |
| Oversized/malformed profile input | 4 KiB body cap, strict JSON fields, display-name bounds | Fuzz and boundary tests |
| Sensitive response caching | Cache-Control: no-store | Gateway/cache integration test |
| Partial profile/event write | Profile and outbox insert share one PostgreSQL transaction | Transaction rollback integration test |
| Database outage | Readiness returns 503 | Failure injection and alert test |
| Credential exposure | Credentials are environment-provided; none committed | Secret scanning and deployment secret review |
| Outbox duplicate delivery | Event table is durable; consumer not implemented | Idempotent consumer and replay test |

## Required before certification
- Threat-model review by an independent reviewer.
- TLS enforcement and certificate verification for PostgreSQL.
- Least-privilege database role and schema ownership.
- Rate limits, request correlation, audit policy and PII redaction.
- OIDC key-rotation and account-recovery tests.
- Dependency/SBOM/vulnerability scans.
- Backup/restore and failure-injection exercises.

No production data or credentials may be used in this slice.
