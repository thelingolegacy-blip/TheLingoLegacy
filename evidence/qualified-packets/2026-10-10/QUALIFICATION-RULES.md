# Evidence Qualification Rules

Every packet must record gate ID, scope, UTC capture time, collector/tool, immutable source ref and commit, run/job/runner IDs where applicable, raw artifact reference, SHA-256 digest, collection method, expected predicate, observed result, limitations/redactions, and independent reviewer role/identity/timestamp/decision.

Qualification dimensions: authenticity, integrity, completeness, scope, correlation, and independent verification.

Status meanings: PASS = all predicates evidenced and independently accepted; FAIL = observed predicate contradicts requirements; BLOCKED = prerequisite prevents execution; UNKNOWN = insufficient observation; RECORDED_PASS_NOT_REVERIFIED = historical only.

Missing evidence is not a pass. Runner ID 0, empty runner name, null/empty steps, unavailable logs, and empty artifact inventories cannot be upgraded to PASS. Workflow files, source code, proposals, and templates are not runtime evidence. Never fabricate timestamps, outputs, signatures, checksums, or identities.
