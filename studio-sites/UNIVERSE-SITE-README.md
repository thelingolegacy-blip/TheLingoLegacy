# LINGO Universe Studio Sites

## Preview structure
- `index.html`: responsive LINGO Legacy universe directory.
- `lingoarcade/index.html`: arcade discovery experience.
- `lingoslots/index.html`: five-reel virtual-coin demo.
- `assets/logos/*.svg`: individual, editable vector identities for 12 worlds.
- `shared/studio.css` and `shared/studio.js`: shared visual system and opt-in procedural UI audio.

## Art direction
Industrial Noir; black/obsidian surfaces, royal-purple light, metallic gold accents, cinematic gradients, motion-led world cards, individual identity marks, responsive navigation, and reduced-motion support. All SVG logos are original vector wordmarks with per-world palettes. They are starting identity systems, not final trademark/legal clearance.

## World directory
LINGOslots; LINGOarcade; That's My Lingo; Spades Is My Lingo; UhNo Lingo University; Lingo Eruptions; Cashman Lingo Mania; Tricia's Escape; Doughboy's Oasis; Crazy Weasols; Silly in Philly; Jersey Shore: The Undead.

## Media asset manifest contract
Each production media item must register: `asset_id`, `kind`, `path`, `version`, `sha256`, `license`, `owner`, `alt_or_transcript`, `variants`, `status`. Keep editable source masters separate from web exports. Audio must document duration, format, loudness target, rights/territory, transcript/cue description, and fallback. Browser audio is opt-in. Avoid unlicensed fonts, stock, music, and character art.

## Deployment and governance
This branch is an isolated preview proposal. It has not been merged or certified, and does not modify production DNS, Cloudflare routes, Worker secrets, payments, or live services. Production remains fail-closed while GitHub runner dispatch and public reachability are unverified. Required before activation: real runner assignment and sentinel logs, build/link tests, accessibility/reduced-motion audit, security review, asset rights review, approved game destinations, independent public fetch, and required review/merge checks.

## Game safety
LINGOslots remains entertainment-only. Local demo coins have no monetary value. No deposits, cash-out, paid spins, cash prizes, or game-linked payments are implemented.
