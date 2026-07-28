# Front-to-Back Integration OS

This is the static integration blueprint for Lingo Legacy OS across Flutter, Firebase, Cloudflare, Vercel, GitHub, storage, and studio pipelines. It does not activate backend writes, payments, ads, Cloud Functions, Firestore writes, DNS changes, or Vercel Functions.

## Active now

- Vercel static web delivery for the public site, studio routes, game previews, safety pages, payload matrix, master interface, and integration OS.
- GitHub pull request workflow for focused branches, validation, review, and Vercel preview deployments.
- Static docs, JSON contracts, safety pages, payload matrix, and monetization safety blueprint.
- Security headers in `vercel.json`.

## Front-to-back layers

### Flutter app layer

Future mobile shell for:

- Splash and last-active-world resume.
- Lingo ID profile, avatar, badges, XP, accessibility preferences, and settings.
- Virtual wallet display for Demo Coins, Loyalty Bucks, Lingo Tokens, cosmetics, and collectibles with no cash-out route.
- Store preview, world home, notifications surface, and safe sync states.

### Firebase optional layer

Optional app services after a separate backend activation plan:

- Firebase Authentication for account sessions.
- App Check for app integrity.
- Firestore for profiles, inventories, progress, audit trails, and configuration state.
- Cloud Storage only when a Firebase-specific media path is chosen; otherwise prefer Vercel Blob for file storage.
- FCM for notifications, Crashlytics for app stability, Analytics/Remote Config only after consent and spend review.

### Cloudflare optional layer

Optional external boundary for DNS, redirects, cache policy, and security controls. Do not change DNS without domain-specific verification. Vercel remains the deployment source of truth for this repository.

### Vercel delivery layer

- Static hosting, preview deployments, production deployments, aliases, domains, headers, and future Blob file storage.
- Vercel Blob is first-party file storage for images, documents, generated assets, and uploads.
- Neon via Vercel Marketplace is the relational path. Vercel Postgres is no longer first-party; existing databases were migrated to Neon via Vercel Marketplace in December 2024.
- Upstash Redis via Vercel Marketplace is the key-value/cache path. Vercel KV is no longer first-party; existing stores were migrated to Upstash Redis via Vercel Marketplace in December 2024.

### GitHub source layer

- Source control and pull requests.
- Static validation before review.
- Vercel preview deployments for review.
- Merge to main for production deployment.

## Activation requirements before live services

1. Auth and role checks.
2. Schema validation.
3. Rate limits.
4. Audit logs.
5. Spend Management hard stop.
6. Rollback plan.
7. No-wagering, no-cash-out, no-cash-equivalent enforcement.
8. Domain-specific verification before Cloudflare DNS or edge changes.
9. Environment variables stored only in the Vercel dashboard or provider dashboards, never committed.

## Source of truth

- Static page: `/integration-os/`
- Static config: `config/integration/front-back-stack.json`
