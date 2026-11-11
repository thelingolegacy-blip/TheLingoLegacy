#!/usr/bin/env node
/**
 * Fail-closed environment isolation audit.
 * This is a static configuration check, not a live Cloudflare account audit.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const productionPath = path.join(root, "wrangler.jsonc");
const stagingPath = path.join(root, "wrangler.staging.jsonc");

function readJsonc(file) {
  const raw = fs.readFileSync(file, "utf8");
  // Current checked-in Wrangler configs are strict JSON-compatible JSONC.
  try { return JSON.parse(raw); }
  catch { throw new Error(`${path.basename(file)} is not JSON-compatible; review comments/trailing commas before using this audit.`); }
}
function bindings(config) {
  const list = [...(config.bindings ?? [])];
  for (const [name, value] of Object.entries(config.env ?? {})) {
    if (value && typeof value === "object") list.push(...(value.bindings ?? []).map(x => ({...x, __env:name})));
  }
  return list;
}
function fail(message) { console.error(`FAIL: ${message}`); process.exitCode = 1; }
function blocked(message) { console.error(`BLOCKED: ${message}`); process.exitCode = 2; }

if (!fs.existsSync(productionPath)) {
  fail("wrangler.jsonc is missing; canonical production config cannot be audited.");
} else {
  const prod = readJsonc(productionPath);
  const prodBindings = bindings(prod);
  const stateful = prodBindings.filter(b => ["kv_namespace","d1","durable_object_namespace","r2_bucket","hyperdrive","service","queue","workflow"].includes(b.type));
  if (stateful.length) fail(`Production config contains stateful/service bindings: ${stateful.map(b => `${b.name}:${b.type}`).join(", ")}`);
  else console.log("PASS: checked-in production config has no KV/D1/DO/R2/Hyperdrive/Service/Queue/Workflow bindings.");
  if (!prod.name || !prod.main || !Array.isArray(prod.routes) || prod.routes.length === 0) fail("Production identity, entry point, or explicit routes are missing.");
  else console.log(`PASS: production Worker identity and ${prod.routes.length} explicit route(s) are present.`);
}

if (!fs.existsSync(stagingPath)) {
  blocked("wrangler.staging.jsonc is not present. Do not reuse production bindings or invent resource IDs; provision and verify dedicated staging resources first.");
} else {
  const stage = readJsonc(stagingPath);
  if (!stage.name || stage.name === "thelingolegacyv-5") fail("Staging Worker must have its own distinct Worker name.");
  if (stage.workers_dev !== true && (!Array.isArray(stage.routes) || stage.routes.length === 0)) {
    console.log("INFO: staging has no public route; use a protected workers.dev URL or controlled preview routing.");
  }
  const prod = readJsonc(productionPath);
  const prodIds = new Set(bindings(prod).map(b => b.namespace_id ?? b.database_id ?? b.id).filter(Boolean));
  const stageBindings = bindings(stage);
  const stageIds = stageBindings.map(b => b.namespace_id ?? b.database_id ?? b.id).filter(Boolean);
  if (stageIds.some(id => prodIds.has(id))) fail("A staging binding reuses a production resource ID.");
  if (stageBindings.some(b => ["kv_namespace","d1","durable_object_namespace","r2_bucket"].includes(b.type) && !(b.namespace_id ?? b.database_id ?? b.id))) {
    fail("A staging stateful binding is missing an explicit resource identifier.");
  }
  if (!stage.account_id && !process.env.CLOUDFLARE_ACCOUNT_ID) blocked("Staging account identity is not explicit in config or environment.");
  if (stage.name && stage.name !== "thelingolegacyv-5") console.log(`PASS: staging Worker name is distinct (${stage.name}).`);
  console.log("INFO: static binding comparison completed; verify resource ownership and runtime behavior against Cloudflare before acceptance.");
}
if (process.exitCode === 0) console.log("PASS: static isolation checks completed.");
