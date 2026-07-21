# Credit activation runbook

This runbook defines safe launch-funding options for Lingo Legacy OS without storing financial secrets, Stripe secret keys, or private customer data in the repository.

## Best stack

1. Stripe Capital — best after Stripe revenue starts flowing.
2. Stripe Balance Credits — best for direct invoice offset when using real Stripe customer records.
3. External Funding → Stripe Balance — best for early launch support, grants, micro-loans, or business capital.
4. Stripe Coupons / Promotions — best zero-cash option for first-month promos and trials.

## Recommended launch path

- Use coupons/promotions first for launch incentives.
- Use Stripe Balance Credits only inside Stripe or a secure backend.
- Evaluate Stripe Capital only when Stripe offers eligibility in the dashboard.
- Keep all secret keys, customer IDs, bank data, and funding data outside the repository.

## Safe credit balance flow

Operator-only Stripe flow:

1. Identify the real Stripe customer ID in Stripe Dashboard.
2. Add customer credit balance inside Stripe or a secure backend.
3. Let Stripe apply the balance to future invoices.
4. Reconcile through the Stripe revenue dashboard.

Do not commit the real customer ID or secret API request payload to this repository.

## Coupon alternative

Use coupons and promotion codes when you want first-month coverage without adding cash:

- 100% off first month.
- Free trial period.
- Launch partner discount.
- Avalon supporter promo.
- Creator onboarding code.

## Machine-readable source

- [`../os/funding/credit-activation.json`](../os/funding/credit-activation.json)

## Credit rules and webhooks

- [`credit-rules-and-webhooks.md`](credit-rules-and-webhooks.md)
- [`../os/funding/credit-rules.json`](../os/funding/credit-rules.json)
- [`../os/funding/stripe-credit-webhooks.json`](../os/funding/stripe-credit-webhooks.json)

## Stripe Credit ruleset

- [`stripe-credit-ruleset.md`](stripe-credit-ruleset.md)
- [`../os/funding/stripe-credit-ruleset.json`](../os/funding/stripe-credit-ruleset.json)

## Stripe Credit Engine

- [`stripe-credit-engine.md`](stripe-credit-engine.md)
- [`../os/funding/stripe-credit-engine.schema.json`](../os/funding/stripe-credit-engine.schema.json)
- [`../os/funding/credit-engine-services.json`](../os/funding/credit-engine-services.json)
