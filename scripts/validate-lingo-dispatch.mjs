#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const SEVERITIES = new Set(["SEV0", "SEV1", "SEV2", "SEV3"]);
const EXPECTED_SEVERITIES = ["SEV0", "SEV1", "SEV2", "SEV3"];
const SAFE_AUTO_ACTIONS = new Set([
  "read-only-health-check",
  "preserve-evidence",
  "synthetic-probe",
  "open-incident-record",
  "preview-test",
  "create-tracking-issue",
  "static-analysis",
  "documentation-check",
]);
const REQUIRED_APPROVAL_GATES = [
  "production-release",
  "dns-change",
  "worker-promotion",
  "identity-provider-change",
  "credential-rotation",
  "production-database-migration",
  "restore-or-data-repair",
  "payment-activation",
  "wallet-ledger-mutation",
  "sweepstakes-activation",
  "G02-runner-activation",
  "destructive-infrastructure",
];
const STARTUP_FAILURE_FORBIDDEN = [
  "activate G02",
  "pretend test failure",
  "rerun indefinitely",
];
const file = process.argv[2] ?? "config/lingo-dispatch-routes.v1.json";
const errors = [];
let routes;
try {
  routes = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
} catch (error) {
  console.error("Dispatch route JSON could not be read:", error.message);
  process.exit(1);
}

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
const nonEmptyStringArray = (value) => Array.isArray(value) && value.length > 0 && value.every(nonEmpty);

if (!isObject(routes)) {
  console.error("Dispatch route root must be a JSON object");
  process.exit(1);
}

for (const key of ["schema_version", "authority", "mode", "dispatch_defaults", "severity_routes", "triggers", "approval_gates"]) {
  if (!(key in routes)) errors.push("Missing top-level field: " + key);
}
if (routes.schema_version !== "1.0.0") errors.push("Unsupported dispatch schema_version");
if (routes.authority !== "LINGOlegacy_MASTER") errors.push("Unexpected dispatch authority");
if (!nonEmpty(routes.mode) || !routes.mode.includes("design-only") || !routes.mode.includes("owner-approval")) {
  errors.push("Dispatch mode must remain design-only until trigger provisioning and owner approval");
}

const defaults = routes.dispatch_defaults;
if (!isObject(defaults)) {
  errors.push("dispatch_defaults must be an object");
} else {
  if (!Number.isInteger(defaults.retry_max) || defaults.retry_max < 0 || defaults.retry_max > 5) {
    errors.push("retry_max must be an integer from 0 through 5");
  }
  if (!Array.isArray(defaults.backoff_seconds) || defaults.backoff_seconds.length === 0 ||
      !defaults.backoff_seconds.every(Number.isInteger) || defaults.backoff_seconds.some((n) => n <= 0) ||
      defaults.backoff_seconds.some((n, i, a) => i > 0 && n <= a[i - 1])) {
    errors.push("backoff_seconds must contain strictly increasing positive integers");
  }
  if (!Number.isInteger(defaults.dedupe_window_seconds) || defaults.dedupe_window_seconds <= 0) {
    errors.push("dedupe_window_seconds must be a positive integer");
  }
  if (defaults.include_secrets !== false) errors.push("dispatch defaults must exclude secrets");
  if (defaults.include_raw_pii !== false) errors.push("dispatch defaults must exclude raw PII");
}

