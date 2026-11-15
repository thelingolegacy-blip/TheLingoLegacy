const PHONE_RE = /^\+[1-9]\d{7,14}$/;
const BEACON_ZONES = new Set(['full-entity-simulcast','outer-crown-all','nyc-crown-zone','delaware-crown-zone','new-jersey-crown-zone']);
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 5;
const RUNTIME_VERSION = '5.0.0-studio-platform';
const RELEASE_GATES = Object.freeze({
  G00_SOURCE_AUTHORITY: 'PASS', G01_REPOSITORY: 'PASS', G02_RUNNER: 'FAIL / UNVERIFIED',
  G03_CI_EXECUTION: 'BLOCKED', G04_CERTIFICATION: 'BLOCKED', G05_RELEASE_CANDIDATE: 'BLOCKED',
  G06_DEPLOYMENT: 'BLOCKED', G07_LIVE_VALIDATION: 'BLOCKED', G08_SYNCHRONIZATION: 'BLOCKED',
  G09_ACTIVATION: 'BLOCKED', G10_POST_ACTIVATION: 'BLOCKED', G11_ACCEPTANCE: 'BLOCKED'
});
const PLATFORM_MODULES = Object.freeze([
  'flagship','loyalty-lane-world','designs-promotions','loyalty-lane-apparel','laundry-cycle',
  'lingoslots','thats-my-lingo','rewards','missions','xp-engine','universal-legacy-wallet',
  'lingo-id','asklingo','commerce','legacy-club','media','studio','docs','blog','contact','governance'
]);

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
  'content-security-policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests",
  'cross-origin-opener-policy': 'same-origin',
  'x-dns-prefetch-control': 'off',
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
async function createCheckout(request, env) {
  // Payment processing is deliberately unavailable during the no-billing launch phase.
  // Keep the endpoint fail-closed so stale clients cannot create a checkout session.
  return json({
    ok: false,
    code: 'BILLING_DISABLED',
    error: 'Checkout is disabled. No payments or purchases are accepted in this launch phase.',
  }, 410, request, env);
}

