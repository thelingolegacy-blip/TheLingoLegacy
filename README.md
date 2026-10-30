# The Lingo Legacy — Enterprise Platform

> **Repository:** `thelingolegacy-blip/TheLingoLegacy`  
> **Canonical domain:** `thelingolegacy.com`  
> **Edge runtime:** Cloudflare Workers + static assets  
> **Release posture:** fail-closed; production activation requires independently verifiable evidence

The Lingo Legacy is a shared platform for independently branded worlds and studios. Each entity owns its visual identity, content, asset namespace, audio namespace, navigation, and product rules. Shared services provide identity, routing, rewards architecture, asset governance, telemetry, safety, and release control.

## Platform architecture

```text
Public Web / PWA / Flutter / Smart-TV surfaces
                    |
            LINGO World Registry
                    |
       Cloudflare Worker / Edge APIs
                    |
  Identity · Wallet · Rewards · Commerce · Media
                    |
  Telemetry · SHIELDS · NEXUS · VOT-NEXT · Governance
                    |
          GitHub source + CI evidence
```

**Important separation:** a source module, preview page, uploaded Worker version, or configured binding is not proof of production acceptance. The public flagship site is serving, but full interactive-platform activation remains gated.

## Independent worlds and studios

| World / Studio | Purpose | Current source state |
|---|---|---|
| LINGOlegacy HQ | Flagship universe hub and destination router | Preview surface |
| LINGOarcade | Arcade and game collection | Preview surface |
| LINGOslots / That’s My Lingo | Five-reel game with 5×3 and 5×5 demo layouts | Local demo |
| Virtual Library / LINGOreads | Books, contracts, awards, films, scripts, publishing, events | Preview surface |
| Virtual Music & Art Studio / LINGOmedia | Original sound, music production, and Art Canvas | Preview surface; local canvas/audio demo |
| Loyalty Lane Apparel | Clothing brand and Tap Stitch collections | Preview lookbook; commerce not verified |
| Loyalty Lane Designs | Promotions, campaigns, creator management, approvals | Preview operations board |
| Loyalty Lane Cycle | Laundromat, premium packaging, and community hub | Preview service blueprint |
| Kotton’s Code | Separate cartoon/storybook world | Preview surface; child-safety review required |
| Other registered worlds | Games, community, education, stories, and future products | Registry-only / planned until their own surfaces pass acceptance |

The world registry is `studio-sites/assets/world-registry.json`. It records each world's route, visual theme, asset namespace, audio namespace, telemetry namespace, and truthful surface state.

## Shared assistant and operations

### askLINGO
The universal L-shaped askLINGO dock is injected into HTML surfaces served by the flagship Worker. The Flutter app includes a matching mobile dock.

- Default mode: guided platform navigation and support fallback.
- Optional model inference: disabled until a Cloudflare AI binding, model, usage budget, privacy review, and explicit enable flag are configured.
- Public endpoint: `POST /api/v1/asklingo/chat`.
- Controls: input limits, origin allowlist, per-isolate rate limit, correlation ID, and safe text rendering.
- No account access, payment authority, deployment authority, or autonomous write access.

See [askLINGO runtime contract](docs/ASKLINGO-RUNTIME.md).

### Operations Center
`studio-sites/operations/` is a read-only dashboard for runtime health, integration readiness, release gates, wallet/coin mode, telemetry, realtime, and governed agent status.

### Agent/control-plane catalog
- **LINGOassist:** guided support and diagnostics.
- **LINGOsisters:** planned specialist agents.
- **LINGOsystem:** planned orchestration and signal coordination.
- **SHIELDS:** partial edge guardrails.
- **NEXUS:** preview world registry and routing.
- **VOT-NEXT:** fail-closed release governance.

Autonomous execution, background workers, and agent write scopes are disabled until separately provisioned, budgeted, permissioned, and audited.

## Commerce, wallet, and rewards

- Universal Legacy Wallet and Lingo coin surfaces remain demo-only.
- Demo coins have no cash value and are not transferable or redeemable.
- Real checkout is unavailable until Stripe secrets, price identifiers, webhooks, tax/legal review, and end-to-end test evidence are configured.
- No cash-out or real-money gameplay is enabled.

## Multi-platform release matrix

