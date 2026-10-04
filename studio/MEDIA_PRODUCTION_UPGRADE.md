# Studio Media & Production Upgrade

## Canonical visual/media contract

The central Cloudflare studio artifact now reserves a production-grade media layer for:

- Visual identity: Crimson / White / Shadow Noire
- Motion: ambient lighting, entrance transitions, card/reel motion, reduced-motion fallback
- Audio: UI interaction cues, navigation confirmation, world/game ambience, mute-first behavior
- Assets: centralized image/SVG/audio manifests, route ownership, versioning, preload/lazy-load policy
- Loading: branded boot/loading shell with deterministic fallback
- Icons: consistent Lingo icon family with accessible labels
- Responsive: mobile/tablet/desktop compositions
- Accessibility: keyboard navigation, focus states, reduced motion, semantic labels
- Performance: lazy media, responsive images, cache headers, route-level loading boundaries
- Runtime safety: no fake production/live state; media availability is independently observable

## Production feature lanes

### Shared Studio OS
- unified shell/navigation
- askLINGO launcher
- shared identity/session boundary
- shared route registry
- health contract
- telemetry contract
- error boundary
- loading/error/empty states

### Media pipeline
- `/assets/visuals`
- `/assets/audio`
- `/assets/animation`
- `/assets/icons`
- `/assets/video`
- `/assets/manifests`

Every asset should carry:
`id + source + version + type + dimensions/duration + route_owner + integrity + accessibility_role`

### Experience lanes
- LINGOarcade
- Thats My Lingo
- KOTTONSCODE
- Loyalty Lane
- LINGOmedia / Rise of Zavione
- Studio Worlds
- askLINGO

## Runtime rule

This is a source/build upgrade only until independently verified at runtime.

`SOURCE → BUILD → DEPLOY → LIVE OBSERVATION → VERIFICATION → ACCEPTANCE`

No source asset, animation, audio cue, or feature is treated as production-live solely because it exists in GitHub.
