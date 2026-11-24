import test from "node:test";
import assert from "node:assert/strict";
import { createProxyWorker } from "../../cloudflare/static-backup-proxy.mjs";

const request = (path = "/", method = "GET", host = "launch.thelingolegacy.com") =>
  new Request("https://" + host + path, { method });

test("root is served from the Pages standby origin, not a pinned legacy HTML commit", async () => {
  let target;
  const worker = createProxyWorker(async (req) => {
    target = req.url;
    return new Response("current standby homepage", { status: 200 });
  });
  const response = await worker.fetch(request("/"));
  assert.equal(target, "https://thelingolegacy-static-backup.pages.dev/");
  assert.equal(await response.text(), "current standby homepage");
  assert.equal(response.headers.get("x-lingo-recovery-route"), "cloudflare-pages-proxy");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("deep links and query strings are proxied to the static Pages origin", async () => {
  let target;
  const worker = createProxyWorker(async (req) => {
    target = req.url;
    return new Response("page", { status: 200 });
  });
  await worker.fetch(request("/thats-my-lingo/?mode=preview"));
  assert.equal(target, "https://thelingolegacy-static-backup.pages.dev/thats-my-lingo/?mode=preview");
});

test("Pages-origin redirects are rewritten to the launch hostname", async () => {
  const worker = createProxyWorker(async () => new Response(null, {
    status: 302,
    headers: { location: "https://thelingolegacy-static-backup.pages.dev/contact/" }
  }));
  const response = await worker.fetch(request("/contact/"));
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "https://launch.thelingolegacy.com/contact/");
});

test("non-read-only methods are rejected without calling the origin", async () => {
  let called = false;
  const worker = createProxyWorker(async () => { called = true; return new Response("unexpected"); });
  const response = await worker.fetch(request("/checkout/", "POST"));
  assert.equal(response.status, 405);
  assert.equal(called, false);
});

test("unexpected hostnames are rejected without calling the origin", async () => {
  let called = false;
  const worker = createProxyWorker(async () => { called = true; return new Response("unexpected"); });
  const response = await worker.fetch(request("/", "GET", "attacker.example"));
  assert.equal(response.status, 421);
  assert.equal(called, false);
});

test("origin failures return 502 and never fall back to the primary domain", async () => {
  const requested = [];
  const worker = createProxyWorker(async (req) => {
    requested.push(req.url);
    throw new Error("simulated origin failure");
  });
  const response = await worker.fetch(request("/"));
  assert.equal(response.status, 502);
  assert.deepEqual(requested, ["https://thelingolegacy-static-backup.pages.dev/"]);
  assert.equal(await response.text(), JSON.stringify({ ok: false, error: "Standby origin unavailable." }));
});

test("security headers are applied to proxied responses", async () => {
  const worker = createProxyWorker(async () => new Response("ok", { status: 200 }));
  const response = await worker.fetch(request("/privacy/"));
  for (const header of [
    "x-robots-tag",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "permissions-policy",
    "strict-transport-security",
    "content-security-policy",
    "cross-origin-opener-policy"
  ]) assert.ok(response.headers.has(header), "missing " + header);
});

test("HEAD requests return no body", async () => {
  const worker = createProxyWorker(async () => new Response("body", { status: 200 }));
  const response = await worker.fetch(request("/", "HEAD"));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
});
