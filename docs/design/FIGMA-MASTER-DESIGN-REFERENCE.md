# Figma Master Design Reference

**Canonical Figma file:** [THE LINGO LEGACY — Enterprise Master Design System](https://www.figma.com/design/W5unjzxbrpKazxgiyEO8WG)  
**Figma file key:** `W5unjzxbrpKazxgiyEO8WG`  
**Revision:** 2026-11-24  
**Status:** Editable design foundation created; application integration and platform QA remain open.

## Purpose

This Figma file is the canonical visual-design workspace for the LINGO Legacy portfolio. It aligns product surfaces to one enterprise design language while allowing each product to retain its own information architecture and content identity.

## Current editable Figma frames

1. **01 — Design Foundations** — Industrial Noir / Crimson Shadow, typography hierarchy, brand palette and channel principles.
2. **02 — LINGO Enterprise Control Tower / Desktop** — portfolio overview, shared status indicators, governance summary and reusable navigation/product-card components.
3. **03 — LINGO Control Tower / Mobile** — compact responsive portfolio and status view.
4. **04 — LINGO Control Tower / Connected TV** — 10-foot experience concept with remote-first focus/navigation principles.
5. **05 — That’s My Lingo / Vegas Studio Mode** — 5×3 reel layout, 20-payline labeling, demo-only credits and explicit no-wagering/no-cashout/no-prize-redemption notice.

## Shared tokens and reusable components

- Dark foundation: `#050507`, `#0A0A0C`, `#151519`
- Brand accents: Crimson `#C41E3A`, Gold `#D4AF37`, Bright Gold `#F7C84B`, Purple `#4B2E83`
- Text and border: `#F5F5F7`, `#A7A7B0`, `#303038`
- Figma variable collection: **LINGO / Enterprise Foundations**
- Reusable components: **Navigation / Item**, **Portfolio / Product Card**, **That’s My Lingo / Reel Symbol**
- A shared card-radius token and spacing token are defined; the spacing token is bound to the foundations layout.

## Governance and implementation rules

- The Figma workspace is the visual source of truth; Core GitHub remains the source of truth for implementation contracts and release evidence.
- Use the enterprise platform blueprint at `docs/architecture/LINGO-ENTERPRISE-PLATFORM-BLUEPRINT.md`.
- Use shared CSS reference tokens at `docs/design/lingo-enterprise-tokens.css`.
- Import the tokens and component patterns into Web and mobile through reviewed implementation changes. Do not claim they are live until those changes are merged, built and verified.
- Maintain responsive variants for web, iOS, Android, tablet and LG webOS/connected TV.
- Preserve accessibility: visible focus, sufficient contrast, semantic hierarchy, reduced motion and keyboard/remote navigation.
- Preserve product-specific rules. That's My Lingo remains virtual-credit Studio Mode only; no wagering, cash-out, prize redemption or monetary conversion.
- Do not use a screenshot or flattened raster as a substitute for editable native Figma layers.

## Remaining acceptance

- Visual review in Figma at desktop, mobile and TV sizes.
- Review component property overrides and variable bindings.
- Import shared tokens into the Web and mobile repositories through PRs.
- Run browser, accessibility, device and TV remote-focus tests.
- Obtain product-owner and accessibility review before design acceptance.
- Release only after the Core release gates and provider execution evidence pass.

This reference records a design artifact, not a deployment, app-store registration, device registration or production release.
