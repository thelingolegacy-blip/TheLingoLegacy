# That’s My Lingo by The Lingo Legacy

Static Vercel website for That’s My Lingo by The Lingo Legacy: a purple-and-gold culture game world with playable lingo rounds, district UI, community lanes, merch/marketplace framing, and launch-list capture.

## Site map

- `/` — polished public homepage with games, music, merch, and launch calls to action
- `/thats-my-lingo/` — full demo lane with slots, demo store, rewards, opt-in sounds, card/dice bonuses, and animations
- `/landing/` — campaign landing page and waitlist call to action
- `/app/` — playable daily lingo game with browser-side scoring, streaks, sounds, and best-score saves
- `/assets/` — existing brand asset library
- `/lingo-ai/` — Ask Lingo / Start Lingo.ai static studio assistant for content, visuals, animation, and launch prompts

## Development

This is a static HTML site with browser-side interactivity. There is no build step and no package manager install required.

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
