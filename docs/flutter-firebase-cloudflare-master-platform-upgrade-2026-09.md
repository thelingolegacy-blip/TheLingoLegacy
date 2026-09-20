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

## 5. Cloudflare data-plane expansion

When provisioned and independently verified:

D1:
- relational configuration/control data
- operational records requiring SQL semantics

KV:
- low-latency feature/config/cache state

R2:
- large asset/object storage

Durable Objects:
- authoritative coordination/stateful realtime features where required

Queues:
- asynchronous jobs and event processing

Workers:
- API/edge orchestration

No binding is considered active merely because a variable or configuration key exists. Activation requires live binding evidence.

## 6. Cross-platform API contract

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

## 7. Identity contract

Canonical identity:
- Lingo ID

Identity correlation must preserve:
- user identifier
- environment
- authorization state
- client version
- backend version
- request/correlation ID

No client-generated identity is accepted as proof of authorization.

## 8. Economy contract

For That’s My Lingo and related entertainment systems:
- Demo Coins, Loyalty Bucks, Lingo Tokens, XP, badges, cosmetics and collectibles remain non-cash-value game/platform state where applicable.
- No real-money wagering, cash prizes, cryptocurrency gambling, sports betting, or cash-out flow.
- Client-side calculations may support demo presentation only.
- Persistent rewards require server-authoritative validation.

## 9. Observability contract

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

## 10. Release/evidence chain

Flutter build
→ artifact
→ commit SHA
→ GitHub workflow
→ executable runner
→ CI evidence
→ backend compatibility
→ AppDeploy candidate when applicable
→ Cloudflare deployment candidate
→ live probes
→ certification

Firebase configuration changes follow a separate evidence chain and may not be inferred from a successful client build.

Cloudflare DNS/binding changes require domain-specific authoritative evidence.

## 11. Rollback model

Every release candidate must identify:
- source SHA
- Flutter build version where applicable
- Firebase deployment/config version where applicable
- Worker deployment/version
- AppDeploy candidate/version where applicable
- last-known-good identifiers
- rollback procedure

Rollback evidence must be preserved before promotion.

## 12. Current safety boundary

This platform upgrade is architectural/control-plane work.

It does NOT authorize:
- Firebase production writes
- Cloudflare DNS mutation
- Worker production deployment
- payment activation
- wallet activation
- production promotion
- LKG modification

The existing fail-closed runner gate remains authoritative.

## 13. Required future acceptance chain

SOURCE
→ BUILD
→ EXECUTE
→ TEST
→ ARTIFACT
→ VERIFY
→ DEPLOY CANDIDATE
→ LIVE PROBE
→ ACCEPT
→ AUTHORIZE
→ PROMOTE
→ POST-PROMOTION VERIFY

Any missing evidence blocks the next transition.
