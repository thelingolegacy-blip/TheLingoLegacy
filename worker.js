const CHECKOUT_TIERS = {
  xp: { label: 'Digital XP Pack', priceEnv: 'STRIPE_PRICE_XP_PACK' },
  key: { label: 'Mystery Key Pack', priceEnv: 'STRIPE_PRICE_MYSTERY_KEY_PACK' },
  avalon: { label: 'Avalon House Badge Set', priceEnv: 'STRIPE_PRICE_AVALON_BADGE_SET' },
};

const PHONE_RE = /^\+[1-9]\d{7,14}$/;
const BEACON_ZONES = new Set(['full-entity-simulcast','outer-crown-all','nyc-crown-zone','delaware-crown-zone','new-jersey-crown-zone']);
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 5;
// Bound per-isolate memory use. This is defense in depth, not a substitute for
// a shared Cloudflare rate-limit rule across Worker isolates.
const RATE_BUCKET_MAX = 10000;
const rateBuckets = new Map();
const RUNTIME_VERSION = '5.0.0-studio-platform';
const RELEASE_GATES = Object.freeze({
  G00_SOURCE_AUTHORITY: 'PASS', G01_REPOSITORY: 'PASS', G02_RUNNER: 'FAIL / UNVERIFIED',
  G03_CI_EXECUTION: 'BLOCKED', G04_CERTIFICATION: 'BLOCKED', G05_RELEASE_CANDIDATE: 'BLOCKED',
  G06_DEPLOYMENT: 'BLOCKED', G07_LIVE_VALIDATION: 'BLOCKED', G08_SYNCHRONIZATION: 'BLOCKED',
  G09_ACTIVATION: 'BLOCKED', G10_POST_ACTIVATION: 'BLOCKED', G11_ACCEPTANCE: 'BLOCKED'
});
const PLATFORM_MODULES = Object.freeze([
  'flagship','loyalty-lane-world','designs-promotions','loyalty-lane-apparel','laundry-cycle','studio-world-registry',
  'lingoslots','thats-my-lingo','asklingo-chat','lingo-assist','lingo-sisters','lingo-system','shields','nexus','vot-next','signal-dispatch','diagnostics','rewards','missions','xp-engine','universal-legacy-wallet',
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
function clientKey(request, phone) {
  // Cloudflare supplies this edge-derived address. Do not trust X-Forwarded-For:
  // clients can spoof it to rotate rate-limit keys.
  const ip = String(request.headers.get('cf-connecting-ip') || '').trim().slice(0, 64) || 'unknown';
  return `${ip}:${phone}`;
}
function isRateLimited(key) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (bucket && now - bucket.startedAt <= RATE_WINDOW_MS) {
    bucket.count += 1;
    return bucket.count > RATE_LIMIT;
  }

  // Expired keys are pruned only when needed. Never let attacker-controlled
  // unique keys grow this in-memory map without bound.
  if (rateBuckets.size >= RATE_BUCKET_MAX) {
    for (const [existingKey, existingBucket] of rateBuckets) {
      if (now - existingBucket.startedAt > RATE_WINDOW_MS) rateBuckets.delete(existingKey);
      if (rateBuckets.size < RATE_BUCKET_MAX) break;
    }
  }
  // Fail closed if the bounded local bucket is saturated.
  if (rateBuckets.size >= RATE_BUCKET_MAX) return true;
  rateBuckets.set(key, { startedAt: now, count: 1 });
  return false;
}
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
    observability: Boolean(env.OBSERVABILITY_ENABLED),
    integrations: {
      stripe: Boolean(env.STRIPE_SECRET_KEY),
      beacon_webhook: Boolean(env.BEACON_ALERTS_WEBHOOK_URL),
      twilio: Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER),
      d1: Boolean(env.DB),
      kv: Boolean(env.STUDIO_KV),
      r2: Boolean(env.ASSET_BUCKET),
      firebase: Boolean(env.FIREBASE_PROJECT_ID),
      studio_world_registry: Boolean(env.ASSETS),
      assistant_ai: Boolean(env.AI && env.ASKLINGO_AI_ENABLED === 'true' && env.ASKLINGO_MODEL),
      agent_catalog: true,
    },
    safety: { real_money_gameplay: false, cash_out: false, harmful_bypass: false },
    realtime: { websocket: Boolean(env.REALTIME_ENABLED), status: env.REALTIME_ENABLED ? 'ENABLED' : 'DISABLED' },
  };
}

