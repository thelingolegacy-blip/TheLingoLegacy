# LSCOI Internal Creation Pilots & Commercial Readiness

**Status:** Proposed execution specification; not an operational certification  
**Parent:** LSCOI issue #580 / LEAILOC PR #569  
**Authority:** Existing LECS, LKIS, Enterprise Registry, Surface Matrix, EMS and Enterprise Control Tower  
**Release posture:** Production HOLD; no merge, launch, payment, deployment or rights-transfer authority

## 1. Purpose

Move LSCOI from charter into bounded internal pilots that reuse existing LINGO architecture. Prove repeatable creation, provenance, quality and acceptance before exposing any capability to customers. Do not create another registry, identity service, command plane, data platform or release authority.

## 2. Pilot portfolio

### Pilot A — LKIS internal knowledge runtime

**Existing implementation:** PR #565, stacked on the knowledge schema and architecture in PR #562.  
**Purpose:** Validate an internal knowledge-record lifecycle: propose, validate, persist, retrieve with evidence, independently review, expire/stale, backup and restore.

**Boundaries**
- Local/loopback-only pilot; no public route, Firebase, Cloudflare, customer data, production credentials or hosted deployment.
- Proposed records remain distinct from independently reviewed records.
- Retrieval is read-only and classification-filtered.
- Reviewer identity and evidence are separate from release approval.

**Acceptance evidence**
- Node 20+ npm run check and npm test pass on a completed GitHub-hosted job.
- Schema validation covers the full current Draft 2020-12 contract, not only a subset of keywords.
- Backup/restore, digest integrity, duplicate IDs, authentication, reviewer separation, classification and freshness tests pass.
- Independent security reviewer accepts token handling, file permissions, classification ceilings and backup recovery.
- Operational state remains LOCAL_PILOT until a separate approval.

**Current status:** Source present in draft PR #565; its prior Actions run failed before job creation. Tests are not yet verified as executed.

### Pilot B — Asset provenance and rights intake

**Architecture:** Extend the existing Enterprise Registry and LKIS evidence model. Do not create a competing IP database.

**First workflow**
1. Register one candidate internal digital asset with a stable ID and exact repository/path/version or digest.
2. Capture creator/contributor identities from authoritative records; unresolved contributors remain unresolved.
3. Record source materials, upstream dependencies and applicable licenses.
4. Set rights state to RIGHTS_REVIEW_REQUIRED until evidence is reviewed.
5. Record license/assignment/consent references, scope, territory, term, restrictions and reviewer where applicable.
6. Permit OWNERSHIP_EVIDENCE_REVIEWED only after a qualified human review and retained evidence.
7. Preserve disputes, restrictions, review date and retirement/takedown history.

**Acceptance evidence**
- Schema compatibility review against the existing Enterprise Registry and LKIS evidence schema.
- One test fixture validates the full lifecycle; test fixtures must be clearly marked as synthetic and must not be represented as actual ownership.
- One real asset may enter the pilot only after source/contributor/rights evidence is available.
- No AI-generation, repository possession, purchase receipt or commit alone is treated as proof of ownership.

**Current status:** Charter requirements defined; no production rights ledger or verified ownership records are claimed.

### Pilot C — Secure digital publication

**Existing implementation:** PR #574 two-layer public-surface security repair.

**Purpose:** Prove restricted Worker paths are blocked before static lookup and internal/control-plane files are excluded from public publication while approved customer-facing routes remain available.

**Acceptance evidence**
- Worker route tests and publication-scope tests execute and pass in GitHub Actions.
- Generate a complete public-file allowlist from the actual build output; review every included file.
- Run a Wrangler dry-run and path-level probes against an isolated preview, not production.
- Verify deployed source/commit correlation before any separate production release request.

**Current status:** Source-level review completed; CI, generated allowlist, dry-run and deployed-path evidence remain outstanding.

## 3. Commercial workstreams

Commercialization follows internal acceptance; it is not a parallel shortcut around quality, security or rights review.

| Workstream | Initial internal deliverable | External offer only after |
|---|---|---|
| LINGO AI / automation | Provider-neutral adapter and agent workflow prototypes | Evaluations, data classification, model/provider terms, privacy, support and unit economics pass |
| Software / app / game creation | Reusable design-to-build and QA pipeline | Reproducible builds, security/accessibility QA, IP review, support and release acceptance pass |
| Creative / publishing / media | Asset, editorial, production and approval workflow | Contributor releases, rights clearances, content QA, customer terms and fulfillment are verified |
| Design / documents | Templates, design systems and document-generation workflow | Source rights, privacy, accessibility, quality and professional review requirements are met |
| Fabrication / apparel / products | Product specification, supplier and QA work orders | Materials/supplier provenance, safety, labeling, fulfillment, returns and margin are validated |
| Governance / notary / legal connections | Workflow and referral/connection prototypes only | Applicable licensing, commissioned professional, jurisdictional and consumer requirements are independently confirmed |

Legal, notarial, financial, journalism and other regulated activities must not be marketed or performed as professional services without the required authorization. AI-generated legal material remains a draft until reviewed by an appropriately qualified professional.

## 4. Commercial acceptance gates

Before any paid offer:
- Identify customer segment, validated problem, competitor alternatives and demand evidence.
- Define the exact deliverable, scope, exclusions, service levels, support owner and termination/retention policy.
- Establish price from measured labor, provider/model usage, infrastructure, supplier/fulfillment, support, tax and risk costs.
- Validate gross margin and cash requirements using actual pilot data; do not invent prices or promise unmeasured savings.
- Confirm asset rights, third-party licenses, contributor permissions and customer deliverable ownership.
- Approve privacy notices, data processing, security controls, refund/cancellation terms and jurisdiction-specific compliance.
- Separate internal pilot data from customer data and production systems.
- Obtain independent product, security, legal/compliance and finance acceptance as applicable.

## 5. Shared scorecard

Track each pilot using the existing Enterprise Control Tower / EMS evidence model:
- source commit and version;
- named accountable owner (not a role placeholder);
- state: PLANNED, BUILT, TESTED, VERIFIED, CONNECTED, AUTHORIZED or LIVE;
- evidence references and freshness;
- defects, risks and rollback/recovery path;
- rights status and third-party dependencies;
- measured cost per successful task or deliverable;
- independent reviewer and acceptance decision.

Unknown, missing, stale or contradictory evidence is BLOCKED/UNKNOWN, never PASS.

## 6. Current execution order

1. Restore GitHub Actions job startup and dispatch the existing read-only hosted-runner probe.
2. Run PR #565 tests, PR #574 security tests and registry/schema validation with inspectable job logs and artifacts.
3. Complete Enterprise Registry / LKIS / Surface Matrix field reconciliation and name accountable owners.
4. Complete the first synthetic rights-lifecycle fixture, then admit one real asset only after evidence intake.
5. Complete internal pilot acceptance and measured unit-cost baselines.
6. Prepare one narrowly scoped commercial offer with customer terms and independent review.
7. Use existing release governance for any later deployment or production promotion.

**No pilot in this document is declared complete, operational, customer-ready, legally cleared, or production-authorized.**
