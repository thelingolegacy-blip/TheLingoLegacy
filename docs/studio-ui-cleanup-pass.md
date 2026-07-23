# Studio UI Cleanup Pass

Use this pass when a screen has strong features but still looks crowded, blocked together, or too flat.

## Layer model

- Background World: atmosphere, lights, particles, and environment. Keep it low-contrast and slow-moving.
- Middle Content: cards, characters, machines, draft arenas, and main features. Give these objects shadows, glows, and breathing room.
- Front UI: buttons, menus, wallet, controls, and navigation. Keep controls closest to the user with clear spacing and press feedback.

## Remove the boxed-in feeling

Reduce heavy borders, thick outlines, crowded rectangles, buttons touching panels, and images competing with text. Replace them with floating glass panels, soft shadows, transparent overlays, depth shadows, subtle rim glows, and more empty space.

## Depth spacing

Every important object needs this stack: object, shadow layer, glow layer, background separation. If an object has highlight, shadow, and reflection, it does not need a heavy outline.

## Mobile layout

Use three zones instead of a squeezed desktop layout:

1. Top zone: logo, profile, currency, status.
2. Center zone: main gameplay or hero object.
3. Bottom zone: navigation and primary actions.

Secondary controls should move into contextual menus, rails, or sheets.

## Animation hierarchy

1. Main action: strongest animation.
2. Rewards: medium animation.
3. Background: slow movement.
4. UI: subtle hover, press, shimmer, and focus motion.

## One hero object rule

Every screen needs one focus. Casino screens focus on the slot machine. Draft screens focus on the draft arena or player card. Kotton’s Code screens focus on the Kotton character. Everything else supports that hero object.

## Recomposition targets

- Redesigned screen hierarchy.
- Spacing grid and safe zones.
- 3D component library.
- Floating cards and glass panels.
- Cinematic backgrounds.
- Cleaner navigation.
- Production-ready mobile layout.