const ASK_RATE_WINDOW_MS = 60 * 60 * 1000;
const ASK_RATE_LIMIT = 20;
const askRateBuckets = new Map();

function askRateAllowed(request) {
  const forwarded = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  const current = askRateBuckets.get(forwarded);
  if (!current || now - current.startedAt > ASK_RATE_WINDOW_MS) {
    if (askRateBuckets.size > 10000) askRateBuckets.clear();
    askRateBuckets.set(forwarded, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= ASK_RATE_LIMIT) return false;
  current.count += 1;
  return true;
}

function askFallback(message) {
  const text = message.toLowerCase();
  if (/\b(studio|world|entity|brand|portal|homepage|navigate|where|find)\b/.test(text)) {
    return "The LINGO universe is organized into independent worlds. Start at the flagship hub, then choose Arcade, Virtual Library, Music & Art Studio, Loyalty Lane Apparel, Loyalty Lane Designs, Loyalty Lane Cycle, or another registered world. Each destination shows whether it is a preview, local demo, planned, or independently verified.";
  }
  if (/\b(game|games|slot|arcade|play|payline)\b/.test(text)) {
    return "Games live inside LINGOarcade. That’s My Lingo is the signature five-reel experience, with separate 5×3 and 5×5 demo layouts. Demo coins are not cash, prizes, or transferable value. Production gameplay and wallet services remain behind release acceptance.";
  }
  if (/\b(book|story|script|movie|contract|award|library|event|publishing)\b/.test(text)) {
    return "The Virtual Library is the archive for books, scripts, contracts, awards, films, publishing work, and upcoming events. Each collection should retain its own permissions, metadata, and version history.";
  }
  if (/\b(music|audio|song|artist|canvas|art|design|creative)\b/.test(text)) {
    return "The Virtual Music Studio is the home for music, sound, and the creative Art Canvas partner. Original masters, project files, artwork, credits, and rights records should stay attached to each work.";
  }
  if (/\b(apparel|clothing|fashion|loyalty lane|laundry|cycle|promotion|campaign)\b/.test(text)) {
    return "Loyalty Lane has distinct operations: Apparel is the clothing brand; Designs manages promotions and campaigns; Cycle is the laundromat and community hub. They share the LINGO identity layer but keep separate catalogues, workflows, and reporting.";
  }
  if (/\b(account|login|sign.?up|wallet|coin|token|points|checkout|payment|buy|purchase)\b/.test(text)) {
    return "I can explain the account, rewards, and checkout structure, but I cannot access your private account or confirm a transaction here. Sign-in, wallet balances, coin purchases, and checkout stay disabled until their authenticated services and payment webhooks pass production acceptance.";
  }
  if (/\b(status|production|deploy|release|live|launch|runner|g02|pipeline)\b/.test(text)) {
    return "The public flagship site is serving, but full platform activation is separately gated. The current release policy requires verified source, CI execution, security, deployment, live validation, synchronization, and acceptance evidence. A preview or successful Vercel status alone does not satisfy the G02 release gate.";
  }
  if (/\b(kotton|kotton's code|puppy|character|storybook)\b/.test(text)) {
    return "Kotton’s Code is its own illustrated story world. It keeps a warmer cartoon and storybook art direction rather than inheriting the flagship’s crimson, white, smoke-gray enterprise system.";
  }
  return "I’m askLINGO, the L-shaped guide to the LINGO universe. I can help navigate the studios, explain products and release status, and point out which services are ready versus still gated. What part of the LINGO world are you working in?";
}

async function askLingoStatus(request, env) {
  return json({
    ok: true,
    assistant: 'askLINGO',
    interface: 'universal-l-dock',
    mode: env.ASKLINGO_AI_ENABLED === 'true' && env.AI ? 'ai-enabled' : 'guided-fallback',
    ai_ready: env.ASKLINGO_AI_ENABLED === 'true' && Boolean(env.AI),
    request_limit_per_hour: ASK_RATE_LIMIT,
    note: 'No account data is available to this public assistant.',
  }, 200, request, env);
}

async function askLingoChat(request, env) {
  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405, request, env);
  const origin = request.headers.get('Origin');
  if (origin && !allowedOrigins(env).has(origin.toLowerCase())) {
    return json({ ok: false, error: 'Origin not allowed.' }, 403, request, env);
  }
  if (!askRateAllowed(request)) return json({ ok: false, error: 'Rate limit reached. Try again later.' }, 429, request, env);
  const raw = await request.text();
  if (raw.length > 5000) return json({ ok: false, error: 'Message is too large.' }, 413, request, env);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ ok: false, error: 'Invalid request.' }, 400, request, env); }
  const message = String(body.message || '').trim().slice(0, 1200);
  if (!message) return json({ ok: false, error: 'Enter a message to continue.' }, 400, request, env);
  const correlationId = crypto.randomUUID();
  let reply;
  let mode = 'guided-fallback';
  if (env.ASKLINGO_AI_ENABLED === 'true' && env.AI && env.ASKLINGO_MODEL) {
    try {
      const response = await env.AI.run(String(env.ASKLINGO_MODEL), {
        messages: [
          { role: 'system', content: 'You are askLINGO, the concise and professional guide to The Lingo Legacy platform. Explain navigation, studio boundaries, product capabilities, and release states. Never claim a feature is live unless the provided platform context explicitly verifies it. Never claim account access, balances, payments, deployments, or store approval. Do not solicit secrets, passwords, payment details, or sensitive personal information. Demo coins are non-cash and non-transferable. Use direct, respectful language.' },
          { role: 'user', content: message },
        ],
        max_tokens: 350,
      });
      reply = String(response?.response || response?.result || '').trim();
      if (reply) mode = 'ai-enabled';
    } catch {
      reply = null;
    }
  }
  if (!reply) reply = askFallback(message);
  return json({ ok: true, assistant: 'askLINGO', mode, correlation_id: correlationId, reply }, 200, request, env);
}

