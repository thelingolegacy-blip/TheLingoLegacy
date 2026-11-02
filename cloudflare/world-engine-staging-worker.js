const ALLOWED_ORIGINS = new Set([
  "https://thelingolegacy.com",
  "https://www.thelingolegacy.com",
  "https://hub.thelingolegacy.com",
  "https://app.thelingolegacy.com"
]);
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };

function response(body, status = 200, origin = "") {
  const headers = new Headers(JSON_HEADERS);
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "Origin");
  }
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "no-referrer");
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      if (!ALLOWED_ORIGINS.has(origin)) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": origin,
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "600",
          "vary": "Origin"
        }
      });
    }
    if (request.method !== "GET") return response({ error: "method_not_allowed" }, 405, origin);
    if (url.pathname === "/healthz") {
      try {
        const row = await env.WORLD_ENGINE_DB.prepare("SELECT COUNT(*) AS count FROM worlds").first();
        return response({
          status: "ok",
          service: "lingo-world-engine-staging",
          schema: "world-engine-v1",
          database: "reachable",
          worldCount: Number(row?.count || 0),
          cacheBinding: Boolean(env.WORLD_REGISTRY_KV)
        }, 200, origin);
      } catch {
        return response({ status: "degraded", service: "lingo-world-engine-staging", database: "unavailable" }, 503, origin);
      }
    }
    if (url.pathname === "/api/v1/worlds") {
      const cacheKey = "public-world-registry:v1";
      try {
        const cached = await env.WORLD_REGISTRY_KV.get(cacheKey);
        if (cached) return response(JSON.parse(cached), 200, origin);
        const result = await env.WORLD_ENGINE_DB.prepare(
          "SELECT world_id, slug, display_name, owner_product_id, engine_id, lifecycle_state, asset_namespace, registry_version FROM worlds WHERE lifecycle_state = 'published' ORDER BY display_name"
        ).all();
        const payload = { schema: "world-registry-v1", worlds: result.results || [], count: (result.results || []).length };
        await env.WORLD_REGISTRY_KV.put(cacheKey, JSON.stringify(payload), { expirationTtl: 60 });
        return response(payload, 200, origin);
      } catch {
        return response({ error: "registry_unavailable", worlds: [] }, 503, origin);
      }
    }
    return response({ error: "not_found" }, 404, origin);
  }
};