| Platform | Delivery target | Current state | Remaining gate |
|---|---|---|---|
| Desktop / mobile web | Responsive web + PWA | Source preview foundation | Browser/device QA and accepted production deployment |
| Android | Flutter APK / AAB | Preview build workflow | Firebase config, release signing, Play Console review |
| iPhone / iPad | Flutter iOS | Shared Flutter source | macOS build, signing certificates, App Store Connect review |
| LG webOS / ThinQ TV | webOS TV web app | Packaging scaffold + directional remote navigation | LG SDK, TV device QA, signing and store review |
| Samsung Tizen TV | Tizen WGT | Packaging scaffold + directional remote navigation | Tizen SDK, certificate profile, TV QA and store review |

See [platform release matrix](platforms/README.md). Store submission, certification, and public availability are separate gates. No store credentials or signing keys are committed to source.

## Runtime and deployment

- Production API/site Worker: `thelingolegacyv-5`, source entrypoint `worker.js`.
- Exact-root homepage Worker: `lingo-flagship-root`, source entrypoint `cloudflare/lingo-flagship-root.js` and isolated config `cloudflare/wrangler.flagship-root.jsonc`.
- Both Workers are separately routed. The root Worker must be updated and accepted independently; the API Worker’s HTML injection alone does not affect the exact `/` route.
- Static assets are served through the Worker asset binding.
- Studio source lives under `studio-sites/`.
- Flutter source lives under `lib/`.
- Cloudflare account currently reports only the `ASSETS`, canonical-domain, and public-site bindings for the production Worker. Firebase, Stripe, D1, KV, R2, Workers AI, and realtime bindings are not confirmed on that Worker.
- Cloudflare preview versions: main API Worker v172 (`2b95e82d-1410-42cf-b19c-485aad766259`) and exact-root Worker v2 (`1009da37-9128-44c2-9853-f277eb791c31`). Both have preview enabled and neither is deployed to production.
- Production traffic remains 100% on the previously deployed main Worker v137 (`2d161fa5-598f-4998-ada8-7ac4c72c3461`) and exact-root Worker v1 (`658acd1a-997b-45cd-b8fc-e59c59b26b45`) until all release gates pass.

## CI and release governance

The repository's recent GitHub Actions runs have failed at workflow startup with `startup_failure`, zero jobs, and zero artifacts. This is a runner-dispatch/platform issue, not a failed application test. Do not disable all CI triggers to hide it, and do not bypass the G02 acceptance predicate.

G02 requires a real assigned runner, positive runner ID, populated runner name, instantiated steps, executed sentinel, and retrievable logs. Until then:

- G02: BLOCKED
- CI execution: BLOCKED
- Certification and release candidate: BLOCKED
- Production deployment and activation: BLOCKED
- Last Known Good: PROTECTED
- Fail-closed policy: ACTIVE

Required evidence chain:

`SOURCE → EVIDENCE → VERIFICATION → ACCEPTANCE → PASSED → AUTHORIZATION → PROMOTION`

No merge or production activation is authorized by a passing local check or a preview build alone.

## Validation

Run the source checks from the repository root:

```sh
node studio-sites/scripts/validate-studio.mjs
node studio-sites/scripts/validate-world-matrix.mjs
node scripts/verify-studio-world-api.mjs
node scripts/verify-asklingo-contract.mjs
node scripts/verify-platform-surface-contract.mjs
node studio-sites/lingoslots/game-engine.test.cjs
```

Flutter preview build:

```sh
flutter pub get
flutter analyze
flutter test
flutter build web --release
flutter build apk --debug
```

Firebase-backed Flutter builds require the authorized `FIREBASE_OPTIONS_JSON` secret. The preview build intentionally does not claim Firebase connectivity.

## Active engineering reviews

- [PR #414 — Studio worlds and 5×3 / 5×5 game engine](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/414)
- [PR #415 — Flutter, Firebase runtime contract, and mobile askLINGO](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/415)
- [PR #416 — Universal askLINGO, world surfaces, operations, PWA, and TV foundations](https://github.com/thelingolegacy-blip/TheLingoLegacy/pull/416)

All three are draft and remain unmerged pending runner recovery, independent review, security/accessibility testing, and release evidence.
