# LINGO Lions Eruptions — playable browser prototype

**State:** isolated prototype; not production-certified.  
**Runtime:** native HTML/CSS/JavaScript modules; no external runtime dependency, CDN, API, or account required.

## Run
Open `index.html` in a modern browser, or serve this directory with any static file server. The prototype is local-first and can be played offline after the files are available.

## Play
- Trace a continuous orthogonal path of at least three adjacent glyphs of the same type.
- Release to resolve the chain, or use the Unleash Chain button.
- Tiles fall and refill; horizontal and vertical matches create cascades.
- Score is deterministic for the selected chain and cascade length.
- Relaxed and 90-second timed modes are included.
- Best score is stored in local browser storage only.

## Accessibility and safety
Keyboard focus, button labels, live status announcements, responsive touch layout, optional sound, reduced-motion control and system reduced-motion preference are included. No strobing effects, payment flows, wagers, cash-out, sweepstakes, or prize promises exist.

## Verification
Run the built-in Node test suite:
```sh
node --test studio-sites/games/lingo-eruptions/test/engine.test.mjs
```

## Not yet implemented
Lingo ID, cloud save, server-authoritative score, online leaderboard, multiplayer, approved final character art, layered background masters, sprite atlases, exported animation clips, original recorded music/SFX, voice, localization, device lab testing, independent live-route verification, and release certification.

Do not infer production readiness from this prototype.
