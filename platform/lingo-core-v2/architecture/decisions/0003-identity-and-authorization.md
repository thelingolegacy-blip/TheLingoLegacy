# ADR-0003: Identity federation and authorization

**Status:** PROPOSED  
**Date:** 2026-11-15

## Context
LINGO products require a shared identity experience while preserving separate product permissions, data ownership and security boundaries.

## Proposal
- Use OIDC for federation and standards-based token verification.
- LINGO ID is the platform identity abstraction; external provider subjects are mapped through a stable issuer-plus-subject identity key.
- APIs validate signature, issuer, audience, expiry and key rotation; never trust client-supplied user IDs as authority.
- Authorization is enforced server-side using explicit roles/attributes and product/domain scopes.
- Separate authentication from authorization; a valid login does not grant access to every product.
- Use short-lived access tokens and approved refresh/session handling; store secrets only in managed secret stores.
- Account recovery, deprovisioning, consent and audit are first-class lifecycle flows.

## Consequences
Identity provider selection and tenant strategy remain open until provider/account/security review. No production user migration or identity cutover is authorized.

## Acceptance
OIDC negative/positive tests, multi-user isolation tests, authorization matrix, key rotation, recovery and audit evidence.
