const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY"
};

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders }
  });
}

const unavailable = (capability) => json({
  ok: false,
  code: "INTEGRATION_NOT_CONFIGURED",
  capability,
  status: "NOT_CONFIGURED",
  message: "This isolated preview has no verified provider binding. No operation was performed."
}, 503);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/v1/avalon/status") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405, { allow: "GET, HEAD" });
      }
      const body = {
        ok: true,
        environment: "isolated-preview",
        releaseGate: "PROTECTED_HOLD",
        authentication: "NOT_CONFIGURED",
        integrations: {
          assistant: "NOT_CONFIGURED",
          email: "NOT_CONFIGURED",
          dns: "NOT_CONFIGURED",
          identity: "DEMO_ONLY",
          grantLedger: "NOT_CONFIGURED",
          eventRegistration: "NOT_CONFIGURED"
        },
        productionMutation: false
      };
      return request.method === "HEAD"
        ? new Response(null, { status: 200, headers: JSON_HEADERS })
        : json(body);
    }

    if (path === "/api/v1/avalon/assistant") {
      if (request.method !== "POST") return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405, { allow: "POST" });
      return unavailable("assistant");
    }
    if (path === "/api/v1/avalon/email/dispatch") {
      if (request.method !== "POST") return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405, { allow: "POST" });
      return unavailable("email");
    }
    if (path === "/api/v1/avalon/dns-check") {
      if (request.method !== "GET") return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405, { allow: "GET" });
      const domain = url.searchParams.get("domain");
      if (!["thelingolegacy.com", "avalonphilly.org"].includes(domain)) {
        return json({ ok: false, code: "DOMAIN_NOT_ALLOWLISTED" }, 400);
      }
      return unavailable("dns");
    }
    if (path === "/api/v1/avalon/house-id") {
      if (request.method !== "POST") return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405, { allow: "POST" });
      return unavailable("identity");
    }
    return json({ ok: false, code: "NOT_FOUND" }, 404);
  }
};
