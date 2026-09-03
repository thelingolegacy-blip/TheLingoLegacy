const CHECKOUT_TIERS = {
  xp: { label: 'Digital XP Pack', priceEnv: 'STRIPE_PRICE_XP_PACK' },
  key: { label: 'Mystery Key Pack', priceEnv: 'STRIPE_PRICE_MYSTERY_KEY_PACK' },
  avalon: { label: 'Avalon House Badge Set', priceEnv: 'STRIPE_PRICE_AVALON_BADGE_SET' },
};

const PHONE_RE = /^\+[1-9]\d{7,14}$/;
const BEACON_ZONES = new Set([
  'full-entity-simulcast',
  'outer-crown-all',
  'nyc-crown-zone',
  'delaware-crown-zone',
  'new-jersey-crown-zone',
]);
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 5;
const rateBuckets = new Map();

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'SAMEORIGIN',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
};

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function json(body, status = 200) {
  return withSecurityHeaders(new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  }));
}

function requestOrigin(request) {
  const url = new URL(request.url);
  return url.origin;
}

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function safeEmail(value = '') {
  const email = String(value).trim().slice(0, 160);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

async function createCheckout(request, env) {
  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  const secret = env.STRIPE_SECRET_KEY;
  if (!secret) return json({ ok: false, error: 'Stripe checkout is not configured yet.' }, 503);

  const body = await parseJson(request);
  const tierKey = String(body.tier || '').trim();
  const tier = CHECKOUT_TIERS[tierKey];
  if (!tier) return json({ ok: false, error: 'Unknown checkout tier.' }, 400);

  const price = env[tier.priceEnv];
  if (!price) return json({ ok: false, error: `${tier.label} is not configured for checkout yet.` }, 503);

  const origin = env.PUBLIC_SITE_URL || requestOrigin(request);
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
  if (!response.ok) return json({ ok: false, error: result.error?.message || 'Stripe checkout failed.' }, response.status);
  return json({ ok: true, url: result.url });
}

function normalizePhone(value = '') {
  return String(value).replace(/[\s().-]/g, '').trim();
}

function normalizeSource(value = '') {
  return String(value || 'beacon-alert-form').replace(/[^a-z0-9 _.-]/gi, '').slice(0, 80) || 'beacon-alert-form';
}

function clientKey(request, phone) {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0].trim() || 'unknown';
  return `${ip}:${phone}`;
}

function isRateLimited(key) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt > RATE_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

function alertMessage(zone, source) {
  const zoneLabel = zone.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  return `Lingo Legacy Beacon Alerts active for ${zoneLabel}. Source: ${source || 'web'}. Reply STOP to opt out.`;
}

async function sendBeacon(payload, env) {
  const webhookUrl = env.BEACON_ALERTS_WEBHOOK_URL;
  if (webhookUrl) {
    const headers = { 'Content-Type': 'application/json' };
    if (env.BEACON_ALERTS_WEBHOOK_SECRET) headers.Authorization = `Bearer ${env.BEACON_ALERTS_WEBHOOK_SECRET}`;
    const response = await fetch(webhookUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    return { provider: 'webhook' };
  }

  const sid = env.TWILIO_ACCOUNT_SID;
  const token = env.TWILIO_AUTH_TOKEN;
  const from = env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return null;

  const body = new URLSearchParams({ To: payload.phone, From: from, Body: payload.message });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!response.ok) throw new Error(`Twilio returned ${response.status}`);
  return { provider: 'twilio' };
}

async function beaconAlerts(request, env) {
  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  const body = await parseJson(request);
  const phone = normalizePhone(body.phone);
  const zone = String(body.zone || '').trim();
  const source = normalizeSource(body.source);
  const consent = body.consent === true || body.consent === 'true' || body.consent === 'on';

  if (!PHONE_RE.test(phone)) return json({ ok: false, error: 'Enter a phone number in E.164 format.' }, 400);
  if (!BEACON_ZONES.has(zone)) return json({ ok: false, error: 'Unknown beacon alert zone.' }, 400);
  if (!consent) return json({ ok: false, error: 'Consent is required before starting text alerts.' }, 400);
  if (isRateLimited(clientKey(request, phone))) return json({ ok: false, error: 'Too many beacon alert requests. Try again later.' }, 429);

  const payload = {
    phone,
    zone,
    source,
    message: alertMessage(zone, source),
    consent: true,
    createdAt: new Date().toISOString(),
  };

  const result = await sendBeacon(payload, env);
  if (!result) return json({ ok: true, staged: true, message: 'Beacon alert validated but no delivery provider is configured.' }, 202);
  return json({ ok: true, provider: result.provider, message: 'Beacon text alerts started.' });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === '/healthz') {
        return withSecurityHeaders(new Response('ok\n', {
          status: 200,
          headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
        }));
      }

      if (url.pathname === '/api/create-checkout-session') return await createCheckout(request, env);
      if (url.pathname === '/api/beacon-text-alerts') return await beaconAlerts(request, env);
      if (url.pathname.startsWith('/api/')) return json({ ok: false, error: 'API route not found.' }, 404);

      return withSecurityHeaders(await env.ASSETS.fetch(request));
    } catch {
      return json({ ok: false, error: 'Request could not be completed right now.' }, 500);
    }
  },
};