const AGENT_CATALOG = Object.freeze([
  { id: 'LINGOassist', role: 'guided support and diagnostics', mode: 'guided-fallback', status: 'AVAILABLE', writes: false, requires: [] },
  { id: 'LINGOsisters', role: 'specialist studio, operations, media, and commerce assistants', mode: 'registry-only', status: 'PLANNED', writes: false, requires: ['agent-orchestration','permission-scopes','audit-store'] },
  { id: 'LINGOsystem', role: 'workflow orchestration and signal coordination', mode: 'control-plane-design', status: 'PLANNED', writes: false, requires: ['durable-workflows','queue','service-identity','approval-gates'] },
  { id: 'SHIELDS', role: 'security headers, origin checks, rate limits, and policy controls', mode: 'edge-guardrails', status: 'PARTIAL', writes: false, requires: ['centralized-rate-limits','security-events','incident-runbooks'] },
  { id: 'NEXUS', role: 'world registry, routing, and cross-surface contracts', mode: 'edge-registry', status: 'PREVIEW', writes: false, requires: ['world-acceptance','cross-platform-sync'] },
  { id: 'VOT-NEXT', role: 'release governance, evidence chain, and activation gates', mode: 'fail-closed-governance', status: 'ACTIVE-GUARDRAILS', writes: false, requires: ['G02-runner-evidence','independent-certification'] },
]);

