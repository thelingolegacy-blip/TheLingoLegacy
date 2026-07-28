# Production launch foundation

The static site now starts in production shell mode through `assets/lingo-os.js` and `assets/lingo-os.css`.

## Startup defaults

- Onboarding screens, tutorial pop-ups, first-run animations, debug banners, placeholder tips, demo content, and temporary shortcuts are disabled by default.
- Unfinished controls use `data-feature-flag` and are hidden unless enabled in the shell configuration.
- The shell restores the last studio path, preloads critical visual assets, and keeps persistent navigation available.
- Offline and client-error hooks surface graceful recovery messages without adding paid telemetry.

## Feature flags

The current static flag defaults live in `config/production/launch-foundation.json` and are mirrored inside `assets/lingo-os.js` so the site can boot without a network round trip.

Disabled for launch:

- Admin command center shortcut
- Studio upgrade shortcut
- XP debug event button
- Pro-mode toggle
- Cinematic overlay toggle

Enabled for launch:

- Studio assets
- Trust Core
- User-triggered audio test pads

## Launch flow

1. Initialize core services.
2. Load local production configuration.
3. Restore session state.
4. Preload critical assets.
5. Initialize persistent navigation.
6. Start offline and recovery hooks.
7. Render the main application.

## Validation

Run before merge:

```bash
node scripts/validate-static-site.mjs
node scripts/smoke-static-site.mjs
```
