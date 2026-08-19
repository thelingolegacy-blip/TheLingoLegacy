const TIERS = {
  xp: {
    label: 'Digital XP Pack',
    priceEnv: 'STRIPE_PRICE_XP_PACK',
  },
  key: {
    label: 'Mystery Key Pack',
    priceEnv: 'STRIPE_PRICE_MYSTERY_KEY_PACK',
  },
  avalon: {
    label: 'Avalon House Badge Set',
    priceEnv: 'STRIPE_PRICE_AVALON_BADGE_SET',
  },
};

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function parseBody(req) {
  if (typeof req.body === 'object' && req.body !== null) return req.body;
  if (typeof req.body === 'string' && req.body.trim()) return JSON.parse(req.body);

  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const FALLBACK_ORIGIN = 'https://thelingolegacy.com';

function normalizeOrigin(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    return url.origin;
  } catch {
    return '';
  }
}

function originFromRequest(req) {
  const configuredOrigin = normalizeOrigin(process.env.PUBLIC_SITE_URL);
  if (configuredOrigin) return configuredOrigin;

  const host = String(req.headers.host || '').split(',')[0].trim();
  if (!host || /[\\/\s]/.test(host)) return FALLBACK_ORIGIN;

  const protocol = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim() === 'http' ? 'http' : 'https';
  return normalizeOrigin(`${protocol}://${host}`) || FALLBACK_ORIGIN;
}

function safeEmail(value = '') {
  const email = String(value).trim().slice(0, 160);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, {ok: false, error: 'Method not allowed'});
  }

  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return json(res, 503, {ok: false, error: 'Stripe checkout is not configured yet.'});
    }

    const body = await parseBody(req);
    const tierKey = String(body.tier || '').trim();
    const tier = TIERS[tierKey];
    if (!tier) {
      return json(res, 400, {ok: false, error: 'Unknown checkout tier.'});
    }

    const price = process.env[tier.priceEnv];
    if (!price) {
      return json(res, 503, {ok: false, error: `${tier.label} is not configured for checkout yet.`});
    }

    const origin = originFromRequest(req);
    const params = new URLSearchParams({
      mode: 'payment',
      success_url: `${origin}/drop/?checkout=success&tier=${encodeURIComponent(tierKey)}`,
      cancel_url: `${origin}/drop/?checkout=cancelled&tier=${encodeURIComponent(tierKey)}`,
      'line_items[0][price]': price,
      'line_items[0][quantity]': '1',
      'metadata[tier]': tierKey,
      'metadata[source]': 'lingo-legacy-drop',
      'payment_intent_data[metadata][tier]': tierKey,
    });

    const customerEmail = safeEmail(body.email);
    if (customerEmail) params.set('customer_email', customerEmail);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const result = await response.json();
    if (!response.ok) {
      return json(res, response.status, {ok: false, error: result.error?.message || 'Stripe checkout failed.'});
    }

    return json(res, 200, {ok: true, url: result.url});
  } catch (error) {
    return json(res, 500, {ok: false, error: 'Stripe checkout could not be started right now.'});
  }
};