function agentCatalog(request, env) {
  return json({
    ok: true,
    policy: 'Agents are informational until each tool, identity, write scope, budget, and approval gate is explicitly provisioned.',
    autonomous_execution: false,
    background_workers: false,
    agents: AGENT_CATALOG,
    generated_at: new Date().toISOString(),
  }, 200, request, env);
}

async function readStudioWorldRegistry(request, env) {
  if (!env.ASSETS) return null;
  const assetUrl = new URL('/studio-sites/assets/world-registry.json', request.url);
  const response = await env.ASSETS.fetch(new Request(assetUrl.toString(), {
    method: 'GET',
    headers: { accept: 'application/json' },
  }));
  if (!response.ok) return null;
  try { return await response.json(); } catch { return null; }
}

async function studioWorlds(request, env, worldId = null) {
  if (request.method !== 'GET') return json({ ok: false, error: 'Method not allowed' }, 405, request, env);
  const registry = await readStudioWorldRegistry(request, env);
  if (!registry || !Array.isArray(registry.worlds)) {
    return json({ ok: false, error: 'Studio world registry is not available from the current asset bundle.' }, 503, request, env);
  }
  if (worldId) {
    const world = registry.worlds.find(item => item.id === worldId);
    if (!world) return json({ ok: false, error: 'Studio world not found.' }, 404, request, env);
    return json({ ok: true, registry_version: registry.schemaVersion, world }, 200, request, env);
  }
  return json({
    ok: true,
    registry_version: registry.schemaVersion,
    principle: registry.contract?.principle || 'Distinct worlds; shared platform rails.',
    shared_services: registry.contract?.sharedServices || [],
    count: registry.worlds.length,
    worlds: registry.worlds,
  }, 200, request, env);
}

function platformStatus(request, env) {
  const manifest = runtimeManifest(request, env);
  return {
    ...manifest,
    status: 'SERVING / RELEASE-LOCKED',
    platform_modules: PLATFORM_MODULES,
    service_status: {
      identity: { configured: Boolean(env.FIREBASE_PROJECT_ID), production_verified: false },
      wallet: { mode: 'demo-only', real_value: false, transfers: false, cashout: false },
      coins: { mode: 'demo-only', purchasable: false, transferable: false, redeemable: false },
      checkout: { configured: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_XP_PACK), production_verified: false },
      rewards: { mode: 'demo-only', server_authoritative: false },
      assistant: { configured: Boolean(env.ASKLINGO_AI_ENABLED === 'true' && env.AI && env.ASKLINGO_MODEL), fallback: true },
      world_registry: { configured: Boolean(env.ASSETS), production_verified: false },
      telemetry: { configured: Boolean(env.OBSERVABILITY_ENABLED), logpush: Boolean(env.LOGPUSH_ENABLED) },
      realtime: { configured: Boolean(env.REALTIME_ENABLED) },
      data: { d1: Boolean(env.DB), kv: Boolean(env.STUDIO_KV), r2: Boolean(env.ASSET_BUCKET) },
    },
    control_planes: ['security','devops','data','safety','ai','commerce','games','rewards','studio','applications'],
    deployment_authority: 'github-cloudflare',
    retired_providers: ['vercel'],
    domain_authority: 'cloudflare',
    release_policy: 'fail-closed',
    production_mutation: 'FROZEN',
    lkg: 'PROTECTED',
    gates: RELEASE_GATES,
    authorization: { production_promotion: false, activation: false, real_money_gameplay: false, cash_out: false },
    acceptance_predicate: 'P1..P9 all true required for G02 PASS',
    dynamic_contract: 'active',
  };
}

