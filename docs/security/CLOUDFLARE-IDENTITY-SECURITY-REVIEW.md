# Cloudflare Identity Security Review

**Observed:** 2026-11-16  
**Account:** LINGO Cloudflare account (ID retained in provider; do not copy credentials into source)  
**Release posture:** `PROTECTED_HOLD`  
**Changes made:** none; read-only review.

## Verified account posture

- The connected Cloudflare user session is authenticated.
- One Cloudflare account was returned by the account-list endpoint.
- The account currently has one accepted member.
- That member has the **Super Administrator — All Privileges** role.
- The member record reports `two_factor_authentication_enabled: false`.
- The account settings report `enforce_twofactor: false`.
- No separate CI workload identity or scoped deployment credential was proven by this user-session authentication.

## Risk and required remediation

**High-priority identity risk:** a single Super Administrator account member with 2FA disabled creates a concentrated account-takeover and recovery risk.

Required owner-operated sequence:

1. Enroll and verify phishing-resistant MFA where supported (prefer a passkey/security key; retain a secure recovery method).
2. Confirm recovery codes and a second recovery path are stored securely outside the repository and outside chat.
3. Re-authenticate and verify account access from a trusted device.
4. Only then enable account-level 2FA enforcement, after confirming no legitimate collaborator or automation will be unexpectedly locked out.
5. Re-read account settings and member records to confirm both account enforcement and member enrollment are enabled.
6. Review whether a second named administrator/recovery owner is appropriate; grant only the minimum role required and avoid shared accounts.

This review did **not** enable account enforcement or change member roles because doing so can interrupt access and requires owner-side MFA enrollment/recovery readiness.

## CI and deployment identity

- Keep the human Cloudflare connection separate from CI deployment identity.
- Do not reuse a human OAuth session or Super Administrator token in GitHub Actions.
- Prefer an approved short-lived federation if supported by the selected Cloudflare deployment path; otherwise create a narrowly scoped staging-only API token through Cloudflare's secure UI, with only the exact Workers/Pages resources and actions required.
- Store any approved staging credential only in the designated secret manager / protected GitHub environment; never in Git, Worker source, app frontend variables, issues, or logs.
- Production deployment credentials remain unconfigured and unauthorized pending separate release acceptance.
- Verify token scope, expiry/rotation procedure, environment isolation, and negative tests before enabling any staging deploy job.

## Evidence boundary

This is a point-in-time account/member inventory. It does not verify the security of the human sign-in provider, device posture, active sessions, API token inventory, Worker bindings, CI federation, or production deployment authorization.
