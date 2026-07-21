# Lingo.ai activation

Lingo.ai is the playable game and AI app surface for the Lingo Legacy OS.

## Live surface

- Route: `/site/lingoai/`
- Status: browser prototype live.
- Current engine: HTML5 canvas scaffold with XP score, mute toggle, and share action.

## Game activation sequence

1. Keep browser prototype live on the OS site.
2. Export final GDevelop HTML5 build.
3. Replace the prototype game engine with the exported build.
4. Add analytics events for play, score, share, premium click, and XP booster click.
5. Publish portal-ready zip packages for game distribution.

## Distribution checklist

- Own site: live at `https://thelingolegacy.com/site/lingoai/`.
- Itch.io: needs HTML5 zip and listing assets.
- CrazyGames: needs playable build and review.
- GameMonetize: needs HTML5 build, metadata, and ad policy review.
- Poki: needs publisher acceptance and quality review.
- Social bios: use Lingo.ai route in bios and pinned posts.

## Monetization hooks

- Lingo.ai Premium.
- XP Booster / Crown Pack.
- Geo-beacon Crown drops.
- Social score challenge.

## Machine-readable source

- [`../os/games/lingo-ai-activation.json`](../os/games/lingo-ai-activation.json)
