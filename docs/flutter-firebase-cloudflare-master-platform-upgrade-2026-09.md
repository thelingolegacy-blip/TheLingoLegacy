# Lingo Legacy — Flutter + Firebase + Cloudflare Master Platform Upgrade
Date: 2026-09-20

## 1. Platform topology

Flutter client
→ Firebase identity/data services where assigned
→ Cloudflare edge/runtime/API boundary
→ production web/runtime
→ GitHub CI/release evidence

GitHub remains implementation and release-evidence authority.
Cloudflare remains canonical web production runtime authority.
Firebase remains the designated identity/data platform for capabilities assigned to it.
Flutter is the client/runtime layer and never becomes a production certification authority.

## 2. Flutter build system

Current repository contract:
- Dart SDK: >=3.0.0 <4.0.0
- Flutter application package
- firebase_core
- firebase_auth
- firebase_database
- firebase_storage
- firebase_analytics
- provider
- http
- intl
- shared_preferences
- connectivity_plus
- flutter_test
- integration_test
- flutter_lints

### Flutter architecture target

Presentation:
- Industrial Noir design system
- responsive/mobile-first surfaces
- accessibility and reduced-motion behavior
- world-specific themes

Application:
- state management through Provider or an explicitly approved replacement
- navigation
- offline/error states
- feature flags
- session lifecycle

Domain:
- Lingo ID
- profile
- XP/progression
- wallet display
- games/worlds
- collections
- achievements
- notifications
- content permissions

Infrastructure:
- Firebase adapters
- Cloudflare API client
- secure local state
- connectivity handling
- telemetry adapters

### Flutter release gates

A mobile candidate requires:
1. deterministic dependency resolution
2. static analysis
3. unit tests
4. widget tests
5. integration tests
6. Android/iOS build identity
7. commit SHA
8. artifact identity
9. environment identity
10. backend contract compatibility
11. rollback/version identity

Client builds cannot certify server-side economy or authorization behavior.

## 3. Firebase platform contract

Firebase services are divided by responsibility.

### Authentication
- Lingo ID identity
- session lifecycle
- provider/account linking
- authorization claims
- account recovery

### Database
Use the designated Firebase database for ecosystem data assigned to Firebase.

Required logical domains:
- profiles
- progression
- inventories
- achievements
- missions
- events
- configuration
- audit trails

### Storage
- controlled user/profile media
- approved game/world assets
- generated content where Firebase Storage is the selected path

### Cloud Functions
Server-authoritative operations:
- reward grants
- economy mutations
- anti-cheat validation
- rate limits
- scheduled jobs
- notification jobs
- privileged administrative actions

### Analytics
Analytics is measurement only.
It must never silently mutate:
- balances
- rewards
- identity
- permissions
- production configuration

### Firebase security contract
- least-privilege rules
- user ownership enforcement
- role-aware administrative access
- server-side validation
- App Check where supported
- audit logging for privileged/economy mutations
- secrets outside source control
- environment separation between development/staging/production

Persistent wallet/economy state must never depend on client-trusted calculations.

## 4. Cloudflare runtime contract

Current authoritative configuration:
- Worker: thelingolegacy
- entrypoint: worker.js
- configuration: wrangler.jsonc
- canonical domain: thelingolegacy.com
- www redirects to canonical domain
- observability enabled
- Worker-controlled assets
- Node compatibility enabled

### Required runtime endpoints
/healthz
/api/v1/runtime
/api/v1/platform/manifest
/api/v1/platform/status
/api/v1/site/context

These are machine-readable runtime verification surfaces.

### Edge responsibilities

Cloudflare owns:
- DNS/routing
- canonical redirects
- edge headers
- runtime/API boundary
- asset delivery
- observability
- cache/security policy
- optional D1/KV/R2 bindings when provisioned

### Security baseline

Maintain:
- HSTS
- nosniff
- strict referrer policy
- restrictive permissions policy
- controlled CORS
- no-store for sensitive API responses
- explicit origin allow-listing
- rate limiting for exposed mutation endpoints
- secret values only in environment bindings

## 5. Three-way traffic splitter and recovery fabric

The constellation routing layer is an architectural control plane for three independently identifiable destinations:

- Origin A — primary/main environment
- Origin B — duplicate/blue-green candidate
- Origin C — clean recovery environment

The splitter is intended to operate at the Cloudflare edge without requiring apex DNS changes during a controlled traffic transition.

### Routing principle

Incoming traffic:
thelingolegacy.com → Cloudflare edge → governed splitter → A/B/C

A path or internal validation route may expose a candidate/recovery environment for testing, but public traffic remains on the authorized active origin.

### Origin identity contract

Each origin must have independently verifiable:
- deployment/version identity
- source commit SHA
- artifact identity
- environment identity
- runtime version
- health endpoint
- rollback/LKG identity

