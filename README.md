# That’s My Lingo by The Lingo Legacy

Cloudflare Worker production surface for That’s My Lingo by The Lingo Legacy: a purple-and-gold culture game world with playable lingo rounds, district UI, community lanes, merch/marketplace framing, and launch-list capture.

## Production runtime contract

The production surface is **dynamic-first and Worker-controlled**. The Cloudflare Worker is the runtime boundary for health, API routing, security headers, integration endpoints, runtime/manifest metadata, and frontend asset delivery through the `ASSETS` binding. Static files are presentation assets, not the production control plane.

Authoritative runtime gates:

- `/healthz` — edge health check
- `/api/v1/runtime` — dynamic runtime contract
- `/api/v1/platform/manifest` — platform/runtime manifest
- `scripts/verify-dynamic-runtime.mjs` — repository contract gate
- `scripts/live-probes.mjs` — live production probe harness

The production deployment executor is `scripts/deploy-production.mjs`. It is fail-closed by default: it requires the `production-deploy` branch, a clean working tree, authenticated Wrangler, a dynamic-runtime contract pass, and a successful Wrangler dry-run before a live deployment. A live deployment requires the explicit `--execute` flag, followed by live probes.

### Controlled production path

**GitHub → controlled Mac Wrangler executor → Cloudflare Worker → Worker-controlled Assets → production domain**

GitHub Actions remains a CI/evidence layer. Runner isolation or CI availability does not authorize bypassing production validation, and CI failure does not itself imply that the Cloudflare runtime is unhealthy.

Firebase and Flutter remain integration/application layers and must use authoritative production bindings. No resource IDs, secrets, or credentials are invented or committed to source control.

## Site map

- `/` — polished public Lingo Game Casino homepage with entertainment-only virtual casino play, daily app routes, merch, rewards, safety language, and launch calls to action
- `/thats-my-lingo/` — production entertainment lane with 5x3 virtual reels, virtual wallet, progression, missions, ecosystem platform framing, live-ops readiness, compliance guardrails, demo store, rewards, opt-in sounds, and animations
- `/loading/` — cinematic LoadingPage gateway
- `/studio-assets/` — studio-grade visuals, symbols, backgrounds, animations, glass panels, lighting, and audio motifs
- `/master-interface/` — guardrailed master interface preview
- `/landing/` — campaign landing page and waitlist
- `/drop/` — founder micro-drop landing page
- `/kottons-code/` — bright kids explorer world for Kotton, Kimba, Jada, stories, mini-games, and learning zones
- `/kottons-code/episodes/sunny-key/` and `/kottons-code/episodes/blue-clue-trail/` — KottonsCode episodes
- `/kottons-code/educators/` — educator landing page
- `/kottons-code/app-wireframes/` — app screen wireframes
- `/tapstich/` — apparel customization lane
- `/app/` — playable daily lingo game
- `/social-play/` — mobile-first social challenge page
- `/assets/` — brand asset library
- `/lingo-ai/` — Ask Lingo / Start Lingo.ai studio assistant surface
- `/admin-command-center/` — production dashboard command center
- `/casino-upgrade/` — casino-grade UI upgrade package
- `/casino-config/` — deterministic casino config command center
- `/casino/` — entertainment-only play-money Lingo casino mini-game
- `/visual-showcase/` — casino visual showcase
- `/visual-expansion/` — second-stage casino visual expansion
- `/sweepstakes-visual-system/` — Industrial Noir visual system
- `/multiplayer-rap-arena/` — multiplayer rap battle arena blueprint
- `/auto-racing-universe/` — mascot/avatar racing universe blueprint
- `/live-casino-studio/` — regulated live-casino launch shell with restricted modules disabled pending approvals
- `/payload-matrix/` — Lingo Legacy OS contract matrix
- `/monetization-safety/` — Monetization Safety OS blueprint
- `/integration-os/` — Flutter/Firebase/Cloudflare/GitHub/studio integration map
- `/studio-production/` — studio production framework
- `/studio-world-os/` — individual entity worlds and unified experience layer
- `/universe/` — live web/game/studio route map
- `/outer-crown-expansion/` — HQ Mode expansion
- `/full-entity-simulcast/` — Full-Entity Simulcast staging
- `/trust-compliance/` — Lingo Safety Core trust layer
- `/economy-command-center/` — economy monitoring scaffold
- `/studio-ui-cleanup/` — premium UI cleanup pass

## Development

Static assets remain part of the frontend, but the production control plane is the Cloudflare Worker. The global OS skin lives in `assets/lingo-os.css` and `assets/lingo-os.js`; together they provide the World Layer, HUD Layer, FX Layer, command bar, side rail, quick actions, Industrial Noir theme state, core OS modules, XP/wallet event feedback, and auto-cinematic overlay governance.

## Validation

Run the dynamic runtime contract gate before deployment:

```bash
node scripts/verify-dynamic-runtime.mjs
```

Run the live production probe after deployment:

```bash
LIVE_BASE_URL="https://thelingolegacy.com" \
LIVE_PROBE_PATHS="/|/healthz|/api/v1/runtime|/api/v1/platform/manifest" \
node scripts/live-probes.mjs
```

The legacy static smoke test remains available for asset/link integrity:

```bash
node scripts/validate-static-site.mjs
```

## Deployment

Use the controlled local executor from the canonical `production-deploy` checkout:

```bash
node scripts/deploy-production.mjs
```

This performs branch/worktree/authentication checks, repository dynamic-runtime validation, and a Wrangler dry-run without changing production. Only an explicit execution request performs the live deployment:

```bash
node scripts/deploy-production.mjs --execute
```

The live executor does not support bypass flags. If a gate fails, deployment stops.

The Worker entrypoint is `worker.js` and the deployment configuration is `wrangler.jsonc`. Cloudflare runtime secrets are injected through the deployment environment; secret values never belong in source control.

## Studio safety guardrails

Security headers, advisory AI crawler blocks, no-cost service boundaries, and safe overlay rules are documented in `docs/studio-safety-guardrails.md`. The product-level Safety Core operating model is documented in `docs/lingo-safety-core.md` and surfaced on `/trust-compliance/`.

The runtime safety contract remains:

- Real-money gameplay: **OFF**
- Cash-out: **OFF**
- Harmful bypass: **OFF**

## Launch operations

Cloudflare launch checks, `/healthz`, rollback notes, and smoke-test guidance are enforced through the production promotion workflow and live-probe scripts.

## Production launch foundation

The production shell disables startup friction, hides unfinished controls behind static feature flags, restores session state, preloads critical assets, and adds offline/error recovery hooks. See `docs/production-launch-foundation.md` and `config/production/launch-foundation.json`.

## That’s My Lingo production foundation

See `docs/thats-my-lingo-enterprise-foundation.md` for the enterprise entertainment-platform architecture, compliance guardrails, backend readiness, security gates, live-ops model, and QA checklist. The AI-light config foundation is documented on `/casino-config/`.

## Economy monitoring scaffold

The economy monitoring specification lives in `docs/lingo-economy-monitoring-master-spec.md`, the dashboard shell lives at `/economy-command-center/`, and JSON data contracts live in `config/economy/monitoring-contracts.json`. This scaffold is recommendation-only until backend services, security rules, and admin authorization are implemented.

## Agent cost guardrails

See `docs/agent-cost-guardrails.md` for static-first operating rules, Spend Management recommendations, and billing review guidance.
