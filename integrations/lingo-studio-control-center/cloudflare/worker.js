import registry from "./route-registry.json";

const routes = new Map(registry.routes.map((route) => [
  "/apps/" + route.slug + "/",
  new URL(route.origin)
]));

function securityHeaders(headers) {
  const output = new Headers(headers);
  output.set("x-content-type-options", "nosniff");
  output.set("referrer-policy", "strict-origin-when-cross-origin");
  output.set("x-frame-options", "SAMEORIGIN");
  output.set("cache-control", "no-store");
  output.delete("set-cookie");
  output.delete("server");
  return output;
}

class PrefixRootAttributes {
  constructor(prefix) { this.prefix = prefix; }
  element(element) {
    for (const attr of ["href", "src", "action", "poster"]) {
      const value = element.getAttribute(attr);
      if (value && value.startsWith("/") && !value.startsWith("//")) {
        element.setAttribute(attr, this.prefix.slice(0, -1) + value);
      }
    }
  }
}

export default {
  async fetch(request, env) {
    if (env.ENVIRONMENT !== "staging") {
      return new Response("Staging environment required", { status: 503 });
    }

    const incoming = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Read-only preview proxy", {
        status: 405,
        headers: { allow: "GET, HEAD", "cache-control": "no-store" }
      });
    }

    const match = [...routes.entries()]
      .sort((a, b) => b[0].length - a[0].length)
      .find(([prefix]) => incoming.pathname.startsWith(prefix));

    if (!match) {
      return new Response("Route not registered", { status: 404 });
    }

    const [prefix, origin] = match;
    const remainder = incoming.pathname.slice(prefix.length);
    let decodedPath;
    try {
      decodedPath = decodeURIComponent(remainder);
    } catch {
      return new Response("Invalid path encoding", { status: 400 });
    }
    if (decodedPath.startsWith("/") || decodedPath.startsWith("\\") ||
        decodedPath.includes("\\") || decodedPath.includes("\0") ||
        decodedPath.split("/").some((segment) => segment === "." || segment === "..")) {
      return new Response("Invalid path", { status: 400 });
    }
    if (decodedPath === "api" || decodedPath.startsWith("api/")) {
      return new Response("Application APIs are not exposed through the preview proxy", { status: 403 });
    }

    const upstream = new URL("/" + remainder, origin);
    if (upstream.origin !== origin.origin) {
      return new Response("Upstream origin mismatch", { status: 400 });
    }
    upstream.search = incoming.search;
    const headers = new Headers();
    const accept = request.headers.get("accept");
    const language = request.headers.get("accept-language");
    if (accept) headers.set("accept", accept);
    if (language) headers.set("accept-language", language);

    let upstreamResponse;
    try {
      upstreamResponse = await fetch(new Request(upstream.toString(), {
        method: request.method,
        headers,
        redirect: "manual"
      }));
    } catch {
      return new Response("Upstream unavailable", { status: 502 });
    }

    const responseHeaders = securityHeaders(upstreamResponse.headers);
    const location = responseHeaders.get("location");
    if (location) {
      const redirectUrl = new URL(location, origin);
      if (redirectUrl.origin !== origin.origin) {
        return new Response("External redirect blocked", { status: 502 });
      }
      responseHeaders.set("location", prefix + redirectUrl.pathname.replace(/^\//, "") + redirectUrl.search + redirectUrl.hash);
    }

    let response = new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders
    });

    const contentType = upstreamResponse.headers.get("content-type") || "";
    if (request.method === "GET" && contentType.includes("text/html")) {
      response = new HTMLRewriter()
        .on("a[href],link[href],script[src],img[src],source[src],form[action]", new PrefixRootAttributes(prefix))
        .transform(response);
    }

    return response;
  }
};
