# Cloudflare Access preview hardening — 2026-11-08

**Change type:** Live Access policy containment  
**Environment:** Cloudflare account Access application `All Workers`  
**Production routes/DNS/Worker source:** Unchanged

## Before

The `All Workers` Access application (`23f8af94-4573-46af-8774-e245d01d6ece`) targets `all_workers` and had three policies:

- Allow Cloudflare account members.
- Allow a named operator identity through an `email_domain` rule whose value was a full email address, not a domain; that rule was malformed and would not reliably match the intended identity.
- Bypass Access for `everyone`.

The reusable bypass policy was shared by multiple per-worker Access applications. Deleting the reusable policy globally would have affected unrelated applications and was not safe.

## Changes applied and read back

1. Updated only the `All Workers` application to detach the shared `bypass everyone` policy. The application now has only two allow policies: Cloudflare account members and the named operator email.
2. Corrected the named operator policy from an invalid `email_domain` matcher to an exact `email` matcher. The reusable policy is attached to one application only.
3. Read the application back from Cloudflare and verified that no bypass policy remains on `All Workers`.
4. Read the account membership list and verified that the account owner identity is an account member, preserving the owner's preview access.
5. Read the reusable bypass policy back. It remains in place and is still attached to eight other per-worker applications; it was not globally deleted.

## Post-change checks

- The apex `/healthz` endpoint continued returning `ok`.
- The apex homepage continued serving the public candidate experience.
- No custom domain route, DNS record, Worker script, D1 database, Firebase project, Worker secret, or production deployment was changed.

## Remaining Access review

Eight per-worker Access applications still reference the reusable public-bypass policy. Their individual destinations and intended exposure must be reviewed before removing any further bypass association. Some may intentionally serve public content; a broad policy deletion would be unsafe. The staging Workers without a dedicated per-worker Access application now fall under the restricted `All Workers` application.

**Disposition:** The global Workers Preview URLs application is no longer public-by-default. Per-worker exceptions remain explicitly identified for separate review; no claim is made that every Workers preview URL is now private.

