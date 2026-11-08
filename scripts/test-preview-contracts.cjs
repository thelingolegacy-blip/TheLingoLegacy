const assert = require("node:assert/strict");
const runtimeHandler = require("../api/v1/runtime.js");
const gatesHandler = require("../api/v1/platform/gates.js");
const vercel = require("../vercel.json");

function invoke(handler, method = "GET") {
  const headers = {};
  const response = {
    statusCode: 200,
    body: undefined,
    setHeader(name, value) { headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; }
  };
  handler({ method }, response);
  return { ...response, headers };
}

const runtime = invoke(runtimeHandler);
assert.equal(runtime.statusCode, 200);
assert.equal(runtime.body.runtime, "vercel-preview-contract");
assert.equal(runtime.body.status, "PREVIEW_ONLY");
assert.equal(runtime.body.backend_integrations, "NOT_VERIFIED");
assert.equal(runtime.body.production_mutation, false);
assert.equal(runtime.body.gates.G02_RUNNER, "BLOCKED");
assert.equal(runtime.headers["cache-control"], "no-store");
assert.equal(runtime.headers["x-robots-tag"], "noindex, nofollow");

const gates = invoke(gatesHandler);
assert.equal(gates.statusCode, 200);
assert.equal(gates.body.fail_closed, true);
assert.equal(gates.body.mutation_freeze, true);
assert.equal(gates.body.lkg, "PROTECTED");
assert.equal(gates.body.authorization.production_promotion, false);
assert.equal(gates.body.gates.G11_ACCEPTANCE, "BLOCKED");

for (const handler of [runtimeHandler, gatesHandler]) {
  const rejected = invoke(handler, "POST");
  assert.equal(rejected.statusCode, 405);
  assert.deepEqual(rejected.body, { ok: false, error: "Method not allowed" });
  assert.equal(rejected.headers.allow, "GET, HEAD");
}

assert.deepEqual(vercel.redirects, [
  { source: "/game", destination: "/thats-my-lingo/", permanent: true },
  { source: "/arcade", destination: "/lingoarcade/", permanent: true }
]);

console.log("Preview contract checks passed: 21 assertions.");
