# That’s My Lingo Casino Config System

This document defines the AI-light casino configuration foundation for That’s My Lingo. Core game logic remains deterministic; AI is allowed only for reviewed flavor content.

## Runtime rules

- Spins, payouts, jackpot selection, XP, missions, rewards, volatility, and unlocks must be deterministic server-authoritative logic.
- AI can generate slang, mascot dialog, event names, seasonal lore, and cosmetic descriptions only.
- AI output must be cached by prompt and parameters, filtered, reviewed, and stored before it can appear in the product.
- The public Vercel surface stays static-first with no API/function requirement for this foundation; config is served as static JSON.
- Persistent production storage should use Neon through Vercel Marketplace for relational data and Upstash Redis through Vercel Marketplace for cache/rate counters. Vercel Postgres and Vercel KV are no longer first-party products; existing stores were migrated to Neon and Upstash Redis via Vercel Marketplace in December 2024.

## Config domains

| Domain | Purpose | Production table target |
| --- | --- | --- |
| Machines | Slot definitions, symbols, paylines, bonuses, world assignment | `machines` |
| Jackpot profiles | Jackpot tiers, contribution rates, reset rules | `jackpot_profiles` |
| Economy | XP curves, no-cash-value currencies, reward tables | `economy_settings` |
| Missions | Daily, weekly, and seasonal objectives | `missions` |
| Events | Bonus storms, jackpot festivals, season launches | `events` |
| Cosmetics | Slot skins, lobby themes, FX packs, unlock rules | `cosmetics` |
| Worlds | Casino worlds, machine lists, ambient FX | `worlds` |
| Families | Mascot, bonus, and jackpot family grouping | `families` |
| Auto engine | Cron rotations, mutation rules, approval gates | `auto_engine_settings` |
| Safety | Content review, rate limits, circuit breakers, player disclosures | `safety_settings` |

## Static config surface

This foundation intentionally disables the new Vercel Function surface. The live static seed is served from:

```txt
/config/casino/master.json
```

When authenticated admin storage is ready, add protected write APIs with validation, role checks, audit logs, and rate limits. Until then, the public site reads static documentation and JSON only.

## Admin screens

- Machine Editor: machines, symbols, paylines, volatility, bonus schemas.
- Economy Editor: XP curves, currencies, rewards, jackpot profiles.
- Mission/Event Scheduler: daily missions, weekly events, seasons, bonus storms.
- Cosmetics Manager: skins, lobby themes, FX packs, unlock rules.
- World Builder: worlds, families, ambient FX, machine grouping.
- Safety Guardrail Monitor: AI review state, filter status, fallback packs, rate-limit/circuit-breaker health.

## Next implementation step

Move the JSON seed into a protected admin data model:

1. Add authenticated admin access.
2. Add schema validation before writes.
3. Persist writes to Neon tables.
4. Cache published config in Upstash Redis.
5. Require an audit log entry for every economy, jackpot, event, or machine change.
6. Add protected Vercel Functions only after the static foundation is approved.
