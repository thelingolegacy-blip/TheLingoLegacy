# LECS-SEC-01 — Security, Override and Break-Glass Standard
**Status:** Proposed mandatory control baseline  
**Applies to:** All LINGO products, repositories, data, AI agents, MCP tools, cloud resources and production environments.

## 1. Security precedence
The precedence order is: law and contractual duties → privacy and data-use restrictions → identity and authorization → security policy → production safety and release controls → product configuration → operator convenience. Lower layers cannot weaken higher layers.

## 2. Override design
An override is a narrow, temporary, auditable exception to a named operational control. It is not a master password, hidden administrator mode, universal bypass, or permission inherited by an AI agent.

| Field | Mandatory value |
|---|---|
| Exception ID | Unique immutable identifier |
| Requester | Authenticated person and identity |
| Approver | Independent authorized person |
| Incident/change | Linked incident or change record |
| Asset/environment | Exact service, resource and environment |
| Control | Exact policy/control ID |
| Action | Exact permitted operation |
| Scope | Explicit resources and data classes |
| Start/expiry | UTC timestamps; maximum 30 minutes for break-glass |
| Reason/risk | Impact, alternatives and mitigation |
| Audit destination | Protected append-only log |
| Revocation | Automatic expiry plus revocation verification |
| Review | Post-event review and remediation owner |

### Deny conditions
Deny when the requester cannot be authenticated; the approver is absent or conflicted; the audit sink is unavailable; scope is wildcard/ambiguous; the request disables logging, encryption, authorization or tenant boundaries; the action violates data rights or legal duties; the exception has no expiry; or the target is production and its required release approval is absent.

### Break-glass sequence
1. Declare incident and assign incident commander.
2. Request exact temporary access and state impact.
3. Independent approver reviews scope and risk.
4. Policy engine grants least privilege with short expiry.
5. Execute only approved actions; every call is logged.
6. Revoke immediately after task or expiry; verify access is gone.
7. Review within one business day; create corrective actions.
8. Preserve evidence and update runbooks/policies through normal review.

## 3. Minimum security controls
- MFA for privileged human identities; unique service/workload identities.
- Least privilege, short-lived credentials, environment and tenant isolation.
- Secret manager or protected platform secrets; never commit secrets.
- TLS in transit and encryption at rest for sensitive stores.
- Server-side authorization on every protected request.
- Input/schema validation, output encoding, rate limits and abuse prevention.
- Dependency, secret, SAST, IaC, image and SBOM checks appropriate to stack.
- Threat model and abuse-case review before exposing a new trust boundary.
- Redacted, access-controlled logs; protected audit retention.
- Backups, restoration tests, incident response and vulnerability remediation.
- No production personal data in preview/test without approved safeguards.
- External/model/retrieved/tool content is untrusted; prompt injection defenses are required.

## 4. AI, RAG and MCP controls
- The model never acts as the authorization authority.
- Tools are allowlisted, scoped, schema-validated and independently authorized.
- Read and write capabilities are separated.
- High-impact actions require a human approval checkpoint.
- Retrieval ACLs are applied before generation; tenant boundaries are tested.
- Retrieved content cannot override system policy or grant permissions.
- Training data requires rights, consent/purpose, provenance and evaluation.
- No default training on user conversations or production data.
- Sensitive prompts and tool arguments are not logged raw by default.
- Model output is untrusted and must be validated before execution or publication.

## 5. Security incident severity and response
- Critical: active compromise, credential theft, cross-tenant disclosure, unauthorized privileged action, or control-plane bypass. Contain immediately; suspend affected credentials/tools/routes; preserve evidence; incident commander owns recovery.
- High: exploitable vulnerability or material policy failure without confirmed compromise. Mitigate promptly and block affected release.
- Medium: bounded weakness with compensating controls and tracked remediation.
- Low: hardening or documentation gap without material exposure.

Severity is assigned by the security owner using impact, exploitability, exposure and data sensitivity. No numeric severity score substitutes for judgment.

## 6. Evidence required
Threat model, asset/data classification, access matrix, secret scan, dependency/SBOM report, relevant security tests, audit sample, vulnerability disposition, incident/exception record and independent security acceptance. Missing evidence is UNKNOWN, not PASS.
