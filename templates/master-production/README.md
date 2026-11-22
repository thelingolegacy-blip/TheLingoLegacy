# Master Production Ledger Templates

These CSVs are working templates for import into a spreadsheet or database. They do not replace the portfolio registry, Enterprise Completion Control Tower, EMS or LSCOI.

## Foreign-key rules
- `EntityID` must resolve to an accepted canonical entity in the portfolio registry. Until PR #511 is accepted, planning IDs are provisional.
- `WorkstreamID` should use the existing master execution router.
- `EvidenceID` should resolve to a record in `evidence-ledger.csv`.
- Never fabricate owners, evidence URLs, timestamps, approvals, asset rights or runtime status.

## Templates
- `game-build-ledger.csv`
- `asset-request-queue.csv`
- `asset-provenance-ledger.csv`
- `pipeline-register.csv`
- `timesheet.csv`
- `timeline-milestones.csv`
- `evidence-ledger.csv`

## Controlled status values
Use the existing control-tower values: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `PASS — EVIDENCE LINKED`, `ACCEPTED`. If a source system has a different vocabulary, map it explicitly rather than silently coercing it.

## Import guidance
Keep IDs as text (not numeric), preserve ISO-8601 timezone offsets, and store multiple references in a separate relationship table rather than semicolon-encoding ambiguous values. Do not put secrets or personal data in these ledgers.
