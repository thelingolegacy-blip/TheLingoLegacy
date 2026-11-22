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
| B11 | Hosted CI result for the new policy suite | PR run 44966884187 ended `startup_failure`; GitHub returned zero jobs and no steps | BLOCKED — no CI execution evidence |
| B12 | Historical voice branch contains an unsafe runtime proposal | Separate review of branch head `893f2d3974d302a672b848078c8c060916b5d6bd`; 53 ahead / 732 behind main | PRESERVED / NOT MERGEABLE AS A WHOLE |
| B13 | Full portfolio registry reconciliation | Compare routing taxonomy with the authoritative complete portfolio register | PENDING |

## Implemented in this branch so far

- Additive architecture and governance documentation under `docs/asklingo-v2/`.
- Canonical 13-mode registry reconciled from preserved source material.
- Voice/WebRTC architecture and legacy branch security assessment.
- Product-domain routing and provider-neutral persistence/adapter contracts.
- Isolated default-deny policy primitive and deterministic action-digest / approval-snapshot validation.
- Local `node --check` on the new module and test file: PASS.
- Local `npm run test:asklingo`: 10 tests passed, 0 failed.
- GitHub Actions askLINGO policy run 44966884187: startup_failure, zero jobs, no step evidence; CI result is not a pass.

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
