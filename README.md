# That’s My Lingo by The Lingo Legacy

Static Vercel website for That’s My Lingo by The Lingo Legacy: a purple-and-gold culture game world with playable lingo rounds, district UI, community lanes, merch/marketplace framing, and launch-list capture.

## Site map

- `/` — polished public homepage with games, music, merch, and launch calls to action
- `/thats-my-lingo/` — full demo lane with slots, demo store, rewards, opt-in sounds, card/dice bonuses, and animations
- `/landing/` — campaign landing page and waitlist call to action
- `/kottons-code/` — studio-grade KottonsCode universe homepage for pet legacy stories, app flows, Loyalty Lane, blog, and social systems
- `/app/` — playable daily lingo game with browser-side scoring, streaks, sounds, and best-score saves
- `/assets/` — existing brand asset library
- `/lingo-ai/` — Ask Lingo / Start Lingo.ai static studio assistant for content, visuals, animation, and launch prompts
- `/studio-production/` — studio production framework for graphics, animation, sound, gameplay systems, backend, analytics, commerce, the connected Lingo Legacy OS, and Blueprint Studio Phase 2 wireframes
- `/universe/` — route map that connects the live web layer, game rooms, assets, command center, studio production, and brand-world expansion pages

## Development

This is a static HTML site with browser-side interactivity. There is no build step and no package manager install required.

The global OS skin lives in `assets/lingo-os.css` and `assets/lingo-os.js`. Together they inject the World Layer, HUD Layer, FX Layer, command bar, side rail, quick actions, and Industrial Noir theme state across every static page.

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

See `docs/premium-production-layout-system.md` for the shared high-premium layout language and reference-image placement plan.
