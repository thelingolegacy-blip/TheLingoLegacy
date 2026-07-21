# Stripe Payment Link deployment package

This package defines the full Stripe setup for Lingo Legacy OS without storing secrets in the repository.

## Scaling architecture

- One product with multiple prices for each tier.
- One public Payment Link per tier or purchase group.
- Stripe Checkout handles Apple Pay, Google Pay, Link, cards, SCA, fraud checks, localization, and receipts.
- Stripe Billing handles subscription upgrades, downgrades, proration, failed payment recovery, invoices, and receipts.
- Webhooks are only for fulfillment.

## Products and prices

### Lingo.ai Premium

- Monthly: $9.99
- Annual: $99.00
- Mode: subscription
- Redirect: `https://thelingolegacy.com/site/lingoai/?activated=lingo-ai-premium`
- Placeholder: `STRIPE_PAYMENT_LINK_LINGO_AI_PREMIUM`

### Lingo Legacy OS Builder

- Monthly: $29.00
- Annual: $290.00
- Mode: subscription
- Redirect: `https://thelingolegacy.com/site/os/?activated=os-builder`
- Placeholder: `STRIPE_PAYMENT_LINK_LINGO_OS_BUILDER`

### Avalon Supporter Membership

- Monthly: $5.00
- Annual: $50.00
- Mode: subscription
- Redirect: `https://thelingolegacy.com/site/avalon/?activated=avalon-supporter`
- Placeholder: `STRIPE_PAYMENT_LINK_AVALON_SUPPORTER`

### Creator / Partner Tier

- Monthly: $14.99
- Annual: $149.00
- Mode: subscription
- Redirect: `https://thelingolegacy.com/site/creators/?activated=creator-partner`
- Placeholder: `STRIPE_PAYMENT_LINK_CREATOR_PARTNER`

### XP Booster / Crown Pack

- Small Booster: $4.99
- Medium Booster: $9.99
- Large Booster: $19.99
- Crown Pack: $49.99
- Mode: payment
- Redirect: `https://thelingolegacy.com/site/lingoai/?activated=xp-boosted`
- Placeholder: `STRIPE_PAYMENT_LINK_XP_BOOSTER_CROWN_PACK`

## Stripe dashboard steps

1. Create each Product.
2. Add monthly and annual Prices for subscriptions.
3. Add one-time Prices for XP Booster / Crown Pack.
4. Create one Payment Link per tier or purchase group.
5. Enable Apple Pay, Google Pay, Link, and Cards.
6. Enable promotion codes.
7. Add redirect URLs listed above.
8. Enable Stripe Customer Portal for subscription self-service.
9. Optional: enable Stripe Tax before global paid launch.
10. Send only public Payment Link URLs for site wiring.

## Webhook events for fulfillment

Use webhooks only when the fulfillment backend exists:

- `checkout.session.completed` — grant access, XP, or purchase fulfillment.
- `customer.subscription.updated` — adjust tier.
- `invoice.payment_failed` — pause access or notify customer.
- `customer.subscription.deleted` — revoke subscription access.

## Machine-readable source

- [`../os/payments/stripe-payment-link-package.json`](../os/payments/stripe-payment-link-package.json)
