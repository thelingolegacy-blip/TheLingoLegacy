# Studio Media Runtime Guide

The central studio uses a shared media/runtime contract rather than duplicating presentation behavior across every surface.

## Required behavior

1. Critical branding assets load first.
2. Noncritical images/video/audio lazy-load.
3. Audio starts muted and requires explicit user interaction.
4. Reduced-motion preferences disable nonessential animation.
5. Every route has loading, empty, error, and success states.
6. Media failures degrade to the semantic fallback instead of blocking navigation.
7. Asset identity/version/integrity metadata belongs in the centralized manifest.
8. Production status is never inferred from source presence.

## Route integration

`/` → Legacy HQ  
`/arcade` → LINGOarcade  
`/game` → Thats My Lingo  
`/kottons-code` → KOTTONSCODE  
`/lane` → Loyalty Lane  
`/media` → Rise of Zavione  
`/assets` → shared media  
`/store` → storefront boundary  
`/ai` → askLINGO

## Verification boundary

The runtime guide defines expected behavior. It does not establish that the behavior is currently live.

Required production chain:

SOURCE → BUILD → DEPLOY → LIVE OBSERVATION → VERIFICATION → ACCEPTANCE
