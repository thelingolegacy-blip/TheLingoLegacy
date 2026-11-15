# ADR-0005: Environments and release governance

**Status:** PROPOSED  
**Date:** 2026-11-15

## Context
The greenfield foundation must be built without disrupting existing production services or bypassing established release protections.

## Proposal
- Separate local, CI, development, staging and production environments with distinct identities, credentials, data and infrastructure state.
- CI uses GitHub-hosted runners by default; protected G02 is not a fallback.
- IaC state is encrypted, access-controlled, backed up and isolated by environment.
- Pull requests run formatting, lint, unit, integration, security, build and artifact checks.
- Deployment is a separate protected workflow requiring explicit environment approval and provenance.
- Release evidence links source commit, workflow run, jobs, artifacts, SBOM, approvals, migration status and rollback.
- Production promotion is not implied by successful CI or a merged PR.
- Cost approval is required before paid resources or recurring commitments.

## Consequences
The Control Plane may report deployment and release state but cannot silently promote production. Existing last-known-good remains protected until a separately approved migration and rollback rehearsal.

## Acceptance
Environment isolation tests, branch/release policy review, least-privilege credentials, artifact provenance, backup/restore and approved go/no-go record.
