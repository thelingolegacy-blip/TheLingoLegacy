# LLG Tech Corps — AI & Game Development Foundation

**Owner:** The Lingo Legacy  
**Division:** LLG Tech Corps  
**Record date:** 2026-11-07  
**Disposition:** Architecture foundation for review; not a provider activation or production release.

## Mission

LLG Tech Corps is the technology and AI development division responsible for building, integrating, operating, securing, and maintaining The Lingo Legacy's software, AI services, game-development systems, and shared technical infrastructure.

The division has two connected disciplines:

1. **LLG AI Systems** — multi-provider AI services, model routing, comparison, agent orchestration, and developer assistance.
2. **GDeveloper** — original game design and production, game-engine engineering, interactive systems, asset pipelines, testing, and game operations.

GDeveloper means **Game Developer**. It is an LLG game-development division, not a Google product or AI model provider. Google Developer Services are separately classified as infrastructure and developer tooling.

## AI provider portfolio

| Provider | Role | Server-side credential binding | Activation rule |
|---|---|---|---|
| OpenAI / GPT | Reasoning, chat, agents, application intelligence | `OPENAI_API_KEY` | Disabled until approved, configured and live-tested |
| Anthropic / Claude | Long-context analysis, coding, document intelligence | `ANTHROPIC_API_KEY` | Disabled until approved, configured and live-tested |
| Google / Gemini | Multimodal AI, research and reasoning | `GEMINI_API_KEY` | Disabled until approved, configured and live-tested |
| xAI / Grok | Research and real-time information workflows | `XAI_API_KEY` | Disabled until approved, configured and live-tested |
| Google Developer Services | Firebase, Google Cloud, developer APIs and infrastructure | Separate service credentials | Infrastructure integration, not a model adapter |

Model identifiers are configured independently per provider; do not hard-code model names into public clients. API credentials are server-side secrets only and must never enter Git, client bundles, source maps, logs, test fixtures, or issue comments.

## LLG AI Command Center

The shared product surface is intended to provide:

- **AI Chat:** a unified conversation interface with an explicit provider selector.
- **AI Compare:** send the same user-authored prompt to two or more providers selected by the user and display independent responses.
- **AI Agents:** orchestrate bounded tasks with declared inputs, outputs, permissions, budgets, and human approval gates.
- **AI Developer:** assist with code analysis, test generation, debugging, documentation, and review.

The first-party gateway owns authentication, provider selection, server-side credentials, request validation, timeouts, usage ceilings, error normalization, audit metadata, and feature flags. Provider adapters are isolated; each provider receives only the prompt and context explicitly selected for that request. One provider's output must not be forwarded to another provider without explicit workflow-level authorization.

## Provider-neutral service contract

- The web, mobile, and game clients call first-party LLG endpoints only.
- Clients never call commercial model endpoints with embedded provider keys.
- Every request has a bounded payload, authenticated identity where required, request correlation ID, provider selection, and server-enforced usage policy.
- Provider errors are normalized; upstream response bodies, prompts, secrets, and stack traces are not returned to clients.
- Timeouts and provider outages fail closed. There is no silent provider fallback.
- Conversation persistence is off until retention, consent, deletion, access control, and applicable privacy review are accepted.
- Public chat does not grant developer, financial, release, or administrative permissions.
- Provider spend remains disabled until an explicit budget and provider account authorization are in place.

### Feature flags and secret bindings

Global flag: `LLG_AI_ENABLED=true`  
Provider flags: `LLG_AI_PROVIDER_OPENAI_ENABLED`, `LLG_AI_PROVIDER_CLAUDE_ENABLED`, `LLG_AI_PROVIDER_GEMINI_ENABLED`, `LLG_AI_PROVIDER_GROK_ENABLED`.

Provider credentials and model names are separate server-side bindings. A provider is unavailable unless both the global and provider-specific flags are explicitly enabled and its key/model configuration is valid. All flags remain off by default.

## GDeveloper game-production system

GDeveloper owns the lifecycle for original LINGO games:

