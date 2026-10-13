import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.PORT || 8080);
const LAB_MODE = process.env.LAB_MODE === "true";
const MAX_IN_FLIGHT = clampInt(process.env.MAX_IN_FLIGHT, 8, 1, 64);
const MAX_QUEUE = clampInt(process.env.MAX_QUEUE, 16, 0, 256);
const MAX_DELAY_MS = clampInt(process.env.MAX_DELAY_MS, 1500, 0, 5000);

let active = 0;
let total = 0;
let completed = 0;
let failed = 0;
let rejected = 0;
let queued = 0;
const queue = [];

function clampInt(value, fallback, min, max) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
}

function send(res, status, body, extra = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "content-length": Buffer.byteLength(payload),
    ...extra,
  });
  res.end(payload);
}

function drain() {
  while (active < MAX_IN_FLIGHT && queue.length > 0) {
    const job = queue.shift();
    queued = queue.length;
    active += 1;
    void execute(job);
  }
}

async function execute(job) {
  const started = Date.now();
  try {
    await new Promise((resolve) => setTimeout(resolve, job.delayMs));
    if (Math.random() < job.failRate) {
      failed += 1;
      send(job.res, 503, { ok: false, error: "synthetic_dependency_failure", elapsedMs: Date.now() - started });
    } else {
      completed += 1;
      send(job.res, 200, {
        ok: true,
        mode: "synthetic-capacity-lab",
        elapsedMs: Date.now() - started,
        activeAtStart: job.activeAtStart,
        queueAtStart: job.queueAtStart,
      });
    }
  } catch {
    failed += 1;
    if (!job.res.headersSent) send(job.res, 500, { ok: false, error: "lab_internal_error" });
  } finally {
    active -= 1;
    drain();
  }
}

const server = http.createServer((req, res) => {
  total += 1;
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method !== "GET") {
    send(res, 405, { ok: false, error: "method_not_allowed" }, { allow: "GET" });
    return;
  }

  if (url.pathname === "/healthz") {
    send(res, 200, { ok: true });
    return;
  }
  if (url.pathname === "/readyz") {
    send(res, 200, { ok: true, active, queued, maxInFlight: MAX_IN_FLIGHT, maxQueue: MAX_QUEUE });
    return;
  }
  if (url.pathname === "/metrics") {
    const body = [
      "# TYPE lingo_lab_requests_total counter",
      `lingo_lab_requests_total ${total}`,
      "# TYPE lingo_lab_requests_completed_total counter",
      `lingo_lab_requests_completed_total ${completed}`,
      "# TYPE lingo_lab_requests_failed_total counter",
      `lingo_lab_requests_failed_total ${failed}`,
      "# TYPE lingo_lab_requests_rejected_total counter",
      `lingo_lab_requests_rejected_total ${rejected}`,
      "# TYPE lingo_lab_active_requests gauge",
      `lingo_lab_active_requests ${active}`,
      "# TYPE lingo_lab_queued_requests gauge",
      `lingo_lab_queued_requests ${queued}`,
    ].join("\n") + "\n";
    res.writeHead(200, { "content-type": "text/plain; version=0.0.4; charset=utf-8", "cache-control": "no-store" });
    res.end(body);
    return;
  }
  if (url.pathname !== "/simulate") {
    send(res, 404, { ok: false, error: "not_found" });
    return;
  }
  if (!LAB_MODE) {
    send(res, 404, { ok: false, error: "lab_mode_disabled" });
    return;
  }

  const delayMs = Number(url.searchParams.get("delay_ms") || 50);
  const failRate = Number(url.searchParams.get("fail_rate") || 0);
  if (!Number.isFinite(delayMs) || delayMs < 0 || delayMs > MAX_DELAY_MS ||
      !Number.isFinite(failRate) || failRate < 0 || failRate > 0.25) {
    send(res, 400, { ok: false, error: "parameter_out_of_bounds", maxDelayMs: MAX_DELAY_MS, maxFailRate: 0.25 });
    return;
  }

  if (active >= MAX_IN_FLIGHT && queue.length >= MAX_QUEUE) {
    rejected += 1;
    send(res, 429, { ok: false, error: "capacity_limit_reached", retryable: true });
    return;
  }

  const job = {
    res,
    delayMs,
    failRate,
    activeAtStart: active,
    queueAtStart: queue.length,
  };
  if (active < MAX_IN_FLIGHT) {
    active += 1;
    void execute(job);
  } else {
    queue.push(job);
    queued = queue.length;
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(JSON.stringify({
    event: "lab_started",
    port: PORT,
    labMode: LAB_MODE,
    maxInFlight: MAX_IN_FLIGHT,
    maxQueue: MAX_QUEUE,
    maxDelayMs: MAX_DELAY_MS,
  }));
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
