# Documentation, Training & Memory Governance

## Documentation hierarchy

1. Governance charter and policies.
2. Architecture decision records (ADRs), threat models and data maps.
3. Product/service specifications and API contracts.
4. Standard operating procedures (SOPs) and runbooks.
5. Build, test, release, recovery and rollback instructions.
6. Provider integration and access guides.
7. Incident records, postmortems and change history.
8. Role-based training, exercises and competency records.
9. User-facing help, accessibility and support content.

Each controlled document needs owner, version, status, scope, reviewers, effective date, next review date, source links and change history. Mark draft, approved, superseded or retired. Do not present draft instructions as approved procedures.

## Minimum runbook template

- Purpose and supported systems.
- Preconditions, required role and access scope.
- Safety warnings and prohibited actions.
- Inputs, expected outputs and exact source references.
- Step-by-step procedure with checkpoints.
- Verification commands and expected results.
- Failure modes and decision tree.
- Recovery/rollback and abort criteria.
- Evidence to capture and redaction rules.
- Escalation owner, communication template and closure criteria.
- Revision, reviewer and training prerequisites.

## Training curriculum

| Learning path | Required modules | Competency evidence |
|---|---|---|
| All users | Identity, MFA, privacy, data handling, reporting incidents | Knowledge check |
| Contributors | Git workflow, review, CI, artifacts, evidence | Reviewed sample change |
| Operators | Environments, runbooks, change control, monitoring | Supervised non-production exercise |
| Recovery operators | Incident command, containment, restore, rollback | Recovery tabletop and practical drill |
| Verifiers | Test design, provenance, negative paths, independent review | Evidence review exercise |
| Release managers | Acceptance, signing, distribution, delivery, rollback | Release simulation |
| Administrators | Least privilege, secrets, audit, access reviews, emergency access | Admin control assessment |
| Product owners | Requirements, product acceptance, privacy, support readiness | Signed acceptance exercise |

Training completion records must include learner, course/version, instructor or delivery method, date, assessment, result and renewal date. Privileged operation requires current training and demonstrated competency.

## Memory and data governance

"Memory" is not a universal data store. Separate these classes:

1. **User personal memory:** user-controlled preferences/context. Use only for its intended purpose; honor requests to avoid topics. Never copy private user memory into public product telemetry or engineering tickets.
2. **Operational working context:** temporary state needed to complete a task; minimize and expire it.
3. **Project knowledge base:** approved architecture, runbooks, product decisions and training documents with owners and versioning.
4. **Evidence ledger:** immutable references and redacted operational proof; not a repository for secrets or raw personal content.
5. **Application/customer data:** governed by tenant boundaries, consent, privacy notice, retention and deletion policy.
6. **Model/agent memory:** explicitly scoped, source-attributed, permission-checked and reviewable; no cross-tenant retrieval.

## Memory rules

- Collect only what is necessary for a defined purpose.
- Record source, owner, purpose, sensitivity, consent/legal basis where applicable and retention.
- Respect user correction, access, export and deletion requests under applicable policy.
- Propagate approved deletion to indexes, caches, embeddings, replicas and downstream processors; retain only legally required minimal audit tombstones.
- Never treat model-generated inference as verified fact.
- Never retrieve or disclose another tenant's memory.
- Apply access control before retrieval, not only after generation.
- Filter secrets, credentials, payment data and sensitive personal data from prompts, embeddings, logs and training corpora.
- Separate training data from operational user data; do not use customer data for model training without explicit authorization and lawful basis.
- Provide provenance, version, freshness and confidence for retrieved knowledge.
- Support correction and expiry; stale memory must not silently override current source records.
- Human review is required for high-impact decisions.

## Knowledge lifecycle

`PROPOSE → SOURCE-CHECK → CLASSIFY → REVIEW → APPROVE → PUBLISH → VERSION → MONITOR → CORRECT/EXPIRE → DELETE/ARCHIVE`

A conversation, chat summary or AI-generated note is not automatically approved project documentation. Convert decisions into controlled records with owner and review.

## Site help and support readiness

Every public product must have accessible help, privacy notice, terms appropriate to the product, contact/support route, account recovery instructions, status communication path and escalation process. Child-directed experiences require age-appropriate privacy and parental controls review. Payment, sweepstakes, virtual currency and regulated features require separate legal/compliance acceptance before activation.
