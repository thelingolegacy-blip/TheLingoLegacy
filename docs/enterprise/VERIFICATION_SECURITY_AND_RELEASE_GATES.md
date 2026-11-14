# LINGO Legacy Verification, Security & Release Gates

Version 1.0.0 | Fail-closed control specification.

## Verification doctrine
Configuration is not execution. A green badge is not evidence. A successful build is not release acceptance. HTTP 200 is not business-function proof. Production activation requires independent evidence and explicit authorization.

## G00–G11
| Gate | Scope | Required evidence |
|---|---|---|
| G00 | Product identity/scope | Canonical registry, owner, target environment |
| G01 | Architecture/requirements | Approved diagrams, contracts, dependency inventory, ADRs |
| G02 | CI runner/execution | runner_id > 0, exact runner name/labels, completed jobs/steps, logs, sentinel artifact, host telemetry, commit/run correlation |
| G03 | Reproducible build | Pinned toolchain, build logs, artifact digest, repeatability |
| G04 | Functional/integration QA | Unit, integration, E2E and regression |
| G05 | Security/privacy | Secret scan, dependency/SBOM, authZ, threat model, privacy/abuse review |
| G06 | Data integrity/recovery | Migration review, backup evidence, restore drill, retention |
| G07 | Performance/scale | Load profile, latency/error budgets, resource limits |
| G08 | Accessibility/compatibility | WCAG-aligned audit, device/browser matrix, responsive tests |
| G09 | Operations/support | Health probes, logs, metrics, alerts, owner, runbooks |
| G10 | Independent acceptance | Reviewer identity, evidence references, risk disposition |
| G11 | Controlled activation | Explicit authorization, release manifest, rollback, post-deploy probes |

No downstream gate can manufacture missing upstream evidence.

## G02 runner acceptance
Expected dedicated runner: lingo-legacy-g02. Labels: self-hosted, linux, x64, lingo-g02. Service unit: actions.runner.lingo-legacy-g02.service. Acceptance requires runner ID > 0, non-empty runner name, exact labels, separate hosted smoke, instantiated jobs, completed steps, retrievable logs, artifact upload/download, correlation to repository/commit/workflow/job/attempt, and independently captured host telemetry. No duplicate registration or runner activity until token exposure and registration state are reconciled.

## Evidence manifest
Record change_id, actor, authorization reference, UTC timestamp, repo/branch/commit, environment/resource IDs, change type, before/after snapshots, source/artifact SHA-256, test run/job/artifact URIs, reviewer, acceptance decision, rollback and post-change probes. Never record secret values; use provider references only.

## Security baseline
MFA; least privilege; access recertification; secrets manager; secret scanning; dependency pinning; SBOM/license/vulnerability scanning; CSP/HSTS/secure cookies/CSRF/CORS; input validation/output encoding; rate limits; encryption; data minimization/retention/deletion/export; redacted audit logs; encrypted access-controlled backups; incident response.

## Safety baseline
Digital: protect against destructive automation, unauthorized access, unsafe content, payment misuse, privacy leakage, prompt injection, supply-chain compromise and runaway cost.
Physical: identify hazards, isolate work area, use licensed trades and permits, follow manufacturer and electrical/building/fire codes, apply lockout/tagout where required, never bypass interlocks/protective devices/grounding, obtain inspections/commissioning sign-off, preserve as-built drawings and manuals. Agents must not direct unqualified users to open energized equipment, rewire circuits, bypass safeguards or perform permit-required work.

## Production promotion
Blocked until G00–G11 are accepted with fresh evidence; route precedence reconciled; exact-root and catch-all tested independently; bindings/dependencies verified; payments disabled unless accepted end-to-end; Firebase verified or disabled; security/privacy/accessibility/performance reviews pass; rollback rehearsed; independent review accepted; authorized release owner approves.

## Rollback
Declare incident; stop changes; capture UTC and resource state; compare deployed versions/routes/bindings/artifacts; execute approved rollback; verify root/deep routes/APIs/auth/data/payment-disabled behavior; preserve logs/hashes; communicate impact; complete RCA and corrective actions.

## Acceptance record
Release ID; product/surface; environment; commit/artifact digest; G00–G11 results; evidence references; security/privacy/accessibility review; backup/rollback; open risks; reviewer; explicit authorization; post-deploy probes; final state BLOCKED / VERIFIED / ACCEPTED / PRODUCTION.
