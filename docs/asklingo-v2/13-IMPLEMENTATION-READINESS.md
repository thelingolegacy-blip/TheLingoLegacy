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
| B02 | Persistent grant/policy adapter not implemented | Reviewed schema exists in staging D1; trusted read/write adapter, revocation enforcement and tests | BLOCKED — schema only |
| B03 | Approval lifecycle adapter not implemented | Staging D1 approvals table exists; atomic single-use consume, digest/scope binding, expiry, revocation and separation-of-duties tests | BLOCKED — schema only |
| B04 | Audit ingestion and operations not implemented | Staging D1 append-only table/triggers exist; authenticated ingestion, access policy, retention, export/restore and failure tests | BLOCKED — schema only |
| B05 | No askLINGO inference provider selected | Data-processing, privacy, safety, latency, availability, cost and exit review | BLOCKED |
| B06 | No shared/global rate limit for askLINGO | Cross-isolate rate limiting and abuse tests | BLOCKED |
| B07 | No production query route | Separately reviewed server implementation and contract tests | NOT IMPLEMENTED |
| B08 | No voice provider/session broker | Provider-neutral session design and staging tests | NOT IMPLEMENTED |
| B09 | No conversation persistence policy approval | Consent, retention, deletion, age-appropriate controls and privacy review | BLOCKED / OFF |
| B10 | No independent security acceptance | Threat model, abuse cases, code review and evidence | NOT RUN |
| B11 | Hosted CI result for the v2 policy suite | Latest inspected foundation-branch runs 44969912132, 44969910037, 44969911063, 44969907816, and 44969908990 ended `startup_failure` before job creation; zero steps | BLOCKED — no hosted CI execution evidence |
| B12 | Historical voice branch contains an unsafe runtime proposal | Separate review of branch head `893f2d3974d302a672b848078c8c060916b5d6bd`; 53 ahead / 732 behind main | PRESERVED / NOT MERGEABLE AS A WHOLE |
| B13 | Full portfolio registry reconciliation | Compare routing taxonomy with the authoritative complete portfolio register | PENDING |
| B14 | Dedicated staging identity and callable runtime not ready | D1 and disabled Worker scaffold provisioned; Firebase staging project, identity adapter, routes and runtime acceptance still required | PARTIAL — infrastructure only |

## Implemented in this branch so far

- Additive architecture and governance documentation under `docs/asklingo-v2/`.
- Canonical 13-mode registry reconciled from preserved source material.
- Voice/WebRTC architecture and legacy branch security assessment.
- Product-domain routing and provider-neutral persistence/adapter contracts.
- Initial read-only Cloudflare inventory confirmed no dedicated askLINGO target; the existing Studio Control Center staging Worker was preserved. A separate askLINGO D1 database and disabled Worker scaffold were subsequently provisioned under explicit user approval.
- Isolated default-deny policy primitive, deterministic action-digest / approval-snapshot validation, and strict query request validation.
- Canonical 13-mode runtime registry, explicit operating-state resolver, v2 master system prompt, and 12-agent registry with execution disabled.
- Proposed query API contract with strict request schema and no conversation ID while persistence is disabled.
- Local `node --check` on all four new runtime modules and all four test files: PASS.
- Local `npm run test:asklingo`: 29 tests passed, 0 failed.
- Latest inspected foundation-branch Actions runs 44969912132 / 910037 / 911063 / 907816 / 908990 all ended `startup_failure` with zero jobs; CI is not a pass.
- Parallel PRs #645–#647 are stacked on the foundation branch. The digest canonicalization and delimiter-collision findings on #646/#647 have code/test fixes and targeted isolated regression checks, but full branch suites and hosted CI remain outstanding. See [parallel PR reconciliation](22-PARALLEL-PR-RECONCILIATION.md).

The local test result covers only the isolated policy primitive. It does not validate the complete repository suite, Worker integration, persistence adapters, or production security.

## Safe implementation sequence

1. Complete additive specifications and source reconciliation.
2. Add isolated, provider-neutral policy primitives and deterministic unit tests.
3. Define persistent adapter contracts and storage schema without binding production data — staging schema now applied; adapters remain.
4. Establish a separately configured Firebase staging identity — dedicated D1 and disabled Worker scaffold now exist.
5. Implement a staging-only API route behind a server-side disabled-by-default flag.
6. Integrate a provider only after cost, data, privacy, and security approval.
7. Add shared rate limiting, abuse controls, and durable audit.
8. Add web and Flutter clients against the same versioned API contract.
9. Implement voice through a separate reviewed realtime session broker.
10. Run independent security, privacy, functional, accessibility, and recovery acceptance.
11. Submit a release candidate for separate human authorization.

## Non-negotiable stop conditions

Do not bypass the disabled facade, change `ask_lingo: false`, alter production Worker routes/bindings, enable the sentinel, provision paid resources, persist conversations, or deploy to production as a shortcut around a blocker.

