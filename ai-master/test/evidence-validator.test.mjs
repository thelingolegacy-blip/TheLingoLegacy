import test from "node:test";
import assert from "node:assert/strict";
import { validateEvidencePackage } from "../src/evidence-validator.mjs";

const validPackage = () => ({
  package_id: "evidence-ai-006-001",
  work_package_id: "AI-006",
  disposition: "PASS",
  created_at_utc: "2026-11-06T13:00:00.000Z",
  repository: {
    full_name: "thelingolegacy-blip/TheLingoLegacy",
    branch: "ai-master/bootstrap-phase0-1-2026-11-06",
    commit_sha: "a".repeat(40),
  },
  environment: "isolated-local-test",
  authorization: { scope: "local-unit-test", actor: "developer", approval_reference: null },
  execution: {
    actions: ["node --test ai-master/test/evidence-validator.test.mjs"],
    result: "All tests passed",
    exit_code: 0,
    log_references: ["local-test-run"],
    artifact_references: [],
    artifacts: [{ path_or_uri: "router.mjs", sha256: "b".repeat(64) }],
  },
  verification: {
    independent: false,
    verifier: "pending",
    result: "Local structural validation only",
    checks: ["schema-shape"],
  },
  rollback: { required: false, procedure: "No runtime state changed." },
  blockers: [],
  notes: "Test fixture only.",
});

test("accepts a complete evidence package", () => {
  const result = validateEvidencePackage(validPackage());
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("rejects null, arrays and primitive values", () => {
  assert.equal(validateEvidencePackage(null).valid, false);
  assert.equal(validateEvidencePackage([]).valid, false);
  assert.equal(validateEvidencePackage("package").valid, false);
});

test("reports missing required fields", () => {
  const result = validateEvidencePackage({ package_id: "x" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((item) => item.includes("work_package_id")));
  assert.ok(result.errors.some((item) => item.includes("verification")));
});

test("rejects unsupported dispositions", () => {
  const pkg = validPackage();
  pkg.disposition = "DONE";
  assert.ok(validateEvidencePackage(pkg).errors.includes("disposition is invalid"));
});

test("requires timezone-qualified ISO timestamps", () => {
  const pkg = validPackage();
  pkg.created_at_utc = "2026-11-06 13:00";
  assert.ok(validateEvidencePackage(pkg).errors.includes("created_at_utc must be an ISO-8601 timestamp with timezone"));
});

test("requires repository identity and commit", () => {
  const pkg = validPackage();
  pkg.repository.commit_sha = "";
  assert.ok(validateEvidencePackage(pkg).errors.includes("repository.commit_sha must be a non-empty string"));
});

test("requires exact SHA-256 format for evidence artifacts", () => {
  const pkg = validPackage();
  pkg.execution.artifacts[0].sha256 = "not-a-hash";
  assert.ok(validateEvidencePackage(pkg).errors.some((item) => item.includes(".sha256")));
});

test("requires typed execution, verification and rollback fields", () => {
  const pkg = validPackage();
  pkg.execution.actions = "not-an-array";
  pkg.verification.independent = "yes";
  pkg.rollback.required = "no";
  const errors = validateEvidencePackage(pkg).errors;
  assert.ok(errors.some((item) => item.includes("execution.actions")));
  assert.ok(errors.some((item) => item.includes("verification.independent")));
  assert.ok(errors.some((item) => item.includes("rollback.required")));
});

test("does not equate a valid structure with independent acceptance", () => {
  const pkg = validPackage();
  const result = validateEvidencePackage(pkg);
  assert.equal(result.valid, true);
  assert.equal(pkg.verification.independent, false);
  assert.match(pkg.verification.result, /Local structural validation only/);
});
