# Launch plan

## Current Vercel status

- Primary project: `the-lingo-legacy`
- Production domains: `thelingolegacy.com`, `www.thelingolegacy.com`, and Vercel preview aliases
- Linked repository: `thelingolegacy-blip/TheLingoLegacy`
- Production branch: `main`

## Project consolidation

Keep `the-lingo-legacy` as the public production site. Review duplicate or experimental projects before continuing heavy development so deployments and usage stay controlled.

Highest-priority project charges are currently small compared with Agent usage. The main cost guardrail is to batch planning/code requests and avoid repeated high-volume Agent runs until revenue is active.

## Payment launch checklist

1. Create a one-time Stripe product and Price.
2. Add Vercel environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_ONE_TIME_PRICE_ID`
   - `SITE_URL`
3. Redeploy the production site.
4. Test `/payments/` with Stripe test mode.
5. Switch to live Stripe keys and Price ID when ready.

## Subscription phase

When recurring memberships are ready:

1. Create a Stripe subscription product and recurring Price.
2. Add `STRIPE_SUBSCRIPTION_PRICE_ID` in Vercel.
3. Add subscription UI copy and route traffic to subscription checkout.
4. Keep the one-time payment option live for supporters who do not want recurring billing.

## Billing guardrails

- Monitor Vercel usage at least daily during launch.
- Batch Agent tasks into clear work packages before execution.
- Avoid deploying duplicate experimental projects unless they have a launch purpose.
- Add Vercel spend controls and alerts from team billing settings before paid marketing starts.