1. Product brief, ownership, audience, canon and rights clearance.
2. Game bible, rules, core loop, economy boundary, accessibility and content rating.
3. Engine selection per title: Unity for suitable cross-platform/mobile/2D/3D work; Unreal Engine 5 for suitable high-fidelity 3D experiences. Do not force one engine across every game.
4. Source architecture, deterministic game-state systems, data-driven content, save/version migration and server-authoritative competitive or reward systems.
5. Character, environment, UI, animation, sound, voice and visual-effects production.
6. Asset provenance, rights/licensing, optimization, localization and platform packaging.
7. Automated tests, playtesting, device/browser QA, security, accessibility and performance.
8. Release candidate, independent verification, human approval, controlled release, monitoring and rollback.

Use GitHub as source authority. Use Git LFS and an approved asset workflow for large binary assets; keep original masters, licenses, approvals, manifests, and checksums traceable. Unity/Unreal engine selection and build environments are title-specific. Blender or equivalent tools may be used for original 3D assets. No unlicensed third-party characters, music, logos, voices, or franchise assets.

### Shared game platform services

- Lingo ID / identity and consent
- Player profiles and accessibility settings
- Versioned game catalog and feature flags
- Server-authoritative save, progression, score and leaderboard APIs
- XP, achievements and quest events with idempotency controls
- Virtual demo balances isolated from payments and real-value systems
- Asset registry, content delivery and media pipeline
- Telemetry, moderation, support and incident response

Client-side scores, balances, inventory, rewards and entitlements are untrusted. Competitive ranking and progression grants require server-side validation. Virtual demo currency is non-cash, non-transferable and non-redeemable. Real-money wagering, cash-out, paid spins and prize activation are outside this foundation and remain disabled.

## Product integration map

- **LINGOai:** central AI intelligence.
- **askLINGO:** user-facing AI chat and research.
- **LINGOdev:** software-development assistant and engineering workflows.
- **LINGOsupport:** support knowledge and customer assistance.
- **LINGOshield:** security analysis and defensive monitoring.
- **LINGOmedia:** creative-production assistance.
- **LINGOarcade / LINGOslots:** game discovery and virtual gameplay surfaces.
- **LINGOlegacy:** unified account and ecosystem experience.
- **GDeveloper:** game-production division serving the LINGO game portfolio.

## Reference stack

| Layer | Preferred foundation |
|---|---|
| Web | React / Next.js or existing native site runtime, selected per product |
| Mobile | Flutter |
| Game runtime | Unity or Unreal Engine 5, selected per title |
| AI | Independent provider adapters behind the LLG gateway |
| Backend / identity | Firebase only after project identity and configuration are verified |
| Edge / APIs | Cloudflare Workers |
| Source and review | GitHub monorepo, branches, PRs and release evidence |
| Data | Firestore / SQL / D1 only with an explicit data owner, schema and security boundary |
| Assets | Git LFS plus approved asset pipeline and immutable manifests |

The existing production edge and last-known-good deployment are preserved. This architecture does not authorize production route changes, Worker deployments, Firebase activation, provider billing, or release promotion.

## Current integration blockers

- Firebase project identity and real app registrations must be reconciled before authentication or database activation.
- Flutter Firebase options still contain placeholder values; no production app registration is established by this document.
- askLINGO remains disabled until identity, provider credentials, server route, rate limiting, privacy controls, and live tests are accepted.
- GitHub Actions startup and G02 runner assignment remain unverified. Source-level tests are not accepted as executed tests until logs and artifacts are retrievable.
- Cloudflare production route ownership and the separate apex root/catch-all Worker arrangement must remain unchanged until source-to-runtime and external route verification are complete.
- AppDeploy runtime source reproducibility and authorization gaps remain separately tracked.
- GDeveloper titles retain their individual design/build/test/release evidence. A game catalog entry or browser prototype is not a production-certified game.

## Release evidence contract

For every code or game release:

`SOURCE → BUILD → TEST → SECURITY → ACCESSIBILITY → RIGHTS → INDEPENDENT QA → ACCEPTANCE → AUTHORIZATION → CONTROLLED RELEASE`

Every gate requires retrievable evidence tied to exact commit, build, environment, and artifact. A draft, proposed change, green status label, provider "ready" state, or successful source fetch is not acceptance.

**Disposition:** foundation ready for technical review; provider activation, Firebase activation, game releases, production deployment, and production promotion remain gated.
