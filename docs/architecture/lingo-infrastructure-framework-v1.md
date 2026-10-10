# LINGO Legacy Infrastructure Framework v1

**Status:** Reconstruction proposal / isolated integration branch  
**Production posture:** FAIL-CLOSED; mutation freeze remains active  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`  
**Rule:** This framework documents and validates intent. It does not itself authorize a production mutation.

## 1. System boundaries and authority

| Plane | System of record / responsibility | Boundary |
|---|---|---|
| Source & change control | GitHub repository, reviewed branches, PRs, commits | Only reviewed, immutable commit SHAs may enter a release candidate |
| CI and evidence | GitHub Actions, job logs, artifacts, signed/hashed evidence manifests | A queued job or configured runner is not execution evidence |
| Edge/runtime | Cloudflare Workers, DNS, zone settings, observability | Cloudflare is the intended production edge/runtime authority |
| Identity and application data | Firebase Auth, Firestore, Cloud Functions | Least privilege; production writes require explicit release authorization |
| Mobile shell | Flutter app and shared LINGO contracts | Must consume versioned API/schema contracts; no private provider keys in client |
| Staging and QA | AppDeploy and isolated preview environments | Test-only credentials/data; staging evidence cannot certify production |
| Optional web preview | Vercel | Legacy/preview surface only unless an explicit architecture decision restores it as authority |
| AI prototyping | Google AI Studio | Prompt/model experimentation and prototype export; not a production secret store or runtime authority |
| AI runtime adapter | Cloudflare Worker server-side adapter calling the Gemini API | Disabled until credentials, privacy, quota, policy, and staging checks pass |
| Media | Governed object storage/CDN with manifest-backed media IDs | Generated or uploaded media is untrusted until reviewed and versioned |
| Governance / recovery | Gate matrix, evidence ledger, LKG manifest, rollback runbook | No gate may be bypassed by a UI toggle or successful build alone |

## 2. Observed drift that must be reconciled

Read-only control-plane inspection on 2026-10-10 found:

1. Live Cloudflare apex and www routes point to Worker script `thelingolegacy`.
2. The repository's `wrangler.jsonc` declares Worker name `thelingolegacyv-5` and lists apex/www routes. The live route owner and declared Worker name therefore disagree.
3. The Vercel project reports a READY deployment in metadata, but its deployment URL returns HTTP 402 `DEPLOYMENT_DISABLED`; Vercel also reports account suspension pending a valid payment method. Metadata READY is not live availability.
4. GitHub run `38060589970`, job `114237877802`, remained queued with no instantiated steps and no retrievable logs. G02 is not accepted.
5. Direct public HTTP probes from the connected fetch surface were blocked by that surface's own request policy, so public reachability was not independently established by those probes.

These findings are recorded as blockers, not silently normalized. Do not point DNS at Vercel, rename/delete a Worker, or change the route owner as a speculative repair. Reconcile the source/runtime Worker-name mismatch through a reviewed PR, a staging deployment, and an independently captured runtime comparison.

## 3. Environments

- **Local:** synthetic data and mocked AI adapter by default.
- **CI:** deterministic unit/contract tests; no production secrets or deploy permissions.
- **Staging:** isolated Cloudflare Worker, Firebase test project, synthetic identities/data, AI provider disabled or budget-capped.
- **Production:** immutable last-known-good (LKG) protected until all release gates pass.
- **Recovery:** a separate operator-controlled path that restores an identified, previously accepted commit/artifact and verifies the restored live service.

Secrets are environment-scoped. Production secrets must never be copied to a branch, prompt, issue, build log, mobile binary, artifact, or AI Studio conversation.

## 4. Canonical lifecycle

`DISCOVER → SNAPSHOT → RECONCILE → BUILD → STATIC VALIDATE → TEST → REVIEW → STAGE → EVIDENCE → ACCEPT → AUTHORIZE → PROMOTE → LIVE VERIFY → SEAL LKG`

Rollback path:

`DETECT → FREEZE → IDENTIFY LAST ACCEPTED LKG → RESTORE EXACT ARTIFACT/CONFIG → VERIFY LIVE → RECORD EVIDENCE → REOPEN ONLY WITH AUTHORIZATION`

A restore is not “latest green build.” It must name the accepted commit SHA, artifact digest, runtime/config snapshot, database compatibility requirements, and the evidence that made it last known good. Never roll back a database schema or irreversible transaction by guesswork.

## 5. Gate contract

- **G00 Source authority:** repository, branch, commit, and artifact identity are known.
- **G01 Configuration inventory:** Cloudflare, Firebase, GitHub, AppDeploy, Vercel, AI provider, and DNS inventories are correlated.
- **G02 Runner dispatch:** a real eligible runner is assigned; job and steps exist; sentinel runs; logs/artifacts are retrievable; evidence is independently verified.
- **G03 CI execution:** required checks run against the exact candidate SHA.
- **G04 Certification:** tests, dependency/security checks, configuration validation, and artifact digest pass.
- **G05 Release candidate:** immutable candidate and rollback target are recorded.
- **G06 Deployment:** staged deployment is successful and matches the candidate digest.
- **G07 Live validation:** independent external probes validate domain, TLS, routes, API health, and key user journeys.
- **G08 Synchronization:** source, runtime, Firebase/API schema, Flutter contracts, routing, and manifests agree.
- **G09 Activation:** feature flags and integrations are enabled only after authorization; AI remains opt-in and budget-limited.
- **G10 Post-activation:** error rate, latency, cost, security, and user journeys remain within approved limits.
- **G11 Acceptance:** independent evidence, approvals, and LKG seal are complete.

Downstream gates remain BLOCKED when an upstream gate is failed, missing, stale, or not independently verifiable. A configured service or a successful control-plane API response is not proof of public availability.

## 6. Synchronization model

Each release candidate must carry a manifest with:
- repository and full commit SHA;
- build/test workflow run IDs and artifact SHA-256;
- Worker name, deployment ID/version, route/DNS snapshot IDs;
- Firebase project/environment and schema/migration version (never credentials);
- Flutter API contract version;
- AI adapter version, model identifier, safety-policy version, and secret-presence boolean (never secret value);
- evidence timestamps, verifier identity, gate results, and LKG reference.

Drift is detected by comparing desired source configuration with observed live configuration. Drift is reported first; mutating the live system to match source is a separate authorized operation.

## 7. LKG protection

LKG is immutable during reconstruction. A new LKG may be sealed only after G00–G11 acceptance, independent live verification, artifact/configuration correlation, and explicit owner authorization. Preserve the prior LKG and rollback instructions until the new release has completed its observation window.

## 8. Google AI Studio integration boundary

Google AI Studio is the design/prototyping surface. The production application uses a server-side Gemini adapter behind the Cloudflare Worker. AI Studio API keys are stored as a Cloudflare secret in the staging environment first; never embed a key in Flutter, browser code, prompts, GitHub, or committed config. See [Google AI Studio integration contract](../integrations/google-ai-studio.md).

The integration starts in **disabled** state with Observe/Analyze/Propose/Verify modes. Propose cannot execute actions; Verify is read-only. No autonomous production mutations, Firebase production writes, deployments, financial transactions, or gate overrides are permitted.

## 9. Acceptance for this reconstruction branch

This branch is accepted for review only when:
- contract JSON parses and static validator passes;
- workflow syntax and changed-file scope are reviewed;
- AI secret handling and default-off behavior are reviewed;
- live Worker-name drift is explicitly resolved in a later controlled change;
- G02 host/runner evidence is independently collected;
- no production DNS, Worker, Firebase, deployment, or LKG mutation is bundled into this architecture PR.
