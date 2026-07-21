const Stripe = require('stripe');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const oneTimePriceId = process.env.STRIPE_ONE_TIME_PRICE_ID;
const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

function getBaseUrl(req) {
  const configuredUrl = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configuredUrl) {
    return configuredUrl.startsWith('http') ? configuredUrl : `https://${configuredUrl}`;
  }

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return `${protocol}://${host}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripeSecretKey || !oneTimePriceId) {
    return res.status(500).json({
      error: 'Payment configuration is missing. Set STRIPE_SECRET_KEY and STRIPE_ONE_TIME_PRICE_ID in Vercel.'
    });
  }

  try {
    const stripe = new Stripe(stripeSecretKey);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const mode = body.mode === 'subscription' ? 'subscription' : 'payment';
    const priceId = mode === 'subscription' ? subscriptionPriceId : oneTimePriceId;

    if (!priceId) {
      return res.status(500).json({ error: `Missing Stripe price for ${mode} checkout.` });
    }

    const baseUrl = getBaseUrl(req);
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${baseUrl}/payments/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payments/index.html?canceled=1`,
      metadata: {
        brand: 'The Lingo Legacy',
        source: 'website'
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session failed:', error);
    return res.status(500).json({ error: 'Unable to start checkout.' });
  }
};
