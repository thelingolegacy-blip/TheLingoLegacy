#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2] ?? "config/lingo-dispatch-routes.v1.json";
const errors = [];
let config;
try {
  config = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
} catch (error) {
  console.error("Dispatch config JSON could not be read:", error.message);
  process.exit(1);
}
for (const key of ["schema_version", "authority", "mode", "dispatch_defaults", "severity_routes", "triggers", "approval_gates"]) {
  if (!(key in config)) errors.push("Missing top-level field: " + key);
}
if (config.schema_version !== "1.0.0") errors.push("Unsupported schema_version");
if (config.authority !== "LINGOlegacy_MASTER") errors.push("Unexpected authority");
if (config.dispatch_defaults?.include_secrets !== false) errors.push("Secrets must never be included in dispatch payloads");
if (config.dispatch_defaults?.include_raw_pii !== false) errors.push("Raw PII must never be included in dispatch payloads");
if (!Number.isInteger(config.dispatch_defaults?.retry_max) || config.dispatch_defaults.retry_max < 0 || config.dispatch_defaults.retry_max > 5) errors.push("retry_max must be an integer from 0 to 5");
const events = new Set();
for (const trigger of config.triggers ?? []) {
  for (const key of ["event", "severity", "route", "when", "action", "forbidden"]) {
    if (!(key in trigger)) errors.push("Trigger missing " + key + ": " + (trigger.event ?? "unknown"));
  }
  if (events.has(trigger.event)) errors.push("Duplicate trigger event: " + trigger.event);
  events.add(trigger.event);
  if (!["SEV0", "SEV1", "SEV2", "SEV3"].includes(trigger.severity)) errors.push("Invalid severity: " + trigger.event);
  if (!Array.isArray(trigger.forbidden)) errors.push("forbidden must be an array: " + trigger.event);
}
for (const severity of ["SEV0", "SEV1", "SEV2", "SEV3"]) {
  if (!config.severity_routes?.[severity]) errors.push("Missing severity route: " + severity);
}
if (!Array.isArray(config.approval_gates) || config.approval_gates.length === 0) errors.push("approval_gates must be a non-empty array");
if (errors.length) {
  console.error("LINGO dispatch validation FAILED");
  for (const error of errors) console.error("- " + error);
  process.exit(1);
}
console.log("LINGO dispatch validation PASSED");
console.log("Triggers:", config.triggers.length);
console.log("Retry cap:", config.dispatch_defaults.retry_max);
console.log("Production mutations require approval.");
