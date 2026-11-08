/**
 * LINGO AI Master — dependency-free evidence package validator.
 *
 * Validates the required shape and high-risk fields from
 * docs/ai-master/EVIDENCE_PACKAGE_SCHEMA.json. It does not certify truth,
 * provenance, signatures, or independent acceptance of the supplied evidence.
 */

const DISPOSITIONS = new Set(["PASS", "FAIL", "BLOCKED", "NOT_RUN", "UNVERIFIED"]);
const SHA256 = /^[a-fA-F0-9]{64}$/;
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

export function validateEvidencePackage(pkg) {
  const errors = [];
  if (!isObject(pkg)) {
    return { valid: false, errors: ["package must be an object"] };
  }

  const required = [
    "package_id", "work_package_id", "disposition", "created_at_utc",
    "repository", "environment", "authorization", "execution",
    "verification", "rollback",
  ];
  for (const key of required) {
    if (!(key in pkg)) errors.push(`missing required field: ${key}`);
  }

  if (!isNonEmptyString(pkg.package_id)) errors.push("package_id must be a non-empty string");
  if (!isNonEmptyString(pkg.work_package_id)) errors.push("work_package_id must be a non-empty string");
  if (!DISPOSITIONS.has(pkg.disposition)) errors.push("disposition is invalid");

  if (!isNonEmptyString(pkg.created_at_utc) || Number.isNaN(Date.parse(pkg.created_at_utc)) || !/(Z|[+-]\d{2}:\d{2})$/.test(pkg.created_at_utc)) {
    errors.push("created_at_utc must be an ISO-8601 timestamp with timezone");
  }

  if (!isObject(pkg.repository)) {
    errors.push("repository must be an object");
  } else {
    for (const key of ["full_name", "branch", "commit_sha"]) {
      if (!isNonEmptyString(pkg.repository[key])) errors.push(`repository.${key} must be a non-empty string`);
    }
  }

  if (!isNonEmptyString(pkg.environment)) errors.push("environment must be a non-empty string");

  if (!isObject(pkg.authorization)) {
    errors.push("authorization must be an object");
  } else {
    for (const key of ["scope", "actor"]) {
      if (!isNonEmptyString(pkg.authorization[key])) errors.push(`authorization.${key} must be a non-empty string`);
    }
    if ("approval_reference" in pkg.authorization && pkg.authorization.approval_reference !== null && typeof pkg.authorization.approval_reference !== "string") {
      errors.push("authorization.approval_reference must be a string or null");
    }
  }

  if (!isObject(pkg.execution)) {
    errors.push("execution must be an object");
  } else {
    if (!Array.isArray(pkg.execution.actions) || pkg.execution.actions.some((item) => typeof item !== "string")) {
      errors.push("execution.actions must be an array of strings");
    }
    if (!isNonEmptyString(pkg.execution.result)) errors.push("execution.result must be a non-empty string");
    if ("exit_code" in pkg.execution && pkg.execution.exit_code !== null && !Number.isInteger(pkg.execution.exit_code)) {
      errors.push("execution.exit_code must be an integer or null");
    }
    for (const key of ["log_references", "artifact_references"]) {
      if (key in pkg.execution && (!Array.isArray(pkg.execution[key]) || pkg.execution[key].some((item) => typeof item !== "string"))) {
        errors.push(`execution.${key} must be an array of strings`);
      }
    }
    if ("artifacts" in pkg.execution) {
      if (!Array.isArray(pkg.execution.artifacts)) {
        errors.push("execution.artifacts must be an array");
      } else {
        pkg.execution.artifacts.forEach((artifact, index) => {
          if (!isObject(artifact)) {
            errors.push(`execution.artifacts[${index}] must be an object`);
          } else {
            if (!isNonEmptyString(artifact.path_or_uri)) errors.push(`execution.artifacts[${index}].path_or_uri is required`);
            if (typeof artifact.sha256 !== "string" || !SHA256.test(artifact.sha256)) {
              errors.push(`execution.artifacts[${index}].sha256 must be a 64-character hexadecimal digest`);
            }
          }
        });
      }
    }
  }

  if (!isObject(pkg.verification)) {
    errors.push("verification must be an object");
  } else {
    if (typeof pkg.verification.independent !== "boolean") errors.push("verification.independent must be boolean");
    if (!isNonEmptyString(pkg.verification.result)) errors.push("verification.result must be a non-empty string");
    if ("verifier" in pkg.verification && typeof pkg.verification.verifier !== "string") errors.push("verification.verifier must be a string");
    if ("checks" in pkg.verification && (!Array.isArray(pkg.verification.checks) || pkg.verification.checks.some((item) => typeof item !== "string"))) {
      errors.push("verification.checks must be an array of strings");
    }
  }

  if (!isObject(pkg.rollback)) {
    errors.push("rollback must be an object");
  } else {
    if (typeof pkg.rollback.required !== "boolean") errors.push("rollback.required must be boolean");
    if (!isNonEmptyString(pkg.rollback.procedure)) errors.push("rollback.procedure must be a non-empty string");
  }

  if ("blockers" in pkg && (!Array.isArray(pkg.blockers) || pkg.blockers.some((item) => typeof item !== "string"))) {
    errors.push("blockers must be an array of strings");
  }
  if ("notes" in pkg && typeof pkg.notes !== "string") errors.push("notes must be a string");

  return { valid: errors.length === 0, errors };
}
