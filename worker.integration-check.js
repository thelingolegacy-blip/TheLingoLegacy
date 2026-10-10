export default {
  async fetch(request) {
    const url = new URL(request.url);
    const headers = {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-lingo-test-target": "isolated",
    };

    if (url.pathname === "/healthz") {
      return new Response(JSON.stringify({
        ok: true,
        service: "lingo-legacy-integration-check",
        runtime: "cloudflare-worker",
        environment: "isolated-test",
        production: false,
        canonical_routes: false,
        commit_ref: "infra/cloudflare-git-preview-check-2026-10-10",
        timestamp: new Date().toISOString(),
      }), { status: 200, headers });
    }

    return new Response(JSON.stringify({
      ok: true,
      service: "lingo-legacy-integration-check",
      message: "Isolated LINGO Legacy Git integration probe",
      environment: "isolated-test",
      production: false,
    }), { status: 200, headers });
  },
};
