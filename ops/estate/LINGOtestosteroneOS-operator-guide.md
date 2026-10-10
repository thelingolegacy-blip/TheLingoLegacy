# LINGOtestosteroneOS — Rules, Settings, Tools, Backups, and Safe Access

**Mode:** FAIL-CLOSED / PRODUCTION PROTECTED  
**Policy source:** `ops/estate/lingotestosteroneos-control-plane.json`  
**Status:** PROPOSED ON ISOLATED BRANCH; not applied to GitHub or production.

## Quick access

- **Control policy:** `ops/estate/lingotestosteroneos-control-plane.json`
- **Agent boundaries:** `ops/estate/agents/agent-boundaries.md`
- **G02 diagnostics:** `ops/estate/diagnostics/README.md`
- **Evidence verifier:** `ops/estate/diagnostics/verify-g02-evidence.sh`
- **Runner host instructions:** `ops/estate/linux/README.md`
- **Assignment matrix:** `ops/estate/assignments/runner-ci-production-activation.md`
- **Independent owner charter:** `ops/estate/assignments/independent-owner-charter.md`
- **Activation registry:** `ops/estate/activation-registry.json`
- **Proposed branch rules:** `ops/estate/ruleset-policy.json`

## Operating rules

1. Read and inspect first; prefer read-only diagnostics and dry runs.
2. Every privileged action must record action, reason, authority reference, input state, planned change, result, verification, and decision.
3. Apply least privilege. Separate host operator, workflow maintainer, evidence verifier, independent owner, and release approver.
4. Do not run untrusted fork code on the self-hosted runner. Do not put production secrets on the runner.
5. Do not apply branch rules until required-check names are backed by real successful runs. Do not enable bypass actors.
6. Never use synthetic evidence or dummy commits to make a gate appear green.
7. Repairs must be bounded and deterministic. A failed repair halts and escalates; it does not authorize promotion.

## Safe access pattern

- Use named roles and short-lived, scoped credentials supplied by the approved secret manager.
- Keep credentials out of source, logs, manifests, screenshots, and artifacts.
- Require explicit authorization references for runner sentinels and separate human approval for merge, deployment, activation, DNS/Worker changes, ruleset changes, and credential-scope changes.
- Unknown, missing, conflicting, expired, or unverifiable data means BLOCK.
- The connected tooling may inspect repository state but does not itself prove that a host is provisioned or a runner is online and assigned.

## Backup and restore

Back up source-control references, non-secret configuration, controlled-run evidence, and recovery instructions. Encrypt backups and restrict access. Store them outside the primary failure domain when supported.

Never back up secrets by copying plaintext into the repository. Use the secret manager's approved recovery mechanism.

A backup is not accepted merely because a file exists. Verify checksums, restore to an isolated target, validate function, preserve the test evidence, and obtain independent review. Production restore requires explicit authorization. RPO and RTO are intentionally unset until an authorized owner approves service-specific objectives.

## Current fail-safe state

- Production mutation frozen: **YES**
- Last-known-good protected: **YES**
- Deployment mutex: **LOCKED**
- Auto-merge / auto-deploy / auto-activation: **DISABLED**
- G02: **FAIL / BLOCKED**
- G03–G11: **BLOCKED**
- Actual human accountable owner: **PENDING**
- Backup restore test: **NOT VERIFIED**
- Ruleset application: **NOT APPLIED**

## Change and release discipline

This guide and its JSON policy are configuration proposals in an isolated branch. Review them through the normal pull-request process. Applying settings in GitHub, changing credentials, running a restore, registering a runner, or activating production is a separate privileged operation and requires its own authorization and evidence.
