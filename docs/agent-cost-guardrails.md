# Vercel Agent Cost Guardrails

This project should stay static-first and low-cost on Vercel. The July audit showed the dominant billed line item was Vercel Agent team-level usage, not traffic, Functions, Blob, Web Analytics, or Speed Insights.

## Operating rules

- Keep requests small: one focused implementation or audit per Agent plan.
- Avoid broad “ALL” build loops that create many plans, PRs, previews, and validations in one session.
- Prefer static JSON/docs/pages before adding live API routes.
- Do not add `/api`, framework middleware, server functions, database writes, queues, or background workers without a separate approval.
- Keep payload URLs as reserved contracts until auth, validation, rate limits, audit logs, monitoring, and rollback controls are implemented.
- Use Vercel Blob only for file storage such as images, documents, generated assets, and uploads.
- Use Neon through Vercel Marketplace for relational data. Vercel Postgres is no longer first-party; existing databases were migrated to Neon via Vercel Marketplace in December 2024.
- Use Upstash Redis through Vercel Marketplace for cache/queue-style key-value workloads. Vercel KV is no longer first-party; existing stores were migrated to Upstash Redis via Vercel Marketplace in December 2024.

## Spend Management

Recommended setting while building:

- Enable Spend Management.
- Set a low temporary cap before large Agent sessions.
- Enable pause-project behavior for a hard stop.
- Raise the cap only for intentional production work.

Dashboard: https://vercel.com/thelingolegacy/~/settings/billing

## Refund or billing review

Billing disputes and refund reviews go through Vercel Help: https://vercel.com/help. Include the team name `thelingolegacy`, invoice or charge details, and the audit finding that the largest driver was Vercel Agent usage.