A HTTP 200 alone is not sufficient evidence of origin readiness.

### KV routing state

KV may hold non-secret routing state such as:
- active origin pointer
- recovery enabled/disabled state
- routing epoch/version
- origin identifiers
- metadata
- audit references

Do not store master administrative credentials or recovery secrets in ordinary routing KV.

KV read/modify/write operations must not be described as atomic transactions. Promotion requires concurrency/version protection and an auditable state transition.

### Three-way state machine

A = MAIN
B = DUPLICATE
C = RECOVERY

Permitted transitions are governed state changes, not arbitrary dashboard commands.

A recovery environment must remain isolated until its evidence package is accepted.

## 6. Human control layer: Dashboard Backend Proxy

The dashboard browser must never receive or transmit the master ADMIN_API_SECRET.

Architecture:

Browser → Cloudflare Access → Dashboard Proxy Worker → authenticated internal governance API

The Dashboard Proxy is responsible for:
- validating the Cloudflare Access identity at the protected boundary
- serving read-only routing/status data
- forwarding authorized write requests server-side
- attaching the secret only inside the trusted Worker environment
- returning sanitized responses
- recording actor/request correlation

The browser receives an authorization decision, not a master secret.

### Dashboard security requirements

- Cloudflare Access protection is mandatory for administrative surfaces.
- Browser-side secret prompts are prohibited.
- ADMIN_API_SECRET is a Worker secret binding.
- Promotion endpoints require POST and explicit authorization.
- Input validation is mandatory.
- Promotion requests must carry actor, request/correlation ID, target origin, and evidence reference where applicable.
- Dashboard UI cannot bypass the production gate.
- Dashboard health/status views are informational unless a promotion authorization has independently been granted.

## 7. Governance and promotion API

The governance API is a separate control-plane service from the public runtime.

Responsibilities:
- validate promotion requests
- verify current routing state
- require accepted readiness/evidence records
- perform controlled state transition
- emit an audit event
- expose rollback identity
- reject stale or unauthorized transitions

A health probe may be a prerequisite but is never, by itself, production authorization.

Automatic promotion based only on three boolean universe flags is prohibited.

Required sequence:

readiness → executable evidence → artifact identity → live probe → verification → acceptance → authorization → routing change

## 8. Recovery vault and Origin C

Origin C is a clean recovery environment, not a second uncontrolled production environment.

Recovery preparation requires:
- immutable verified build artifact
- artifact checksum/identity
- verified database snapshot where applicable
- recovery configuration identity
- LKG identifier
- isolated recovery data plane
- recovery deployment identity
- successful functional/live probes

Recovery drills must be executed without changing public production routing until acceptance.

The vault is treated as a source of recovery artifacts, not as an implicit production authority.

## 9. Secret architecture and rotation

Secret classes:
- ADMIN_API_SECRET
- RECOVERY_ACCESS_TOKEN
- deployment/provider credentials
- webhook destination secrets

Rules:
- secrets live in provider secret stores, never source-controlled configuration
- example values are never production credentials
- recovery tokens are not ordinary KV configuration
- rotation must preserve overlap/verification where the provider requires it
- old credentials are revoked after successful validation
- rotation events are audited
- emergency rotation is permitted independently of the normal schedule when compromise is suspected

Suggested maintenance cadence:
- administrative secret: quarterly or on compromise
- recovery credential: after recovery drills or on compromise
- deployment credentials: according to provider policy and pipeline exposure

A rotation is not complete until both authentication and revocation have been verified.

## 10. Telemetry and webhook layer

Operational events may be forwarded to approved telemetry destinations.

Events include:
- promotion request
- promotion accepted/rejected
- recovery enabled/disabled
- routing transition
- runner gate transition
- deployment candidate state
- live probe result
- rollback event
- secret rotation event

Webhook payloads must avoid:
- secrets
- access tokens
- credentials
- unnecessary personal data
- raw privileged configuration

Every event should include:
- event type
- timestamp
- environment
- actor/service identity
- request/correlation ID
- from/to state where applicable
- source/artifact identity where applicable
- result

Telemetry failure must not silently authorize a promotion.

## 11. Cloudflare data-plane expansion

When provisioned and independently verified:

D1:
- relational configuration/control data
- operational records requiring SQL semantics

KV:
- low-latency feature/config/cache state
- governed routing state where appropriate

R2:
- large asset/object storage
- recovery/artifact storage where selected

Durable Objects:
- authoritative coordination/stateful realtime features where required

Queues:
- asynchronous jobs and event processing

Workers:
- API/edge orchestration
- splitter
- governance
- dashboard proxy

No binding is considered active merely because a variable or configuration key exists. Activation requires live binding evidence.

## 12. Cross-platform API contract

