# Flagship root homepage candidate

This is a staging-only repair candidate derived from the exact deployed source snapshot captured in PR #460.

## Navigation repairs
- Repointed product cards from nonexistent `/studio-sites/<product>/` destinations to existing repository routes.
- Routed askLINGO to the static interactive prototype at `/lingo-ai/`; the page explicitly states that no live AI backend is connected.
- Routed support to `/beta-support/`, Lingo ID to its readiness page, and LINGOworld to the existing Living Universe page.
- Kept wallet, cinema, marketplace, Doughboys Oasis, investment/partner, and operations destinations in preview-only mode where a verified public product route or active service is not established.

## Missing asset repairs
Removed references to missing files:
- `/studio-sites/assets/asklingo-dock.css`
- `/studio-sites/assets/asklingo-dock.js`
- `/studio-sites/assets/tv-navigation.js`
- `/pwa-register.js`

Changed the Apple touch icon to the existing `/apple-touch-icon.png`.

## Release boundary
- `worker.js` remains the recovered exact deployed source baseline in PR #460.
- `worker.candidate.js` is a separate, un-deployed candidate.
- No Cloudflare route, Worker version, traffic allocation, DNS record, backend, payment, or production page was changed.
- This candidate must pass the route verifier and full responsive/accessibility/security QA before any deployment review.
