const RELEASE = "2026.11.08";
const SERVICE = "lingo-resilience-gateway";
const CANONICAL_DOMAIN = "thelingolegacy.com";

const SECURITY_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "x-robots-tag": "noindex, nofollow",
  "cross-origin-resource-policy": "same-origin"
};

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#09090d">
<meta name="robots" content="noindex,nofollow">
<title>LINGOlegacy | Resilience Gateway</title>
<style>
:root{color-scheme:dark;background:#09090d;color:#f8f5f0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at 50% 0,rgba(170,18,48,.28),transparent 42rem),#09090d}
main{width:min(760px,100%);padding:clamp(24px,5vw,48px);border:1px solid rgba(239,190,77,.3);border-radius:26px;background:rgba(17,16,22,.96);box-shadow:0 28px 90px #0009}
.eyebrow{color:#efbe4d;font-size:.75rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
h1{font-size:clamp(2.4rem,8vw,4.6rem);line-height:.98;letter-spacing:-.07em;margin:16px 0}
p{color:#c8c2ba;line-height:1.7}.state{display:flex;align-items:center;gap:10px;margin:26px 0;padding:14px 16px;border:1px solid #276b4d;border-radius:14px;background:#10271d;color:#b9f4d2;font-weight:700}
.dot{width:9px;height:9px;border-radius:50%;background:#5be29b;box-shadow:0 0 14px #5be29b}
.links{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}a{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:11px 17px;border-radius:999px;text-decoration:none;font-weight:800}.primary{background:#efbe4d;color:#17100a}.secondary{border:1px solid #51464a;color:#f8f5f0}
small{display:block;margin-top:28px;color:#8f8782}
</style>
</head>
<body><main>
<div class="eyebrow">Independent fallback · Edge gateway</div>
<h1>LINGO<span style="color:#efbe4d">legacy</span></h1>
<p>This standalone resilience endpoint is served independently from the primary LINGOlegacy site Worker. It is designed to preserve a dependable status surface and a clear return path while primary infrastructure is being repaired or verified.</p>
<div class="state"><span class="dot" aria-hidden="true"></span><span>Resilience gateway is responding</span></div>
<p>This page does not represent the health of every LINGO service, game, payment flow, or backend. Use the machine-readable checks below for this gateway's own status.</p>
<div class="links">
<a class="primary" href="https://thelingolegacy.com/">Open primary LINGOlegacy</a>
<a class="secondary" href="/healthz">Health check</a>
<a class="secondary" href="/readyz">Readiness check</a>
</div>
<small>Service: lingo-resilience-gateway · Release: 2026.11.08 · No payment processing or production data dependencies</small>
</main></body></html>`;

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow",
      ...headers
    }
  });
}

export async function handleRequest(request, env = {}) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();

  if (method !== "GET" && method !== "HEAD") {
    return json({ ok: false, service: SERVICE, error: "method_not_allowed" }, 405, { allow: "GET, HEAD" });
  }

  const common = {
    service: SERVICE,
    release: RELEASE,
    hostname: url.hostname,
    timestamp: new Date().toISOString(),
    isolation: "independent-worker",
    production_dependencies: []
  };

  if (path === "/healthz" || path === "/api/health") {
    return json({ ok: true, status: "healthy", ...common });
  }
  if (path === "/readyz" || path === "/api/ready") {
    return json({
      ok: true,
      status: "ready",
      checks: {
        worker_runtime: "pass",
        static_fallback_page: "pass",
        health_endpoint: "pass",
        readiness_endpoint: "pass",
        external_dependencies: "none"
      },
      ...common
    });
  }
  if (path === "/api/v1/status" || path === "/api/v1/manifest") {
    return json({
      ok: true,
      name: "LINGO Legacy Resilience Gateway",
      domain: env.CANONICAL_DOMAIN || CANONICAL_DOMAIN,
      release: RELEASE,
      service: SERVICE,
      endpoints: ["/", "/healthz", "/readyz", "/api/v1/status", "/api/v1/manifest"],
      dependencies: [],
      billing_enabled: false,
      production_route_mutation: false,
      ...common
    });
  }
  if (path === "/") {
    const headers = new Headers(SECURITY_HEADERS);
    headers.set("x-lingo-service", SERVICE);
    headers.set("x-lingo-release", RELEASE);
    return new Response(method === "HEAD" ? null : PAGE, { status: 200, headers });
  }
  return json({ ok: false, service: SERVICE, error: "not_found", path }, 404);
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  }
};
