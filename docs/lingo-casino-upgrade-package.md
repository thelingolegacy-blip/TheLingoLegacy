# Lingo Casino Upgrade Package

This package defines the casino-grade upgrade wave for the Lingo game experience while keeping the product framed as virtual/social casino-style gameplay, not real-money wagering.

## Visual skin system

- Metallic gold gradients with neon rim lighting
- Velvet-purple backgrounds with ambient glow
- Glossy three-state buttons: idle, hover, press
- 3D reel framing with depth shadows and reflective rims
- Coin variants: gold, purple, platinum, founder edition
- XP bars with liquid-fill motion and badge states

## Motion system

| Moment | Timing | Behavior |
| --- | ---: | --- |
| Micro tap | 0.1s | Button compresses, glow tightens, soft click plays |
| Button transition | 0.3s | Elastic bounce, rim-light sweep, hover shimmer |
| Page transition | 0.5s | Cinematic slide with shallow parallax |
| Standard win | 1.2s | Reel stop, flash, XP pop, coin burst |
| Big win | 2.5s | Layered chime, coin fountain, chest reveal, mission progress fill |
| Loss | 0.6s | Soft fade, low thud, muted glow reset |

## Sound pack

- Tap: crisp soft click
- Card/reel stop: short metallic snap
- Standard win: rising chime
- Big win: layered chime plus coin burst
- Loss: muted low thud
- Background loop: noir casino ambient bed
- Haptics: tap, reel stop, win burst, and loss rumble hooks for mobile clients

## Reward and progression system

- Daily missions
- Weekly ladder
- Seasonal pass framing
- Cosmetic unlocks
- Level badges
- Animated treasure chest reveal
- Near-miss and almost-win sequences
- XP bursts and floating reward numbers

## Asset library requirements

- Reel symbols and reel frames
- Coin variants and coin burst sprites
- Glossy button states
- Neon glow overlays
- Win/loss Lottie animation slots
- XP bar and mission icon states
- Reward chest frames
- Velvet, brushed steel, and carbon-fiber textures
- Ambient overlays and casino-floor backplates

## Vercel-native asset pipeline

- Store uploaded/generated image, audio, and animation assets in Vercel Blob.
- Use immutable asset URLs for published drops so CDN/browser cache does not show stale overwrites.
- For fast reward/session state, use Upstash Redis. Vercel KV is no longer first-party; existing stores were migrated to Upstash Redis through the Vercel Marketplace in December 2024.
- For relational progression, wallet, or catalog data, use Neon. Vercel Postgres is no longer first-party; existing databases were migrated to Neon through the Vercel Marketplace in December 2024.

## Compliance note

Keep the experience as virtual/social casino-style mechanics unless a legal/compliance review approves real-money wagering, regulated odds, payouts, or cash-equivalent rewards.
