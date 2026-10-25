/**
 * LINGO static recovery proxy with isolated Studio OS prototype.
 * This Worker is routed only on launch.thelingolegacy.com/*.
 * Studio HTML/SVG source is pinned to an immutable Git commit; apex/www are untouched.
 */
const SOURCE = "https://raw.githubusercontent.com/thelingolegacy-blip/TheLingoLegacy/9eaa20fd8872b940a157f16a8bbd5ddb04371597/cloudflare/studio-assets/";
const SVG_FILES = new Set(["hero-universe.svg","loyalty-lane.svg","thats-my-lingo.svg","kottonscode.svg","asklingo.svg"]);
async function pinnedFile(path, requestMethod) {
  const upstream = await fetch(SOURCE + path, { cf: { cacheTtl: 60, cacheEverything: true } });
  if (!upstream.ok) return new Response("Studio asset unavailable", { status: 502, headers: { "x-robots-tag": "noindex, nofollow" } });
  const headers = new Headers(upstream.headers);
  headers.set("x-robots-tag", "noindex, nofollow");
  headers.set("x-lingo-recovery-route", "cloudflare-studio-prototype");
  headers.set("x-content-type-options", "nosniff");
  headers.set("cache-control", path === "index.html" ? "no-store" : "public, max-age=300");
  if (path === "index.html") headers.set("content-type", "text/html; charset=utf-8");
  else headers.set("content-type", "image/svg+xml; charset=utf-8");
  return new Response(requestMethod === "HEAD" ? null : upstream.body, { status: 200, headers });
}
export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    if (request.method === "GET" || request.method === "HEAD") {
      if (incoming.pathname === "/" || incoming.pathname === "/index.html") return pinnedFile("index.html", request.method);
      const match = incoming.pathname.match(/^\/assets\/([a-z0-9-]+\.svg)$/i);
      if (match && SVG_FILES.has(match[1])) return pinnedFile("assets/" + match[1], request.method);
    }
    const upstream = new URL(request.url);
    upstream.protocol = "https:";
    upstream.hostname = "thelingolegacy-static-backup.pages.dev";
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("content-length");
    headers.set("x-forwarded-host", incoming.host);
    headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));
    const init = { method: request.method, headers, redirect: "manual" };
    if (request.method !== "GET" && request.method !== "HEAD") init.body = request.body;
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
    return new Response(originResponse.body, { status: originResponse.status, statusText: originResponse.statusText, headers: responseHeaders });
  }
};
