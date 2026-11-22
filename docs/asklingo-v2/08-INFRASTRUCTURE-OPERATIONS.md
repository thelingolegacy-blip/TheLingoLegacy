# askLINGO v2.0 — Infrastructure and Operations Plan

## Source and runtime authority

- Source of truth: GitHub repository `thelingolegacy-blip/TheLingoLegacy`.
- Current runtime target: Cloudflare Workers and Pages as documented by the repository.
- Web client: existing repository web surface; React/Next only where the current source architecture supports it.
- Mobile client: Flutter.
- Identity/data: candidate Firebase services require real staging configuration and verification.
- Model inference: provider-neutral server-side adapter; provider not yet selected.
- CI/CD: existing GitHub controls and required checks; no gate weakening.

## Environment separation

Use isolated development, staging, and production environments with distinct credentials, data, and policy. No production data in development. No production secrets in CI logs or preview builds. Staging credentials must not grant production access.

## Cost controls

Before selecting providers or services, set a monthly ceiling, per-user/per-tenant limits, per-request budget, token/compute quotas, timeout, concurrency limits, and alerts. Default to zero paid inference until a provider and budget are explicitly approved. Never enable paid fallback automatically.

## Secrets

Store secrets only in approved server-side secret storage. Scope each secret to one environment and purpose. Rotate, revoke, and audit access. Never commit secrets or place them in mobile/web assets.

## Rate limiting and abuse

The current facade uses an in-memory per-isolate rate bucket and labels its scope accordingly. That is not a global rate limiter. A production implementation must use a shared edge/platform rate-limit mechanism or another reviewed distributed control, plus abuse detection and per-identity quotas.

## Observability

Capture structured, privacy-minimized events for request latency, error class, provider availability, policy decisions, approval outcomes, tool calls, and verification results. Correlate across services. Never log secrets or raw sensitive conversations by default.

## Resilience

Define dependency timeouts, cancellation, bounded retries, circuit breakers, queue backpressure, idempotency, and recovery procedures. Protected operations fail closed if identity, policy, approval, or required audit services are unavailable.

## Backup and recovery

Define backup scope, encryption, retention, restore roles, recovery-point objective, recovery-time objective, integrity checks, and periodic restore exercises. Backups do not bypass deletion or retention obligations.

## Deployment

This architecture branch does not deploy. A future implementation must use a reviewed PR, required CI checks, a release candidate, independent acceptance, separate deployment authorization, live probes, and rollback plan. Existing production HOLD and G02 BLOCKED/UNVERIFIED status remain unchanged.