Flutter → Cloudflare:
- HTTPS only
- explicit API version
- structured JSON
- request IDs
- bounded payloads
- authorization where required
- idempotency for mutation operations where applicable

Cloudflare → Firebase:
- only approved service paths
- server-side authorization
- validated input
- explicit failure semantics
- auditable mutations

Firebase → client:
- minimum required data
- rules-enforced access
- no secrets
- no privileged server state exposed directly

Dashboard → governance:
- Access-authenticated request
- explicit target
- actor identity
- correlation ID
- evidence/authorization reference
- no browser-held master secret

## 13. Identity contract

Canonical identity:
- Lingo ID for product/user identity
- Cloudflare Access identity for administrative dashboard identity
- GitHub identity for source/CI actions
- service identity for automated governance actions

Identity correlation must preserve:
- user/service identifier
- environment
- authorization state
- client version
- backend version
- request/correlation ID
- source/artifact identity when relevant

No client-generated identity is accepted as proof of authorization.

## 14. Economy contract

For That’s My Lingo and related entertainment systems:
- Demo Coins, Loyalty Bucks, Lingo Tokens, XP, badges, cosmetics and collectibles remain non-cash-value game/platform state where applicable.
- No real-money wagering, cash prizes, cryptocurrency gambling, sports betting, or cash-out flow.
- Client-side calculations may support demo presentation only.
- Persistent rewards require server-authoritative validation.

## 15. Observability contract

Every production-capable layer should expose:
- version
- environment
- build/commit identity
- health
- dependency state
- request correlation
- error classification

Flutter:
- startup failures
- crashes
- connectivity state
- API failures

Firebase:
- function failures
- auth failures
- rule-denied operations
- privileged mutation audit events

Cloudflare:
- request status
- Worker exceptions
- route behavior
- runtime version
- API response health
- observability traces/logs where available

Splitter:
- active origin
- routing epoch
- target origin
- transition result
- correlation ID
- post-transition probe

Governance:
- authorization decision
- evidence reference
- actor/service identity
- state transition
- rejection reason

## 16. Release/evidence chain

Flutter build
→ artifact
→ commit SHA
→ GitHub workflow
→ executable runner
→ CI evidence
→ backend compatibility
→ AppDeploy candidate when applicable
→ Cloudflare deployment candidate
→ origin probes
→ splitter readiness
→ live probes
→ certification

Firebase configuration changes follow a separate evidence chain and may not be inferred from a successful client build.

Cloudflare DNS/binding/routing changes require domain-specific authoritative evidence.

## 17. Splitter promotion evidence contract

A traffic transition requires a complete correlated evidence bundle:

1. source SHA
2. artifact identity
3. origin deployment identity
4. environment identity
5. runner execution evidence
6. test results
7. live health response
8. recovery/LKG identity
9. authorization identity
10. routing state version/epoch
11. pre-transition state
12. post-transition state
13. post-transition live probe
14. rollback target

Missing evidence blocks promotion.

## 18. Rollback model

Every release candidate must identify:
- source SHA
- Flutter build version where applicable
- Firebase deployment/config version where applicable
- Worker deployment/version
- AppDeploy candidate/version where applicable
- active origin
- previous origin
- last-known-good identifiers
- recovery artifact identity
- rollback procedure

Rollback evidence must be preserved before promotion.

A rollback is itself a governed state transition and requires post-transition validation.

## 19. Current production safety boundary

This platform upgrade is architectural/control-plane work.

It does NOT authorize:
- Firebase production writes
- Cloudflare DNS mutation
- Worker production deployment
- splitter activation
- KV routing promotion
- payment activation
- wallet activation
- production promotion
- LKG modification

The existing fail-closed runner gate remains authoritative.

Current disposition:
- RUNNER_GATE = BLOCKED
- CI EXECUTION = BLOCKED
- CERTIFICATION = BLOCKED
- PROMOTION = BLOCKED
- ACTIVATION = BLOCKED
- LKG = PROTECTED
- MUTATION FREEZE = ACTIVE

## 20. Required future acceptance chain

SOURCE
→ BUILD
→ EXECUTE
→ TEST
→ ARTIFACT
→ VERIFY
→ DEPLOY CANDIDATE
→ ORIGIN PROBE
→ SPLITTER READINESS
→ LIVE PROBE
→ ACCEPT
→ AUTHORIZE
→ ROUTING CHANGE
→ POST-ROUTING VERIFY
→ PROMOTE

Any missing evidence blocks the next transition.

## 21. Explicit non-goals

This architecture does not:
- manufacture GitHub runner evidence
- infer Cloudflare DNS state
- treat AppDeploy readiness as production certification
- treat a 200 response as complete release evidence
- expose administrative secrets to browsers
- automatically promote production from health flags
- bypass the LKG protection model
- bypass the GitHub runner gate
