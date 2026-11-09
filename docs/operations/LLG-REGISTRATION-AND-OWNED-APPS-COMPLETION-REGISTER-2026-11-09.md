# LLG Registration, Integration and Owned-App Completion Register

**Snapshot:** 2026-11-09  
**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Working branch:** `feat/lingo-master-registry-wave0-2026-11-08` (PR #511, draft / unmerged)  
**Default branch:** `main`  
**Disposition:** PROTECTED HOLD; G02 FAIL / UNVERIFIED; no production promotion authorized  
**Budget rule:** $0 incremental spend unless the owner separately approves a specific ceiling

## 1. Executive disposition

The architecture and policy baseline is progressing, but LLG registration, unified LINGO ID, provider governance and the five planned owned applications are **not operationally complete**. Current evidence supports a design proposal, a draft machine-readable provider inventory and a registration preview—not a production identity service, approved integration plane or launched owned apps.

This register is an evidence index. It does not supersede GitHub issues, provider records, legal approvals or the release gate. Do not close an issue because documentation exists.

## 2. Prioritized completion register

| ID / Priority | Workstream | State | Owner (known role only) | Evidence | Next action | Acceptance criteria |
|---|---|---|---|---|---|---|
| R-01 / P0 | Identity/backend authority | BLOCKED | Repository owner + platform/identity owner (named approver TBD) | ADR-002 proposal; PR #515; #469; existing Firebase identity contract | Approve ADR-002 after verifying provider project ownership, current identities/data, environments, costs and rollback | Signed ADR selects one identity authority and one transactional authority; issuer/audience, principal mapping, data ownership, migration and rollback are explicit; no dual-primary writes |
| R-02 / P0 | Firebase project and environment inventory | BLOCKED | Firebase/project owner (TBD) | Main `.firebaserc` defaults to `lingo-legacy-production`; #469 records conflicting project candidates | Use authorized provider read-only access to inventory ownership, Auth, apps, rules, functions, storage, billing and environments | Project IDs and roles reconciled; provider-side evidence linked; no production mutation required for inventory |
| R-03 / P0 | Registration and LINGO ID runtime | BLOCKED | Identity owner (TBD) | `signup-preview/index.html` says preview only/no credentials transmitted; verifier module exists; gateway router returns unconfigured/503 and fails closed | After ADR, implement server-side registration/session/recovery/consent lifecycle in isolated staging | Registration, verification, login/logout, revoke sessions, recovery, link/unlink, export/deletion, age/guardian gates where applicable, audit and abuse controls pass; cross-user and privilege tests pass |
| R-04 / P0 | Firebase Hosting publication boundary | BLOCKED | Web/platform owner (TBD) | Main `firebase.json` uses `public: "."`; #441; `lib/firebase_options.dart` has placeholder app IDs/API keys | Confirm actual build output and correct Hosting scope in a reviewed non-production change; obtain real config only through authorized owner flow | Artifact contains only intended build output; placeholder verifier passes with legitimate environment config; staging deploy/runtime and artifact provenance verified |
| R-05 / P0 | Public-source privacy / Kotton’s Code | BLOCKED | Product + privacy owner (TBD) | #476 open; source review identified identifiable family/minor details in public staging material | Review privately; fictionalize public character data; scan source, bundles, source maps, metadata and publication assets; obtain fresh QA | Independent reviewer confirms no unnecessary personal/minor details in public outputs; fictional canon preserved; staging QA and evidence linked |
| R-06 / P0 | Main protection, CI and G02 | BLOCKED; G02 FAIL / UNVERIFIED | Repository owner/admin; infrastructure owner (TBD) | #470; PRs #511/#512/#516 draft; latest #511 head Actions runs 42668732007, 42668729120 and 42668725745 all startup_failure with 0 jobs/artifacts; Vercel status failure | Verify ruleset/protection in authorized GitHub settings; diagnose Actions startup; prove hosted smoke and separate G02 runner allocation | Effective rules and required checks read back; jobs instantiate and complete with logs/artifacts correlated to commit; G02 runner_id > 0, correct labels/name, sentinel evidence and hosted smoke pass |
| R-07 / P1 | Plugin/integration registry | IN PROGRESS — incomplete | Integration owner (TBD) | `config/registry/llg-plugin-integration-registry.v1.json` in PR #511; 8 provider records; required fields are declared | Populate owner, docs/terms, data flow/classes/residency, auth scopes, credential ownership/rotation/revocation, threat/security/legal review, plan/quota/budget, reliability, evidence and change history; add approval-stage semantics | Schema validator passes; every record has an accountable owner and complete evidence; staging and production approval are separate; no secret values/passwords stored |
| R-08 / P1 | Amplitude governance / LLG Analytics foundation | BLOCKED | Analytics + privacy owner (TBD) | Connected Amplitude Starter workspace; project `default`, ID `902649`; 30-day event inventory returned 0 events | Confirm owner/project mapping, terms/DPA, consent, event taxonomy, retention/deletion, role access and budget ceiling before staging events | Synthetic staging events validate schema/consent/opt-out/deletion and reconciliation; no direct identifiers or secrets; cost ceiling and reviewer recorded |
| R-09 / P1 | Legal and provider contracts | BLOCKED | Legal/privacy owner (TBD) | No accepted legal/DPA approval evidence linked in this workstream | Review current terms, DPA/subprocessors, data residency, IP/licenses, user-facing Terms/Privacy, age/guardian, support/refund and jurisdiction obligations per provider/product | Versioned contracts and notices approved by authorized reviewer; processing purposes, retention, user rights, incident notice and termination/export obligations documented |
| R-10 / P1 | API, authorization and data contracts | IN PROGRESS — design only | Platform/API/security owners (TBD) | Identity/wallet API contract v1; integration-network operating model; #507 | Select backend, then publish OpenAPI schemas, authz matrix, data classification, RLS/rules, webhook signatures, idempotency, rate limits and migration contracts | Contract tests and positive/negative authz tests pass against isolated staging; no client-trusted privileges or balances |
| R-11 / P1 | Security/privacy/operations baseline | IN PROGRESS — source audit only | Security/SRE owner (TBD) | #517 W9; PR #518 security baseline draft; #470/#476; CSP and isolate-local rate-limit findings | Verify private vulnerability reporting, secret scanning, dependency/SBOM, action pinning, CSP, shared rate limits, logs/alerts, backup/restore and incident drills | Scans are executed and findings triaged; controls have negative tests; alerts, restore, revocation and rollback are demonstrated; independent security/privacy signoff |
| R-12 / P2 | LLG Analytics | NOT STARTED — charter only | Product/analytics owner TBD | Charter in PR #511; no dedicated LLG-owned implementation located in current main-branch search | Build after identity, consent, event and provider contracts are accepted | Synthetic staging ingestion, schema validation, consent/opt-out/deletion, source-linked metric definitions, tenant isolation and cost ceiling pass |
| R-13 / P2 | LLG Command | NOT STARTED — charter only | Product/operations owner TBD | Charter in PR #511; PR #523 control-room proposal is a separate read-only draft surface, not proof of LLG Command delivery | Define product boundary against GitHub issue/release authority; build traceable project/approval/evidence workflows | Issue → branch/PR → CI → review → release evidence trace works; GitHub remains source authority; RBAC, audit and immutable approval history pass |
| R-14 / P2 | LLG AI Studio | NOT STARTED — charter only | Product/AI/security owner TBD | Charter in PR #511; issue #438 says askLINGO provider path is not verified | Define provider allowlist, data policy, adapter contract, prompt-injection defenses, model provenance and cost controls | Provider contract tests; server-only secrets; tenant isolation; safety filters; quota/cost caps; fallback and traceable model/version evidence pass |
| R-15 / P2 | LLG Automations | NOT STARTED — charter only | Product/automation owner TBD | Charter in PR #511; no dedicated LLG-owned app implementation located in current main-branch search | Define workflow schema, trigger/action permissions, approval matrix, queue and stop-switch semantics | Deterministic workflows, idempotency/replay, dry-run, dead-letter/redrive, audit, compensation/rollback and operator kill switch pass |
| R-16 / P2 | LLG App Exchange | NOT STARTED — charter only | Product/security/legal owner TBD | Charter in PR #511; no dedicated LLG-owned app implementation located in current main-branch search | Define publisher verification, capability manifest, package signing, sandbox, license and permission review | Staging install/uninstall/revoke; signed manifest; visible permission diff; malicious/overprivileged package rejected; audit and emergency disable pass |

## 3. Integration registry structural audit

The current draft registry declares 36 required record fields and contains 8 provider records. Read-only parsing confirms the JSON is syntactically valid. However, each of the 8 records is missing 28 of the 36 declared required fields (224 missing field instances in total). The absent fields include ownership, official documentation/terms, data classification and flow, residency/retention/deletion, auth scopes, credential lifecycle, threat/security/legal reviews, plan/quota/budget, rate/retry/idempotency/fallback, evidence, reviewer/date and change history.

The registry also needs to distinguish **connection state** from **approval lifecycle stage**. Values such as `connected-read-surface` and `test-mode-only` describe observations, while `discovered → evaluating → approved_for_staging → staging_verified → approved_for_production → production` describes approval progression. Add an explicit approval-stage field before treating lifecycle transitions as machine-enforceable.

The new validator draft is intentionally fail-closed: it should report incomplete records, not convert missing information into approval. No credential values or third-party passwords are to be stored.

## 4. Five-app delivery dependencies

Shared prerequisites, in order:

1. Approved identity/backend ADR and a working isolated staging identity provider.
2. Common principal, authorization, tenant/entitlement, consent, audit/event, API version and secret-reference contracts.
3. Canonical product/app ownership and environment registry.
4. Security/privacy threat models, data retention/deletion and provider contract approvals.
5. Executable CI, artifact provenance, staging observability, rollback and independent review.
6. Product-specific acceptance below.

Do not build five separate user stores or role systems. Each app must consume shared LINGO ID, authorization, consent and audit contracts. A design mockup or deployment-ready status is not runtime acceptance.

## 5. Cost and capacity risks

- **AppDeploy:** latest PR #511 evidence records Free plan, 20.892937682 monthly credits available, reset 2026-11-17T00:00:00Z, zero top-up credits; per-app status responses conflict with an exhausted-credit warning. Capacity is unreconciled. Do not buy credits or run repeated builds.
- **Vercel:** current PR #511 combined status reports a Vercel build-rate-limit failure. Do not treat Vercel as the release authority or spend to clear the limit; resolve the retired integration/preview path through an approved architecture change.
- **Supabase:** connected project is provider-healthy but has no LINGO schema/migrations/functions in the current architecture evidence. Confirm plan, region, backups, egress and projected usage before any schema or paid resource.
- **Firebase:** project ownership and billing are unresolved; production project is named in repository config but app IDs remain placeholders. No deployment or paid configuration change.
- **Amplitude:** Starter project mapping, retention and quota/cost ceiling are not approved. Keep ingestion disabled.
- **Stripe/commerce:** issue #527 is open for sandbox lifecycle; test-mode evidence is incomplete. Live charges, subscriptions, payouts and entitlements remain disabled.
- **General:** no new paid plan, credit top-up, paid AI model, R2 enablement, SMS, hosting or external service without named budget owner, estimate, hard cap and explicit approval.

## 6. Contract and policy gaps still requiring controlled review

- Identity provider/project authority ADR; canonical principal and provider-subject mapping.
- Registration, consent, session/revocation, recovery, account linking, export/deletion and age/guardian requirements.
- OpenAPI schemas and versioning; authorization matrix; tenant isolation; webhook signatures and idempotency.
- Data classification, residency, retention, deletion, backup/restore, RPO/RTO and incident notification.
- Provider Terms of Service, DPA/subprocessor register, license/IP, acceptable use, SLA/support and termination/export obligations.
- Security threat models, secret lifecycle, vulnerability disclosure, SBOM, dependency policy, upload scanning and abuse controls.
- Analytics event taxonomy, consent/opt-out, identity merge/unmerge and deletion propagation.
- App publisher terms, package signing, permission manifest and revocation policy for App Exchange.
- AI model/provider terms, data-use policy, prompt-injection/safety controls and usage/cost limits for AI Studio.
- Automation action scopes, human approvals, destructive-action policy and compensation/rollback for Automations.

## 7. Release blockers and no-go conditions

Production remains NO-GO while any applicable condition remains:
- ADR-002 and project ownership unresolved.
- Registration is still preview-only or authorization/session lifecycle is untested.
- Firebase Hosting still targets repository root or configuration placeholders remain.
- Public staging privacy issue #476 remains open.
- Effective main protection and required checks are not verified.
- CI has no instantiated passing jobs/artifacts; G02 remains FAIL / UNVERIFIED.
- Security/privacy/legal review, backup/restore, rollback, support ownership or cost ceilings are absent.
- Any app lacks staging acceptance, accessibility/device QA or independent review.
- Production promotion authorization is not separately recorded.

## 8. Operating rules

- Keep all work on non-production branches with synthetic data until owner decisions and gates are satisfied.
- Preserve production routes, DNS, Workers, databases, secrets, permissions, payment settings and runners.
- Never ask for or store third-party passwords, tokens or secret values in source/issues/chat.
- Keep GitHub as code, contract, issue and evidence source of truth.
- Distinguish documentation/design completion from runtime PASS and owner ACCEPTED.
- Close gaps only when acceptance evidence is linked and independently reviewable.
