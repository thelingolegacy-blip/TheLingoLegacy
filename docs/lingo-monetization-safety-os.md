# Lingo Legacy Monetization Safety OS

This is a static blueprint for compliant entertainment monetization. It does not activate payments, ads, surveys, live backend writes, or Vercel Functions.

## Allowed monetization

- Virtual currency that is purchasable and spendable only inside the app.
- XP packs, boosts, cosmetics, skins, animations, sound packs, premium features, season passes, VIP access, ads, banners, surveys, offers, promo codes, and affiliate links.
- Mystery boxes and spin-style rewards only when rewards are non-cash, non-transferable, and have no real-world financial value.

## Hard blocked mechanics

- Real-money wagers.
- Real-money payouts.
- Cash-out flows.
- Virtual currency to cash conversion.
- Virtual currency to cash-equivalent prizes.
- Sweepstakes or contests with monetary prizes.
- Chance-based outcomes that award financial-value rewards.

## Required controls before going live

1. No-cash-value disclosures near every wallet, reward, purchase, mystery box, event, and leaderboard.
2. Consent manager for ads, tracking, analytics, surveys, personalization, location, maps, and beacons.
3. Audit logging for purchases, grants, wallet changes, entitlement changes, admin changes, and promotion changes.
4. Refund/support path for subscriptions and in-app purchases.
5. Published pricing, renewal, and cancellation terms for VIP and season passes.
6. AI governance: no odds, payout, reward, volatility, or spend-pressure decisions.
7. Plugin sandboxing with least privilege, monitoring, and kill switches.

## Storage and backend posture

- Vercel Blob is the first-party file storage path for images, generated assets, documents, and user uploads.
- Relational data should use Neon through Vercel Marketplace. Vercel Postgres is no longer first-party; existing databases were migrated to Neon via Vercel Marketplace in December 2024.
- Key-value/cache workloads should use Upstash Redis through Vercel Marketplace. Vercel KV is no longer first-party; existing stores were migrated to Upstash Redis via Vercel Marketplace in December 2024.
- This repository stays static-first until a separate backend activation plan is approved.

## Source of truth

- Static page: `/monetization-safety/`
- Static config: `config/monetization/safety-os.json`
- Regulated wagering readiness blueprint: `config/monetization/regulated-wagering-readiness.json`

## Regulated wagering readiness

That’s My Lingo can present a casino-grade product shell, but real-money wagers, deposits, withdrawals, cash prizes, payout ledgers, and cash-out guidance stay disabled until a licensed wagering provider or approved regulated backend is integrated. Activation requires qualified legal/compliance review, KYC and age checks, state or jurisdiction geofencing, responsible-play controls, fraud controls, server-verified outcomes, auditable ledgers, tax/reporting workflows, and published terms/rules/support paths.
