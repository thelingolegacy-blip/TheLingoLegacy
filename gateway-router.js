// Cloudflare API Gateway for sub-domain routing and unified authentication
// Add to worker.js

const SUB_DOMAIN_ROUTES = {
  'api': { prefix: '/api/', description: 'Unified REST API' },
  'auth': { prefix: '/auth/', description: 'Authentication & identity service' },
  'casino': { prefix: '/casino/', description: 'Casino game service' },
  'rewards': { prefix: '/rewards/', description: 'Rewards & loyalty service' },
  'content': { prefix: '/content/', description: 'Content delivery service' },
};

const DOMAIN_ROUTING = {
  'api.thelingolegacy.com': 'api',
  'auth.thelingolegacy.com': 'auth',
  'casino.thelingolegacy.com': 'casino',
  'rewards.thelingolegacy.com': 'rewards',
  'content.thelingolegacy.com': 'content',
  'thelingolegacy.com': 'main',
  'www.thelingolegacy.com': 'main',
};

// JWT Token validation for sub-domain requests
function validateAuthToken(request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) return { valid: false, error: 'No authorization token' };

  // Basic validation structure (replace with real JWT validation)
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, error: 'Invalid token format' };
    return { valid: true, token };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Route requests to appropriate sub-domain handler
async function routeSubDomain(request, env) {
  const url = new URL(request.url);
  const subdomain = DOMAIN_ROUTING[url.hostname] || 'main';

  // CORS headers for sub-domain requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': `https://*.thelingolegacy.com`,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
  };

  if (request.method === 'OPTIONS') {
    return withSecurityHeaders(new Response(null, { status: 204, headers: corsHeaders }), request, env);
  }

  // API requests require authentication
  if (subdomain !== 'main' && !url.pathname.startsWith('/health')) {
    const auth = validateAuthToken(request);
    if (!auth.valid) {
      return json({ ok: false, error: auth.error }, 401, request, env);
    }
  }

  // Route to appropriate service
  switch (subdomain) {
    case 'api':
      return handleAPIService(request, env, url, corsHeaders);
    case 'auth':
      return handleAuthService(request, env, url, corsHeaders);
    case 'casino':
      return handleCasinoService(request, env, url, corsHeaders);
    case 'rewards':
      return handleRewardsService(request, env, url, corsHeaders);
    case 'content':
      return handleContentService(request, env, url, corsHeaders);
    default:
      return withSecurityHeaders(await env.ASSETS.fetch(request), request, env);
  }
}

async function handleAPIService(request, env, url, corsHeaders) {
  // Unified REST API gateway
  const path = url.pathname;

  if (path === '/health') {
    return json({ ok: true, service: 'api', status: 'healthy' }, 200, request, env);
  }

  if (path.startsWith('/v1/')) {
    // Route to appropriate versioned endpoint
    return json({ ok: true, message: 'API endpoint active', version: 'v1' }, 200, request, env);
  }

  return json({ ok: false, error: 'API endpoint not found' }, 404, request, env);
}

async function handleAuthService(request, env, url, corsHeaders) {
  // Identity & authentication service
  const path = url.pathname;

  if (path === '/health') {
    return json({ ok: true, service: 'auth', status: 'healthy' }, 200, request, env);
  }

  if (path === '/verify' && request.method === 'POST') {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    return json({ ok: true, verified: Boolean(token) }, 200, request, env);
  }

  if (path === '/login' && request.method === 'POST') {
    const body = await parseJson(request);
    // Implement actual login logic with Firebase Auth
    return json({ ok: true, message: 'Login endpoint active', token: 'placeholder' }, 200, request, env);
  }

  return json({ ok: false, error: 'Auth endpoint not found' }, 404, request, env);
}

async function handleCasinoService(request, env, url, corsHeaders) {
  // Casino game service
  const path = url.pathname;

  if (path === '/health') {
    return json({ ok: true, service: 'casino', status: 'healthy' }, 200, request, env);
  }

  if (path === '/game/status') {
    return json({ ok: true, game: 'casino', running: true }, 200, request, env);
  }

  return json({ ok: false, error: 'Casino endpoint not found' }, 404, request, env);
}

async function handleRewardsService(request, env, url, corsHeaders) {
  // Rewards & loyalty service
  const path = url.pathname;

  if (path === '/health') {
    return json({ ok: true, service: 'rewards', status: 'healthy' }, 200, request, env);
  }

  if (path.startsWith('/user/')) {
    return json({ ok: true, message: 'User rewards endpoint active' }, 200, request, env);
  }

  return json({ ok: false, error: 'Rewards endpoint not found' }, 404, request, env);
}

async function handleContentService(request, env, url, corsHeaders) {
  // Content delivery service
  const path = url.pathname;

  if (path === '/health') {
    return json({ ok: true, service: 'content', status: 'healthy' }, 200, request, env);
  }

  if (path.startsWith('/assets/')) {
    return withSecurityHeaders(await env.ASSETS.fetch(request), request, env);
  }

  return json({ ok: false, error: 'Content endpoint not found' }, 404, request, env);
}

export { routeSubDomain, validateAuthToken };
