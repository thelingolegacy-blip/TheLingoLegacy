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


- Compatibility date: `2026-09-01`
- Compatibility flags: `nodejs_compat`
- Usage model: `standard`
- Cloudflare script ETag: `763efc28368aa4585b0e92bcd546918d69acfe10f05e1ed099c66fde6a7005a8`
- Recovered source SHA-256: `9dab8b015ff50c16f075f5d26866e0ab93ab925e1f3399ebd1312d1211f2287f`
- Recovered source size: `30,715` bytes

The separate catch-all Worker was independently observed at version `137` (version ID `2d161fa5-598f-4998-ada8-7ac4c72c3461`) with the `ASSETS`, `CANONICAL_DOMAIN`, and `PUBLIC_SITE_URL` bindings. The exact-root Worker has no bindings. Do not treat these two runtime contracts as interchangeable.

## Important boundary

This is a recovered source baseline, not a deployment authorization or a completed migration. It was not deployed or modified in Cloudflare by this change. The live root Worker is still a separate production route from the catch-all Worker `thelingolegacyv-5`.

Before using this file for any future deployment:
1. Review the recovered source against the current public homepage and approved brand canon.
2. Run syntax, security, accessibility, responsive, and route tests.
3. Add a dedicated, reviewed Wrangler configuration and environment contract for the root Worker.
4. Verify route precedence, rollback targets, and the www/apex experience in isolated staging.
5. Obtain independent release acceptance and explicit production promotion authorization.

Do not add this Worker to the catch-all configuration or change the exact-root route as a shortcut.


## 2026-11-11 route-repair candidate

A preview candidate was prepared from the current recovered source with the following bounded changes:

- Repoint catalog cards to existing canonical GitHub pages for Loyalty Lane Apparel, Kotton's Code, That’s My Lingo, LINGOmedia, LINGOlibrary, Loyalty Lane Cycles, Loyalty Lane Designs, Doughboys Oasis vertical slice, LINGOworld, and LINGO Nexus.
- Preserve planned/disabled placeholders for wallet, identity, marketplace, cinema, and investment destinations until their service gates pass.
- Replace the whole-site "candidate experience" footer wording with an accurate statement that the public discovery portal is live while destination activation remains staged.
- Clarify that only routes and integrations which pass production verification are eligible for activation.

This update is source-only on the review branch. It has not been uploaded to Cloudflare or promoted. Preview and route QA are required before any production change.
