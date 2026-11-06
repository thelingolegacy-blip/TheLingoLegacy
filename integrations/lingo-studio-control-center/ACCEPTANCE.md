# Integration acceptance matrix

**Audit window:** 2026-11-03T00:10:31Z–2026-11-03T00:17:00Z  
**PR:** #445 · `staging/lingo-studio-control-center-integration-2026-11-02`  
**Audited source head:** `2f5bffb8a07aefa8d703990c30d8d4db38667bb4`  
**PR posture:** open, draft, unmerged. Production remains protected.

## Gate status

| Gate | Static / configuration evidence | Required live evidence | State |
|---|---|---|---|
| CTRL-01 — Existing Control Center staging extension | Existing AppDeploy app ID retained; new Staging Integrations page; read-only backend health route; five UI tests retained | AppDeploy deployment status `ready`; snapshot `1793664829309`; QA snapshot `2026-11-03T00:14:02.920Z`; zero frontend/network/backend errors | PASS — staging deployment only |
| STATIC-01 — Integration package validation | Seven contract assertions executed against current branch files | GitHub Actions job execution is separate and still blocked | PASS — static assertions only |
| APP-16 — Registered AppDeploy surfaces | 16 distinct app IDs and HTTPS origins in the exact route registry | Provider status reads: 16/16 `ready`, zero reported frontend/network/backend errors. Direct origin HTTP responses are still required | PARTIAL — HTTP acceptance blocked |
| EDGE-01 — Cloudflare staging gateway | GET/HEAD-only, 16-origin allowlist, protected-path/redirect guards, no credentials forwarded, workers.dev only | Active deployment and settings verified; Worker runtime request and 16-origin results still need a retrievable response | PARTIAL — runtime smoke blocked by execution egress |
| ASK-01 — askLINGO authenticated MCP | Manifest/OpenAPI contract parses; endpoint remains `NOT_CONFIGURED` | Authenticated MCP handshake, tool-schema tests and unauthorized-request rejection | BLOCKED — no authenticated chat/MCP endpoint or service credentials |
| ART-01 — LINGOarts | Existing Studio Hub has authenticated asset routes; Control Center exposes a separate secure handoff | Cross-app token exchange and authenticated API integration are not configured; rights and publication approvals remain human gates | INTEGRATED — secure handoff only |
| FB-01 — Firebase staging | Deny-by-default rules and server-authoritative function templates pass static contract assertions | Dedicated staging project, connected Firebase connector, Emulator Suite tests and function logs | BLOCKED — no connector/project available |
| G02-01 — Runner execution | Workflow definitions and G02 acceptance predicates remain in the repository | Runner ID/name, assigned job, execution steps, logs and artifact digest | BLOCKED — latest runs failed before job creation |
| REL-01 — Independent release acceptance | Fail-closed acceptance contract requires independently verified evidence and an approver | G02 execution, retrievable artifacts, independent reviewer identity and human acceptance | BLOCKED — no promotion authorization |

## AppDeploy staging deployment

The existing LINGO Enterprise Control Center was extended in place; no second Control Center was created.

- App ID: `lingo-enterprise-control-center-qos4ix`
- URL: https://lingo-enterprise-control-center-qos4ix.v2.appdeploy.ai/
- Snapshot version: `1793664829309`
- Deployment result: `ready`
- QA snapshot: `2026-11-03T00:14:02.920Z`
- Frontend errors: 0
- Network errors: 0
- Backend errors: 0
- Existing UI test suite: 5 tests, exactly one `sanity: true` test.
- Added a staging-only Staging Integrations page with the 16-origin registry, provider-versus-HTTP evidence distinction, Cloudflare health/probe links, integration gate states, and G02 run references.
- Added read-only `GET /api/_healthcheck` returning staging/read-only metadata and `productionMutation: false`.
- The deployed dashboard's G02 run cards are a static snapshot from the preceding UI build (source head `21982512220409096eeabe43ddd6ac969c740c52`); this matrix records the newer documentation-head CI evidence. The dashboard does not query GitHub Actions live.
- The first deployment attempt failed preflight because the existing frontend+backend snapshot lacked `backend/index.ts`. A minimal read-only backend entry point was added and the retry completed `ready`.
- The deployment service accepted the update after the daily reset boundary `2026-11-03T00:00:00Z`. The account overview does not expose a separate remaining daily counter.

