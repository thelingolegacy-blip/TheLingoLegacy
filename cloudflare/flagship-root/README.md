# Flagship root Worker — recovered source baseline

This directory contains a source snapshot recovered from the currently deployed Cloudflare Worker `lingo-flagship-root`.

## Provenance

- Zone: `thelingolegacy.com`
- Exact-root route: `thelingolegacy.com/`
- Route ID: `04e6903aedf14510b58b34b57df699e1`
- Worker: `lingo-flagship-root`
- Deployment ID: `31ccefbb-ddf4-4a62-974b-3ee9d0bc81d3`
- Deployed version: `658acd1a-997b-45cd-b8fc-e59c59b26b45`
- Traffic allocation observed: 100%
- Bindings observed in the cutover runbook: none

## Important boundary

This is a recovered source baseline, not a deployment authorization or a completed migration. It was not deployed or modified in Cloudflare by this change. The live root Worker is still a separate production route from the catch-all Worker `thelingolegacyv-5`.

Before using this file for any future deployment:
1. Review the recovered source against the current public homepage and approved brand canon.
2. Run syntax, security, accessibility, responsive, and route tests.
3. Add a dedicated, reviewed Wrangler configuration and environment contract for the root Worker.
4. Verify route precedence, rollback targets, and the www/apex experience in isolated staging.
5. Obtain independent release acceptance and explicit production promotion authorization.

Do not add this Worker to the catch-all configuration or change the exact-root route as a shortcut.
