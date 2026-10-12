export default {
  async fetch(request) {
    const url = new URL(request.url);
    const headers = {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    };

    if (url.pathname === "/healthz") {
      return new Response(
        JSON.stringify({
          service: "lingo-recovery-sandbox",
          status: "ok",
          production: false,
          bindings: 0,
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers },
      );
    }

    if (url.pathname === "/readyz") {
      return new Response(
        JSON.stringify({
          service: "lingo-recovery-sandbox",
          ready: true,
          deploymentPromotion: false,
          productionRoutes: false,
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers },
      );
    }

    return new Response(
      JSON.stringify({ error: "not_found", service: "lingo-recovery-sandbox" }),
      { status: 404, headers },
    );
  },
};
