# Payment alerts

Stripe Checkout now has a webhook endpoint at `/api/stripe-webhook`.

## Required Stripe webhook setup

1. In Stripe, add an endpoint for `https://thelingolegacy.com/api/stripe-webhook`.
2. Subscribe to these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
3. Add the signing secret to Vercel as `STRIPE_WEBHOOK_SECRET`.
4. Redeploy after adding the variable.

## Optional alert delivery

Set `PAYMENT_ALERT_WEBHOOK_URL` to a private webhook URL for your alert destination. Do not commit that URL to GitHub.

The webhook endpoint verifies Stripe signatures before sending alerts.
