# Lingo Legacy Empire — Sovereign Production Core

> **Authoritative implementation source:** `thelingolegacy-blip/TheLingoLegacy` (`main`)  
> **Production edge:** Cloudflare Workers  
> **Status:** Production promotion remains fail-closed; studio completion is subject to acceptance evidence.

---

## Ecosystem architecture

The LINGO portfolio is organized into distinct product worlds and divisions:

- **`thelingolegacy.com` / `www.thelingolegacy.com`** — flagship hub and product discovery.
- **`LINGOslots`** — That’s My Lingo, Spades Is My Lingo, Uhno Lingo U-No, Lingo Lions Eruptions and Cashman Lingo Mania.
- **`LINGOarcade`** — Tricias Escape, Doughboys Oasis, Crazy Weasols, Silly in Philly and Jersey Shore: The Undead.
- **`LINGOlibrary`** — Kotton’s Code and the LINGO story/book catalog.
- **`LINGOmedia`** — The Rise of Zavione and creator media.
- **`LINGOlane`** — Loyalty Lane designs, apparel and laundry-cycle experiences.
- **`LINGOworld`** — askLINGO, LINGOai, travel, campus, support, voice, shield, lounge and related shared services.

Product names use the canonical LINGO naming system. The current names are **LINGOarcade** (not LINGOarena), **LINGOlibrary** (not LINGOreads), **askLINGO** and **LINGOai**.

## Verified edge and domain routing

The following is the read-only Cloudflare route inventory checked on 2026-11-09. A configured route or DNS record is not proof that every product, backend or user flow is accepted.

| Host / route | Current target | Status |
|---|---|---|
| `thelingolegacy.com/*` | `thelingolegacyv-5` | Main production Worker |
| `www.thelingolegacy.com/*` | `thelingolegacyv-5` | Main production Worker |
| `thelingolegacy.com/` | `lingo-flagship-root` | Separate exact-root Worker |
| `atlas.thelingolegacy.com/*` | `lingo-ecosystem-atlas` | Dedicated Atlas Worker |
| `launch.thelingolegacy.com/*` | `lingo-static-backup-proxy` | Static recovery surface |
| `ai`, `thats-my-lingo`, `theriseofzavione`, `therealzavione`, `sparkling-rain`, `lingo`, `cyber`, `solar`, `drip`, `site`, `luxe`, `web`, `hub`, `v3`, `v4`, `blog` subdomains | `thelingolegacyv-5` | Main Worker route aliases |
| `studio-preview.thelingolegacy.com` | `lingo-studio-control-center-staging` | Staging only; asset/browser acceptance incomplete |
| `resilience.thelingolegacy.com` | `lingo-resilience-gateway` | Isolated resilience fallback |

The DNS inventory also contains:
- `app.thelingolegacy.com` → `my-flutter-app.pages.dev` (DNS-only; current build provenance is not verified).
- `admin.thelingolegacy.com` → `admin-thelingolegacy.firebaseapp.com` (DNS-only; authenticated Firebase configuration is not verified).
- `casino.thelingolegacy.com` → AppDeploy proxy (deployment record is not feature acceptance).
- Google mail records, SPF, DMARC and legacy `_vercel` verification TXT records.

**Planned, not verified live:** `apparel.thelingolegacy.com`, `arena.thelingolegacy.com`, `reads.thelingolegacy.com` and `media.thelingolegacy.com` do not appear in the current 34-record DNS inventory. Do not present these as active production domains until DNS, routes, runtime, backend and browser acceptance are verified. Product experiences may still be exposed through approved paths on the flagship domain.

## Deployment pipeline and production baseline

The intended source-to-production path is:

`GitHub source → verified CI and review gates → Cloudflare Worker preview → staging QA → approved production deployment → live probes`

The current pipeline is **not fully operational**: GitHub Actions runs on recent PR heads are returning `startup_failure` with zero jobs. Cloudflare branch integration has uploaded preview Worker versions 290–292, but none is assigned production traffic.

The canonical production Worker is `thelingolegacyv-5`; its repository entrypoint is `worker.js`, configuration is `wrangler.jsonc`, and compatibility date is `2026-09-01`.

The current production traffic deployment remains 100% on Worker version 137 (version ID `2d161fa5-598f-4998-ada8-7ac4c72c3461`). Newer branch uploads are preview-only. Do not promote a preview without exact source/build provenance, passing CI, security review, staging acceptance and rollback verification.

The current Studio staging Worker is `lingo-studio-control-center-staging`. It is not the apex/www production Worker. The exact-root homepage Worker is `lingo-flagship-root`; version 1 remains deployed while version 2 is a preview.

## Runtime and backend contract

The production Worker controls edge runtime headers, request routing, platform context, health, manifest, status and asset delivery. Real-value checkout remains disabled. Virtual/demo gameplay is separate from real-money wagering, cash-out or cash-equivalent redemption.

Firebase is an application-service integration boundary, not a verified live backend in the current release. The project selector and client configuration still contain placeholders; authenticated app registrations, identity, data rules, storage, App Check, billing and end-to-end tests remain outstanding. askLINGO is a planned shared capability; a provider design or health endpoint does not prove authenticated model execution.

## Verification contract

A successful source build or provider deployment record alone never marks production LIVE. Repository state, CI execution, Worker deployment, domain routing, backend bindings, observability, privacy, security, asset provenance, live probes and rollback evidence must agree.

Required runtime probes include:

- `/api/v1/platform/gates`
- `/api/v1/platform/modules`
- `/healthz`
- `/api/v1/runtime`
- `/api/v1/platform/manifest`
- `/api/v1/platform/status`
- `/api/v1/site/context`

## Studio platform completion

The platform surface spans the flagship, Loyalty Lane World, LINGOslots, LINGOarcade, LINGOlibrary, LINGOmedia, LINGO ID, Universal Legacy Wallet architecture, askLINGO, commerce, LegacyXclub, Studio, documentation and governance.

Production state is evidence-driven:

`EVIDENCE → VERIFICATION → ACCEPTANCE → AUTHORITY → TRANSITION`

Current release authority: `G02 = FAIL / UNVERIFIED`, hosted CI execution = `BLOCKED`, production promotion = `BLOCKED`, last-known-good = `PROTECTED`.

## Production gate

`RECONCILE → FIX → VERIFY → REVIEW → QA → PUSH → DEPLOY → VERIFY LIVE`

No production sign-off is valid without successful live verification, independent review and a rehearsed rollback path.
