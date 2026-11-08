# LINGOsheilds Threat Model

## Trust boundaries

1. Browser → Edge API
2. Edge API → Control Plane
3. Control Plane → Provider APIs
4. Control Plane → Runner Grid
5. Agent Gateway → Model Providers
6. Runners → Artifact Storage
7. Release Plane → Production
8. Evidence Plane → Audit Store

## Primary threats

- compromised developer credential
- compromised OAuth installation
- malicious pull request
- poisoned dependency
- malicious agent instruction
- prompt injection
- runner escape
- artifact substitution
- secret exfiltration
- provider state drift
- unauthorized merge
- deployment rollback abuse
- evidence tampering

## Required controls

- zero-trust service authentication
- scoped tokens
- sandboxed execution
- dependency pinning
- artifact digest verification
- signed provenance
- branch protection
- policy evaluation
- human/authorized acceptance
- immutable audit trail
- independent post-deployment verification

## Agent-specific rule

External model output is untrusted input until validated.

```
MODEL OUTPUT
     ↓
VALIDATION
     ↓
POLICY
     ↓
EVIDENCE
     ↓
AUTHORIZED ACTION
```
