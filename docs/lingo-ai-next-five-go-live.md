# Lingo.ai next five go-live tasks

This is the next-five activation package for Lingo.ai.

## 1. Launch QA checklist

Verify before each production push:

- Root route loads.
- Game canvas renders.
- Mute toggle works.
- Share button works or copies fallback text.
- Distribution page opens.
- Payment CTAs resolve.

## 2. Privacy / policy placeholder

Use this as a portal submission placeholder until legal-approved policy copy is finalized:

- Policy route: `/site/lingoai/privacy.html`.
- Purpose: explain prototype tracking, browser-only gameplay, and future analytics/payment hooks.
- Constraint: no unsupported legal claims.

## 3. Portal submission pack

Bundle these before submitting:

- Portal metadata.
- Tags and genre.
- HTML5 zip.
- Game icon.
- Cover image.
- 3 screenshots.
- 15-second gameplay clip.
- 30-second trailer.
- Privacy policy link.

## 4. Analytics event wiring map

Events to wire when analytics/custom events are implemented:

- `play_lingo_ai`
- `score_xp`
- `share_score`
- `click_premium`
- `click_xp_booster`
- `portal_outbound_click`

## 5. Production go-live checklist

Confirm:

- Vercel production is `READY`.
- Custom domains are attached.
- PR summary is updated.
- Portal submissions are queued.
- Stripe public links are pending or inserted.

## Machine-readable source

- [`../os/games/lingo-ai-next-five.json`](../os/games/lingo-ai-next-five.json)
