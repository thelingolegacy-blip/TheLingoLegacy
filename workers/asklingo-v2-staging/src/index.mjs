export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/_health") {
      return Response.json({
        service: "askLINGO",
        environment: "staging",
        state: "disabled",
        inference: false,
        persistence: false,
        authorization: "not-configured",
        message: "Staging scaffold only. No query or execution surface is enabled."
      }, {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer"
        }
      });
    }
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer"
      }
    });
  }
};
