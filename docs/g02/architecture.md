# LINGO Legacy G02 Runner Recovery Architecture

**Mode:** design/evidence scaffolding only  
**Authority:** fail-closed; production protected; last-known-good (LKG) protected  
**As of:** 2026-10-10

## Purpose

Establish a traceable, auditable contract for runner identity, host telemetry, sentinel execution, evidence packets, and correlation. This architecture does not provision hosts, register runners, dispatch workflows, restart services, change access controls, deploy, or promote production.

## System boundaries

1. **GitHub control plane** — workflow run, attempt, job, commit, repository, runner assignment, step summaries, artifact metadata, and raw logs when available.
2. **Authorized Linux host** — operator-collected host identity, runner configuration presence, daemon/service/process state, connectivity diagnostics, and bounded redacted logs. This session cannot directly inspect or operate the private host.
3. **Sentinel** — a bounded, non-mutating execution that records run/job/attempt/commit/runner identity and exits nonzero when required assertions fail.
4. **Evidence vault** — immutable packet files, source timestamps, hashes, collection method, and verification records. Never store tokens, private keys, registration secrets, or unredacted environment dumps.
5. **Correlation verifier** — joins Packet A (host/runner identity) with Packet B (workflow execution) using runner name/ID, repository, workflow/run/attempt/job IDs, commit SHA, and UTC timestamps.
6. **Gate controller** — computes P1–P9 as PASS / FAIL / UNKNOWN. UNKNOWN is not PASS. No downstream authorization is inherited.

## Evidence packets

- **Packet A — Host & Runner Identity:** operator-collected host telemetry, runner installation/configuration indicators, service/process state, runner name and labels, collection timestamp, source identity, and SHA-256 manifest.
- **Packet B — Sentinel Execution & Platform Correlation:** GitHub run/job/attempt, commit SHA, runner assignment, instantiated steps, sentinel exit code, log/artifact references, timestamps, and source API responses.
- Packets must be linked by a correlation ID and cross-referenced hashes. Packet A alone cannot prove job assignment; Packet B alone cannot prove the host's independent identity and service state.

## Acceptance predicates (conjunctive)

- P1 real matching runner independently identified.
- P2 runner ID is numeric and greater than zero.
- P3 runner name exactly matches `lingo-legacy-g02`.
- P4 job is assigned to that runner.
- P5 job steps are instantiated.
- P6 sentinel executed and exited 0.
- P7 raw execution logs exist.
- P8 logs and required artifacts are retrievable and hash-verifiable.
- P9 independent correlation/verification confirms repository, workflow, run attempt, job, commit, runner, and timestamps.

**G02 PASS iff every predicate P1–P9 is TRUE.** Any FALSE or UNKNOWN keeps G02 BLOCKED. A host diagnostic PASS is not a G02 PASS.

## State and promotion

`DESIGN_ONLY → COLLECTING → CORRELATING → VERIFYING → ACCEPTED`  
Failure or missing evidence routes to `BLOCKED`; contradictory/tampered evidence routes to `REJECTED`. Only separately authorized governance may promote an accepted G02 packet. No automated promotion is implemented here.

## Security rules

- Default read-only. No automatic runner registration, service restart, workflow dispatch, deployment, merge, DNS/Worker mutation, or production activation.
- Never emit registration tokens, secrets, private keys, full environment variables, or unredacted logs.
- Treat runner labels as routing metadata, not authentication.
- Validate all source timestamps in UTC and preserve raw source responses where safe.
- Hash every packet file and manifest; record collection tool/version and collector identity.
- Do not convert unavailable logs, empty step arrays, runner_id=0, or missing artifacts into success.
