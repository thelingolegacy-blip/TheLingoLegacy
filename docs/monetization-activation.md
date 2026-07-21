# Monetization activation

This layer prepares subscriptions, commerce, ads, analytics, and payment activation for the Lingo Legacy ecosystem.

## Live-ready revenue streams

- Subscriptions: Lingo.ai Premium, OS Builder, Avalon Supporter, Creator/Partner, Business/Enterprise.
- Commerce: XP boosters, cosmetic packs, Avalon merch, event tickets, partner marketplace items.
- Ads and banners: AdSense, in-game ads, social monetization, geo-targeted partner alerts.

## Payment backbone

Stripe is the recommended backbone for Apple Pay, Google Pay, subscriptions, one-time purchases, and payment links.

Do not commit secret keys. Static pages should use public payment links until the app has a secure backend for Checkout sessions.

## Machine-readable sources

- [`../os/monetization/subscription-tiers.json`](../os/monetization/subscription-tiers.json)
- [`../os/monetization/commerce-catalog.json`](../os/monetization/commerce-catalog.json)
- [`../os/payments/payment-activation.json`](../os/payments/payment-activation.json)
- [`../os/analytics/tracking-plan.json`](../os/analytics/tracking-plan.json)
- [`../os/promotion/promo-engine.json`](../os/promotion/promo-engine.json)
