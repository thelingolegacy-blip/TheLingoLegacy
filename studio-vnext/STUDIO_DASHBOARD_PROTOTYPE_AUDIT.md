# Studio OS Dashboard Prototype — Engineering Audit

**Scope:** User-supplied single-file HTML dashboard prototype for The Lingo Legacy Enterprise Studio OS.  
**Disposition:** Preserve as a UI/interaction reference. Do not deploy this file as a production control plane without the changes below.  
**Governance:** Fail closed; UI state is never authoritative release evidence.

## Executive assessment

The prototype communicates the intended product well: a unified navigation shell for infrastructure, the public homepage, That’s My Lingo, Loyalty Lane Apparel, KOTTONSCODE, and AskLINGO. It is useful as a visual/interaction prototype, but its present controls are largely browser-local simulations. A production implementation must separate presentation from trusted services and display only verified, timestamped status returned by APIs.

## Critical defects in the supplied prototype

1. **False CI/CD success:** `triggerMasterBuildPipeline()` writes success messages with timers, checks the G02 checkbox and labels the gate PASSED without dispatching or reading a GitHub Actions run. Remove the simulated success path. A button must call an authenticated backend job broker, return a run ID, poll real status, and show failure/unknown when no qualifying evidence exists.
2. **False accessibility/security attestations:** `triggerBotAgent()` marks WCAG compliance and security scan success using `setTimeout`. Replace with real Playwright/axe and security-scan jobs, attach versioned reports and exact commit/environment identifiers, and never let a UI checkbox certify a gate.
3. **False Firebase configuration:** `toggleFirebaseConfig()` changes labels only; it does not load or validate Firebase configuration. Replace with a server-side configuration health endpoint that returns safe metadata only (project alias, environment, validation time and pass/fail). Never expose service credentials in the browser.
4. **Unsafe production cutover control:** `executeProductionCutover()` trusts user-editable checkboxes and emits a success toast without a deployment request. Remove direct cutover from the prototype. Production promotion must be server-authorized, role-protected, approval-gated, bound to an immutable commit/artifact, have a recorded rollback target, and require independently verified gate evidence.
5. **Casino is not the specified game:** the screen contains three symbols, not a 5×3 grid with 20 paylines; client-side `Math.random()` and client-side balance/XP updates are not authoritative or auditable. Treat it as a local-only UI prototype. Build the actual game engine with versioned rules, deterministic test fixtures, server-authoritative outcomes, persistent sessions, ledgered transactions and reconciliation. Keep real-money or redeemable-value features disabled pending legal/licensing review.
6. **Cart is a counter, not commerce:** `addToCart()` only increments a number. Use Shopify as product/inventory/order source of truth, with variant IDs, actual cart state, sandbox checkout, signed/idempotent webhooks and end-to-end order tests.
7. **AskLINGO is scripted, not AI:** the reply logic is hard-coded keyword matching. Build an authenticated server-side assistant with approved indexed sources, citations where applicable, prompt-injection defenses, privacy controls, rate limits, evaluation tests and explicit unavailable/error states.
8. **Media sections are placeholders:** ebook/audiobook, YouTube and TikTok actions only show toast messages. Connect only after each provider integration is authorized and verified; otherwise label the feature as planned or preview-only.
9. **DOM injection risk:** `showToast()` inserts interpolated message content using `innerHTML`. Use `textContent` for user/data-derived strings and static DOM construction. Keep `escapeHtml()` only where unavoidable and context-correct.
10. **No real persistence or authorization:** tab state, cart, balance, XP and checkboxes live only in memory. Add authentication, role-based authorization, durable storage, server-side validation, audit trails and explicit error handling. Never trust client state for money, entitlements or approvals.
11. **Third-party supply-chain exposure:** Tailwind CDN, Font Awesome CDN, Google Fonts and Tone.js are loaded from external origins; integrity, CSP, fallback and version pinning are absent. Pin/package dependencies, add SRI where compatible, define CSP and test offline/failure behavior. Avoid relying on remote placeholder product imagery in production.
12. **Accessibility and UX gaps:** add keyboard and screen-reader testing, visible focus, semantic landmarks, focus management for modal dialogs, Escape-to-close, contrast/forced-colors/reduced-motion checks, mobile navigation state and clear loading/error states. Audio must be opt-in and never autoplay.

## Required dashboard service contract

The UI should read these from authenticated APIs, not infer them from button clicks:

- `GET /api/studio/health` — dependency health, checked timestamp, environment and degraded state.
- `GET /api/studio/projects` — project registry and owner.
- `GET /api/studio/releases/gates` — gate state, evidence URI/reference, commit SHA, environment, verifier and timestamp.
- `POST /api/studio/tasks` — enqueue an allowlisted task with idempotency key; return task/run ID.
- `GET /api/studio/tasks/{taskId}` — queued/running/succeeded/failed/cancelled state, log/artifact references and safe error summary.
- `POST /api/studio/releases/{releaseId}/approval` — privileged, audited approval only after server-side policy evaluation; not a client-side checkbox.
- `POST /api/studio/releases/{releaseId}/promote` — disabled unless all required gates pass and an authorized human approves the exact immutable artifact.

All mutations require authenticated identity, server-side role checks, schema validation, CSRF protection where cookie sessions are used, rate limits, audit records and clear failure responses. The API must not accept arbitrary shell commands, arbitrary URLs, user-supplied workflow names or arbitrary production targets.

## Recommended implementation order

1. Convert the prototype into a typed, accessible Next.js Studio Portal shell with shared design tokens and reusable components.
2. Replace simulated statuses with read-only GitHub, Cloudflare, Vercel, Firebase and Shopify adapters; display `UNKNOWN` when evidence is missing or stale.
3. Implement task orchestration with a queue, bounded concurrency, timeouts, cancellation, retries only for idempotent jobs, immutable logs and artifact checksums.
4. Add role-based access, approval policy, append-only audit events and secret redaction before enabling any mutations.
5. Implement product modules separately: public site/content; Shopify commerce; That’s My Lingo game/session service; KOTTONSCODE media/canon; AskLINGO retrieval/assistant.
6. Add automated unit/contract/integration/E2E, keyboard/accessibility, dependency/license, secret, asset and security tests. Require reports tied to exact commits.
7. Keep production cutover hidden/disabled until G02, Firebase, accessibility, security, governance, live-flow and independent certification gates pass.

## Acceptance criteria

- No UI action can manufacture a PASSED gate.
- Every status includes source, last-checked timestamp and evidence reference; missing or stale evidence is UNKNOWN/BLOCKED.
- Every mutation is authorized server-side and audited; production operations require human approval.
- All controls do the action their labels promise, or are visibly marked unavailable/planned.
- Game, commerce, AI and media capabilities pass their own contract and end-to-end tests.
- No production credentials are bundled into client code or logs.
- Rollback and recovery paths are exercised in a non-production environment.
- Apex/www remain unchanged until the independent release acceptance process authorizes promotion.
