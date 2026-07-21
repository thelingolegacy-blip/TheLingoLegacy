# Payments setup

This site uses Stripe Checkout through the Vercel Serverless Function at `/api/create-checkout-session`.

Required Vercel environment variables:

- `STRIPE_SECRET_KEY`: Stripe secret key for the account.
- `STRIPE_ONE_TIME_PRICE_ID`: Stripe Price ID for the one-time credit-card payment.
- `SITE_URL`: Production site URL, for example `https://thelingolegacy.com`.

Optional subscription variable for the next phase:

- `STRIPE_SUBSCRIPTION_PRICE_ID`: Stripe Price ID for the subscription product.

After setting or changing environment variables in Vercel, redeploy the site so the function receives them.
