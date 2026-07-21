# Credit rules and webhook scaffolds

This layer defines how Lingo Legacy OS should treat own-account credits, customer credits, coupons, and Stripe webhook fulfillment when a secure backend exists.

## Own-account credit rules

Use own-account credits only through Stripe Dashboard or a secure backend.

Initial rules:

- Cover OS Builder first month: $29 credit, operator-only.
- Cover promo runway: amount defined by campaign budget, expiration, and redemption cap.

Never commit:

- Real Stripe customer IDs.
- Secret API keys.
- Bank data.
- Raw API payloads with private identifiers.

## Customer credit rules

Use these paths in order:

1. Coupons for first-month-free launch onboarding.
2. Promotion codes for creator and partner acquisition.
3. Customer balance credits for manual supporter or grant-funded credits.

## Webhook fulfillment scaffold

Use these events when a backend exists:

- `checkout.session.completed` — grant purchased access, XP, crowns, or supporter perks.
- `invoice.paid` — mark subscription invoice paid, including credit-balance payments.
- `invoice.payment_failed` — warn or pause access after fallback rules.
- `customer.subscription.updated` — adjust tier state.
- `customer.subscription.deleted` — revoke subscription access.

## Security requirements

- Verify Stripe webhook signatures.
- Process only trusted events.
- Store billing state in secure backend storage.
- Never store card data locally.

## Machine-readable sources

- [`../os/funding/credit-rules.json`](../os/funding/credit-rules.json)
- [`../os/funding/stripe-credit-webhooks.json`](../os/funding/stripe-credit-webhooks.json)

## Stripe Credit ruleset

- [`stripe-credit-ruleset.md`](stripe-credit-ruleset.md)
- [`../os/funding/stripe-credit-ruleset.json`](../os/funding/stripe-credit-ruleset.json)

## Stripe Credit Engine

- [`stripe-credit-engine.md`](stripe-credit-engine.md)
- [`../os/funding/stripe-credit-engine.schema.json`](../os/funding/stripe-credit-engine.schema.json)
- [`../os/funding/credit-engine-services.json`](../os/funding/credit-engine-services.json)
