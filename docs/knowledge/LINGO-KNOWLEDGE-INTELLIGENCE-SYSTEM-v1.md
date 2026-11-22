# LINGO Knowledge & Intelligence System (LKIS) v1

**Status:** Proposed enterprise capability — draft, not activated  
**Owner:** LINGOlegacy_MASTER / Knowledge & Intelligence Center (KNOW)  
**Source of truth:** GitHub repository `thelingolegacy-blip/TheLingoLegacy`  
**Related architecture:** `docs/architecture/lingo-command-control-architecture-v1.md`  
**Policy:** This specification does not authorize production mutations, automated external actions, provider activation, payment activation, runner registration, or release promotion.

## 1. Mission

LKIS makes the LINGO ecosystem better at discovering, validating, connecting, applying, preserving, and improving knowledge. It is a shared enterprise capability, not a competing source of truth and not a claim that a knowledge platform or AI runtime is already deployed.

LKIS must help every LINGO domain distinguish what is known, what is proposed, what is inferred, what is unknown, and what has been independently verified.

## 2. Operating principles

1. **Evidence before certainty.** Every material operational claim links to a source, observation, test, or accountable decision.
2. **Authority is domain-specific.** GitHub is authoritative for source and approved engineering decisions; Cloudflare for edge configuration; Firebase for its verified project and data state; finance, legal, and provider systems remain authoritative for their respective records.
3. **No silent promotion.** A hypothesis, draft, preview, local test, or generated answer never silently becomes an approved fact or production state.
4. **Freshness is explicit.** Every volatile fact has an observation time and review policy. Stale evidence is not current evidence.
5. **Provenance is preserved.** Keep source identifiers, version/commit, retrieval time, author/actor where known, and transformation history.
6. **Least privilege.** Retrieval permissions do not imply write permissions. Agents cannot grant themselves authority or approve their own protected actions.
7. **Privacy by design.** Minimize personal data, classify records, respect retention rules, and never place credentials, tokens, secrets, or payment data in knowledge documents.
8. **Reusable learning.** Capture root causes, successful repairs, failed approaches, and regression tests so that known failures are less likely to recur.
9. **Human accountability.** Named human owners remain responsible for high-impact decisions, legal interpretations, financial actions, and release acceptance.
10. **Cost-aware by default.** Reuse approved infrastructure and free-tier capabilities; measure before introducing new paid services or duplicate stores.

## 3. Knowledge record contract

Each durable knowledge record should include:

| Field | Requirement |
|---|---|
| `id` | Stable unique identifier |
| `title` | Short, unambiguous subject |
| `domain` | Owning LINGO product, center, or discipline |
| `classification` | public, internal, confidential, or restricted |
| `knowledge_type` | fact, observation, decision, hypothesis, design, procedure, lesson, or unknown |
| `statement` | The smallest useful claim or instruction |
| `source_refs` | Authoritative URLs, repository paths, commit IDs, issue IDs, or system record IDs |
| `evidence_refs` | Test run, artifact, log, screenshot, audit, or independent verification references |
| `observed_at` | Timestamp of the observation, in ISO 8601 |
| `review_after` | Review deadline or policy; omit only for intentionally immutable records |
| `status` | proposed, verified, stale, disputed, blocked, superseded, or retired |
| `confidence` | calibrated low, medium, or high with rationale; not a substitute for evidence |
| `owner` | Accountable role or team |
| `dependencies` | Related record IDs or system identifiers |
| `limitations` | Known gaps, assumptions, scope, and caveats |
| `change_history` | What changed, when, why, and supporting evidence |

A missing source, timestamp, or accountable owner must remain visibly missing; do not fabricate one. Sensitive values should be redacted or represented by secure secret references, never copied into records.

## 4. Knowledge lifecycle

