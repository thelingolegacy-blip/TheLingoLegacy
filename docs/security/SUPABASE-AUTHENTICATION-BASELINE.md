# Supabase Authentication and Authorization Baseline

**Observed:** 2026-11-16  
**Project:** `zoksxavxmgnkrthselek` (organization `thelingolegacy`, region `us-west-2`)  
**Status:** `ACTIVE_HEALTHY` at provider level; not approved as a LINGO product backend.  
**Changes made:** none; read-only review.

## Current evidence

- One Supabase organization and one active project are visible through the connected account.
- Project database reports PostgreSQL 17.
- The public schema returned zero tables.
- The Supabase security-advisor query returned zero lint notices.
- The available project metadata does not expose enough Auth configuration to verify enabled providers, redirect allowlists, MFA policy, session lifetime, JWT signing-key mode, or user provisioning.
- No LINGO product-to-project mapping, production role, or approved data boundary has been established.

A healthy provider project and an empty public schema are not proof of application authentication or authorization readiness. Zero advisor notices are not a substitute for source review, Auth configuration inspection, RLS tests, or an application-level acceptance test.

## Required setup before adoption

1. Obtain explicit owner approval for the exact LINGO product, environment, data classification, and project mapping. Do not attach multiple products to this project by default.
2. Configure only the required human sign-in providers and exact callback/redirect allowlists for the approved app origins.
3. Use Supabase Auth user JWTs for end-user identity. Validate JWT signatures, issuer, audience, expiry, and subject in every trusted API boundary.
4. Use asymmetric JWT signing keys where supported and plan rotation/revocation; do not build new components around the legacy shared JWT secret.
5. Enable RLS on every exposed table and storage object. Authorize by verified user identity and explicit ownership/tenant claims; add negative tests for cross-user and unauthenticated access.
6. Keep secret/service-role keys server-side only. Never ship them in React, Next.js browser bundles, Flutter, Unity, or static hosting.
7. Apply least-privilege database roles and separate development, staging, and production projects/credentials.
8. Add MFA enrollment, challenge, recovery, and authorization enforcement only after the app's user-support and recovery flows are designed. A frontend prompt alone does not enforce MFA.
9. Run provider and application security tests, including unauthenticated access, wrong audience/issuer, expired token, forged token, wrong tenant, RLS bypass attempts, and revoked-key behavior.
10. Record evidence by project ID, app build, source commit, test run, and reviewer before changing state to `CONNECTED_VERIFIED`.

## Current decision

Keep this project `CONNECTED_UNVERIFIED` and outside production. Do not create tables, users, OAuth providers, policies, secrets, or edge functions until the product mapping and non-production scope are approved. No cost-bearing resources or project changes are authorized by this review.

## Evidence boundary

The review verifies project metadata, provider health, public-schema table listing, and the returned security-advisor result. It does not verify Auth provider settings, JWT signing-key state, user accounts, MFA enforcement, database grants in other schemas, storage policies, Edge Function authorization, or application login flows.
