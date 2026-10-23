// LINGO G02 Control Agent — read-only diagnostic API.
// No GitHub credentials, Cloudflare API tokens, or production bindings.
// This is a Workers edge service, NOT a persistent Linux host or Actions runner.

async function handle(request) {
  const url = new URL(request.url);
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "allow": "GET, HEAD, OPTIONS"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(JSON.stringify({ error: "method_not_allowed", readOnly: true }), { status: 405, headers });
  }

  const status = {
    service: "lingo-g02-control-agent",
    mode: "read-only diagnostic agent",
    generatedAt: "2026-10-10",
    productionMutation: "FROZEN",
    lastKnownGood: "PROTECTED",
    merge: "NOT_AUTHORIZED",
    deployment: "NOT_AUTHORIZED",
    activation: "NOT_AUTHORIZED",
    gates: {
      G00_SOURCE_AUTHORITY: "PASS",
      G01_REPOSITORY: "PASS",
      G02_RUNNER_DISPATCH: "FAIL_UNVERIFIED",
      G03_CI_EXECUTION: "BLOCKED",
      G04_CERTIFICATION: "BLOCKED",
      G05_RELEASE_CANDIDATE: "BLOCKED",
      G06_DEPLOYMENT: "BLOCKED",
      G07_LIVE_VALIDATION: "BLOCKED",
      G08_SYNCHRONIZATION: "BLOCKED",
      G09_ACTIVATION: "BLOCKED",
      G10_POST_ACTIVATION: "BLOCKED",
      G11_ACCEPTANCE: "BLOCKED"
    },
    latestObservedRuns: [
      { workflow: "Lingo Legacy Static CI", runId: 38077021340, jobId: 114286031586, runnerId: 0, runnerName: "", steps: [], conclusion: "failure" },
      { workflow: "Studio Sandbox Guard", runId: 38077021334, jobId: 114286031603, runnerId: 0, runnerName: "", steps: [], conclusion: "failure" }
    ],
    supportCase: "NOT_SUBMITTED",
    hostDaemon: "NOT_VERIFIED",
    credentialsStoredInWorker: false,
    repairCapability: false,
    note: "This endpoint reports recorded evidence only. It cannot register runners, mint credentials, execute jobs, or authorize production changes."
  };

  if (url.pathname === "/healthz") {
    return new Response(JSON.stringify({ service: "lingo-g02-control-agent", status: "ok", readOnly: true, production: false }), { status: 200, headers });
  }
  if (url.pathname === "/g02/status") {
    return new Response(JSON.stringify(status), { status: 200, headers });
  }
  if (url.pathname === "/g02/acceptance") {
    return new Response(JSON.stringify({
      gate: "G02",
      acceptanceRequiresAll: [
        "matching real runner assigned",
        "runner_id greater than zero",
        "runner_name populated",
        "job assigned and steps instantiated",
        "sentinel step executed with recorded exit code",
        "logs generated and retrievable",
        "evidence artifact retrievable",
        "run/job/commit correlation independently verified"
      ],
      pass: false,
      currentState: "BLOCKED",
      productionMutation: "FORBIDDEN"
    }), { status: 200, headers });
  }

  return new Response(JSON.stringify({
    error: "not_found",
    service: "lingo-g02-control-agent",
    endpoints: ["/healthz", "/g02/status", "/g02/acceptance"]
  }), { status: 404, headers });
}

addEventListener("fetch", event => event.respondWith(handle(event.request)));
