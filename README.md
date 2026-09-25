# Lingo Legacy Empire — Sovereign Production Core

> **Authoritative Source of Truth:** `thelingolegacy-blip/TheLingoLegacy` (`main` branch)  
> **Sovereign Runtime:** Cloudflare Edge Workers & Pages  
> **Status:** Studio Platform Complete / Production Promotion Fail-Closed  

---

## 🏛️ Ecosystem Architecture
The Lingo Legacy Empire is consolidated under a single, authoritative, studio-grade infrastructure:
- **`thelingolegacy.com` & `www`**: Master Hub & Game Floor (*That's My Lingo*)
- **`apparel.thelingolegacy.com`**: Loyalty Lane Apparel Studio & Stripe Gateway
- **`arena.thelingolegacy.com`**: LINGOarena Virtual Arcade & Casino Floor
- **`reads.thelingolegacy.com`**: LINGOreads Virtual Theater & Literary Hallway
- **`media.thelingolegacy.com`**: LINGOmedia Sonic Branding & Mixtape Nexus
- **`ai.thelingolegacy.com`**: AskLINGO ⭐️ AI Omni-Oracle Neural Core

---

## ⚡ Deployment Pipeline
All deployments are managed natively via Cloudflare Edge Workers and GitHub Actions. Legacy hosting providers such as Vercel are retired and are not part of the production architecture.

---

## 🧱 Runtime Contract
The production surface is dynamic-runtime-first. The Cloudflare Worker controls runtime headers, edge HTML transformation, platform context, health, manifest, status, checkout, beacon APIs, and asset delivery.

Production authority:

`GitHub → GitHub Actions gates → Cloudflare Worker → dynamic runtime/API → Cloudflare assets → canonical domain`

The Worker entrypoint is `worker.js`; Cloudflare configuration is `wrangler.jsonc`.

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