async async function renderDynamicHtml(request, env, response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') || request.method !== 'GET') return response;
  const html = await response.text();
  const runtime = JSON.stringify({ version: RUNTIME_VERSION, canonical: String(env.CANONICAL_DOMAIN || 'thelingolegacy.com') }).replace(/</g, '\\u003c');
  const injection = `<meta name="lingo-runtime" content="${RUNTIME_VERSION}"><meta name="lingo-dynamic" content="true"><link rel="manifest" href="/studio-sites/manifest.webmanifest"><link rel="apple-touch-icon" href="/studio-sites/assets/lingo-app-icon.svg"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><link rel="stylesheet" href="/assets/lingo-design-tokens.css"><link rel="stylesheet" href="/assets/studio-ui-runtime.css"><link rel="stylesheet" href="/studio-sites/assets/asklingo-dock.css"><script defer src="/assets/studio-ui-runtime.js"></script><script defer src="/studio-sites/assets/asklingo-dock.js"></script><script defer src="/studio-sites/pwa-register.js"></script><script defer src="/studio-sites/assets/tv-navigation.js"></script><script>window.__LINGO_RUNTIME__=${runtime};</script>`;
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
      if (url.hostname === `www.${String(env.CANONICAL_DOMAIN || 'thelingolegacy.com').trim().toLowerCase()}`) {
        const canonical = new URL(request.url);
        canonical.hostname = String(env.CANONICAL_DOMAIN || 'thelingolegacy.com').trim().toLowerCase();
        return withSecurityHeaders(Response.redirect(canonical.toString(), 301), request, env);
      }
      if (url.pathname === '/healthz') return withSecurityHeaders(new Response('ok\n', { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } }), request, env);
      if (url.pathname === '/api/v1/runtime' || url.pathname === '/api/v1/platform/manifest') return json(runtimeManifest(request, env), 200, request, env);
      if (url.pathname === '/api/v1/agents/catalog' && request.method === 'GET') return agentCatalog(request, env);
      if (url.pathname === '/api/v1/asklingo/status') return await askLingoStatus(request, env);
      if (url.pathname === '/api/v1/asklingo/chat') return await askLingoChat(request, env);
      if (url.pathname === '/api/v1/studios/worlds') return await studioWorlds(request, env);
      const studioWorldMatch = url.pathname.match(/^\/api\/v1\/studios\/worlds\/([a-z0-9-]+)$/);
      if (studioWorldMatch) return await studioWorlds(request, env, studioWorldMatch[1]);
      if (url.pathname === '/api/v1/platform/status') return json(platformStatus(request, env), 200, request, env);
      if (url.pathname === '/api/v1/platform/gates') return json({ ok: true, gates: RELEASE_GATES, fail_closed: true, mutation_freeze: true, lkg: 'PROTECTED', generated_at: new Date().toISOString() }, 200, request, env);
      if (url.pathname === '/api/v1/platform/modules') return json({ ok: true, modules: PLATFORM_MODULES, generated_at: new Date().toISOString() }, 200, request, env);
      if (url.pathname === '/api/v1/site/context') return json({ ok: true, runtime: RUNTIME_VERSION, domain: env.CANONICAL_DOMAIN || 'thelingolegacy.com', generated_at: new Date().toISOString(), navigation_mode: 'dynamic', feature_flags: { premium_studio: true, live_ops: true, ask_lingo: true, analytics: true } }, 200, request, env);
      if (url.pathname === '/api/create-checkout-session') return await createCheckout(request, env);
      if (url.pathname === '/api/beacon-text-alerts') return await beaconAlerts(request, env);
      if (url.pathname.startsWith('/api/')) return json({ ok: false, error: 'API route not found.' }, 404, request, env);
      const assetResponse = await env.ASSETS.fetch(request);
      return withSecurityHeaders(await renderDynamicHtml(request, env, assetResponse), request, env);
    } catch { return json({ ok: false, error: 'Request could not be completed right now.' }, 500, request, env); }
  },
};