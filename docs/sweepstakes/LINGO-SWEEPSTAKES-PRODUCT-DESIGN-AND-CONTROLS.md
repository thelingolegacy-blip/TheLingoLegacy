# LINGO Sweepstakes — Product Design, Operating Model & Controls

**Document status:** Product design baseline — ready for counsel and compliance review; not approved official rules.  
**Owner:** LINGOlegacy  
**Version:** 1.0.0  
**Date:** 2026-10-31  
**Release state:** NOT ACTIVE. No entry collection, prize offer, winner selection, or advertising claim is authorized by this document.

## 1. Product intent

Create a transparent, accessible, mobile-first promotional sweepstakes framework that can support eligible LINGOlegacy community campaigns and participating real-world retail/community partners. It must be clearly separate from casino-style entertainment, paid game features, wallets, stored value, and any real-money wagering.

Core principles: no purchase necessary; equal treatment of free entry methods; clear official rules; auditable random selection where chance is used; privacy by design; accessible participation; no misleading odds or prize claims; no launch before jurisdiction-specific legal approval.

## 2. Product surfaces and user journey

1. **Discovery:** campaign card shows sponsor, campaign title, prize description, opening/closing timestamps with timezone, eligibility summary, entry limit, and a link to full Official Rules.
2. **Campaign detail:** accessible description, prize value and quantity, eligibility, geographic exclusions, entry methods, dates, odds statement, sponsor identity, winner-notification process, privacy notice, and support contact.
3. **Registration:** collect only fields required by the approved rules. Email verification and bot/rate-limit controls. Do not require marketing consent as a condition of entry.
4. **Entry:** one clearly documented free entry path; optional alternate method of entry (AMOE) only when approved and operationally equivalent. Entry receipt includes campaign ID, timestamp, method, and non-sensitive confirmation code.
5. **Confirmation:** show entry status, entry limit, close time, rules link, and how winners will be contacted. Never imply that an entry guarantees a prize.
6. **Selection:** freeze eligible entry set at close; preserve immutable export/hash; run approved random selection with independent witness/reviewer; record algorithm/version, seed custody, run timestamp, exclusions and reasons.
7. **Winner validation:** verify eligibility and required affidavit/release where lawful; document alternate winners and deadlines. Do not publish personal information without lawful basis and consent.
8. **Award and closeout:** document delivery, tax forms if required, prize acceptance/refusal, unclaimed-prize disposition, complaints, and campaign reconciliation.

## 3. Eligibility and entry integrity

- Define age of majority, residency, employee/contractor/family exclusions, partner exclusions, and restricted jurisdictions in each campaign's Official Rules.
- Do not permit underage participation in campaigns not designed and legally approved for minors. If a campaign targets children, require specialized child-privacy and advertising review before design or collection.
- Use server-side entry validation, campaign state, timestamp, idempotency key, per-person/per-household limits as counsel approves, rate limits, duplicate detection, and abuse review.
- Do not use device fingerprinting or invasive tracking as a default anti-fraud measure.
- Do not sell entries, bundle entry with a purchase, require paid upgrades, or disadvantage AMOE entries.
- Do not use sweepstakes entries as casino chips, wallet credits, cash equivalents, or wagering stakes.
- No guaranteed win, manipulated odds, fabricated winners, undisclosed sponsor, or undisclosed influencer/affiliate relationship.

## 4. Official Rules — mandatory campaign fields

Each campaign must have counsel-approved, versioned Official Rules containing:
- Sponsor legal name and address/contact.
- Campaign name, start/end dates and time zone.
- Eligible territory, age, exclusions, and void-where-prohibited statement.
- No-purchase entry instructions and any AMOE details.
- Entry limits and treatment of duplicate/incomplete/late entries.
- Prize description, approximate retail value, quantity, restrictions, substitution policy.
- Winner selection method, date, odds explanation, notification method and response deadline.
- Verification, affidavit/release, publicity rights and privacy limits.
- Taxes and costs that are the winner's responsibility.
- Disqualification, technical failures, force majeure, dispute resolution and governing law, as counsel determines.
- Sponsor liability limitations and applicable platform disclaimers.
- Accessibility/contact and privacy notice references.
- Rules version identifier and publication timestamp.

**No template becomes campaign rules automatically.** State/country requirements vary. Counsel must determine registration/bonding, filing, tax, publicity, privacy, platform and advertising obligations for each jurisdiction and prize value.

## 5. Data model (logical)