A missing verified staging identity or tested policy, approval-consumption, audit-ingestion, and rate-limit adapters means protected execution remains DENIED. A passing local unit test proves only the tested local primitive.


## 2026-11-22 parallel workstream reconciliation

The following stacked/parallel pull requests were inspected after the initial foundation was prepared:

| PR | Branch relationship | Scope | Observed state |
|---|---|---|---|
| #644 | base: `main` | Canonical architecture, 4 isolated v2 modules, tests, workflow, 24 numbered askLINGO docs plus index, staging schema and Worker source/config | OPEN / DRAFT; 38 files; 2,463 additions; 2 deletions |
| #645 | base: #644 head branch | 17-workstream execution plan | OPEN / DRAFT; 1 additive document |
| #646 | base: #645 head branch | SAAAE policy kernel and tests | OPEN / DRAFT; 4 files; local test result reported as 11/11; no hosted CI pass |
| #647 | base: #645 head branch | Agent capability registry and tests | OPEN / DRAFT; 3 files; local test result reported as 6/6; no hosted CI pass |

Do not merge these out of order. #645 is stacked on #644; #646 and #647 are parallel children of #645. The PRs remain review candidates, not accepted releases.

### Independent code-review findings

- **#646 — action-digest canonicalization:** fixed on the PR branch with null-prototype canonical objects, `__proto__` preservation, cycle detection, sparse-array rejection, and regression tests. Targeted isolated Node regression checks passed 3/3; this is not a full PR-suite or hosted CI pass. Follow-up review comment: `7071852441`. Atomic approval consumption and trusted server adapters remain mandatory.
- **#647 — capability duplicate key:** fixed on the PR branch with unambiguous JSON tuple encoding and a delimiter-injection regression test. Targeted isolated Node regression check passed 1/1; this is not a full PR-suite or hosted CI pass. Follow-up review comment: `7071852721`. Workload identity attestation, tenant binding, revocation, and authoritative registry loading remain future adapter requirements.

The initial findings have code/test changes on their respective branches, but independent re-review, complete branch test suites, and hosted CI evidence are still outstanding. Neither PR is approved for integration.

### Current hosted validation evidence

At the latest inspected foundation-branch commit before the workflow path-filter cleanup, GitHub Actions run IDs `44969912132`, `44969910037`, `44969911063`, `44969907816`, and `44969908990` all completed with `startup_failure`. Each failed before a job was created; no steps or test evidence were produced. This is a repository runner/startup blocker, not a passing test result. Local test evidence remains limited to the individual reported suites; full repository `npm test` and hosted CI acceptance are still outstanding.

### Integration and release posture

No PR was merged and no branch was force-updated. A dedicated staging D1 database and disabled Worker scaffold were provisioned; no production infrastructure changed. The public facade remains disabled. Firebase staging identity, tested persistent adapters, provider decision, shared rate limiting, web/mobile/voice integration, and independent security/privacy acceptance remain outstanding. Production remains NOT ENABLED; G02 remains FAIL / UNVERIFIED; downstream release gates remain held.


## 2026-11-22 isolated staging provisioning
- Cloudflare D1 `asklingo-v2-staging-20261122` created in US jurisdiction, ENAM primary, read replication disabled.
- Dedicated Worker `asklingo-v2-staging` uploaded with D1 binding; workers.dev and preview URLs explicitly disabled; no routes; observability off; no provider secrets.
- Worker scaffold is fail-closed only (health diagnostic returns 503; all other paths 404); it is not an active askLINGO runtime.
- Migration source `migrations/asklingo-staging/0001_initial.sql` defines identity bindings, exact-scope grants, approvals, append-only audit, rate limits, and idempotency; no conversation content tables.
- Firebase Auth provisioning is blocked pending user connection to the available Firebase plugin and authorization to a dedicated staging project. No alternate identity provider was substituted.
- D1 schema migration applied and verified; Firebase Auth, trusted server adapters, atomic approval consumption, rate limiting, runtime tests, and end-to-end acceptance remain pending. See [staging provisioning record](23-STAGING-PROVISIONING.md).


### Provisioning verification update — 2026-11-22
- Applied migration `0001_initial.sql` successfully to the dedicated staging D1 database.
- Verified six application tables, five secondary indexes, two append-only audit triggers, and zero rows in all six application tables.
- Worker source and Wrangler configuration are now committed under `workers/asklingo-v2-staging/`; the config pins the D1 binding and explicitly disables workers.dev and preview URLs.
- Re-read Cloudflare metadata: worker subdomain disabled, preview URLs disabled, no routes reported, observability off, no inference/provider binding, and no records in the D1 tables.
- Firebase Auth remains blocked pending connection to the Firebase plugin/project and project-level authorization. The Firebase plugin is available in ChatGPT's plugin directory; no Firebase project has yet been created.

- Local Worker scaffold validation: `node --check` PASS; behavior checks PASS (health diagnostic returns 503 with disabled flags; query and root paths return 404; 3 assertions). This is not a Cloudflare-hosted request test because the subdomain/previews remain disabled.
