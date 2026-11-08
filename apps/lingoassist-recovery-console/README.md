# LINGOassist Recovery Console — Prototype

A dependency-free, browser-based prototype for manual G02 evidence intake and fail-closed gate visualization. It is intentionally isolated under `apps/lingoassist-recovery-console/` and does not replace the canonical Cloudflare Worker entrypoint.

## Features

- G00–G11 gate matrix, with G02 blocked and downstream gates blocked in the historical demo fixture.
- Local JSON packet parsing and SHA-256 digest calculation through Web Crypto.
- Optional SHA-256 manifest comparison.
- Safe text-only rendering of packet summaries.
- Nine explicit G02 predicates.
- Session-only review timeline and JSON export.
- No external API calls, no credentials, no shell execution, no GitHub write actions, and no deployment controls.

## Run locally

Serve this directory over localhost or HTTPS so Web Crypto is available, for example:

```bash
cd apps/lingoassist-recovery-console
python3 -m http.server 4173
```

Open `http://localhost:4173`. This static preview is not deployed and does not connect to GitHub.

## Run unit tests

Requires Node.js with built-in `node:test` support:

```bash
node --test apps/lingoassist-recovery-console/tests/evidence-core.test.mjs
```

The unit tests exercise pure evidence helpers. They do not prove browser rendering, live GitHub connectivity, runner registration, or production readiness.

## Evidence limitations

- The default statuses are a demo fixture, not current live telemetry.
- Packet parse success is not source verification.
- A matching checksum manifest establishes byte consistency only.
- G02 cannot be marked PASS by this app. Independent runner, job, log, artifact, and verification evidence is still required.
- The timeline is session-only and not durable.
- There is no Gemini integration yet. The Google AI Studio build prompt remains the route for generating and reviewing a full-stack Gemini-enabled version.
- Do not paste runner registration tokens, API keys, PATs, passwords, cookies, or private keys into evidence files.
- Do not deploy this prototype to production without a separate security and architecture review.
