# That’s My Lingo by The Lingo Legacy

Static Vercel website for That’s My Lingo by The Lingo Legacy: a purple-and-gold culture game world with playable lingo rounds, district UI, community lanes, merch/marketplace framing, and launch-list capture.

## Site map

- `/` — polished public homepage with games, music, merch, and launch calls to action
- `/thats-my-lingo/` — production entertainment lane with 5x3 virtual reels, virtual wallet, progression, missions, ecosystem platform framing, live-ops readiness, compliance guardrails, demo store, rewards, opt-in sounds, and animations
- `/loading/` — cinematic LoadingPage gateway with Vegas Studio boot sequence, LL monogram reveal, jackpot progress rail, status ticker, audio visualization, and demo diagnostics
- `/studio-assets/` — studio-grade visuals, symbols, backgrounds, animations, glass panels, lighting, and user-triggered audio motifs
- `/master-interface/` — guardrailed static master interface preview with entertainment-only virtual game suite, radio-style ambience, safe progression, and world links
- `/landing/` — campaign landing page and waitlist call to action
- `/drop/` — founder micro-drop landing page for XP, mystery key, and badge-set reservation requests
- `/kottons-code/` — bright kids explorer world for Kotton, Kimba, Jada, play/learn/watch zones, storybook episodes, mini-games, and CSS animation cues
- `/kottons-code/episodes/sunny-key/` and `/kottons-code/episodes/blue-clue-trail/` — static KottonsCode episode pages
- `/kottons-code/educators/` — educator landing page with lesson prompts and safe-use notes
- `/kottons-code/app-wireframes/` — static app screen wireframes for onboarding, stories, activities, progress, and educator review
- `/tapstich/` — static apparel customization lane for patch drops, outfit boards, creator-safe merch concepts, and no-cost launch review
- `/app/` — playable daily lingo game with browser-side scoring, streaks, sounds, and best-score saves
- `/assets/` — existing brand asset library
- `/lingo-ai/` — Ask Lingo / Start Lingo.ai static studio assistant for content, visuals, animation, and launch prompts
- `/admin-command-center/` — production dashboard command center for assets, projects, studios, timeline, testing, publishing, and automation
- `/casino-upgrade/` — casino-grade UI upgrade package for visual skin, motion timing, sound hooks, and rollout planning
- `/casino-config/` — AI-light casino config command center for deterministic machines, economy, missions, events, worlds, admin screens, static config data, and safety guardrails
- `/payload-matrix/` — static payload URL matrix for reserved Lingo Legacy OS contracts across OS, AI, workflow, backend, app, nonprofit, and character systems
- `/monetization-safety/` — static Monetization Safety OS blueprint for virtual currency, subscriptions, ads, surveys, geo consent, AI/plugin governance, and no-cash-out rules
- `/integration-os/` — static front-to-back integration blueprint for Flutter, Firebase, Cloudflare, Vercel, GitHub, Blob, Neon, Upstash Redis, and studio pipelines
- `/studio-production/` — studio production framework for graphics, animation, sound, gameplay systems, static systems, no-cost QA, the connected Lingo Legacy OS, and Blueprint Studio Phase 2 wireframes
- `/studio-world-os/` — Silent World Constellation with fully individual entity worlds, seamless travel, sealed premium realms, and the unified cross-platform experience layer
- `/universe/` — route map that connects the live web layer, game rooms, assets, command center, studio production, and brand-world expansion pages
- `/outer-crown-expansion/` — HQ Mode multi-state expansion for NYC, Delaware, New Jersey, simulcast beacons, promo overlays, and ignition controls
- `/full-entity-simulcast/` — Full-Entity Simulcast Mode for simultaneous 24-hour Beacon Blast staging across entities, platforms, geo-beacons, XP, and monetization lanes
- `/trust-compliance/` — Lingo Safety Core trust layer for user protection, fair play, economy controls, responsible play, AI guardrails, role separation, and release readiness
- `/studio-ui-cleanup/` — Studio UI Cleanup Pass for visual separation, floating glass panels, depth hierarchy, animation priority, and mobile layout zones

## Development

This is a static HTML site with browser-side interactivity. There is no build step and no package manager install required.

The global OS skin lives in `assets/lingo-os.css` and `assets/lingo-os.js`. Together they inject the World Layer, HUD Layer, FX Layer, command bar, side rail, quick actions, Industrial Noir theme state, core OS modules, XP/wallet event feedback, and auto-cinematic overlay governance across the static site.

Open `index.html` locally, or serve the folder with any static server:

```bash
python3 -m http.server 3000
```

## Validation

Run the static smoke test before opening a pull request or deploying:

```bash
node scripts/validate-static-site.mjs
```

It checks JSON config, sitemap URLs, internal links/assets, anchor targets, inline script syntax, and required page metadata.

## Deployment

Deploy the repository as a static site on Vercel. The production entrypoint is `index.html` at the repository root.

See `docs/vercel-os-deployment-readiness.md` for the Vercel OS environment map, current static-site settings, and the checklist for a future Next.js App Router API/middleware migration.

Contact: hello@thelingolegacy.com

## Blueprint Studio Phase 2

The shared Creative OS / Production Dashboard architecture is documented in `docs/blueprint-studio-phase-2.md` and surfaced on `/studio-production/`.

## Premium Studio Production Layout System

See `docs/premium-production-layout-system.md` for the shared high-premium layout language and reference-image placement plan. The crowding/depth cleanup system is documented in `docs/studio-ui-cleanup-pass.md` and surfaced on `/studio-ui-cleanup/`.

## Studio safety guardrails

Security headers, advisory AI crawler blocks, no-cost service boundaries, and safe overlay rules are documented in `docs/studio-safety-guardrails.md`. The product-level Safety Core operating model is documented in `docs/lingo-safety-core.md` and surfaced on `/trust-compliance/`.

## Launch operations

Vercel-native launch checks, `/healthz`, rollback notes, and smoke-test guidance are documented in `docs/launch-operations-guardrails.md`.

## That’s My Lingo production foundation

See `docs/thats-my-lingo-enterprise-foundation.md` for the enterprise entertainment-platform architecture, compliance guardrails, backend readiness, security gates, live-ops model, and QA checklist. The AI-light config foundation is documented in `docs/lingo-casino-config-system.md` and surfaced on `/casino-config/`.

## Agent cost guardrails

See `docs/agent-cost-guardrails.md` for the static-first operating rules, Spend Management recommendation, and billing review path.
