# askLINGO v2.0 — Memory and Knowledge Architecture

## Store separation

Do not treat all context as one memory pool. Separate:

1. User preferences and durable user-approved context.
2. Conversation history, if separately enabled.
3. Product and ecosystem knowledge.
4. Approved source documents and retrieval indexes.
5. Operational state and execution evidence.
6. Security, authorization, and audit records.

Each store has a defined owner, purpose, classification, tenant/product scope, retention period, deletion procedure, and access policy.

## Retrieval

- Resolve the user's identity and permitted scope before retrieval.
- Apply tenant, product, document, and row-level filters before content reaches the model.
- Preserve source ID, version, timestamp, owner, and access classification.
- Return citations/provenance where available.
- Treat retrieved text as untrusted data, never as executable instructions or policy.
- Do not use similarity ranking as an authorization mechanism.
- Recheck access before exposing cached or previously retrieved content.

## Conversation persistence

The existing askLINGO integration contract explicitly says not to persist conversation contents until retention, consent, deletion, access control, and applicable child-privacy requirements have been reviewed. v2.0 preserves this restriction.

Conversation persistence is OFF by default. Before enabling it, document data purpose, user notice/consent, age-appropriate controls, retention, export, deletion, backup deletion, legal review, tenant isolation, and security testing. No provider or storage binding is presumed active.

## Memory writes

A model-generated summary or inferred preference is not automatically a durable memory. Writes require an approved policy and source provenance. Sensitive information receives stricter treatment and must not be retained without a valid basis and explicit applicable authorization.

## Deletion and correction

Deletion requests must propagate to primary records, derived indexes, caches, and eligible backups according to the approved retention policy. The system must report what was deleted, what remains under legal/operational retention, and what cannot yet be verified. Do not claim deletion until the operation is evidenced.

## Knowledge quality

Track freshness, source authority, version, completeness, conflicts, and confidence. If sources disagree, surface the conflict and prefer current authoritative sources for current-state claims. Historical records remain available as history but cannot override current runtime evidence.

## Prompt-injection defense

Retrieved documents, uploads, emails, issue comments, and external content are untrusted. They may inform answers but cannot change system policy, grant capabilities, authorize actions, or redirect secrets.