Provider build/QA readiness is not an independent browser or HTTP smoke test.

## AppDeploy 16-surface status evidence

All 16 app status reads returned `deployment.status=ready` and zero reported frontend, network and backend errors. QA timestamps below are the timestamps of each provider's latest QA snapshot; several are older and must not be mistaken for current HTTP checks.

| Surface | App ID | Snapshot version | Provider QA timestamp (UTC) | Status / reported errors |
|---|---|---:|---|---|
| universe | `lingolegacy-universe-gateway-h6kqu4` | `1793645836683` | 2026-11-02T18:58:06.875Z | ready · 0 |
| control-center | `lingo-enterprise-control-center-qos4ix` | `1793664829309` | 2026-11-03T00:14:02.920Z | ready · 0 |
| loyalty | `lingoloyalty-staging-preview-x4ld0h` | `1793617689224` | 2026-11-02T11:08:25.105Z | ready · 0 |
| asklingo | `lingo-ai-sonic-boom-2030-7plgl2` | `1793612446582` | 2026-11-02T09:41:07.272Z | ready · 0 |
| studio | `lingo-legacy-studio-hub-nhda3b` | `1793476558959` | 2026-10-31T19:56:30.028Z | ready · 0 |
| master-plan | `lingo-legacy-master-project-plan-rkh6r6` | `1793390188848` | 2026-10-30T19:56:50.071Z | ready · 0 |
| runtime | `hello-the-lingo-legacy-ois1rj` | `1793389793355` | 2026-10-30T19:50:03.819Z | ready · 0 |
| thats-my-lingo | `that-s-my-lingo-casino-studio-2xntye` | `1793273333535` | 2026-10-29T11:29:25.185Z | ready · 0 |
| arcade | `lingo-legacy-universe-rpekc0` | `1793273268687` | 2026-10-29T11:28:00.480Z | ready · 0 |
| verification | `lingo-legacy-verification-bridge-wwagn2` | not reported | 2026-09-20T01:53:41.825Z | ready · 0 |
| jersey-shore | `jersey-shore-the-undead-l4h5ea` | `1792449913074` | 2026-10-19T22:45:41.266Z | ready · 0 |
| hq | `the-lingo-legacy-hq-vhjt6i` | not reported | 2026-10-05T11:16:44.356Z | ready · 0 |
| kottonscode | `kotton-s-code-cartoon-studio-509py3` | not reported | 2026-10-04T03:49:12.143Z | ready · 0 |
| loyalty-lane | `loyalty-lane-community-hub-zb39n2` | not reported | 2026-10-04T03:49:11.833Z | ready · 0 |
| crazy-weasels | `crazy-weasels-0j3ujc` | not reported | 2026-09-03T04:26:15.729Z | ready · 0 |
| travel | `lingo-traveltm-uyd57n` | not reported | 2026-09-03T04:15:28.624Z | ready · 0 |

### Direct HTTP probe attempt

At `2026-11-03T00:10:31.611Z`, the execution environment attempted:

- `HEAD /` against each of the 16 registered AppDeploy origins.
- `GET /healthz` against the Cloudflare staging Worker.

All 17 outbound requests were rejected with HTTP 403 by the execution environment's egress policy before an origin response was received. The Worker request returned the policy message that requests to its workers.dev hostname are not allowed. These 403s are not AppDeploy or Worker application responses; no origin health status or response digest was obtained.

The Worker source exposes `GET /healthz/apps`, which performs 16 HEAD checks from the Cloudflare Worker runtime and returns per-origin status. The Control Center now links to that endpoint so the probe can be executed from a network context permitted to reach the Worker.

## Cloudflare deployment reconciliation

Worker: `lingo-studio-control-center-staging`  
URL: https://lingo-studio-control-center-staging.thelingolegacy.workers.dev

- Account subdomain: `thelingolegacy`
- workers.dev: enabled
- Preview URLs: disabled
- Current deployment: `3e86b188-1697-414c-b7bd-637e5eccdc5e`
- Current Worker version: `6827a64d-53b6-4b96-93fe-89fb864ff4d9`
- Traffic: 100%
- Observability: enabled
- Invocation logs: enabled and persistent
- Query-string redaction: enabled
- Bindings: none
- Wrangler config contains no zone routes or production hostname declarations.

