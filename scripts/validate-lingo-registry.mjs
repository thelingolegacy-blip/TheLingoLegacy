#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const EXPECTED_REALM_COUNT = 14;
const file = process.argv[2] ?? "config/lingo-ecosystem-registry.v1.json";
const errors = [];
let registry;
try {
  registry = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
} catch (error) {
  console.error("Registry JSON could not be read:", error.message);
  process.exit(1);
}

if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
  console.error("Registry root must be a JSON object");
  process.exit(1);
}

const required = ["schema_version", "authority", "source_of_truth", "production_policy", "environments", "realms", "status_definitions", "release_gates", "explicit_disabled"];
for (const key of required) if (!(key in registry)) errors.push("Missing top-level field: " + key);
if (registry.schema_version !== "1.0.0") errors.push("Unsupported schema_version");
if (registry.authority !== "LINGOlegacy_MASTER") errors.push("Unexpected authority");
if (!Array.isArray(registry.realms) || registry.realms.length !== EXPECTED_REALM_COUNT) {
  errors.push("realms must contain exactly " + EXPECTED_REALM_COUNT + " entries");
}

const realms = Array.isArray(registry.realms) ? registry.realms : [];
const ids = new Set();
const routes = new Set();
for (const realm of realms) {
  if (!realm || typeof realm !== "object" || Array.isArray(realm)) {
    errors.push("Each realm must be an object");
    continue;
  }
  for (const key of ["id", "name", "type", "status", "products", "dependencies"]) {
    if (!(key in realm)) errors.push("Realm is missing " + key + ": " + (realm.id ?? "unknown"));
  }
  if (typeof realm.id !== "string" || !/^[a-z0-9-]+$/.test(realm.id)) {
    errors.push("Realm id must be lowercase kebab-case: " + String(realm.id));
  }
  if (ids.has(realm.id)) errors.push("Duplicate realm id: " + realm.id);
  ids.add(realm.id);

  if (!Array.isArray(realm.products) || realm.products.length === 0 || realm.products.some((value) => typeof value !== "string" || !value.trim())) {
    errors.push("Realm must list at least one non-empty product: " + (realm.id ?? "unknown"));
  }
  if (!Array.isArray(realm.dependencies) || realm.dependencies.some((value) => typeof value !== "string" || !value.trim())) {
    errors.push("Realm dependencies must be an array of non-empty strings: " + (realm.id ?? "unknown"));
  }
  if (realm.route !== null && realm.route !== undefined) {
    if (typeof realm.route !== "string" || !realm.route.startsWith("/") || realm.route.includes("?") || realm.route.includes("#")) {
      errors.push("Route must be a root-relative path without query or fragment: " + realm.id);
    } else {
      if (routes.has(realm.route)) errors.push("Duplicate realm route: " + realm.route);
      routes.add(realm.route);
    }
  }
  if (!["planned", "planned-disabled", "scaffolded-unverified", "preview-needs-independent-qa", "verified", "production", "live-uncertified"].includes(realm.status)) {
    errors.push("Unsupported status: " + realm.id + " = " + realm.status);
  }
  if (registry.production_policy === "protected-hold" && realm.status === "production") {
    errors.push("Realm cannot be production while production_policy is protected-hold: " + realm.id);
  }
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
console.log("Realms:", realms.length);
console.log("Production realms:", realms.filter((realm) => realm.status === "production").length);
console.log("Protected policy:", registry.production_policy);
