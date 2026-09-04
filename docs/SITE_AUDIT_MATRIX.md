# Lingo Legacy Site-Wide Audit Matrix

Status: STAGED

## Core OS surfaces

| Surface | Route | Treatment | Dynamic requirement |
|---|---|---|---|
| Home | `/` | LINGO OS | runtime-configured hero, worlds, CTAs |
| LINGOhub | `/hub` | LINGO OS | identity, modules, activity |
| AskLINGO | `/ask` | LINGO OS | assistant/session state |
| LINGOroom | `/room` | LINGO OS | rooms/session state |
| LINGOstage | `/stage` | LINGO OS | broadcasts/events |
| LINGOnest | `/nest` | LINGO OS | personal workspace |
| LINGOcraft | `/craft` | LINGO OS | creation tools |
| LINGOvault | `/vault` | LINGO OS | asset metadata/access |
| LINGOpulse | `/pulse` | LINGO OS | telemetry/analytics |
| LINGOflow | `/flow` | LINGO OS | automation/workflows |
| LINGOsync | `/sync` | LINGO OS | integrations/sync status |
| Account | `/account` | LINGO OS | identity/tier/devices |
| Billing | `/billing` | LINGO OS | plans/invoices |
| Settings | `/settings` | LINGO OS | user preferences |
| Notifications | `/notifications` | LINGO OS | event stream |
| Security | `/security` | LINGO OS | MFA/devices/session history |
| Integrations | `/integrations` | LINGO OS | connected services/webhooks |
| Marketplace | `/marketplace` | LINGO OS | modules/add-ons |
| LINGOcare | `/care` | LINGO OS | support/status |
| LINGOguide | `/guide` | LINGO OS | documentation |
| LINGOcamp | `/camp` | LINGO OS | courses/certification |
| LINGOcrew | `/crew` | LINGO OS | community/events |
| Developer | `/developer` | LINGO OS | API/SDK reference |
| Legal | `/legal` | LINGO OS | policies |
| Errors | `/404`, `/500`, `/offline`, `/maintenance` | LINGO OS | graceful recovery |

## Independent universes

These remain visually and editorially independent while being discoverable from the OS:

- `loyaltylane.thelingolegacy.com`
- `kottonscode.thelingolegacy.com`
- `games.thelingolegacy.com`
- `books.thelingolegacy.com`
- `media.thelingolegacy.com`

## Audit acceptance criteria

Every production surface must have: responsive behavior, semantic structure, keyboard access, visible focus, reduced-motion fallback, error state, loading state, dynamic data/configuration where appropriate, optimized media, metadata/SEO where applicable, and a verified runtime route.

No page is considered complete merely because a route or static mock exists.
