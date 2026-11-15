#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2] ?? "config/lingo-ecosystem-registry.v1.json";
const errors = [];
let registry;
try {
  registry = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
} catch (error) {
  console.error("Registry JSON could not be read:", error.message);
  process.exit(1);
}
const required = ["schema_version", "authority", "source_of_truth", "production_policy", "environments", "realms", "status_definitions", "release_gates", "explicit_disabled"];
for (const key of required) if (!(key in registry)) errors.push("Missing top-level field: " + key);
if (registry.schema_version !== "1.0.0") errors.push("Unsupported schema_version");
if (registry.authority !== "LINGOlegacy_MASTER") errors.push("Unexpected authority");
if (!Array.isArray(registry.realms) || registry.realms.length === 0) errors.push("realms must be a non-empty array");
const ids = new Set();
for (const realm of registry.realms ?? []) {
  for (const key of ["id", "name", "type", "status", "products", "dependencies"]) {
    if (!(key in realm)) errors.push("Realm is missing " + key + ": " + (realm.id ?? "unknown"));
  }
  if (ids.has(realm.id)) errors.push("Duplicate realm id: " + realm.id);
  ids.add(realm.id);
  if (realm.route !== null && realm.route !== undefined && !String(realm.route).startsWith("/")) errors.push("Route must be root-relative: " + realm.id);
  if (!Array.isArray(realm.products) || realm.products.length === 0) errors.push("Realm must list at least one product: " + realm.id);
  if (realm.status === "production") {
    for (const key of ["release_record", "last_verified_commit", "last_verified_at", "owner_acceptance"]) {
      if (!realm[key]) errors.push("Production realm lacks " + key + ": " + realm.id);
    }
  }
}
for (const field of ["environments", "release_gates", "explicit_disabled"]) {
  if (!Array.isArray(registry[field])) errors.push(field + " must be an array");
}
if (errors.length) {
  console.error("LINGO registry validation FAILED");
  for (const error of errors) console.error("- " + error);
  process.exit(1);
}
console.log("LINGO registry validation PASSED");
console.log("Realms:", registry.realms.length);
console.log("Production realms:", registry.realms.filter(r => r.status === "production").length);
console.log("Protected policy:", registry.production_policy);
