const STANDBY_HOST = "launch.thelingolegacy.com";
const ORIGIN_HOST = "thelingolegacy-static-backup.pages.dev";
const CSP = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data: https:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests";

function errorResponse(status, message) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow, noarchive",
      "x-content-type-options": "nosniff"
    }
  });
}

export function createProxyWorker(fetchImpl = globalThis.fetch) {
  return {
    async fetch(request) {
      const incoming = new URL(request.url);

      if (incoming.hostname !== STANDBY_HOST || incoming.port !== "") {
        return errorResponse(421, "Misdirected request.");
      }
      if (request.method !== "GET" && request.method !== "HEAD") {
        return errorResponse(405, "Method not allowed.");
      }

      const target = new URL(incoming.pathname + incoming.search, "https://" + ORIGIN_HOST);
      const headers = new Headers(request.headers);
      headers.delete("host");
      headers.delete("content-length");
      headers.set("x-forwarded-host", incoming.host);
      headers.set("x-forwarded-proto", incoming.protocol.slice(0, -1));

      try {
        const originResponse = await fetchImpl(new Request(target.toString(), {
          method: request.method,
          headers,
          redirect: "manual"
        }));
        const responseHeaders = new Headers(originResponse.headers);
        responseHeaders.set("x-lingo-recovery-route", "cloudflare-pages-proxy");
        responseHeaders.set("x-robots-tag", "noindex, nofollow, noarchive");
        responseHeaders.set("x-content-type-options", "nosniff");
        responseHeaders.set("x-frame-options", "DENY");
        responseHeaders.set("referrer-policy", "strict-origin-when-cross-origin");
        responseHeaders.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
        responseHeaders.set("strict-transport-security", "max-age=63072000; includeSubDomains; preload");
        responseHeaders.set("content-security-policy", CSP);
        responseHeaders.set("cross-origin-opener-policy", "same-origin");
        responseHeaders.set("x-dns-prefetch-control", "off");
        responseHeaders.set("x-permitted-cross-domain-policies", "none");

        if (incoming.pathname === "/" || incoming.pathname === "/index.html") {
          responseHeaders.set("cache-control", "no-store");
        }

        const location = responseHeaders.get("location");
        if (location) {
          try {
            const redirectUrl = new URL(location, target);
            if (redirectUrl.hostname === ORIGIN_HOST) {
              redirectUrl.hostname = STANDBY_HOST;
              redirectUrl.protocol = incoming.protocol;
              responseHeaders.set("location", redirectUrl.toString());
            }
          } catch {
            // Preserve malformed or non-origin redirects unchanged.
          }
        }

        return new Response(request.method === "HEAD" ? null : originResponse.body, {
          status: originResponse.status,
          statusText: originResponse.statusText,
          headers: responseHeaders
        });
      } catch {
        // Never fail over to the primary site: keep standby isolation explicit.
        return errorResponse(502, "Standby origin unavailable.");
      }
    }
  };
}

export default createProxyWorker();
