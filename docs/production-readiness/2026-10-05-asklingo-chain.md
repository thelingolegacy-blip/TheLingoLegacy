# Production Readiness Evidence — 2026-10-05

## Scope

Remaining chain:

1. real G02 self-hosted runner
2. successful CI execution
3. Cloudflare `OPENAI_API_KEY` secret
4. authoritative book manuscripts
5. chapter audio generation and QC
6. independent runtime verification

## Current verified state

### G02 / CI

The latest PR-associated Static CI run reached a completed failure, but its job payload contained:

- job status: completed
- conclusion: failure
- runner assignment: unavailable
- steps: unavailable
- logs URL: unavailable

This is not G02 execution evidence.

The G02 acceptance predicate remains P1–P9. A queued/unassigned job cannot satisfy it.

### Cloudflare Worker

The live Worker `thelingolegacy` was inspected directly.

Current live runtime reports:

- `RUNTIME_VERSION = 5.0.0-studio-platform`
- release policy: fail-closed
- production mutation: FROZEN
- LKG: PROTECTED
- G02: FAIL / UNVERIFIED
- G03–G11: BLOCKED

The live Worker source currently contains no `/api/asklingo/realtime-token` or `/api/asklingo/respond` route. Therefore the askLINGO voice/research implementation is not yet promoted to the live Worker.

### Cloudflare secret inventory

The live Worker secret inventory returned an empty list.

Therefore `OPENAI_API_KEY` is **not installed** in the production Worker.

A secure OpenAI API-key setup flow has been opened for the project, but the key has not been transferred into Cloudflare.

### Manuscripts

The authoritative publishing blueprint defines the manuscript-to-audio chain and explicitly distinguishes a title's presence in an audio manifest from proof that authoritative chapter audio exists.

Current file retrieval located:

- `KottonsCode_DraftOne.pdf`
- `KottonsCode_DraftOne.docx`

These are labeled **DraftOne**, not explicitly author-approved authoritative manuscripts. They must not be silently promoted to authoritative source material.

The other six canonical audio titles did not surface as complete authoritative chapter manuscripts in the current file search.

### Audio

A LINGO Books spoken-intro preview exists from earlier work, but it is not chapter narration derived from an author-approved manuscript and is not production acceptance evidence.

No chapter audio is being marked authoritative or production-accepted.

## Required transition

```
REAL lingo-legacy-g02 RUNNER
        ↓
GITHUB JOB ASSIGNED
        ↓
runner_id > 0
        ↓
runner_name populated
        ↓
STEPS EXECUTE
        ↓
SENTINEL OUTPUT
        ↓
LOGS
        ↓
INDEPENDENT VERIFICATION
        ↓
G02 PASS
        ↓
CI PASS
        ↓
OPENAI_API_KEY INSTALLED
        ↓
CLOUDFLARE BUILD / VERSION
        ↓
RUNTIME VOICE TEST
        ↓
RESEARCH TEST
        ↓
BOOK AUDIO TEST
        ↓
INDEPENDENT ACCEPTANCE
        ↓
ESTABLISHMENT
        ↓
PRODUCTION AUTHORIZATION
```

## Fail-closed disposition

No production promotion, activation, or gate advancement is authorized by this evidence package.

Source implementation can continue independently, but live authority remains blocked until the required evidence is independently established.
