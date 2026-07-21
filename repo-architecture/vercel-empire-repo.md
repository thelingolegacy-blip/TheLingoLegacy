# Lingo Legacy Entertainment LLC — Vercel Empire Repo

Tagline: Loyalty. Legacy. Language.

This repository is organized as a Vercel monorepo for the full Lingo Legacy ecosystem: web apps, HTML5/PWA shells, LG webOS/ThinQ surfaces, game services, book services, apparel, media, music, community, commerce, and Ask Lingo / Lingo.ai.

## Vercel project model

Vercel does not use a `projects` array inside `vercel.json`. Use one Vercel Project per deployable app or service, each connected to this Git repository with its own Root Directory:

| Vercel Project | Root Directory |
| --- | --- |
| lingo-web | `apps/web` |
| lingo-admin | `apps/admin` |
| lingo-creator | `apps/creator` |
| lingo-publisher | `apps/publisher` |
| lingo-mobile | `apps/html5-mobile` |
| lingo-webos | `apps/lg-webos` |
| lingo-thinq | `apps/lg-thinq` |
| ask-lingo-api | `services/ask-lingo` |
| lingo-commerce-api | `services/commerce` |
| lingo-media-api | `services/media` |
| lingo-community-api | `services/community` |
| lingo-games-api | `services/games` |

Shared logic lives under `packages/*`. Brand, legal, and roadmap source-of-truth documents live under `docs/*`. Media and product assets live under `assets/*`.

## Core shared systems

- Universal Login
- Universal Wallet
- Universal XP
- Universal Rewards
- Universal Inventory
- Universal Commerce
- Universal Notifications
- Ask Lingo / Lingo.ai intelligence

## Storage guidance

- Use Vercel Blob for logos, audio, video, books, apparel images, animation, and marketing files.
- Relational data should use Neon through the Vercel Marketplace. Vercel Postgres is no longer first-party; existing databases were migrated to Neon via the Marketplace in December 2024.
- Key-value, cache, and session workloads should use Upstash Redis through the Vercel Marketplace. Vercel KV is no longer first-party; existing stores were migrated to Upstash Redis via the Marketplace in December 2024.
