const CHECKOUT_TIERS = {
  xp: { label: 'Digital XP Pack', priceEnv: 'STRIPE_PRICE_XP_PACK' },
  key: { label: 'Mystery Key Pack', priceEnv: 'STRIPE_PRICE_MYSTERY_KEY_PACK' },
  avalon: { label: 'Avalon House Badge Set', priceEnv: 'STRIPE_PRICE_AVALON_BADGE_SET' },
};

const PHONE_RE = /^\+[1-9]\d{7,14}$/;
const BEACON_ZONES = new Set(['full-entity-simulcast','outer-crown-all','nyc-crown-zone','delaware-crown-zone','new-jersey-crown-zone']);
const ROUTE_ALIASES = new Map([
  ['/theater/', '/master-interface/'],
  ['/library/', '/studio-assets/'],
  ['/games/', '/thats-my-lingo/'],
  ['/loyalty-cycles/', '/loyalty-lane-cycles/'],
  ['/ask-lingo/', '/lingo-ai/'],
  ['/loyalty-lane/', '/loyalty-lane-apparel/'],
  ['/shop/', '/loyalty-lane-apparel/'],
  ['/coming-soon/', '/universe/'],
]);
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 5;
const rateBuckets = new Map();
const RUNTIME_VERSION = '4.1.0-dynamic-master-hub';

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'SAMEORIGIN',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
};

function canonicalOrigin(env) {
  const domain = String(env.CANONICAL_DOMAIN || 'thelingolegacy.com').trim().toLowerCase();
  return `https://${domain}`;
}

function allowedOrigins(env) {
  const domain = String(env.CANONICAL_DOMAIN || 'thelingolegacy.com').trim().toLowerCase();
  return new Set([`https://${domain}`, `https://www.${domain}`]);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const headers = {};
  if (origin && allowedOrigins(env).has(origin.toLowerCase())) {
    headers['access-control-allow-origin'] = origin;
    headers['access-control-allow-methods'] = 'GET,POST,OPTIONS';
    headers['access-control-allow-headers'] = 'Content-Type, Authorization';
    headers['access-control-max-age'] = '86400';
    headers['vary'] = 'Origin';
  }
  return headers;
}

function withSecurityHeaders(response, request, env) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  for (const [name, value] of Object.entries(corsHeaders(request, env))) headers.set(name, value);
  headers.set('x-lingo-runtime', RUNTIME_VERSION);
  headers.set('x-lingo-dynamic', 'true');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function json(body, status = 200, request, env) {
  return withSecurityHeaders(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }), request, env);
}

function requestOrigin(request) { return new URL(request.url).origin; }
async function parseJson(request) { try { return await request.json(); } catch { return {}; } }
function safeEmail(value = '') { const email = String(value).trim().slice(0, 160); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''; }

async function createCheckout(request, env) {
  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405, request, env);
  const secret = env.STRIPE_SECRET_KEY;
  if (!secret) return json({ ok: false, error: 'Stripe checkout is not configured yet.' }, 503, request, env);
  const body = await parseJson(request);
  const tierKey = String(body.tier || '').trim();
  const tier = CHECKOUT_TIERS[tierKey];
  if (!tier) return json({ ok: false, error: 'Unknown checkout tier.' }, 400, request, env);
  const price = env[tier.priceEnv];
  if (!price) return json({ ok: false, error: `${tier.label} is not configured for checkout yet.` }, 503, request, env);
  const origin = canonicalOrigin(env) || env.PUBLIC_SITE_URL || requestOrigin(request);
  const params = new URLSearchParams({ mode: 'payment', success_url: `${origin}/drop/?checkout=success&tier=${encodeURIComponent(tierKey)}`, cancel_url: `${origin}/drop/?checkout=cancelled&tier=${encodeURIComponent(tierKey)}`, 'line_items[0][price]': price, 'line_items[0][quantity]': '1', 'metadata[tier]': tierKey, 'metadata[source]': 'lingo-legacy-drop', 'payment_intent_data[metadata][tier]': tierKey });
  const customerEmail = safeEmail(body.email);
  if (customerEmail) params.set('customer_email', customerEmail);
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params });
  const result = await response.json();
  if (!response.ok) return json({ ok: false, error: result.error?.message || 'Stripe checkout failed.' }, response.status, request, env);
  return json({ ok: true, url: result.url }, 200, request, env);
}

