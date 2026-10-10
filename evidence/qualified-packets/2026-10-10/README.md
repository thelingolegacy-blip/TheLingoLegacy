# Qualified Evidence Packets — 2026-10-10

Repository: `thelingolegacy-blip/TheLingoLegacy`  
Branch: `infra/g02-runner-agents-diagnostics-2026-10-10`  
Governance: **FAIL-CLOSED** · production mutation freeze **ACTIVE** · last-known-good **PROTECTED**.

These folders are real repository evidence-intake packets. They do not themselves prove that a gate passed. Templates, source files, workflow definitions, and missing fields are not runtime evidence.

## Evidence chain
SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION.

## Gate packets
- G00 Source authority — historical status requires re-verification.
- G01 Repository integrity — historical status requires re-verification.
- G02 Runner dispatch — FAIL/BLOCKED; raw host evidence and successful runner execution are missing.
- G03 CI execution — BLOCKED.
- G04 Certification — BLOCKED.
- G05 Release candidate — BLOCKED.
- G06 Deployment — BLOCKED.
- G07 Live validation — BLOCKED.
- G08 Synchronization — BLOCKED.
- G09 Activation — BLOCKED.
- G10 Post-activation — BLOCKED.
- G11 Acceptance — BLOCKED.

See `manifest.json`, `QUALIFICATION-RULES.md`, `observations/github-actions-runs-2026-10-10.json`, and each gate's `packet.json`.

## G02 intake helpers
- `G02/INTAKE.md` — how to collect actual host inventory and GitHub sentinel evidence.
- `ops/estate/diagnostics/capture-g02-host-evidence.sh` — read-only host telemetry collector. It does not configure services, access runner credentials, or synthesize a successful sentinel.

## Redaction and integrity
Redact tokens, passwords, private keys, runner registration tokens, authorization headers, and personal data. Preserve timestamps, error strings, labels, status, exit codes, run/job/commit identifiers, and checksums. Keep raw restricted artifacts in approved private storage and commit sanitized copies/metadata only.

**Current decision:** no merge, deployment, activation, promotion, production mutation, or gate bypass is authorized by these packets.
