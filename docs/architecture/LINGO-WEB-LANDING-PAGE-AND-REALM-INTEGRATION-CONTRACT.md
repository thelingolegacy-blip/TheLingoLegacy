# LINGO Web, Landing Page & Realm Integration Contract
Version 1.0.0 · 2026-11-15

## Experience contract
The flagship website is the canonical discovery layer for The Lingo Legacy. Every card and call to action derives its target and readiness label from the checked-in product registry.

## Page map
- / — flagship home/landing, owned by the verified Cloudflare root Worker while PR #548 is under review.
- /worlds/ — realm directory and discovery.
- /studio-hub/ — creation and operating hub; authenticated controls remain gated.
- /lane/ — Loyalty Lane and services.
- /loyalty-lane-apparel/ — apparel destination.
- /loyalty-lane-cycles/ — community laundry-cycle destination.
- /thats-my-lingo/ — game destination with demo/play-credit disclosures.
- /studio-sites/lingoarcade/ — arcade index.
- /library/ — library index.
- /kottons-code/ — family learning/story destination; privacy review required.
- /media/ — media index.
- /contact/, /privacy/, /terms/, /trust-compliance/ — trust and legal pages.

These are candidate canonical routes discovered in the repository. Before enabling navigation, verify each route on the exact release candidate, confirm it renders, has working back-navigation, and is accessible. A folder existing does not establish production readiness.

## Component standards
- Header: accessible skip link, responsive navigation, current-page indication and no hover-only controls.
- Hero: one H1, concise value proposition, primary and secondary discovery actions.
- Realm cards: realm name, purpose, status label, owner route and accurate platform badges.
- Featured modules: curated by registry field; never expose an unverified destination as active.
- Trust panel: privacy, terms, accessibility, play-credit policy and support.
- Footer: canonical contact/legal links and version/status link.
- Search: registry metadata; server-backed search only after API/privacy contract.
- Media: descriptive alt text, lazy loading below fold and explicit rights.
- Motion: respect reduced-motion; avoid autoplay audio/video.
- Mobile/TV: touch targets at least 44 CSS px; keyboard and directional focus support.

## Search, metadata and SEO
Unique page title/description, canonical URL, Open Graph metadata and approved sitemap. Robots rules require explicit distribution review; do not block all major crawlers without a deliberate policy decision. Structured data must describe only real verified products/offers. Never fabricate reviews, prices, availability, launch dates or customer counts. Establish Core Web Vitals budgets, responsive images, minimal third-party scripts and immutable asset caching. CSP/security headers are edge-owned and require browser tests.

## Registry-backed route API
Each product exposes product_id, realm_id, display_name, summary, canonical_path, status, visibility, platforms, owner, dependencies, launch_policy, asset_manifest, last_verified_commit and last_verified_at.
Navigation: production is active only with approved release record; verified is verified preview/staging, not public production; preview shows Preview label; planned/scaffolded shows Coming Soon or is hidden; disabled has no active CTA.

## Accessibility and QA
Keyboard-only navigation, skip link, logical focus order, no traps, accessible labels, WCAG 2.2 AA contrast, status not conveyed by color alone, 200% zoom, 320px viewport, reduced motion, captions/transcripts, labelled forms and announced errors. Browser matrix: current Safari iOS, Chrome Android, desktop Chrome/Firefox/Safari; smart-TV/remote QA when in scope. Run link checks, route smoke, image 404 checks, CSP report review, Lighthouse and manual assistive-technology checks.

## Content and legal
No invented endorsements, testimonials, availability, prices, investment returns or guarantees. Approve founder biography, family references, licensed characters, music, footage, artwork and user-generated content. Children's content requires data minimization, guardian-facing disclosures and no behavioral ad tracking. Game pages disclose credit value; default is free/non-redeemable play credits. Sweepstakes remain disabled pending jurisdiction-specific legal review and approved rules.

## Acceptance
1. Exact source commit recorded.
2. CI build and route tests run and pass.
3. Every visible link resolves to intended verified target.
4. Mobile/desktop browser QA passes.
5. Accessibility and performance checks retained.
6. Legal/privacy/rights copy approved.
7. CSP, headers, redirects, sitemap and robots behavior verified.
8. Preview version and rollback target recorded.
9. Independent release acceptance attached.

The currently known homepage source and exact-root Worker work are in draft PR #548. Keep it separate from this architecture PR and do not promote its Cloudflare preview without the evidence above.


## Live edge inventory checkpoint — 2026-11-15
Read-only Cloudflare inventory confirms the zone is active on the Free Website plan. The apex exact-root route thelingolegacy.com/ points to lingo-flagship-root, with version 1 receiving 100 percent of traffic. PR #548's version 3 (alias flagship-nav-repair-2026-11-11) is preview-only and not active. The apex wildcard route thelingolegacy.com/* and www wildcard route www.thelingolegacy.com/* point to thelingolegacyv-5. This means the apex root and www root are not currently proven to share the same homepage implementation. Treat apex/www parity as a P0 route-ownership issue; do not change routes or promote versions until independent browser QA, deep-link coverage, rollback and owner acceptance pass.
