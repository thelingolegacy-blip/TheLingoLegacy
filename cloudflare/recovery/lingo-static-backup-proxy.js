/**
 * LINGO static recovery proxy.
 *
 * Purpose: serve the independently deployed Cloudflare Pages static recovery
 * site from launch.thelingolegacy.com while preserving the apex and www routes.
 *
 * Scope: staging hostname only. This worker must only be bound to
 * launch.thelingolegacy.com/*; never bind it to the apex or www hostname.
 *
 * The Pages origin is intentionally pinned to a pages.dev hostname to prevent
 * user-controlled hostnames from becoming an open proxy. Responses are marked
 * noindex and include an operational route marker for staging verification.
 */
export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const upstream = new URL(request.url);
    upstream.protocol = "https:";
    upstream.hostname = "thelingolegacy-static-backup.pages.dev";

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("content-length");
    headers.set("x-forwarded-host", incoming.host);
    headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));

    const init = {
      method: request.method,
      headers,
      redirect: "manual"
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }

    const originResponse = await fetch(new Request(upstream.toString(), init));
    const responseHeaders = new Headers(originResponse.headers);
    responseHeaders.set("x-lingo-recovery-route", "cloudflare-pages-proxy");
    responseHeaders.set("x-robots-tag", "noindex, nofollow");

    const location = responseHeaders.get("location");
    if (location) {
      try {
        const redirectUrl = new URL(location, upstream);
        if (redirectUrl.hostname === "thelingolegacy-static-backup.pages.dev") {
          redirectUrl.hostname = incoming.hostname;
          redirectUrl.protocol = incoming.protocol;
          responseHeaders.set("location", redirectUrl.toString());
        }
      } catch {}
    }

    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: responseHeaders
    });
  }
};
