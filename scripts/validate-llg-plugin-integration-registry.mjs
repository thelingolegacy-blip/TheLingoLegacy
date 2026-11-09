#!/usr/bin/env node
import fs from "node:fs";

const path = process.argv[2] || "config/registry/llg-plugin-integration-registry.v1.json";
let registry;
try {
  registry = JSON.parse(fs.readFileSync(path, "utf8"));
} catch (error) {
  console.error("LLG_PLUGIN_REGISTRY=FAIL");
  console.error(`Cannot read or parse ${path}: ${error.message}`);
  process.exit(1);
}

const errors = [];
const required = registry.requiredRecordFields;
if (!Array.isArray(required) || required.length === 0) {
  errors.push("requiredRecordFields must be a non-empty array");
}
if (!Array.isArray(registry.entries)) {
  errors.push("entries must be an array");
}
if (registry.policy?.secretsStored !== false) {
  errors.push("policy.secretsStored must be false");
}
if (registry.policy?.thirdPartyPasswordsCollected !== false) {
  errors.push("policy.thirdPartyPasswordsCollected must be false");
}
if (registry.policy?.productionByDefault !== false) {
  errors.push("policy.productionByDefault must be false");
}

const seen = new Set();
for (const [index, entry] of (registry.entries || []).entries()) {
  const label = entry?.id || `entry[${index}]`;
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    errors.push(`${label}: record must be an object`);
    continue;
  }
  if (typeof entry.id !== "string" || !entry.id.trim()) {
    errors.push(`${label}: id is required`);
  } else if (seen.has(entry.id)) {
    errors.push(`${label}: duplicate id`);
  } else {
    seen.add(entry.id);
  }

  for (const field of required || []) {
    const value = entry[field];
    const missing = value === undefined || value === null
      || (typeof value === "string" && value.trim() === "");
    if (missing) errors.push(`${label}: missing required field ${field}`);
  }

  for (const field of ["products", "dataClasses", "dataFields", "oauthScopes", "evidence", "changeHistory"]) {
    if (entry[field] !== undefined && !Array.isArray(entry[field])) {
      errors.push(`${label}: ${field} must be an array when present`);
    }
  }

  if (entry.status && typeof entry.status !== "string") {
    errors.push(`${label}: status must be a string`);
  }
  if (entry.approvedBy && entry.status === "production" && !entry.reviewedAt) {
    errors.push(`${label}: production approval requires reviewedAt`);
  }
}

if (errors.length) {
  console.error("LLG_PLUGIN_REGISTRY=FAIL");
  console.error(`ENTRIES=${registry.entries?.length ?? 0}`);
  console.error(`REQUIRED_FIELDS=${required?.length ?? 0}`);
  for (const error of errors) console.error("-", error);
  process.exit(1);
}

console.log("LLG_PLUGIN_REGISTRY=PASS");
console.log(`ENTRIES=${registry.entries.length}`);
console.log(`REQUIRED_FIELDS=${required.length}`);
