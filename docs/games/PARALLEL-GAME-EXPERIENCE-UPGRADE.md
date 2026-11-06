# Parallel LINGO Game Experience Upgrade

**Status:** Development specification and source contract only. Not a completion or release claim.

## Portfolio lanes

| Lane | Experiences | Feature focus |
|---|---|---|
| Deluxe slots | That's My Lingo; Lingo Lions Eruptions; Cashman Lingo Mania | Reel engine, symbol atlas, wilds, expanding wilds, free spins, bonus rooms, cascades, win sequences, original mascot art |
| Deluxe card games | Spades Is My Lingo; UhNo Lingo U-No | Card/deck art, table states, dealing/flipping, legal-move state machines, reactions, sound and profile cosmetics |
| Arcade/adventure | Doughboy's Oasis; Tricia's Escape; Crazy Weasols; Silly in Philly; Jersey Shore: The Undead | Character portraits, environments, animation, movement, puzzles, racing, quests, co-op contracts and cinematic audio |

## Shared workstreams (parallel)

1. **Gameplay and rules:** preserve each title's game class. Slots use explicit, testable reel/payline/bonus contracts. Card games use legal-turn state machines and deterministic replay fixtures. Adventure games use deterministic movement, input and quest-state contracts.
2. **Art and symbols:** build original, title-specific symbol atlases, card decks, icons, backgrounds, scene art, character portraits, avatar portraits, frames and profile banners. Do not reuse assets across game namespaces without a recorded authorization.
3. **Animation:** define shared event names and timing primitives, then implement title-specific motion: reel spin/stop, symbol land, win highlight, cascade, card deal/flip, character emotes, scene transitions and particles. Respect reduced-motion settings.
4. **Audio:** create original or explicitly licensed music and sound effects for each title. Keep separate audio namespaces and per-category volume controls. Audio starts muted until a deliberate user gesture; provide captions/transcripts for voice.
5. **Profiles:** build a private-by-default cosmetic profile contract with display name, avatar, frame, banner, earned badges and loadout. Do not expose account identity, photos or player records to other games by default.
6. **Responsive presentation:** validate phone, tablet, desktop and smart-TV/controller layouts. Support touch, keyboard, pointer and controller where the game requires them.
7. **Quality and release:** every title gets its own tests, asset inventory, rights/provenance review, visual checks, accessibility checks, security/privacy review and independent acceptance evidence.

## Title-specific identity

- **That's My Lingo:** Vegas Studio, premium crimson/black/white/gold, original Cashman character, signature reel symbols, Wild Rush, free spins and Grand Order bonus sequence.
- **Lingo Lions Eruptions:** lion identity, eruption/cascade effects, original lion mascot and dedicated roar/impact sound palette.
- **Cashman Lingo Mania:** original Cashman character and symbol family, vault build-up and arcade score-attack bonus.
- **Spades Is My Lingo:** premium card-room identity, spade deck, bid/trick flow, partner signals, table reactions and tournament shell.
- **UhNo Lingo U-No:** original action-card art, challenge/stack effects, campus-comedy identity and original bulldog mascot.
- **Doughboy's Oasis:** coastal urban adventure identity, Money Mile racing, crew/territory systems, original character roster and district environments.
- **Tricia's Escape:** mystery environments, clue reveals, puzzle feedback, portrait dialogue and suspense audio.
- **Crazy Weasols:** original weasel cast, physics comedy, combo chains, stage hazards and expressive emotes.
- **Silly in Philly:** Philadelphia-inspired neighborhood stories, district discovery, dialogue choices and crew progression.
- **Jersey Shore: The Undead:** original creature designs, survival telegraphs, co-op state contracts, environmental hazards and cinematic suspense.

## Asset delivery checklist

For each asset: source file, immutable versioned path, dimensions/format, SHA-256, rights/provenance record, title namespace, alt text or transcript, mobile/desktop crop review, reduced-motion behavior where applicable, and independent visual acceptance. A generated concept image is not a finished sprite atlas, final portrait pack, or integrated runtime asset.

## Acceptance sequence

- Registry contract validates.
- Each game's core rules/state engine tests pass.
- Art/audio files are present, optimized and correctly namespaced.
- Animation events are connected to real gameplay state, not decorative timers alone.
- Profile data remains private and scoped to the intended title.
- Mobile/desktop/TV responsive and input QA passes.
- Accessibility, security, privacy, rights and performance reviews pass.
- CI produces retrievable jobs, logs and artifacts tied to the exact commit.
- Independent review accepts the evidence before any merge or promotion.

## Hard boundaries

All game currencies remain non-transferable demo-only values. No wagering, cash-out, redeemable currency, payment activation or sweepstakes entry is enabled. Do not change production routes, Workers, Firebase production resources, secrets, billing, DNS or the protected last-known-good release during this work. Draft branches and preview artifacts do not constitute production completion.
