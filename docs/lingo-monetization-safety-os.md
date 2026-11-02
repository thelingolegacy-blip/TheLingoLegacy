# LINGOlegacy Monetization Safety OS

This is a static blueprint for compliant entertainment monetization. It does not activate payments, ads, surveys, live backend writes, AI, or billing.

## Allowed monetization candidates

- Non-cash-value virtual currency usable only inside the app.
- XP packs, boosts, cosmetics, skins, animations, sound packs, premium features, season passes, VIP access, ads, banners, surveys, offers, promo codes and affiliate links.
- Mystery boxes and spin-style rewards only when rewards are non-cash, non-transferable and have no real-world financial value, subject to applicable platform rules.

## Hard-blocked mechanics in the current release posture

- Real-money wagers or payouts.
- Cash-out flows or virtual-currency-to-cash conversion.
- Virtual currency to cash-equivalent prizes.
- Sweepstakes or contests with monetary prizes until separately reviewed and authorized.
- Chance-based outcomes awarding financial-value rewards.

## Required controls before any monetization launch

1. Clear no-cash-value disclosures near every wallet, reward, purchase, mystery box, event and leaderboard.
2. Consent manager for ads, tracking, analytics, surveys, personalization, location, maps and beacons.
3. Append-only audit events for purchases, grants, wallet changes, entitlements, admin changes and promotions.
4. Refund/support path, receipts, pricing, renewal and cancellation terms.
5. Platform-specific in-app purchase and subscription policy review before store release.
6. Tax, consumer-protection, age, privacy and regional legal review.
7. AI governance: AI must not decide odds, payouts, reward volatility or spend-pressure mechanics.
8. Plugin and webhook least privilege, signature verification, idempotency, monitoring and kill switches.

## Canonical infrastructure posture

- **Cloudflare Workers / Pages:** edge runtime, API boundary, static delivery and routing.
- **Cloudflare D1:** authoritative world, entitlement and transaction metadata only after staging validation.
- **Cloudflare KV:** non-authoritative, TTL-bound cache; never credentials, sessions or balances.
- **Cloudflare R2:** approved images, video, audio, documents and user assets with rights/provenance checks.
- **Workers AI / Vectorize:** optional, disabled by default; explicit model allowlist, access filtering, consent and cost controls.
- **Stripe:** optional external payment API, not a Cloudflare binding; server-side secret and signed webhook required.
- **Firebase:** mobile identity/application services only after project and platform app registration is verified.

This repository remains static-first until the corresponding backend activation and release gates are accepted. No payment provider, AI inference, SMS or billable integration is enabled by this document.

## Source of truth

- Static page: `/monetization-safety/`
- Static config: `config/monetization/safety-os.json`
- Release controls: `release/acceptance-gates.json`
