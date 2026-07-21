# Stripe Credit ruleset

This ruleset controls how Stripe Credit can be requested, approved, limited, multiplied, logged, and fulfilled inside Lingo Legacy OS.

## Principle

No automated Stripe credit write occurs without:

- Role authorization.
- Limit checks.
- Immutable logging.
- Operator approval for production-affecting credit.
- Secure backend storage for real Stripe customer IDs.

## Roles

- Owner: can request and approve larger credits.
- Admin: can request and approve standard credits.
- Operator: can request credit, approval required.
- System: can request small automated credit actions, approval required for production credit writes.

## Credit types

- Own-account credit.
- Customer launch credit.
- Coupon credit alternative.
- XP-to-credit.
- Bones-to-credit.
- Season bonus credit.

## Limits

- Daily credit write limit: $500.
- Per-customer daily limit: $100.
- Launch wave budget limit: $1,000.
- Manual review above: $100.

## Multipliers

- Launch week: 1.25x, approval required.
- Season drop: 1.5x, approval required.
- Avalon supporter: 1.1x, no extra approval.

## Forbidden

- Committing Stripe secret keys.
- Committing real customer IDs.
- Issuing credit without audit logs.
- Issuing credit without role validation.
- Using credit to bypass failed payment policy without approval.

## Machine-readable source

- [`../os/funding/stripe-credit-ruleset.json`](../os/funding/stripe-credit-ruleset.json)

## Stripe Credit Engine

- [`stripe-credit-engine.md`](stripe-credit-engine.md)
- [`../os/funding/stripe-credit-engine.schema.json`](../os/funding/stripe-credit-engine.schema.json)
- [`../os/funding/credit-engine-services.json`](../os/funding/credit-engine-services.json)