function normalizePhone(value = '') { return String(value).replace(/[\s().-]/g, '').trim(); }
function normalizeSource(value = '') { return String(value || 'beacon-alert-form').replace(/[^a-z0-9 _.-]/gi, '').slice(0, 80) || 'beacon-alert-form'; }
async function rateLimiterIdKey(key) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function isRateLimited(request, phone, env) {
  // Durable Object storage provides a shared, atomic fixed-window counter.
  // Fail closed when the required binding is missing or unavailable.
  if (!env.BEACON_RATE_LIMITER) return true;
  try {
    const ip = String(request.headers.get('cf-connecting-ip') || '').trim().slice(0, 64) || 'unknown';
    const id = env.BEACON_RATE_LIMITER.idFromName(await rateLimiterIdKey(`${ip}:${phone}`));
    const stub = env.BEACON_RATE_LIMITER.get(id);
    const response = await stub.fetch('https://rate-limiter.internal/check', { method: 'POST' });
    if (!response.ok) return true;
    const result = await response.json();
    return result.limited !== false;
  } catch {
    return true;
  }
}
function alertMessage(zone, source) { const zoneLabel = zone.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '); return `Lingo Legacy Beacon Alerts active for ${zoneLabel}. Source: ${source || 'web'}. Reply STOP to opt out.`; }

async function sendBeacon(payload, env) {
  // Outbound paid providers remain off unless separately approved after a cost plan.
  if (env.PAID_SERVICES_ENABLED !== 'true') return null;
  const webhookUrl = env.BEACON_ALERTS_WEBHOOK_URL;
  if (webhookUrl) {
    const secret = String(env.BEACON_ALERTS_WEBHOOK_SECRET || '').trim();
    // Phone-number data must never be sent to an unauthenticated webhook.
    if (!secret) throw new Error('BEACON_WEBHOOK_SECRET_REQUIRED');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` };
    const response = await fetch(webhookUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    return { provider: 'webhook' };
  }
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
  if (await isRateLimited(request, phone, env)) return json({ ok: false, error: 'Too many beacon alert requests. Try again later.' }, 429, request, env);
  const payload = { phone, zone, source, message: alertMessage(zone, source), consent: true, createdAt: new Date().toISOString() };
  const result = await sendBeacon(payload, env);
  if (!result) return json({ ok: true, staged: true, message: 'Beacon alert validated but no delivery provider is configured.' }, 202, request, env);
  return json({ ok: true, provider: result.provider, message: 'Beacon text alerts started.' }, 200, request, env);
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
    integrations: {
      stripe: false,
      beacon_webhook: env.PAID_SERVICES_ENABLED === 'true' && Boolean(env.BEACON_ALERTS_WEBHOOK_URL),
      twilio: env.PAID_SERVICES_ENABLED === 'true' && Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER),
      d1: Boolean(env.DB),
      kv: Boolean(env.STUDIO_KV),
      r2: Boolean(env.ASSET_BUCKET),
      firebase: Boolean(env.FIREBASE_PROJECT_ID),
    },
    safety: { real_money_gameplay: false, cash_out: false, harmful_bypass: false },
    billing: { mode: 'DISABLED', checkout: false, subscriptions: false, paid_game_credits: false, cash_out: false },
    realtime: { websocket: Boolean(env.REALTIME_ENABLED), status: env.REALTIME_ENABLED ? 'ENABLED' : 'READY' },
  };
}

function platformStatus(request, env) {
  const manifest = runtimeManifest(request, env);
  return {
    ...manifest,
    status: 'SERVING / RELEASE-LOCKED',
    platform_modules: PLATFORM_MODULES,
    control_planes: ['security','devops','data','safety','ai','commerce','games','rewards','studio','applications'],
    deployment_authority: 'github-cloudflare',
    retired_providers: ['vercel'],
    domain_authority: 'cloudflare',
    release_policy: 'fail-closed',
    production_mutation: 'FROZEN',
    lkg: 'PROTECTED',
    gates: RELEASE_GATES,
    authorization: { production_promotion: false, activation: false, real_money_gameplay: false, cash_out: false, billing: false },
    acceptance_predicate: 'P1..P9 all true required for G02 PASS',
    dynamic_contract: 'active',
  };
}

async function renderDynamicHtml(request, env, response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') || request.method !== 'GET') return response;
  const html = await response.text();
  const runtime = JSON.stringify({ version: RUNTIME_VERSION, canonical: String(env.CANONICAL_DOMAIN || 'thelingolegacy.com') }).replace(/</g, '\\u003c');
  const injection = `<meta name="lingo-runtime" content="${RUNTIME_VERSION}"><meta name="lingo-dynamic" content="true"><link rel="stylesheet" href="/assets/lingo-design-tokens.css"><link rel="stylesheet" href="/assets/studio-ui-runtime.css"><script defer src="/assets/studio-ui-runtime.js"></script><script>window.__LINGO_RUNTIME__=${runtime};</script>`;
  const rendered = html.includes('</head>') ? html.replace('</head>', `${injection}</head>`) : `${injection}${html}`;
  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store, must-revalidate');
  return new Response(rendered, { status: response.status, statusText: response.statusText, headers });
}



// Durable, atomic rate limiting for Beacon Alerts. One Durable Object instance
// is deterministically selected per SHA-256(IP + phone) key. Raw phone/IP values
// are never written to Durable Object storage or used as the object name.
export class BeaconRateLimiter {
  constructor(state) { this.state = state; }

  async fetch(request) {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const now = Date.now();
    const limited = await this.state.storage.transaction(async (txn) => {
      const bucket = await txn.get('bucket');
      if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
        await txn.put('bucket', { startedAt: now, count: 1 });
        return false;
      }
      if (bucket.count >= RATE_LIMIT) return true;
      await txn.put('bucket', { startedAt: bucket.startedAt, count: bucket.count + 1 });
      return false;
    });
    if (!limited) await this.state.storage.setAlarm(now + RATE_WINDOW_MS + 1000);
    return Response.json({ limited });
  }

  async alarm() {
    // Read and expire the bucket inside one transaction. A request racing the
    // alarm is therefore serialized: either it refreshes first and the alarm
    // keeps it, or the alarm deletes the expired bucket before the request
    // creates a new one. Never delete storage outside this transaction.
    const nextAlarm = await this.state.storage.transaction(async (txn) => {
      const bucket = await txn.get('bucket');
      if (!bucket) return null;
      const expiresAt = bucket.startedAt + RATE_WINDOW_MS;
      if (Date.now() >= expiresAt) {
        await txn.delete('bucket');
        return null;
      }
      return expiresAt + 1000;
    });
    if (nextAlarm !== null) await this.state.storage.setAlarm(nextAlarm);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (request.method === 'OPTIONS') return withSecurityHeaders(new Response(null, { status: 204 }), request, env);
      if (url.hostname === `www.${String(env.CANONICAL_DOMAIN || 'thelingolegacy.com').trim().toLowerCase()}`) {
        const canonical = new URL(request.url);
        canonical.hostname = String(env.CANONICAL_DOMAIN || 'thelingolegacy.com').trim().toLowerCase();
        return withSecurityHeaders(Response.redirect(canonical.toString(), 301), request, env);
      }
      if (url.pathname === '/healthz') return withSecurityHeaders(new Response('ok\n', { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } }), request, env);
      if (url.pathname === '/api/v1/runtime' || url.pathname === '/api/v1/platform/manifest') return json(runtimeManifest(request, env), 200, request, env);
      if (url.pathname === '/api/v1/platform/status') return json(platformStatus(request, env), 200, request, env);
      if (url.pathname === '/api/v1/platform/gates') return json({ ok: true, gates: RELEASE_GATES, fail_closed: true, mutation_freeze: true, lkg: 'PROTECTED', generated_at: new Date().toISOString() }, 200, request, env);
      if (url.pathname === '/api/v1/platform/modules') return json({ ok: true, modules: PLATFORM_MODULES, generated_at: new Date().toISOString() }, 200, request, env);
      if (url.pathname === '/api/v1/site/context') return json({ ok: true, runtime: RUNTIME_VERSION, domain: env.CANONICAL_DOMAIN || 'thelingolegacy.com', generated_at: new Date().toISOString(), navigation_mode: 'dynamic', feature_flags: { premium_studio: false, live_ops: false, ask_lingo: false, analytics: false, staging_preview: true } }, 200, request, env);
      if (url.pathname === '/api/create-checkout-session') return await createCheckout(request, env);
      if (url.pathname === '/api/beacon-text-alerts') return await beaconAlerts(request, env);
      if (url.pathname.startsWith('/api/')) return json({ ok: false, error: 'API route not found.' }, 404, request, env);
      const assetResponse = await env.ASSETS.fetch(request);
      return withSecurityHeaders(await renderDynamicHtml(request, env, assetResponse), request, env);
    } catch { return json({ ok: false, error: 'Request could not be completed right now.' }, 500, request, env); }
  },
};