const severityRoutes = routes.severity_routes;
if (!isObject(severityRoutes)) {
  errors.push("severity_routes must be an object");
} else {
  const keys = Object.keys(severityRoutes).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...EXPECTED_SEVERITIES].sort())) {
    errors.push("severity_routes must define exactly SEV0, SEV1, SEV2 and SEV3");
  }
  for (const severity of EXPECTED_SEVERITIES) {
    const route = severityRoutes[severity];
    if (!isObject(route)) {
      errors.push("Missing severity route: " + severity);
      continue;
    }
    if (!nonEmpty(route.owner)) errors.push(severity + " owner must be non-empty");
    if (!nonEmpty(route.acknowledgement)) errors.push(severity + " acknowledgement must be non-empty");
    if (!nonEmptyStringArray(route.auto_actions)) errors.push(severity + " auto_actions must be a non-empty string array");
    else {
      if (new Set(route.auto_actions).size !== route.auto_actions.length) errors.push(severity + " auto_actions must be unique");
      for (const action of route.auto_actions) {
        if (!SAFE_AUTO_ACTIONS.has(action)) errors.push(severity + " contains an unapproved automatic action: " + action);
      }
    }
    if (!nonEmptyStringArray(route.approval_required)) errors.push(severity + " approval_required must be a non-empty string array");
    else {
      const required = severity === "SEV0" ? "all-mutations" : "production-mutation";
      if (!route.approval_required.includes(required)) errors.push(severity + " must require approval for " + required);
    }
  }
}

if (!Array.isArray(routes.triggers) || routes.triggers.length === 0) {
  errors.push("triggers must be a non-empty array");
}
const triggers = Array.isArray(routes.triggers) ? routes.triggers : [];
const eventIds = new Set();
for (const trigger of triggers) {
  if (!isObject(trigger)) {
    errors.push("Each trigger must be an object");
    continue;
  }
  for (const key of ["event", "severity", "route", "when", "action", "forbidden"]) {
    if (!(key in trigger)) errors.push("Trigger is missing " + key);
  }
  if (!nonEmpty(trigger.event) || !/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/.test(trigger.event)) {
    errors.push("Trigger event must be a lowercase dotted identifier: " + String(trigger.event));
  }
  if (eventIds.has(trigger.event)) errors.push("Duplicate trigger event: " + trigger.event);
  eventIds.add(trigger.event);
  if (!SEVERITIES.has(trigger.severity)) errors.push("Unsupported trigger severity: " + String(trigger.severity));
  if (!nonEmpty(trigger.route)) errors.push("Trigger route must be non-empty: " + String(trigger.event));
  if (!nonEmpty(trigger.when)) errors.push("Trigger condition must be non-empty: " + String(trigger.event));
  if (!nonEmpty(trigger.action)) errors.push("Trigger action must be non-empty: " + String(trigger.event));
  if (!nonEmptyStringArray(trigger.forbidden)) errors.push("Trigger forbidden actions must be a non-empty string array: " + String(trigger.event));
}

const startup = triggers.find((trigger) => trigger?.event === "github.workflow.startup_failure");
if (!startup) {
  errors.push("Missing github.workflow.startup_failure trigger");
} else {
  if (startup.severity !== "SEV1") errors.push("GitHub startup failure must route as SEV1");
  if (startup.route !== "ci-recovery") errors.push("GitHub startup failure must route to ci-recovery");
  for (const phrase of ["run id", "commit", "runner metadata", "preserve last-known-good"]) {
    if (!startup.action?.toLowerCase().includes(phrase)) errors.push("GitHub startup failure action must include: " + phrase);
  }
  for (const forbidden of STARTUP_FAILURE_FORBIDDEN) {
    if (!startup.forbidden?.includes(forbidden)) errors.push("GitHub startup failure must forbid: " + forbidden);
  }
}

if (!Array.isArray(routes.approval_gates) || routes.approval_gates.length === 0) {
  errors.push("approval_gates must be a non-empty array");
} else {
  if (!routes.approval_gates.every(nonEmpty)) errors.push("approval_gates must contain only non-empty strings");
  if (new Set(routes.approval_gates).size !== routes.approval_gates.length) errors.push("approval_gates must be unique");
  for (const gate of REQUIRED_APPROVAL_GATES) {
    if (!routes.approval_gates.includes(gate)) errors.push("Missing required approval gate: " + gate);
  }
}

if (errors.length) {
  console.error("LINGO dispatch route validation FAILED");
  for (const error of errors) console.error("- " + error);
  process.exit(1);
}
console.log("LINGO dispatch route validation PASSED");
console.log("Triggers:", triggers.length);
console.log("Approval gates:", routes.approval_gates.length);
console.log("Mode:", routes.mode);
