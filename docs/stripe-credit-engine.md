# Stripe Credit Engine scaffold

The Stripe Credit Engine is the backend-safe layer for automated credit flows in Lingo Legacy OS.

## What it does

- Accepts credit requests from operators, admins, or system events.
- Applies the Stripe Credit ruleset.
- Requires approval when limits or production impact require it.
- Writes approved credits to Stripe only from a secure backend.
- Logs every request, approval, write, reversal, and fulfillment event.
- Uses webhooks to keep OS access, XP, crowns, and perks synchronized.

## Services

- Credit Request Service.
- Credit Approval Service.
- Stripe Credit Write Service.
- Immutable Credit Log Service.
- Webhook Fulfillment Service.

## Event types

- `credit_request`
- `credit_approval`
- `credit_write`
- `credit_reversal`
- `coupon_issue`
- `webhook_fulfillment`

## Security requirements

- Stripe secret key must live in backend environment variables only.
- Webhooks must verify Stripe signatures.
- Public docs must never contain raw Stripe customer IDs.
- Credit writes must be idempotent.
- Audit logs must be immutable.

## Machine-readable sources

- [`../os/funding/stripe-credit-engine.schema.json`](../os/funding/stripe-credit-engine.schema.json)
- [`../os/funding/credit-engine-services.json`](../os/funding/credit-engine-services.json)