function normalizePhone(value = '') { return String(value).replace(/[\s().-]/g, '').trim(); }
function normalizeSource(value = '') { return String(value || 'beacon-alert-form').replace(/[^a-z0-9 _.-]/gi, '').slice(0, 80) || 'beacon-alert-form'; }
function clientKey(request, phone) { const forwarded = request.headers.get('x-forwarded-for') || ''; const ip = forwarded.split(',')[0].trim() || 'unknown'; return `${ip}:${phone}`; }
function isRateLimited(key) { const now = Date.now(); const bucket = rateBuckets.get(key); if (!bucket || now - bucket.startedAt > RATE_WINDOW_MS) { rateBuckets.set(key, { startedAt: now, count: 1 }); return false; } bucket.count += 1; return bucket.count > RATE_LIMIT; }
function alertMessage(zone, source) { const zoneLabel = zone.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '); return `Lingo Legacy Beacon Alerts active for ${zoneLabel}. Source: ${source || 'web'}. Reply STOP to opt out.`; }

async function sendBeacon(payload, env) {
  const webhookUrl = env.BEACON_ALERTS_WEBHOOK_URL;
  if (webhookUrl) { const headers = { 'Content-Type': 'application/json' }; if (env.BEACON_ALERTS_WEBHOOK_SECRET) headers.Authorization = `Bearer ${env.BEACON_ALERTS_WEBHOOK_SECRET}`; const response = await fetch(webhookUrl, { method: 'POST', headers, body: JSON.stringify(payload) }); if (!response.ok) throw new Error(`Webhook returned ${response.status}`); return { provider: 'webhook' }; }
  const sid = env.TWILIO_ACCOUNT_SID; const token = env.TWILIO_AUTH_TOKEN; const from = env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return null;
  const body = new URLSearchParams({ To: payload.phone, From: from, Body: payload.message });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, { method: 'POST', headers: { Authorization: `Basic ${btoa(`${sid}:${token}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) throw new Error(`Twilio returned ${response.status}`);
  return { provider: 'twilio' };
}

async function beaconAlerts(request, env) {
  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405, request, env);
  const body = await parseJson(request); const phone = normalizePhone(body.phone); const zone = String(body.zone || '').trim(); const source = normalizeSource(body.source); const consent = body.consent === true || body.consent === 'true' || body.consent === 'on';
  if (!PHONE_RE.test(phone)) return json({ ok: false, error: 'Enter a phone number in E.164 format.' }, 400, request, env);
  if (!BEACON_ZONES.has(zone)) return json({ ok: false, error: 'Unknown beacon alert zone.' }, 400, request, env);
  if (!consent) return json({ ok: false, error: 'Consent is required before starting text alerts.' }, 400, request, env);
  if (isRateLimited(clientKey(request, phone))) return json({ ok: false, error: 'Too many beacon alert requests. Try again later.' }, 429, request, env);
  const payload = { phone, zone, source, message: alertMessage(zone, source), consent: true, createdAt: new Date().toISOString() };
  const result = await sendBeacon(payload, env);
  if (!result) return json({ ok: true, staged: true, message: 'Beacon alert validated but no delivery provider is configured.' }, 202, request, env);
  return json({ ok: true, provider: result.provider, message: 'Beacon text alerts started.' }, 200, request, env);
}

async function platformRoutes(request, env) {
  const source = await env.ASSETS.fetch(new Request(new URL('/sitemap.xml', request.url), request));
  if (!source.ok) return json({ ok: false, error: 'Route registry unavailable.' }, 503, request, env);
  const xml = await source.text();
  const routes = [...xml.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((match) => match[1] || '/');
  const unique = [...new Set(routes.map((path) => path || '/'))];
  return json({ ok: true, dynamic: true, generated_at: new Date().toISOString(), source: '/sitemap.xml', count: unique.length, aliases: Object.fromEntries(ROUTE_ALIASES), routes: unique }, 200, request, env);
}

function runtimeManifest(request, env) {
  const url = new URL(request.url);
  return {
    ok: true,
    runtime: 'cloudflare-worker',
    version: RUNTIME_VERSION,
    hostname: url.hostname,
    canonical_domain: String(env.CANONICAL_DOMAIN || ''),
    timestamp: new Date().toISOString(),
    dynamic: true,
    api: true,
    edge_rendering: true,
    assets: 'worker-controlled',
    observability: true,
    navigation: { mode: 'dynamic', registry: '/api/v1/platform/routes', homepage: '/', master_interface: '/master-interface/' },
    integrations: {
      stripe: Boolean(env.STRIPE_SECRET_KEY),
      beacon_webhook: Boolean(env.BEACON_ALERTS_WEBHOOK_URL),
      twilio: Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER),
      d1: Boolean(env.DB),
      kv: Boolean(env.STUDIO_KV),
      r2: Boolean(env.ASSET_BUCKET),
      firebase: Boolean(env.FIREBASE_PROJECT_ID),
    },
    safety: { real_money_gameplay: false, cash_out: false, harmful_bypass: false },
    realtime: { websocket: Boolean(env.REALTIME_ENABLED), status: env.REALTIME_ENABLED ? 'ENABLED' : 'READY' },
  };
}

function platformStatus(request, env) {
  const manifest = runtimeManifest(request, env);
  return {
    ...manifest,
    status: 'OPERATIONAL',
    control_planes: ['security', 'devops', 'data', 'safety', 'parent', 'ai', 'applications'],
    deployment_authority: 'github-cloudflare',
    retired_providers: ['vercel'],
    domain_authority: 'cloudflare',
    release_policy: 'fail-closed',
    dynamic_contract: 'active',
  };
}

function resolveAssetPath(pathname) {
  if (pathname === '/') return '/master-interface/';
  return ROUTE_ALIASES.get(pathname) || pathname;
}

async function renderDynamicHtml(request, env, response, sourcePath = null) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') || request.method !== 'GET') return response;
  let html = await response.text();
  const aliasPath = new URL(request.url).pathname;
  const canonicalPath = sourcePath || aliasPath;
  html = html
    .replaceAll('Static Vercel page', 'Cloudflare Edge dynamic runtime')
    .replaceAll('built for Vercel preview deployment', 'built for the live Cloudflare edge runtime')
    .replaceAll('while staying static', 'through the live edge runtime')
    .replaceAll('static, entertainment-only', 'dynamic, entertainment-only');
  if (canonicalPath !== aliasPath) {
    html = html.replace(/<link rel="canonical" href="[^"]+"\s*\/>/i, `<link rel="canonical" href="${canonicalOrigin(env)}${aliasPath}" />`);
  }
  const runtime = JSON.stringify({ version: RUNTIME_VERSION, canonical: String(env.CANONICAL_DOMAIN || 'thelingolegacy.com'), path: aliasPath, source_path: canonicalPath, dynamic: true, route_registry: '/api/v1/platform/routes' }).replace(/</g, '\\u003c');
  const injection = `<meta name="lingo-runtime" content="${RUNTIME_VERSION}"><meta name="lingo-dynamic" content="true"><script>window.__LINGO_RUNTIME__=${runtime};fetch('/api/v1/platform/routes',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(v=>{if(v){window.__LINGO_ROUTES__=v.routes;document.documentElement.dataset.lingoRoutes=String(v.count)}}).catch(()=>{});</script>`;
  const rendered = html.includes('</head>') ? html.replace('</head>', `${injection}</head>`) : `${injection}${html}`;
  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store, must-revalidate');
  return new Response(rendered, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (request.method === 'OPTIONS') return withSecurityHeaders(new Response(null, { status: 204 }), request, env);
      if (url.pathname === '/healthz') return withSecurityHeaders(new Response('ok\n', { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } }), request, env);
      if (url.pathname === '/api/v1/runtime' || url.pathname === '/api/v1/platform/manifest') return json(runtimeManifest(request, env), 200, request, env);
      if (url.pathname === '/api/v1/platform/status') return json(platformStatus(request, env), 200, request, env);
      if (url.pathname === '/api/v1/platform/routes') return await platformRoutes(request, env);
      if (url.pathname === '/api/v1/site/context') return json({ ok: true, runtime: RUNTIME_VERSION, domain: env.CANONICAL_DOMAIN || 'thelingolegacy.com', generated_at: new Date().toISOString(), navigation_mode: 'dynamic', route_registry: '/api/v1/platform/routes', feature_flags: { premium_studio: true, live_ops: true, ask_lingo: true, analytics: true } }, 200, request, env);
      if (url.pathname === '/api/create-checkout-session') return await createCheckout(request, env);
      if (url.pathname === '/api/beacon-text-alerts') return await beaconAlerts(request, env);
      if (url.pathname.startsWith('/api/')) return json({ ok: false, error: 'API route not found.' }, 404, request, env);
      const assetPath = resolveAssetPath(url.pathname);
      const assetUrl = new URL(assetPath, request.url);
      const assetRequest = new Request(assetUrl.toString(), request);
      const assetResponse = await env.ASSETS.fetch(assetRequest);
      return withSecurityHeaders(await renderDynamicHtml(request, env, assetResponse, assetPath), request, env);
    } catch { return json({ ok: false, error: 'Request could not be completed right now.' }, 500, request, env); }
  },
};
