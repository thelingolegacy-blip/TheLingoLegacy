# Lingo Legacy Empire — Sovereign Production Core

> **Authoritative Source of Truth:** `thelingolegacy-blip/TheLingoLegacy` (`main` branch)  
> **Sovereign Runtime:** Cloudflare Edge Workers & Pages  
> **Status:** Production promotion fail-closed; studio completion remains subject to acceptance evidence  

---

## Static Backup Snapshot — 2026-10-24

This branch, `recovery/static-backup-2026-10-24`, is an isolated static-hosting snapshot based on the repository's authoritative `main` branch. It preserves the checked-in public website entry point (`index.html`), static assets, headers, redirects, and web manifest without changing `main`, production DNS, the apex/www Worker, or production traffic.

**Scope:** public-facing static presentation and linked files only. Dynamic API routes, authentication, Firebase-backed state, wallet/loyalty transactions, checkout, and other server-side functionality are not certified by a static Pages deployment and must remain disabled or clearly unavailable until separately validated.

**Recovery contract:**
1. Keep this snapshot isolated from production.
2. Deploy only to a separate `pages.dev` backup hostname; do not attach `thelingolegacy.com` or `www.thelingolegacy.com`.
3. Verify homepage, static assets, navigation, 404 behavior, mobile layout, response headers, and absence of secret material before calling the backup accepted.
4. Preserve the original production Worker and last-known-good version for rollback.
5. No merge, DNS change, production route change, or production promotion is authorized by this snapshot.

The branch is a recovery artifact, not a declaration that production is restored or release gates have passed.

---

## 🏛️ Ecosystem Architecture
The Lingo Legacy Empire is consolidated under a single, authoritative, studio-grade infrastructure:
- **`thelingolegacy.com` & `www`**: Master Hub & Game Floor (*That's My Lingo*)
- **`apparel.thelingolegacy.com`**: Loyalty Lane Apparel Studio & Stripe Gateway
- **`arena.thelingolegacy.com`**: LINGOarena Virtual Arcade & Casino Floor
- **`reads.thelingolegacy.com`**: LINGOreads Virtual Theater & Literary Hallway
- **`media.thelingolegacy.com`**: LINGOmedia Sonic Branding & Mixtape Nexus
- **`ai.thelingolegacy.com`**: AskLINGO AI Omni-Oracle Neural Core

---

## ⚡ Deployment Pipeline
All deployments are managed natively via Cloudflare Edge Workers and GitHub Actions. Legacy hosting providers such as Vercel are retired and are not part of the production architecture.

---

## 🧱 Runtime Contract
The production surface is dynamic-runtime-first. The Cloudflare Worker controls runtime headers, edge HTML transformation, platform context, health, manifest, status, checkout, beacon APIs, and asset delivery.

Production authority:

`GitHub → GitHub Actions gates → Cloudflare Worker → dynamic runtime/API → Cloudflare assets → canonical domain`

The canonical Worker is `thelingolegacyv-5`; its entrypoint is `worker.js`, configuration is `wrangler.jsonc`, and compatibility date is `2026-09-01`. Keep this identity synchronized with the Cloudflare deployment metadata and the release-configuration consistency gate.

The separate Studio build-validation Worker is `lingo-legacy-studio-build`; its entrypoint is `cloudflare/studio-worker.js`, configuration is `cloudflare/wrangler.toml`, and compatibility date is `2026-10-04`. Its GitHub workflow is dry-run-only and pins Wrangler major version 4. It is not the apex/www production Worker.

---

## 🔎 Verification Contract
A successful build alone never marks production LIVE. Repository state, CI evidence, Worker deployment, domain routing, backend bindings, observability, safety controls, and live probes must agree.

Required runtime probes include:
- `/api/v1/platform/gates`
- `/api/v1/platform/modules`
- `/healthz`
- `/api/v1/runtime`
- `/api/v1/platform/manifest`
- `/api/v1/platform/status`
- `/api/v1/site/context`

---

## 🧭 Studio Platform Completion

The platform surface is organized across flagship, Loyalty Lane World, LINGOslots / That’s My Lingo, rewards, Lingo ID, Universal Legacy Wallet architecture, askLINGO, commerce, Legacy Club, media, Studio, documentation, and governance. Virtual/demo gameplay and presentation layers are separated from real-value transaction and prize activation.

Production state is evidence-driven:

`EVIDENCE → VERIFICATION → ACCEPTANCE → AUTHORITY → TRANSITION`

Current release authority: `G02 = FAIL / UNVERIFIED`, `FAIL-CLOSED = ACTIVE`, `MUTATION FREEZE = ACTIVE`, `LKG = PROTECTED`, downstream promotion/activation = `BLOCKED`.

## 🛡️ Production Gate

`RECONCILE → FIX → VERIFY → REVIEW → QA → PUSH → DEPLOY → VERIFY LIVE`

The production gate is fail-closed. No live production sign-off is valid without successful live verification evidence.