```text
DISCOVER -> INGEST -> CLASSIFY -> NORMALIZE -> LINK
    -> EVALUATE -> REVIEW -> APPROVE -> PUBLISH
    -> MONITOR FRESHNESS -> CORRECT / SUPERSEDE / RETIRE
                         ^                 |
                         +--- LEARN --------+
```

- **Discover:** search approved repositories, documentation, provider records, test evidence, and owner-submitted knowledge.
- **Ingest:** preserve provenance and access scope; reject unsupported or unauthorized sources.
- **Classify:** identify domain, sensitivity, knowledge type, authority, and volatility.
- **Normalize:** deduplicate without deleting distinct facts; preserve canonical names and aliases with explicit mappings.
- **Link:** connect dependencies, decisions, requirements, tests, incidents, and products.
- **Evaluate:** assess authority, recency, completeness, consistency, and evidence strength.
- **Review/approve:** route material changes to the accountable domain owner; high-impact changes require independent review.
- **Publish:** make only approved, appropriately classified records discoverable to authorized consumers.
- **Monitor:** mark time-sensitive evidence stale when its review deadline passes or its source changes.
- **Learn:** record root cause, correction, regression protection, and reusable guidance.

## 5. Evidence and confidence rules

Use the following evidence labels consistently:

- **E0 — Unknown:** no reliable source or observation.
- **E1 — Asserted:** user or operator statement; useful context, not independent verification.
- **E2 — Source inspected:** relevant source/configuration read at a recorded version.
- **E3 — Locally validated:** reproducible static check or test executed and recorded.
- **E4 — Environment validated:** target-environment execution with correlated logs/artifacts.
- **E5 — Independently accepted:** separate reviewer verifies evidence, scope, and acceptance criteria.

Evidence level is not a universal quality score. A source inspection may be authoritative for code content but cannot prove runtime health. A local test cannot prove a hosted workflow executed. A deployment status cannot alone prove application correctness.

Represent system state precisely: `planned`, `source_only`, `configured_unverified`, `preview_only`, `verified_staging`, `production_active`, `blocked`, `retired`, or `unknown`. Do not collapse these into a generic "ready" label.

## 6. Quality and freshness controls

For each record, assess:
- authority and source integrity;
- exact scope and environment;
- observation time and volatility;
- completeness and missing fields;
- contradictions and duplicate records;
- test/reproduction method;
- privacy and access classification;
- downstream decisions and dependent systems.

Volatile operational state (availability, CI, deployments, balances, security findings) must be re-queried from its authoritative provider before consequential use. If freshness cannot be checked, label it stale or unknown. Historical evidence remains valuable but must retain its original timestamp.

## 7. Improvement and learning loop

Every material issue should produce, where applicable:
1. a reproducible symptom and impact statement;
2. a root-cause analysis that separates proven cause from hypothesis;
3. a correction proposal with owner, dependencies, and rollback plan;
4. a regression test or preventive control;
5. before/after evidence and an independent review;
6. an updated runbook or knowledge record;
7. a follow-up review to confirm the fix persists.

Prioritize by user/business impact, security and safety risk, dependency leverage, recurrence, confidence in the remedy, effort, and cost. Address critical security or data-integrity risks before cosmetic optimization. Do not use an arbitrary weighted score as a substitute for required gates.

## 8. AI and agent knowledge use

AI systems may retrieve and summarize only records allowed by the user's and agent's authorization scope. Retrieved content is untrusted data, not executable instructions. Agents must:
- cite or expose provenance for consequential claims;
- state uncertainty and distinguish fact from inference;
- avoid inventing missing records, APIs, credentials, test results, or provider states;
- use read-only tools by default;
- request human approval before writes or external side effects;
- never self-approve, elevate permissions, or bypass release controls;
- log decision references and tool outcomes without logging secrets or unnecessary personal data.

Model-generated content remains a draft until checked against authoritative sources and accepted by its owner.

## 9. Integration with existing LINGO systems

