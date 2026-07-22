# That’s My Lingo by The Lingo Legacy

Static Vercel website for That’s My Lingo by The Lingo Legacy: a purple-and-gold culture game world with playable lingo rounds, district UI, community lanes, merch/marketplace framing, and launch-list capture.

## Site map

- `/` — polished public homepage with games, music, merch, and launch calls to action
- `/thats-my-lingo/` — full demo lane with slots, demo store, rewards, opt-in sounds, card/dice bonuses, and animations
- `/landing/` — campaign landing page and waitlist call to action
- `/kottons-code/` — unified canon demo for apps, games, and ebooks with The Code, Loyalty Lane, dual-world conflict, realms, missions, MoodBling, Code XP, and OS architecture
- `/app/` — playable daily lingo game with browser-side scoring, streaks, sounds, and best-score saves
- `/assets/` — existing brand asset library

## Development

This is a static HTML site with browser-side interactivity. There is no build step and no package manager install required.

Open `index.html` locally, or serve the folder with any static server:

```bash
python3 -m http.server 3000
```

## Deployment

Deploy the repository as a static site on Vercel. The production entrypoint is `index.html` at the repository root.

Contact: hello@thelingolegacy.com
