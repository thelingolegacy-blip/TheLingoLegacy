# askLINGO v2.0 — Implementation Readiness and Blocker Register

## Verified repository baseline

At the inspected `main` source:

- `docs/ASKLINGO-AI-INTEGRATION.md` explicitly states PLANNED / NOT PRODUCTION ENABLED.
- The production Worker returns `ask_lingo: false` from `/api/v1/site/context`.
- Unknown `/api/*` routes return 404; the proposed query endpoint is not implemented in the Worker.
- `src/ai/ask-lingo-facade.mjs` authenticates a Firebase ID token and deliberately returns `ASKLINGO_DISABLED`.
- The facade has an in-memory per-isolate rate bucket; this is not a global rate limit.
- `src/auth/firebase-id-token.mjs` verifies Firebase token signatures, but the service contract reports Firebase project/app configuration as placeholders and not verified for production.
- `wrangler.jsonc` identifies the Worker entrypoint and production routes; this v2 work does not change it.
- Root `package.json` now includes `test:asklingo` and the aggregate `npm test` runs the askLINGO policy tests after the existing suites.
- `.github/workflows/asklingo-v2-policy.yml` adds a read-only hosted Ubuntu pull-request check for the repository test suite. It does not use the dedicated G02 runner and does not change G02.
- The staging sentinel workflow is intentionally disabled by an unconditional false guard while protected hold is active.

## Blockers before isolated runtime acceptance

| ID | Blocker | Required evidence | State |
|---|---|---|---|
| B01 | Staging identity provider not verified | Separate staging project/config, real token verification tests, revocation strategy | BLOCKED |
| B02 | Persistent grant/policy source not implemented | Reviewed schema, owner, read/write boundary, revocation semantics | BLOCKED |
| B03 | Persistent approval store absent | Atomic single-use consume, digest binding, expiry, revocation, separation of duties | BLOCKED |
| B04 | Durable audit sink absent | Append-only/tamper-evident storage, retention, access policy, failure tests | BLOCKED |
| B05 | No askLINGO inference provider selected | Data-processing, privacy, safety, latency, availability, cost and exit review | BLOCKED |
| B06 | No shared/global rate limit for askLINGO | Cross-isolate rate limiting and abuse tests | BLOCKED |
| B07 | No production query route | Separately reviewed server implementation and contract tests | NOT IMPLEMENTED |
| B08 | No voice provider/session broker | Provider-neutral session design and staging tests | NOT IMPLEMENTED |
| B09 | No conversation persistence policy approval | Consent, retention, deletion, age-appropriate controls and privacy review | BLOCKED / OFF |
| B10 | No independent security acceptance | Threat model, abuse cases, code review and evidence | NOT RUN |
| B11 | Hosted CI result for the v2 policy suite | Latest inspected foundation-branch runs 44968046838, 44968046027, 44968045281, 44968044464, and 44968043725 ended `startup_failure` before job creation; zero steps | BLOCKED — no hosted CI execution evidence |
| B12 | Historical voice branch contains an unsafe runtime proposal | Separate review of branch head `893f2d3974d302a672b848078c8c060916b5d6bd`; 53 ahead / 732 behind main | PRESERVED / NOT MERGEABLE AS A WHOLE |
| B13 | Full portfolio registry reconciliation | Compare routing taxonomy with the authoritative complete portfolio register | PENDING |
| B14 | Dedicated isolated staging runtime/data store not identified | Read-only Cloudflare inventory: 10 Worker scripts, no askLINGO Worker; only staging Worker is tagged read-only; four D1 databases report zero tables | BLOCKED — no suitable askLINGO staging target |

## Implemented in this branch so far

- Additive architecture and governance documentation under `docs/asklingo-v2/`.
- Canonical 13-mode registry reconciled from preserved source material.
- Voice/WebRTC architecture and legacy branch security assessment.
- Product-domain routing and provider-neutral persistence/adapter contracts.
- Read-only Cloudflare inventory confirms no dedicated askLINGO staging Worker or populated D1 target; existing Studio Control Center staging is tagged read-only and was not repurposed.
- Isolated default-deny policy primitive, deterministic action-digest / approval-snapshot validation, and strict query request validation.
- Canonical 13-mode runtime registry, explicit operating-state resolver, v2 master system prompt, and 12-agent registry with execution disabled.
- Proposed query API contract with strict request schema and no conversation ID while persistence is disabled.
- Local `node --check` on all four new runtime modules and all four test files: PASS.
- Local `npm run test:asklingo`: 29 tests passed, 0 failed.
- Latest inspected foundation-branch Actions runs 44968046838 / 046027 / 045281 / 044464 / 043725 all ended `startup_failure` with zero jobs; CI is not a pass.
- Parallel PRs #645–#647 are stacked on the foundation branch; #646 and #647 received code-review comments for digest canonicalization and delimiter-collision issues. See [parallel PR reconciliation](22-PARALLEL-PR-RECONCILIATION.md).

