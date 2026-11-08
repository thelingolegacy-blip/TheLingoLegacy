# LINGO AI Master — Read-only Diagnostic Runbook

## Objective
Generate a reproducible, source-backed snapshot of the ecosystem against Master Recovery #480 without changing production, credentials, billing, DNS, Workers, runner registrations, or release state.

## Required inventory
1. Repository default branch, latest commit, branch protection and required checks.
2. Open recovery issues and pull requests, including dependencies and merge state.
3. Build/test workflows and most recent run/job/runner evidence.
4. Cloudflare Worker names, routes, active versions, staging/production boundary and health probes.
5. Firebase project IDs, registered app IDs and placeholder detection; never print secret values.
6. AppDeploy app inventory, credit status and runtime/source provenance where accessible.
7. AI Master registry, router, provider adapter and permission implementation status.
8. Product registry and per-product acceptance evidence.
9. Monitoring, alerts, backup and rollback evidence.

## Diagnostic rules
- Record source URL/ref, retrieval timestamp in UTC and commit SHA.
- Distinguish current live reads from repository documentation and prior snapshots.
- Preserve raw outputs where permitted; redact secrets and personal data.
- Hash retained artifacts with SHA-256.
- A provider status or old screenshot is not a runtime acceptance test.
- A staging result is not production proof.
- If a connector cannot read an endpoint, mark it BLOCKED or UNVERIFIED; do not infer its state.

## Required output
- Executive status and production disposition.
- Inventory table with PASS/FAIL/BLOCKED/NOT RUN/UNVERIFIED.
- Critical blockers with exact issue/PR references.
- Dependency graph and parallel work packages.
- Evidence package for each executed diagnostic.
- Safe next actions, owners and approval requirements.

## First diagnostic command
"Run a full read-only LINGO system health check against Master Recovery #480. Inspect canonical GitHub source, recovery issues and pull requests, CI evidence, Cloudflare and authorized staging metadata, Firebase configuration without exposing secrets, AppDeploy inventory and AI Master bootstrap files. Produce a prioritized blocker register, dependency map and Evidence Package. Do not mutate production, billing, DNS, Workers, credentials, runner registrations, workflows or release state. Report unavailable data as UNVERIFIED."

## Initial baseline from Master Recovery #480
- Production: HOLD; last-known-good protected.
- G02: NO-GO / UNVERIFIED.
- Universe Gateway: BLOCKED by route/chunk failures.
- Studio Hub and Enterprise Control Center: preview health only; functional acceptance pending.
- askLINGO: provider credentials, model calls, auth and telemetry unverified.
- Firebase/Flutter: blocked on project identity and configuration.
- LINGOloyalty: wallet, ledger and provider integration unverified.
- That’s My Lingo: virtual-credit demo only; no real-money wagering, redemption or sweepstakes activation.
- AppDeploy: credits reported exhausted; no billing/top-up action performed.