| History | Deployment record ID | Worker version ID | Traffic |
|---|---|---|---:|
| Current | `3e86b188-1697-414c-b7bd-637e5eccdc5e` | `6827a64d-53b6-4b96-93fe-89fb864ff4d9` | 100% |
| Previous | `7f4d6a26-3866-405c-9909-0b58693bd134` | `69e9af5a-30e3-4abf-82ed-485f7c52e099` | historical |
| Previous | `5b3da71c-3b04-4758-bb3d-feb44d3b452b` | `50fdc7c7-813b-47de-aa64-74d3c585350b` | historical |
| Earliest | `fc5d79bb-712d-42ef-8ed0-1fd0788b1854` | `048b74be-cb67-4099-983e-574d72153ab5` | historical |

Retain all four deployment records as the history of one Worker; they are not duplicate live gateways. The supplied separator-free `048b74becb674099983e574d72153ab5` is the earliest Worker version ID, not a deployment ID. The additional supplied tag `cbf77cdb34764bc282f235de0e8be6c8` was not found in the Cloudflare version list and remains unverified.

## askLINGO and LINGOarts inspection

- askLINGO app `lingo-ai-sonic-boom-2030-7plgl2`, snapshot `1793612446582`: backend index exposes `GET /api/_healthcheck` plus realtime subscription routes. No authenticated chat/MCP route was found. No MCP service or credential was created.
- LINGOarts Studio Hub `lingo-legacy-studio-hub-nhda3b`, snapshot `1793476558959`: `GET /api/assets` and `POST /api/assets` use `requireAuth()`. `POST /api/design-requests` is a separate intake route without that middleware. The Control Center links to the existing Studio Hub; no cross-app token exchange or credential forwarding was introduced. Rights review and publication remain locked.

## Firebase and execution environment

- No Firebase connector is connected or exposed in this session, and no dedicated staging Firebase project is confirmed.
- No Firebase project mutation or Emulator Suite run was attempted.
- Seven static package assertions passed against the current branch content: architecture invariants; 16 unique HTTPS routes; askLINGO unconfigured state; Worker method/path guards; Worker health-probe contract; Firebase deny-by-default/evidence guards; workers.dev-only configuration.
- These assertions were executed in the connector JavaScript runtime against the branch files. The checked-in Node validator was not run from a repository checkout.
- AppDeploy deployment build/QA completed ready with zero reported errors. A separate `tsc --noEmit` run was not executed; Vite build readiness is not represented as a full TypeScript typecheck.
- Firebase Emulator Suite, authenticated MCP handshake, and direct origin HTTP checks remain unexecuted.

## GitHub Actions and G02 evidence

At executable source head `2f5bffb8a07aefa8d703990c30d8d4db38667bb4` (the subsequent acceptance/README commit is documentation-only):

| Workflow | Run ID | Started (UTC) | Conclusion | Jobs | Artifacts |
|---|---:|---|---|---:|---:|
| Crimson Smoke UI — static validation | `41551831872` | 2026-11-03T00:17:50Z | `startup_failure` | 0 | 0 |
| Lingo Legacy Static CI | `41551830758` | 2026-11-03T00:17:50Z | `startup_failure` | 0 | 0 |
| G02 Runner Image Build (no publish) | `41551829530` | 2026-11-03T00:17:49Z | `startup_failure` | 0 | 0 |

All three run records concluded `startup_failure`. Job-list calls returned empty arrays; consequently no job ID, runner ID/name, execution steps or job logs were available. Artifact-list calls returned empty arrays. These runs are not PASS and do not establish runner assignment or host execution.

## Acceptance and production rules

A gate remains BLOCKED or PARTIAL until its required live evidence is retrievable and independently checked. Provider readiness, static assertions, configuration, source presence, a deployment badge, or a zero-job workflow cannot substitute for runtime evidence.

PR #445 remains open and draft. No merge to `main`, production Worker route, DNS record, production AppDeploy app, Firebase production project, secret, payment path, or release promotion is authorized by this package.
