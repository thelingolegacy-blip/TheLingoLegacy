/**
 * Production-candidate HTTP acceptance probes.
 *
 * Usage:
 *   BASE_URL=https://candidate.example node scripts/production-acceptance-probes.mjs
 *
 * This is a read-only GET probe. Point it at an isolated candidate, not production,
 * until the release owner explicitly approves live validation.
 */
const base = process.env.BASE_URL;
if (!base) {
  console.error('BASE_URL is required. Use an isolated deployment candidate.');
  process.exit(2);
}
let baseUrl;
try {
  baseUrl = new URL(base);
  if (!['http:', 'https:'].includes(baseUrl.protocol)) throw new Error('unsupported protocol');
} catch {
  console.error('BASE_URL must be a valid HTTP(S) URL.');
  process.exit(2);
}

// Fail closed against accidental live-production probing. Candidate validation
// must use a separately isolated hostname, not the production zone.
const hostname = baseUrl.hostname.toLowerCase().replace(/\.$/, '');
if (
  hostname === 'thelingolegacy.com' ||
  hostname.endsWith('.thelingolegacy.com') ||
  baseUrl.username ||
  baseUrl.password
) {
  console.error('BASE_URL must use an isolated candidate hostname and must not contain URL credentials.');
  process.exit(2);
}

const timeoutMs = Number(process.env.PROBE_TIMEOUT_MS || 10000);
const routes = [
  { path: '/', status: 200, type: /^text\/html\b/i, body: (text) => /<meta name="lingo-runtime"/i.test(text) && /<meta name="lingo-dynamic" content="true"/i.test(text) && /\/assets\/studio-ui-runtime\.js/i.test(text), cacheControl: /no-store/i },
  { path: '/healthz', status: 200, type: /^text\/plain\b/i, body: (text) => text.trim() === 'ok' },
  { path: '/sitemap.xml', status: 200, type: /^(application\/xml|text\/xml)\b/i },
  { path: '/robots.txt', status: 200, type: /^text\/plain\b/i },
  { path: '/assets/studio-ui-icons.svg', status: 200, type: /^image\/svg\+xml\b/i },
  { path: '/assets/lingo-design-tokens.css', status: 200, type: /^text\/css\b/i },
  { path: '/assets/studio-ui-runtime.css', status: 200, type: /^text\/css\b/i },
  { path: '/assets/studio-ui-runtime.js', status: 200, type: /^(text\/javascript|application\/javascript)\b/i },
  { path: '/api/v1/runtime', status: 200, type: /^application\/json\b/i, json: (value) => value?.ok === true && value?.dynamic === true },
  { path: '/api/v1/platform/gates', status: 200, type: /^application\/json\b/i, json: (value) => value?.ok === true && value?.fail_closed === true },
  { path: '/api/v1/platform/modules', status: 200, type: /^application\/json\b/i, json: (value) => value?.ok === true && Array.isArray(value?.modules) },
  { path: '/api/v1/platform/manifest', status: 200, type: /^application\/json\b/i, json: (value) => value?.ok === true },
  { path: '/api/v1/platform/status', status: 200, type: /^application\/json\b/i, json: (value) => value?.ok === true },
  { path: '/api/v1/site/context', status: 200, type: /^application\/json\b/i, json: (value) => value?.ok === true },
  { path: '/api/v1/__acceptance_missing_route__', status: 404, type: /^application\/json\b/i },
  { path: '/__lingo_acceptance_missing_route__', status: 404 },
  { path: '/.env.example', status: 404 },
  { path: '/.git/config', status: 404 },
  { path: '/wrangler.jsonc', status: 404 },
  { path: '/.github/workflows/', status: 404 },
  { path: '/scripts/', status: 404 },
];
const requiredHeaders = [
  'content-security-policy',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'strict-transport-security',
];
const results = [];
for (const route of routes) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    const response = await fetch(new URL(route.path, baseUrl), {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { accept: route.type?.source?.includes('json') ? 'application/json' : '*/*' },
    });
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}
    const checks = {
      status: response.status === route.status,
      contentType: !route.type || route.type.test(contentType),
      body: !route.body || route.body(text),
      json: !route.json || route.json(parsed),
      cacheControl: !route.cacheControl || route.cacheControl.test(response.headers.get('cache-control') || ''),
    };
    const headerMissing = requiredHeaders.filter((name) => !response.headers.get(name));
    const needsSecurityHeaders = route.path === '/' || route.path.startsWith('/api/');
    if (needsSecurityHeaders) checks.securityHeaders = headerMissing.length === 0;
    results.push({
      path: route.path,
      expectedStatus: route.status,
      actualStatus: response.status,
      contentType,
      checks,
      missingSecurityHeaders: needsSecurityHeaders ? headerMissing : [],
      latencyMs: Math.round(performance.now() - started),
      status: Object.values(checks).every(Boolean) ? 'PASS' : 'FAIL',
    });
  } catch (error) {
    results.push({
      path: route.path,
      expectedStatus: route.status,
      error: String(error?.message || error),
      latencyMs: Math.round(performance.now() - started),
      status: 'FAIL',
    });
  } finally {
    clearTimeout(timer);
  }
}
const report = {
  gate: 'production-candidate-http-acceptance',
  base: baseUrl.origin,
  timestamp: new Date().toISOString(),
  readOnly: true,
  status: results.every((item) => item.status === 'PASS') ? 'PASS' : 'FAIL',
  passed: results.filter((item) => item.status === 'PASS').length,
  total: results.length,
  results,
};
console.log(JSON.stringify(report, null, 2));
if (report.status !== 'PASS') process.exit(1);
