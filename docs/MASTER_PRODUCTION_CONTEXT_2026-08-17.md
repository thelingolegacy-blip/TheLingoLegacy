# The Lingo ⭐️ Legacy — Master Production Context

**Canonical date:** 2026-08-17  
**Production authority:** Cloudflare Edge → Next.js origin → Firestore durable truth / Redis cache + telemetry  
**Primary domain:** https://thelingolegacy.com

## Canonical architecture
- Cloudflare is the authoritative public edge/router.
- Next.js is the primary application/origin layer.
- Firestore is durable source of truth.
- Redis is cache/telemetry only.
- Shopify is primary apparel commerce; Square is failover/mirror; TapStitch is POD/inventory integration.
- Runtime/CI secrets only; never hardcode credentials.
- No competing public edge plane without explicit approval.
- Gaming rewards are non-wagering promotional points only: no cash-out, wagering, staking, cash-equivalent redemption, or real-money conversion.

## Required surfaces
`/`, `/apparel`, `/kids-studio`, `/cycle`, `/community-hub`, `/creator-studio`, `/coming-soon/gaming`, `/coming-soon/vault`, `/api/health`, `/api/metrics`, `/api/checkout`, `/api/rewards/claim`.

## Required remediation/operations
Maintain the disaster-recovery, PITR rollback, Redis singleton, metrics, 20-gate production verification, live smoke tests, Cloudflare cache purge, TapStitch inventory sync, log rotation, immutable release tagging, and Star Points ledger components described in the current production handoff.

## Release authority
A release is not certified merely because source exists. Certification requires real execution of the 20 behavioral gates plus live smoke tests in the target environment. Gate 20 requires a valid CI-injected `LINGO_RELEASE_AUTHORIZATION_KEY` of at least 32 characters.

## Disaster recovery
Required variables include `BACKUP_PASSPHRASE`, `GCS_BACKUP_BUCKET`, `S3_BACKUP_BUCKET`, `S3_BACKUP_ENDPOINT`, `REDIS_PASSWORD`, `REDIS_HOST`, `REDIS_PORT`, and PITR's `FIREBASE_CONFIG_PATH`. Never commit credentials or service-account JSON.

## Cross-agent synchronization rule
Any future agent must read and preserve this canonical context, keep the same control-plane hierarchy, compliance boundary, release gates, and truth model, and must not claim live/active/production status without execution evidence. When architecture changes, update and propagate this file to the connected project repositories.

## Handoff status
This commit records the current canonical intended production state for downstream agents. Source synchronization does not itself prove Cloudflare/DNS/containers/Firestore/Redis are live; those require execution in the connected deployment environment with appropriate credentials.
