#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const EXPECTED_REALM_COUNT = 14;
const EXPECTED_PUBLIC_PORTFOLIO_IDS = new Set([
  "lingo-legacy", "lingo-lane", "lingo-slots", "lingo-arcade",
  "lingo-library", "lingo-media", "lingo-world", "legacy-x-club",
]);
const EXPECTED_SHARED_PLATFORM_SERVICE_IDS = new Set([
  "lingo-studio", "lingo-core", "lingo-identity", "lingo-wallet",
]);
const EXPECTED_SUBPRODUCT_PARENTS = new Map([
  ["lingo-shield", "lingo-world"],
  ["lingo-campus", "lingo-world"],
]);
const NODE_TYPES = new Set(["public_portfolio", "subproduct", "shared_platform_service"]);
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
const realmsById = new Map();
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
  realmsById.set(realm.id, realm);
  if (!NODE_TYPES.has(realm.node_type)) {
    errors.push("Unsupported node_type: " + realm.id + " = " + String(realm.node_type));
  }
  if (realm.node_type === "subproduct") {
    if (typeof realm.parent_id !== "string" || !realm.parent_id.trim()) {
      errors.push("Subproduct must declare a non-empty parent_id: " + realm.id);
    }
  } else if (realm.parent_id !== undefined) {
    errors.push("Only subproducts may declare parent_id: " + realm.id);
  }

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
const publicIdsFound = new Set(realms.filter((realm) => realm?.node_type === "public_portfolio").map((realm) => realm.id));
if (publicIdsFound.size !== EXPECTED_PUBLIC_PORTFOLIO_IDS.size) {
  errors.push("Registry must contain exactly " + EXPECTED_PUBLIC_PORTFOLIO_IDS.size + " canonical public portfolios");
}
for (const id of EXPECTED_PUBLIC_PORTFOLIO_IDS) {
  if (!publicIdsFound.has(id)) errors.push("Missing canonical public portfolio: " + id);
}
for (const id of publicIdsFound) {
  if (!EXPECTED_PUBLIC_PORTFOLIO_IDS.has(id)) errors.push("Unexpected public portfolio: " + id);
}
const sharedIdsFound = new Set(realms.filter((realm) => realm?.node_type === "shared_platform_service").map((realm) => realm.id));
if (sharedIdsFound.size !== EXPECTED_SHARED_PLATFORM_SERVICE_IDS.size) {
  errors.push("Registry must contain exactly " + EXPECTED_SHARED_PLATFORM_SERVICE_IDS.size + " shared platform services");
}
for (const id of EXPECTED_SHARED_PLATFORM_SERVICE_IDS) {
  if (!sharedIdsFound.has(id)) errors.push("Missing canonical shared platform service: " + id);
}
for (const id of sharedIdsFound) {
  if (!EXPECTED_SHARED_PLATFORM_SERVICE_IDS.has(id)) errors.push("Unexpected shared platform service: " + id);
}
for (const [childId, expectedParentId] of EXPECTED_SUBPRODUCT_PARENTS) {
  const child = realmsById.get(childId);
  const parent = realmsById.get(expectedParentId);
  if (!child || child.node_type !== "subproduct") {
    errors.push("Expected canonical subproduct is missing or misclassified: " + childId);
    continue;
  }
  if (child.parent_id !== expectedParentId) errors.push("Subproduct " + childId + " must belong to " + expectedParentId);
  if (!parent || parent.node_type !== "public_portfolio") errors.push("Subproduct parent must be an existing public portfolio: " + expectedParentId);
}
for (const realm of realms) {
  if (realm?.node_type === "subproduct" && !EXPECTED_SUBPRODUCT_PARENTS.has(realm.id)) {
    errors.push("Unexpected subproduct or missing canonical parent mapping: " + realm.id);
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
console.log("Public portfolios:", realms.filter((realm) => realm.node_type === "public_portfolio").length);
console.log("Shared platform services:", realms.filter((realm) => realm.node_type === "shared_platform_service").length);
console.log("Subproducts:", realms.filter((realm) => realm.node_type === "subproduct").length);
console.log("Production realms:", realms.filter((realm) => realm.status === "production").length);
console.log("Protected policy:", registry.production_policy);
