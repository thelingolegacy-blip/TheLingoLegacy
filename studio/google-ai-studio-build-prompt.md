# Google AI Studio Build Prompt — LINGO LEGACY Studio + LINGO AI

Paste this into Google AI Studio Build mode after importing the isolated development branch. This is a prototype prompt, not production authorization.

---

You are building a secure, evidence-first developer and operations prototype for **The Lingo Legacy**. The brand is Industrial Noir: near-black surfaces, metallic borders, royal-purple accents, gold highlights, high contrast, responsive layouts, and a polished studio-grade control room. Tagline: “Loyalty. Legacy. Language.”

## Build objective

Create a full-stack web prototype called **LINGO Studio + LINGO AI** with:
- A responsive Studio Control Center dashboard.
- A conversational LINGO AI assistant.
- A release gate and evidence viewer.
- A runner diagnostic report viewer.
- A module/integration registry.
- A draft change proposal and approval ledger.
- A provider readiness panel for Gemini and other replaceable AI providers.

Use React for the UI and the server-side runtime available in AI Studio Build mode. Keep provider calls on the server. Do not assume the source repository’s Cloudflare Worker has been modified or deployed.

## Non-negotiable safety and truthfulness rules

The repository is under fail-closed release governance:
- G00 and G01 are PASS.
- G02 is FAIL / UNVERIFIED.
- G03–G11 are BLOCKED.
- Production mutation is FROZEN.
- Last-known-good is PROTECTED.
- Activation authority is NOT GRANTED.

Treat those as supplied baseline facts only; show their source and timestamp as “provided baseline” unless a live, authenticated API actually verifies them. Do not invent current state, runner IDs, names, labels, job results, logs, artifacts, test outcomes, billing status, access grants, or deployments.

Do not create buttons that falsely imply an action works. Keep merge, deployment, secret changes, permission changes, billing, reward issuance, wallet mutations, and activation disabled. Do not implement an autonomous production execution mode.

## LINGO AI operating modes

Implement four modes:
1. **Observe** — summarize only supplied/live verified state.
2. **Analyze** — explain evidence, gaps, and likely causes; label inferences as hypotheses.
3. **Propose** — draft an action plan, code change, test plan, or PR text; require human approval.
4. **Verify** — compare claims with actual artifacts and return PASS / FAIL / UNKNOWN per predicate.

For each proposed action, return structured data:
```json
{
  "action_id": "string",
  "purpose": "string",
  "target": "string",
  "risk": "low|medium|high|critical",
  "preconditions": ["string"],
  "required_permissions": ["string"],
  "evidence_required": ["string"],
  "rollback_plan": "string",
  "approval_state": "not_requested|pending|approved|denied",
  "execution_state": "not_executed|executed_and_verified|failed|unknown"
}
```

Never mark an action executed or verified because the model suggested it. Use “UNKNOWN” when no real source is connected.

## G02 runner diagnostic

Create a read-only report workflow that checks evidence for:
- registered runner name and ID;
- online status and last check-in;
- exact labels: self-hosted, linux, x64, lingo-g02;
- job assignment and runner identity;
- instantiated steps;
- sentinel output and actual log URL/content;
- uploaded evidence artifact;
- independent verification status.

G02 passes only when every required predicate is supported by real, retrievable evidence. If any value is missing, contradictory, stale, or inferred, show FAIL / UNVERIFIED and stop. Do not dispatch workflows or attempt host repair from the AI prototype.

## UI requirements

- Accessible landmarks, keyboard navigation, visible focus, ARIA live status, and reduced-motion support.
- Mobile-first responsive layout and empty/loading/error states.
- Dashboard cards: Release Authority, G02 Runner, CI Evidence, Cloudflare Edge, AI Provider, Billing Readiness, Access & Approvals, Module Registry, Audit Trail.
- Each card shows status, evidence source, observed-at timestamp, and confidence class: VERIFIED / PROVIDED / INFERRED / UNKNOWN.
- Use realistic sample data only in an explicitly labeled “DEMO DATA — NOT LIVE” sandbox.
- Add a visible “PRODUCTION LOCKED” banner while the baseline gates are blocked.
- Add a status refresh button only if it calls a real configured read endpoint; otherwise show “Refresh unavailable — no live connector configured.”
- Add export of a diagnostic report only from the data actually displayed, including its evidence classification.

## Security and backend requirements

- Keep `GEMINI_API_KEY` server-side in the Secrets panel; never expose it to browser code, logs, source control, or client bundles.
- Validate request shape and size, apply rate limits, and handle provider errors without returning secrets.
- Do not put user data, credentials, full logs, or sensitive artifacts into prompts by default. Provide redaction before analysis.
- Do not claim authentication/authorization exists unless implemented and tested. Clearly label the prototype as internal sandbox.
- Do not add any privileged backend mutation route in this build.
- Never write secrets into generated files.
- Include unit tests for gate evaluation and schema validation, plus a manual test checklist.

## Repository integration and output

- Preserve existing files unless a change is necessary and explain each changed file.
- Do not modify the production Worker routing, DNS, secrets, Firebase rules, GitHub Actions policy, branch protection, or deployment configuration.
- Keep generated code in a dedicated prototype directory or separate feature branch.
- Produce a concise README with setup, secret configuration, local test instructions, known limitations, and teardown instructions.
- Provide a change summary and test evidence. If tests cannot actually run, say so explicitly.
- Do not deploy to production. A Cloud Run deployment, if explicitly performed later, must be a restricted sandbox and must not change production DNS.

Start by inspecting the imported project and report the detected framework and existing files. Then propose the smallest coherent implementation plan before changing files.
