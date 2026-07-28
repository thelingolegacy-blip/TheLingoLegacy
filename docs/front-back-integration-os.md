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


## Production refresh audit — 2026-07-28

- Production deployment is `READY` from GitHub `main` commit `2bc857fa4f2d8c9c293562a244debe3ccc1dce5e`.
- Production aliases are `thelingolegacy.com`, `www.thelingolegacy.com`, `the-lingo-legacy.vercel.app`, and the Git main branch alias.
- Cloudflare DNS is active through `christina.ns.cloudflare.com` and `randall.ns.cloudflare.com`; public diagnostics resolve the apex and `www` hostnames to Vercel and HTTPS returns Vercel security headers.
- Vercel reports the domain is attached and verified; apply the Vercel Domain Connect DNS recommendation in Cloudflare when convenient, then re-run domain verification.
- Production environment variable names are present for `SITE_URL`, `TML_ASSET_UPLOAD_KEY`, and the public TML asset path map. Secret values stay in Vercel only.
- Firebase and Flutter remain contract-only: no Firebase runtime SDK, Cloud Functions, Firestore writes, Flutter build, or mobile release pipeline is active in this static repo.
- Static validation and smoke checks pass; recent Vercel error-level logs returned no entries for the checked window.

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
