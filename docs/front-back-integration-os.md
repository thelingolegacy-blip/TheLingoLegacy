# Front-to-Back Integration OS

This is the refreshed static integration blueprint for Lingo Legacy OS across the frontend web shell, backend/API readiness, Flutter, Firebase, Cloudflare, Vercel, GitHub, storage, and studio pipelines. It does not activate new backend writes, ads, Cloud Functions, Firestore writes, DNS changes, or unreviewed Vercel Functions.

## Active now

- Vercel static web delivery for the public site, studio routes, game previews, safety pages, payload matrix, master interface, and integration OS.
- GitHub pull request workflow for focused branches, validation, review, and Vercel preview deployments.
- Static docs, JSON contracts, safety pages, payload matrix, and monetization safety blueprint.
- Security headers in `vercel.json`.

## Refresh command lanes

| Lane | Current state | Refresh outcome |
| --- | --- | --- |
| Frontend web | Active static Vercel site | Public routes, Studio shell, Integration OS, monetization pages, and safety pages stay refreshed and reviewable. |
| Backend/API | Guarded Vercel Functions only | Stripe Checkout and Beacon text alerts remain explicit, validated, no-store endpoints; new APIs require hardening first. |
| Flutter | Contract-only | Mobile screens mirror the web product model before any runtime sync is enabled. |
| Firebase | Contract-only | Auth, App Check, Firestore, FCM, Crashlytics, Analytics, and Remote Config require rules/env/consent review. |
| Cloudflare | Manual external layer | DNS, redirect, cache, and security edits require domain-specific verification and rollback. |
| Vercel | Active delivery layer | Static hosting, previews, production aliases, headers, domains, future Blob, and Marketplace storage integrations. |
| GitHub | Active source layer | Focused branches, PRs, validation, and Vercel preview deployment loop. |

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

- Static hosting, preview deployments, production deployments, aliases, domains, headers, current guarded Vercel Functions, and future Blob file storage.
- Vercel Blob is first-party file storage for images, documents, generated assets, and uploads.
- Neon via Vercel Marketplace is the relational path. Vercel Postgres is no longer first-party; existing databases were migrated to Neon via Vercel Marketplace in December 2024.
- Upstash Redis via Vercel Marketplace is the key-value/cache path. Vercel KV is no longer first-party; existing stores were migrated to Upstash Redis via Vercel Marketplace in December 2024.

### GitHub source layer

- Source control and pull requests.
- Static validation before review.
- Vercel preview deployments for review.
- Merge to main for production deployment.

## Backend/API readiness

Current guarded endpoints:

- `/api/create-checkout-session` — server-side Stripe Checkout session creation using Vercel environment variables for Stripe secrets and Price IDs.
- `/api/beacon-text-alerts` — validates consent, E.164 phone format, allowed alert zones, and simple in-memory rate limits before webhook/Twilio delivery.

Before adding new backend endpoints, require method guards, input schemas, auth/role checks when user data is involved, no-store responses for sensitive actions, provider env isolation, audit logs, rate limits, spend controls, and rollback notes.

## Environment variable map

Keep real values only in Vercel Project Settings or provider dashboards. Do not commit secrets.

- Vercel: `PUBLIC_SITE_URL`, `BLOB_READ_WRITE_TOKEN` when Blob is enabled.
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_XP_PACK`, `STRIPE_PRICE_MYSTERY_KEY_PACK`, `STRIPE_PRICE_AVALON_BADGE_SET`.
- Firebase: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_WEB_API_KEY`, `FIREBASE_APP_ID`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_MEASUREMENT_ID`, `FIREBASE_VAPID_KEY`.
- Cloudflare: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`.
- GitHub automation, if later needed: `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`.
- Neon via Vercel Marketplace: `POSTGRES_URL` or `NEON_DATABASE_URL`, depending on the connected resource.
- Upstash Redis via Vercel Marketplace: `REDIS_URL` or Upstash REST variables, depending on the connected resource.

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