- `campaigns`: id, slug, sponsor_id, status, opens_at, closes_at, timezone, rules_version, rules_url, eligibility_config, entry_limit, prize_manifest_id.
- `sponsors`: verified legal entity, contact, approval status, agreement reference.
- `entries`: id, campaign_id, participant_ref, method, created_at, eligibility_state, receipt_code, idempotency_key_hash.
- `participant_profiles`: minimized contact/eligibility fields with retention schedule; avoid storing DOB when an age assertion or verification token is sufficient.
- `selection_runs`: campaign_id, frozen_entry_manifest_hash, algorithm_version, reviewer, run_at, audit_artifact_ref.
- `winner_cases`: selection_run_id, winner_ref, validation_state, notification timestamps, disposition.
- `consents`: purpose-specific consent, wording version, timestamp, withdrawal.
- `audit_events`: append-only actor/action/object/time/reason/correlation ID; no secrets or unnecessary personal data.

Do not store payment-card data or identity documents in the sweepstakes service. Use a qualified provider for identity verification only when necessary and approved.

## 6. Security, privacy and fraud controls

- Enforce server-side authorization and least privilege; participants can view only their own entry receipt and status.
- Separate sponsor, campaign operator, customer support, compliance reviewer, selection witness, and platform administrator roles.
- Require MFA for privileged roles; log administrative changes and rule-version changes.
- Encrypt transport and sensitive stored fields; manage secrets in provider secret stores; never commit keys.
- Use retention/deletion schedules, access/correction handling, incident response, vendor agreements and data-processing review.
- Protect forms with rate limits, bot mitigation, CSRF protections, validation, abuse queues and alerting.
- Maintain immutable campaign close snapshot and audit records with controlled access.
- Never expose participant lists, email addresses, phone numbers, or exact locations to sponsors or the public.

## 7. Monetization boundaries

Permitted only after review: clearly labeled sponsor placements, brand-funded prizes, opt-in partner offers, and contextual advertising that does not affect odds or eligibility.

Prohibited: selling chances, pay-to-enter, paid boosts, premium odds, hidden entry requirements, ad clicks as entry consideration without legal approval, deceptive countdowns, dark patterns, or presenting ads as official system messages. Ads must be distinguishable from game controls and entry buttons. Ad personalization must respect consent and applicable privacy rules.

## 8. UI and interaction requirements

- Responsive layouts for phone, tablet, desktop and supported TV/web surfaces.
- High-contrast, readable typography; keyboard and screen-reader support; visible focus; semantic labels; WCAG 2.2 AA target.
- Buttons have clear labels, disabled/loading/success/error states and prevent duplicate submission.
- Sound is off by default; all sound can be muted; no sound-only information.
- Motion respects reduced-motion settings; avoid flashing and rapid strobing.
- Pop-ups are non-blocking, dismissible, keyboard accessible and never obscure mandatory rules.
- Printable campaign summary and Official Rules; print CSS hides navigation/ads and preserves dates, sponsor, prize, rules version and contact.
- Downloadable receipt is optional and contains no sensitive personal data.
- Entry success, errors, deadlines, and winner notices use plain language.

## 9. Operational controls and campaign lifecycle

`DRAFT → LEGAL_REVIEW → APPROVED → SCHEDULED → OPEN → CLOSED → ENTRY_FREEZE → SELECTION_REVIEW → WINNER_VERIFICATION → AWARDED → ARCHIVED`

Any failed legal, security, fairness, or operational check moves the campaign to `PAUSED` or `CANCELLED`, with participant-facing explanation and counsel-approved remedy. No admin may directly force `OPEN` or edit an entry after close without an audited, approved correction.

## 10. Release acceptance checklist

- [ ] Counsel-approved Official Rules for each jurisdiction and prize.
- [ ] Sponsor identity and prize availability verified in writing.
- [ ] No-purchase entry path tested and equal to all other lawful methods.
- [ ] Entry caps, deduplication, close-time freeze and timezone behavior tested.
- [ ] Random selection independently witnessed and reproducible from retained evidence.
- [ ] Privacy notice, consent, retention and deletion reviewed.
- [ ] Security review, role testing, abuse/rate-limit tests and incident runbook passed.
- [ ] Accessibility and mobile tests passed.
- [ ] Notifications, support, prize fulfillment and unclaimed-prize process rehearsed.
- [ ] Monitoring, audit export, rollback and campaign cancellation tested.
- [ ] Marketing copy and sponsor disclosures approved.
- [ ] Production authorization recorded separately from design approval.

## 11. Legal and launch boundary

This is a product/engineering design, not legal advice, a promotion registration, a bond, an official rules document, or permission to launch. Do not collect entries, advertise a live prize, or select winners until qualified counsel and the responsible sponsor approve the final campaign-specific rules and all required filings, bonds, platform reviews, privacy/security checks and operational controls are complete.
