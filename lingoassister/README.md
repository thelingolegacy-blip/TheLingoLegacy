# LINGOassister Fix Engine — Phase 1

**Mission:** Convert complicated engineering incidents into controlled, verifiable repair workflows.

This folder introduces the first deterministic core for incident state, evidence, diagnostic de-duplication, authorization gates, acceptance checks, and G02 predicate evaluation. It is an implementation foundation, not a claim that the full assistant, durable backend, or production integration is deployed.

## Implemented in this phase

- Incident record contract with explicit state.
- Evidence records with source, timestamp, correlation key, digest, result, and independent-verification flag.
- Finding classes: `CONFIRMED`, `LIKELY`, `UNKNOWN`, and `EXTERNAL_BLOCKER`.
- Confirmed root causes must reference evidence already attached to the incident.
- Diagnostic repetition is suppressed when the diagnostic key and context fingerprint have not changed.
- Production-impacting actions require explicit authorization metadata.
- Transition into execution requires a matching recorded approval.
- Acceptance and G02 evaluators fail closed.
- Recommendation selection skips repeated diagnostics and unavailable external actions.

## Run tests

Requires Node.js with the built-in test runner:

```sh
node --test lingoassister/repair-engine.test.mjs
```

No third-party package is required for the engine or its tests.

## Incident lifecycle

```text
INVESTIGATING → DIAGNOSED → PLANNED → AWAITING_AUTHORIZATION
   → EXECUTING → TESTING → VERIFYING → VERIFIED
```

Any missing evidence or unavailable required capability may result in `BLOCKED`. A blocked incident can return to investigation only when new evidence or access changes the situation. Failed or blocked status never implies production promotion.

## G02 first acceptance scenario

The known G02 observations include queued/unassigned jobs, `runner_id = 0`, and absent instantiated steps/logs in recorded attempts. These observations establish a dispatch failure, not its root cause.

The G02 evaluator requires all of the following before it reports its gate as PASS:

- positive runner ID;
- populated runner name;
- assigned job;
- instantiated steps;
- passing sentinel;
- retrievable logs;
- retrievable evidence artifact;
- verified run/job/commit correlation;
- independent verification.

The evaluator's PASS means only that the supplied predicate values are complete. The caller must authenticate their provenance, freshness, and source before supplying them. **This module never authorizes production promotion.** Existing production release gates remain authoritative.

## Security and execution boundary

This module is pure logic. It does not:
- run commands or scripts;
- connect to GitHub, Cloudflare, Firebase, or a runner host;
- store secrets or credentials;
- deploy, merge, restart, register, or delete infrastructure;
- provide durable persistence by itself;
- treat user-supplied claims as independently verified evidence.

Integrations must provide authenticated adapters, authorization enforcement, durable audit storage, evidence provenance checks, and independently reviewable test output. Do not add credentials to repository files.

## Next implementation gates

1. **G01 — Core tests:** Node test suite passes and the diff is reviewed.
2. **G02 — Durable incident store:** Add a least-privilege persistence adapter with append-only event history, schema validation, and retention policy.
3. **G03 — Evidence adapters:** Read-only GitHub workflow/run/job/artifact collection; every observation records source, timestamp, run/attempt/job/commit correlation, and retrieval status.
4. **G04 — Authorized action adapter:** Plan-only by default; explicit approval required for side effects; no production actions while production is locked.
5. **G05 — Command Center:** Build a phone-first view over persisted incidents and evidence, not a separate source of truth.

Do not duplicate or bypass existing G02 recovery, deployment authorization, observability, or production-gate work. Integrate with those existing contracts after review.
