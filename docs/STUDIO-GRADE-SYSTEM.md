# LINGOlegacy Studio-Grade System

## Experience
- Industrial Noir foundation with obsidian surfaces, metallic depth, gold and royal-purple accents.
- Each LINGO platform gets an individual visual signature while sharing one tokenized design language.
- Responsive-first: 44px minimum touch targets, keyboard navigation, reduced-motion support, high-contrast states and semantic landmarks.

## Visual system
- Tokens: color, type, spacing, radius, elevation, blur, motion, z-index and density.
- Asset classes: brand marks, platform icons, navigation icons, product imagery, character art, environmental backgrounds, UI illustrations, motion and sound.
- AVIF/WebP where supported, responsive srcsets, lazy loading below fold, priority loading for hero art and immutable content hashes.
- Controlled SVG icon set; no arbitrary icon mixing.

## Motion
- Press, hover, focus, loading, success, error and route-transition states.
- Platform-specific signature transitions using shared easing and duration tokens.
- Respect prefers-reduced-motion; remove nonessential parallax, particles and long transitions.

## Sound
- Opt-in and muted by default.
- Separate UI, ambience and media channels.
- Persistent mute/volume preferences.

## Backgrounds
- Base texture + atmospheric gradient + platform environment + foreground lighting.
- Contrast guards are mandatory; mobile receives a performance-safe composition.

## UI/UX architecture
- Global shell: navigation, identity, notifications, search, account and wallet state.
- Individual shells for LINGOlane, LINGOslots, LINGOarcade, LINGOlibrary, LINGOmedia, LINGOworld, LINGOai, askLINGO, LINGOboom, LINGOtravel, LINGOcampus, LINGOsupport, LINGOwifi, LINGOvoice, LINGOshield, LINGOlounge, LINGOdonations and LegacyXclub.
- Core components: Button, IconButton, Card, Modal, Drawer, Tabs, Toast, Skeleton, EmptyState, DataTable, MediaFrame, ProductCard, WalletBadge, XPProgress and PlatformNav.

## Infrastructure
- Cloudflare Edge owns DNS, routing, redirects, caching and security policy.
- Worker is the canonical edge gateway.
- Firebase owns identity/data services where appropriate.
- Shopify owns Loyalty Lane commerce data; Tapstitch owns production/fulfillment integration; Stripe is the approved payment path.
- Secrets never enter Git.

## CI/CD
- PR: lint -> typecheck -> unit -> build -> accessibility -> asset validation -> security checks.
- Preview: immutable artifact -> smoke -> E2E -> visual regression -> runtime checks.
- Promotion requires verified evidence.
- Production: immutable artifact -> Cloudflare validation -> Firebase smoke -> commerce smoke -> telemetry -> acceptance.
- Previous verified artifact remains rollback-ready.

## Observability
- Structured logs with correlation IDs.
- Web vitals and client errors without exposing secrets or unnecessary personal data.
- Worker health and runtime endpoints remain independently probeable.
- Release evidence binds commit, artifact, deployment, runtime, tests and acceptance.

## Governance
This document defines the engineering/design burden. It does not create evidence or authorize deployment. G02 runner acceptance and the existing fail-closed gate matrix remain authoritative.