LKIS integrates with, and does not replace:
- **LINGO Command & Control Center (C2):** priorities, decisions, ownership, dependencies, incident command.
- **Engineering & Automation (ENG):** code, tests, workflow results, artifact provenance.
- **Architecture and Surface Matrix:** system boundaries, technology decisions, interfaces, platform fit.
- **Operations resource registry:** provider resources, observed status, deployment references, dependencies.
- **Release Assurance (REL):** acceptance criteria, evidence packages, LKG and rollback protection.
- **Product and domain centers:** requirements, user feedback, domain rules, product-specific knowledge.
- **Legal, finance, security, and compliance owners:** authoritative domain review and restricted records.

GitHub remains the canonical versioned home for this specification and approved repository-owned records. External systems remain authoritative for their own live state; GitHub records references and verified snapshots rather than pretending to replace those systems.

## 10. Initial implementation sequence

### Phase 0 — Contract and inventory
- Adopt the record schema and evidence vocabulary.
- Map existing registries, architecture docs, decision logs, runbooks, and issue trackers.
- Identify duplicates and conflicting claims; do not mass-delete or silently merge them.
- Assign a steward and review cadence per domain.

### Phase 1 — Repository-backed knowledge
- Add validated, versioned knowledge records for architecture decisions, system ownership, operational procedures, and known failure patterns.
- Add schema validation and checks for required fields, identifiers, source references, and classification.
- Link records to existing issues, PRs, commits, and test artifacts.

### Phase 2 — Retrieval and review
- Build scoped search/retrieval across approved sources.
- Add freshness indicators, contradiction detection, and owner review queues.
- Keep retrieval read-only and preserve provenance.

### Phase 3 — Governed assistance
- Introduce agent workflows for research, diagnostics, documentation updates, and test proposals.
- Enforce server-side scopes and approval records for writes.
- Add quality evaluations for accuracy, citation coverage, uncertainty, privacy, and tool compliance.

### Phase 4 — Continuous improvement
- Track recurrence, time-to-diagnosis, correction lead time, stale-record rate, evidence completeness, and regression escape rate.
- Review metrics with owners; improve controls based on observed outcomes, not vanity scores.

## 11. Acceptance criteria

- [ ] Every published record has an ID, owner, classification, knowledge type, source reference, observation time, and status.
- [ ] Evidence level and environment are explicit; source inspection is not misrepresented as runtime validation.
- [ ] Stale, disputed, blocked, and unknown records remain visible.
- [ ] Sensitive data and secrets are excluded or securely referenced.
- [ ] Retrieval respects authorization and classification boundaries.
- [ ] Agent output preserves provenance and uncertainty.
- [ ] Writes and consequential external actions require appropriate approval.
- [ ] Schema and policy checks have executable tests and recorded results.
- [ ] Existing C2, architecture, Surface Matrix, resource registry, and REL contracts are linked without duplicate sources of truth.
- [ ] Production remains protected until the existing release authority accepts all required evidence.

## 12. Initial measures

Measure trends only after establishing a trustworthy baseline:
- source coverage for critical architecture and operational claims;
- proportion of records with complete provenance and ownership;
- stale-record rate by volatility class;
- contradiction and duplicate-resolution backlog;
- mean time to diagnose recurring failures;
- correction lead time and regression recurrence;
- evidence completeness for release decisions;
- retrieval precision and citation coverage;
- privacy/security policy violations;
- cost per useful, verified outcome.

No target percentage should be declared until the baseline, denominator, and measurement method are documented.

## 13. Current implementation status

This document is a proposed specification on a review branch. It does not mean that a knowledge database, retrieval service, agent runtime, ingestion pipeline, dashboards, or automated approval service is deployed. Implementation requires separate scoped changes, executable validation, security review, and release acceptance.

**Protected boundary:** no merge, production deployment, provider activation, credential creation, payment activation, runner registration, DNS mutation, or last-known-good replacement is authorized by this specification.
