#!/usr/bin/env node
/**
 * Fail-closed static environment isolation audit.
 * This does not inspect deployed Cloudflare resources; pair it with an authenticated
 * read-only account inventory before accepting staging isolation.
 */
import fs from "node:fs";
import path from "node:path";

const productionPath = path.resolve("wrangler.jsonc");
const stagingPath = path.resolve("wrangler.staging.jsonc");
const failures = [];
const blocked = [];
const checks = [];
const check = (id, ok, detail) => {
  checks.push({ id, status: ok ? "PASS" : "FAIL", detail });
  if (!ok) failures.push(id);
};
const block = (id, detail) => {
  checks.push({ id, status: "BLOCKED", detail });
  blocked.push(id);
};
const readConfig = (file) => {
  const source = fs.readFileSync(file, "utf8");
  // Repository configs are JSON-compatible JSONC. Refuse ambiguous parsing.
  return JSON.parse(source);
};
const statefulBindings = (config) => {
  const rows = [];
  const add = (kind, entries = []) => {
    for (const entry of entries) rows.push({ kind, ...entry });
  };
  add("kv", config.kv_namespaces);
  add("d1", config.d1_databases);
  add("r2", config.r2_buckets);
  add("hyperdrive", config.hyperdrive);
  add("service", config.services);
  add("queue-producer", config.queues?.producers);
  add("workflow", config.workflows);
  add("vectorize", config.vectorize);
  add("ai", config.ai ? [config.ai] : []);
  add("durable-object", config.durable_objects?.bindings);
  return rows;
};
const resourceKey = (binding) =>
  binding.namespace_id ?? binding.database_id ?? binding.bucket_name ??
  binding.id ?? binding.service ?? binding.name ?? binding.class_name ?? null;

let production;
if (!fs.existsSync(productionPath)) {
  check("production-config-exists", false, "Canonical wrangler.jsonc is missing.");
} else {
  try {
    production = readConfig(productionPath);
    check("production-config-parses", true, "wrangler.jsonc parses as JSON-compatible configuration.");
    check("production-worker-identity", Boolean(production.name && production.main), "Production Worker name and entry point are explicit.");
    check("production-routes", Array.isArray(production.routes) && production.routes.length > 0, "Production routes are explicit.");
    const rows = statefulBindings(production);
    check("production-stateful-bindings-inventory", true,
      rows.length ? rows.map(x => `${x.kind}:${x.binding ?? x.name ?? x.class_name ?? "unnamed"}`).join(", ") :
      "No KV/D1/R2/Hyperdrive/Service/Queue/Workflow/Vectorize/AI/DO bindings are declared in the root config.");
  } catch (error) {
    check("production-config-parses", false, String(error));
  }
}

if (!fs.existsSync(stagingPath)) {
  block("staging-config-exists", "wrangler.staging.jsonc is absent. Provision and verify a distinct staging Worker and its resources before creating this file.");
} else if (production) {
  let staging;
  try {
    staging = readConfig(stagingPath);
    check("staging-config-parses", true, "wrangler.staging.jsonc parses as JSON-compatible configuration.");
    check("staging-worker-identity", Boolean(staging.name && staging.name !== production.name),
      `Staging Worker must have a distinct name; production is ${production.name}.`);
    check("staging-entrypoint", Boolean(staging.main), "Staging entry point is explicit.");
    const prodRoutes = new Set((production.routes ?? []).map(x => x.pattern));
    const stageRoutes = (staging.routes ?? []).map(x => x.pattern);
    check("staging-route-separation", stageRoutes.every(route => !prodRoutes.has(route)),
      stageRoutes.length ? "Staging routes do not exactly reuse production route patterns." : "Staging has no public route; use protected preview access.");
    if (production.account_id && staging.account_id) {
      check("account-boundary", production.account_id === staging.account_id,
        "Staging and production use the same Cloudflare account. This is not account-level isolation; review this boundary explicitly.");
    } else {
      block("account-boundary", "One or both Wrangler configs omit account_id; verify account ownership from deployment environment and Cloudflare account inventory.");
    }
    const prodRows = statefulBindings(production);
    const stageRows = statefulBindings(staging);
    const prodIds = new Set(prodRows.map(resourceKey).filter(Boolean));
    const reused = stageRows.filter(row => {
      const key = resourceKey(row);
      return key && prodIds.has(key);
    });
    check("no-reused-stateful-resource-identifiers", reused.length === 0,
      reused.length ? reused.map(x => `${x.kind}:${resourceKey(x)}`).join(", ") : "No explicit stateful resource identifier is reused.");
    const missingIds = stageRows.filter(row =>
      ["kv","d1","r2","hyperdrive","service","queue-producer","workflow","vectorize"].includes(row.kind) &&
      !resourceKey(row)
    );
    check("staging-resource-identifiers", missingIds.length === 0,
      missingIds.length ? `Missing resource identifiers for ${missingIds.map(x => x.kind).join(", ")}` : "Every staging external resource binding has an explicit identifier.");
    const doBindings = staging.durable_objects?.bindings ?? [];
    if (doBindings.length) {
      check("staging-do-migrations", Array.isArray(staging.migrations) && staging.migrations.length > 0,
        "Staging Durable Object bindings require explicit migration history.");
      check("staging-do-classes", doBindings.every(x => x.name && x.class_name),
        "Every Durable Object binding has a binding name and class name.");
    } else {
      block("staging-do-bindings", "No staging Durable Object binding declared; this is acceptable only if the staging product slice does not require Durable Objects.");
    }
    check("staging-account-not-production-route", stageRoutes.every(route => !/thelingolegacy\.com\//i.test(route)),
      "Staging must not claim the production apex/www hostnames.");
  } catch (error) {
    check("staging-config-parses", false, String(error));
  }
}

const result = {
  gate: "staging-isolation-static",
  status: failures.length ? "FAIL" : blocked.length ? "BLOCKED" : "PASS",
  productionConfig: path.basename(productionPath),
  stagingConfig: path.basename(stagingPath),
  checks,
  note: "Static source check only. A PASS does not prove deployed binding ownership, separate credentials, Firebase isolation, or runtime non-crossover. Verify deployed Worker settings and resource IDs independently."
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
if (blocked.length) process.exit(2);