The local test result covers only the isolated policy primitive. It does not validate the complete repository suite, Worker integration, persistence adapters, or production security.

## Safe implementation sequence

1. Complete additive specifications and source reconciliation.
2. Add isolated, provider-neutral policy primitives and deterministic unit tests.
3. Define persistent adapter contracts and storage schema without binding production data.
4. Establish a separately configured staging identity and isolated data store.
5. Implement a staging-only API route behind a server-side disabled-by-default flag.
6. Integrate a provider only after cost, data, privacy, and security approval.
7. Add shared rate limiting, abuse controls, and durable audit.
8. Add web and Flutter clients against the same versioned API contract.
9. Implement voice through a separate reviewed realtime session broker.
10. Run independent security, privacy, functional, accessibility, and recovery acceptance.
11. Submit a release candidate for separate human authorization.

## Non-negotiable stop conditions

Do not bypass the disabled facade, change `ask_lingo: false`, alter production Worker routes/bindings, enable the sentinel, provision paid resources, persist conversations, or deploy to production as a shortcut around a blocker.

A missing staging identity, approval store, audit sink, or policy source means protected execution remains DENIED. A passing local unit test proves only the tested local primitive.


## 2026-11-22 parallel workstream reconciliation

The following stacked/parallel pull requests were inspected after the initial foundation was prepared:

| PR | Branch relationship | Scope | Observed state |
|---|---|---|---|
| #644 | base: `main` | Canonical architecture, 4 isolated v2 modules, tests, workflow, 23 askLINGO docs/index, package test wiring | OPEN / DRAFT; 33 files; 2,111 additions; 2 deletions |
| #645 | base: #644 head branch | 17-workstream execution plan | OPEN / DRAFT; 1 additive document |
| #646 | base: #645 head branch | SAAAE policy kernel and tests | OPEN / DRAFT; 4 files; local test result reported as 11/11; no hosted CI pass |
| #647 | base: #645 head branch | Agent capability registry and tests | OPEN / DRAFT; 3 files; local test result reported as 6/6; no hosted CI pass |

Do not merge these out of order. #645 is stacked on #644; #646 and #647 are parallel children of #645. The PRs remain review candidates, not accepted releases.

### Independent code-review findings

- **#646 — action-digest canonicalization:** the canonicalizer builds ordinary objects and assigns arbitrary keys. A `__proto__` property can mutate the output prototype and be omitted by JSON serialization, potentially making distinct action descriptors hash to identical canonical bytes. Add prototype-safe serialization and regression tests for top-level/nested `__proto__`; add deterministic cycle rejection. A review comment was posted (review ID `6009244396`). The PR's own documentation correctly states that approval consumption must still be atomic and server-side.
- **#647 — capability duplicate key:** joining six arbitrary scope strings with U+001F is ambiguous when a field contains that delimiter. Replace with an unambiguous tuple encoding and add a delimiter-injection regression test. A review comment was posted (review ID `6009244459`). Server-side identity attestation, tenant binding, revocation, and authoritative registry loading remain future adapter requirements.

These comments are review findings, not accepted fixes. Both PRs remain unapproved for integration until addressed and re-reviewed.

### Current hosted validation evidence

At the latest inspected foundation-branch commit, GitHub Actions run IDs `44968046838`, `44968046027`, `44968045281`, `44968044464`, and `44968043725` all completed with `startup_failure`. Each failed before a job was created; no steps or test evidence were produced. This is a repository runner/startup blocker, not a passing test result. Local test evidence remains limited to the individual reported suites; full repository `npm test` and hosted CI acceptance are still outstanding.

### Integration and release posture

No PR was merged, no branch was force-updated, and no production or staging infrastructure was changed. The public facade remains disabled. The dedicated askLINGO staging identity, Worker, persistent approval/audit stores, provider decision, shared rate limiting, web/mobile/voice integration, and independent security/privacy acceptance remain outstanding. Production remains NOT ENABLED; G02 remains FAIL / UNVERIFIED; downstream release gates remain held.
