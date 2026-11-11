# Wave 00.2 — Apex Worker Route Investigation

Status: INVESTIGATION REQUIRED — NO ROUTE MUTATION AUTHORIZED

## Observed state

Cloudflare route inventory returned both:

- `thelingolegacy.com/*` → `thelingolegacyv-5`
- `thelingolegacy.com/` → `lingo-flagship-root`

The apex wildcard also routes `www.thelingolegacy.com/*` and multiple product subdomains to `thelingolegacyv-5`.

## Required determination

Do not infer production request precedence from route names or API listing order. Determine actual matching behavior from Cloudflare's documented route matching rules and controlled live probes. The exact root route may be more specific than the wildcard, but that must be established with evidence before any action.

## Safe probe plan

1. Capture route IDs, patterns, script names, Worker deployment/version identifiers and current timestamps.
2. Inspect both deployed script versions and request handlers without changing them.
3. Probe:
   - `https://thelingolegacy.com/`
   - `https://thelingolegacy.com/healthz`
   - `https://thelingolegacy.com/api/v1/runtime`
   - `https://www.thelingolegacy.com/`
4. Record response status, `x-lingo-runtime`, `x-lingo-dynamic`, cache headers, request IDs and any script-specific response marker.
5. Compare observed behavior with the Cloudflare route-matching specification.
6. If evidence conflicts or is ambiguous, keep both routes unchanged and request an approved maintenance plan.

## Acceptance criteria

- One documented intended apex-root owner.
- No unexplained route overlap.
- No regression in apex wildcard, www or API paths.
- Reversible change plan with captured pre-change route IDs.
- Post-change live probes and rollback evidence.

## Protection

No Cloudflare route create/update/delete, Worker deployment, DNS change or production cutover is part of this investigation.
