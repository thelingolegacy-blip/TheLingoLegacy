# Front-to-Back Integration OS

This is the static integration blueprint for Lingo Legacy OS across Flutter, Firebase, Cloudflare, Vercel, GitHub, storage, and studio pipelines. It does not activate backend writes, payments, ads, Cloud Functions, Firestore writes, or Vercel Functions.

## Active now

- Vercel static web delivery.
- GitHub pull request workflow.
- Static docs, JSON contracts, safety pages, payload matrix, and monetization safety blueprint.
- Security headers in `vercel.json`.

## Planned layers

- Flutter: future mobile UI shell for wallet display, XP, store, sync, and permissions.
- Firebase: optional auth, messaging, and app telemetry bridge only after a backend activation plan.
- Cloudflare: optional DNS/edge boundary; do not change DNS without domain-specific verification.
- Vercel Blob: first-party file storage for images, documents, generated assets, and uploads.
- Neon via Vercel Marketplace: relational data. Vercel Postgres is no longer first-party; existing databases were migrated to Neon via Vercel Marketplace in December 2024.
- Upstash Redis via Vercel Marketplace: cache, rate counters, idempotency, and AI flavor dedupe. Vercel KV is no longer first-party; existing stores were migrated to Upstash Redis via Vercel Marketplace in December 2024.

## Activation requirements before live services

1. Auth and role checks.
2. Schema validation.
3. Rate limits.
4. Audit logs.
5. Spend Management hard stop.
6. Rollback plan.
7. No-wagering, no-cash-out, no-cash-equivalent enforcement.

## Source of truth

- Static page: `/integration-os/`
- Static config: `config/integration/front-back-stack.json`
