# Google AI Studio Build Prompt — LINGOassist G02 Recovery Console

Use this prompt in Google AI Studio Build mode after importing this repository or creating a new web app. This is a development scaffold, not production authorization.

## Product objective

Build **LINGOassist Recovery Console**, a secure, responsive, full-stack web application for the Lingo Legacy engineering team. It should help engineers inspect GitHub Actions runner evidence, organize G02 recovery, validate evidence packets, and prepare safe next actions. It must NOT pretend to register runners, dispatch workflows, change GitHub settings, deploy Cloudflare Workers, rotate secrets, merge PRs, or activate production unless a future separately reviewed integration explicitly grants and audits that capability.

## Canonical context

- Repository: `thelingolegacy-blip/TheLingoLegacy`
- Production runtime authority: Cloudflare Workers/Pages, with `worker.js` and `wrangler.jsonc` as current entrypoints.
- G02 runner name expected: `lingo-legacy-g02`
- Required runner labels: `self-hosted`, `linux`, `x64`, `lingo-g02`
- G02 acceptance is conjunctive: a matching real runner; GitHub job assigned with `runner_id > 0` and populated `runner_name`; steps instantiated; sentinel actually executes; logs are retrievable; evidence artifact is retrievable; artifact bytes are independently SHA-256 hashed; a verification record is independently retrievable and linked to the same artifact/reference.
- Current known posture from the evidence supplied at build time: G02 BLOCKED, root cause UNCONFIRMED, production LOCKED, LKG PROTECTED. Treat all statuses as stale until a fresh source is checked.

## Required screens

1. **Overview** — clear gate matrix G00–G11, current timestamp in UTC, source/freshness label, and prominent fail-closed state when evidence is missing or stale.
2. **Runner diagnostics** — expected runner name/labels; runner ID/name; job status; step count; logs/artifact availability; source SHA; workflow/run/job IDs; last observation timestamp. Unknown values must display UNKNOWN, never infer PASS from a queued job.
3. **Evidence intake** — upload/drag-and-drop JSON evidence packets and optional checksum manifests; validate JSON schema and packet SHA-256 using Web Crypto; show exactly which checks passed/failed/are unverified. Do not claim a checksum proves source authenticity or CI execution.
4. **Incident timeline** — append-only client-side session view of observations with source URLs, capture times, evidence hashes, and notes. Do not claim durable persistence until a real database is connected.
5. **Gemini evidence analyst** — explain provided evidence, distinguish observed facts from hypotheses, identify the next discriminating diagnostic, and draft incident notes. It must never invent API results or mark a gate PASS without required evidence.
6. **Runbook** — display safe, copyable host-side diagnostic commands. Registration tokens, API keys, PATs, cookies, private keys, and full environment dumps must never be requested or logged.
7. **Export** — downloadable JSON incident packet containing provenance, evidence status, hashes, and explicit limitations.

## Security and architecture

- Use the full-stack web app option (React UI plus server-side Node runtime).
- Gemini API calls must be server-side and use the platform-managed `GEMINI_API_KEY` secret. Never expose keys in browser code, prompts, logs, URLs, source maps, or exported packets.
- Start with offline evidence upload/manual source links. Do not implement a GitHub write API.
- If adding GitHub read-only integration later, place it behind a server-side adapter with minimum read permissions, explicit source attribution, timeouts, redaction, rate limits, and a visible freshness indicator. Never request runner registration tokens.
- No command execution, shell endpoint, arbitrary URL fetch, filesystem access, secret retrieval, or arbitrary tool/function calls from the browser.
- Treat evidence files and Gemini responses as untrusted data. Validate schemas and render text safely.
- No real-money wallet/payment functionality; no production-control buttons.
- No automatic deployment or production mutation. Build preview only; publishing requires separate human review.
- Provide loading, empty, stale, malformed, partial, and error states. Keyboard accessible, mobile responsive, dark industrial-noir visual language, gold and royal-purple accents, crisp technical tables and readable monospace identifiers.

## Required evidence logic

Represent each predicate as PASS / FAIL / UNKNOWN. Missing or stale evidence is UNKNOWN or BLOCKED, never PASS. A queued job with runner ID 0, empty runner name, and zero steps is a failed assignment observation. A completed run with empty steps/artifacts and unavailable logs does not prove tests executed or reveal the root cause. A packet's valid checksum proves only that the checked bytes match the manifest; it does not prove the evidence is authentic.

The app must show these G02 predicates separately:
P1 matching runner exists; P2 runner ID > 0; P3 runner name populated and matches expected; P4 job assigned; P5 steps instantiated; P6 sentinel executed; P7 logs generated; P8 logs retrievable; P9 evidence independently verified. G02 can PASS only when every required predicate is independently evidenced.

## Build/test acceptance

- Generate a coherent multi-file app with typed evidence models and schema validation.
- Add unit tests for missing fields, stale evidence, mismatched SHAs, runner ID 0, empty steps, missing logs, missing artifacts, digest mismatch, and verification-reference mismatch.
- Add a sample fixture based only on the documented blocked state; label it DEMO / HISTORICAL, not live telemetry.
- Add a README explaining setup, secrets, data flow, limitations, and how to import/sync with GitHub.
- Run the available build/tests in AI Studio and report actual output; do not claim tests passed if they were not executed.
- Do not deploy, connect write scopes, merge a PR, or alter the production runtime.

First generate the application and show the file tree and test results. Then iterate on errors only, preserving the restrictions above.