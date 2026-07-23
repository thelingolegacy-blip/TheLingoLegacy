# That’s My Lingo by The Lingo Legacy

Static Vercel website for That’s My Lingo by The Lingo Legacy: a purple-and-gold culture game world with playable lingo rounds, district UI, community lanes, merch/marketplace framing, and launch-list capture.

## Site map

- `/` — polished public homepage with games, music, merch, and launch calls to action
- `/thats-my-lingo/` — full demo lane with slots, demo store, rewards, opt-in sounds, card/dice bonuses, and animations
- `/landing/` — campaign landing page and waitlist call to action
- `/kottons-code/` — bright kids explorer world for Kotton, Kimba, Jada, play/learn/watch zones, storybook episodes, mini-games, and CSS animation cues
- `/tapstich/` — static apparel customization lane for patch drops, outfit boards, creator-safe merch concepts, and no-cost launch review
- `/app/` — playable daily lingo game with browser-side scoring, streaks, sounds, and best-score saves
- `/assets/` — existing brand asset library
- `/lingo-ai/` — Ask Lingo / Start Lingo.ai static studio assistant for content, visuals, animation, and launch prompts
- `/studio-production/` — studio production framework for graphics, animation, sound, gameplay systems, static systems, no-cost QA, the connected Lingo Legacy OS, and Blueprint Studio Phase 2 wireframes
- `/universe/` — route map that connects the live web layer, game rooms, assets, command center, studio production, and brand-world expansion pages
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

Contact: hello@thelingolegacy.com

## Blueprint Studio Phase 2

The shared Creative OS / Production Dashboard architecture is documented in `docs/blueprint-studio-phase-2.md` and surfaced on `/studio-production/`.

## Premium Studio Production Layout System

See `docs/premium-production-layout-system.md` for the shared high-premium layout language and reference-image placement plan. The crowding/depth cleanup system is documented in `docs/studio-ui-cleanup-pass.md` and surfaced on `/studio-ui-cleanup/`.

## Studio safety guardrails

Security headers, advisory AI crawler blocks, no-cost service boundaries, and safe overlay rules are documented in `docs/studio-safety-guardrails.md`. The product-level Safety Core operating model is documented in `docs/lingo-safety-core.md` and surfaced on `/trust-compliance/`.

## Launch operations

Vercel-native launch checks, `/healthz`, rollback notes, and smoke-test guidance are documented in `docs/launch-operations-guardrails.md`.
