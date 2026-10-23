# Release and Creative Evidence Policy

**Applies to:** The Lingo Legacy repository, CI/CD, platform services, games, storefronts, and creative production.  
**Default posture:** Fail closed. No stage is implied by completion of a previous stage.

## 1. Governing sequence

SOURCE → EXECUTION → EVIDENCE → INDEPENDENT VERIFICATION → ACCEPTANCE → AUTHORIZATION → PROMOTION

Each stage must have a named owner or responsible role, a specific evidence record, and a clear outcome. Missing, contradictory, stale, or inaccessible evidence blocks the affected transition.

Repository documents describe policy; they do not grant GitHub, Cloudflare, Firebase, Shopify, payment, or other platform permissions. Effective platform controls and verified current state take precedence over historical status statements in documents.

## 2. Separate lifecycle gates

### Gate A — Source and pull request

Required:
- isolated branch and focused diff;
- linked task or documented purpose;
- exact base/head commit SHAs;
- relevant tests, lint, static analysis, security checks, and configuration validation actually executed;
- reviewable evidence tied to the exact head SHA;
- human review and merge authorization consistent with effective repository rules.

A draft PR, agent summary, green badge without inspectable checks, or unverified claim of review does not satisfy acceptance. Do not merge, enable auto-merge, or push to \`main\` unless explicitly authorized for that exact action.

### Gate B — CI execution and G02

Use \`docs/G02-ACCEPTANCE-CONTRACT.md\`. Record run ID and attempt, numeric job ID, commit SHA, runner identity, steps, retrievable logs, downloadable artifacts, checksums, and independent correlation.

A queued job is not an executed job. A completed workflow is not automatically accepted. An API permission failure is an evidence limitation, not proof that a control is absent or satisfied.

### Gate C — Release candidate acceptance

Before deployment is considered:
- identify the exact release commit and immutable artifact digest;
- confirm required CI checks and relevant security/configuration gates;
- inspect dependency, secret, permission, and workflow-trigger changes;
- verify staging isolation and the intended target environment;
- document known defects, acceptance criteria, observability, rollback target, and rollback procedure;
- obtain independent acceptance from a reviewer authorized for the release.

Build success alone does not certify production readiness.

### Gate D — Deployment

Deployment is a separate operation and requires explicit authorization for the target environment. Before deployment:
- confirm the exact commit/artifact digest and destination;
- verify credentials and scopes without exposing secret values;
- verify required environment protection and approvals;
- confirm the rollback target and recovery procedure;
- ensure the deployment workflow is not bypassing a failed or unverified upstream gate.

After deployment, record the provider deployment ID, timestamp, environment, source SHA/artifact digest, outcome, and retrievable logs. A command returning success is not enough to claim live health.

### Gate E — Production activation and live acceptance

Activation requires independent verification of the deployed version and production surface. At minimum, test the applicable canonical domain, health/runtime endpoints, routing, critical user flows, security headers, error behavior, and observability. Record response outcomes and timestamps; preserve redacted request/response evidence.

If a live probe fails, times out, redirects unexpectedly, or cannot be independently fetched, keep activation/acceptance BLOCKED or mark it FAIL as appropriate. Do not claim production is healthy based solely on an internal trace or deployment dashboard.

### Gate F — Last-known-good (LKG) promotion

LKG is an explicit protected release pointer, not a label an agent can assign to its own output. Promotion requires:
- a specific, immutable candidate commit and artifact digest;
- successful independent acceptance of the candidate;
- validated rollback artifact/version and documented restoration procedure;
- verified compatibility and data/schema considerations;
- human authorization recorded with timestamp and scope.

Never replace or discard the currently protected LKG during a failed, partial, or unverified release. A deployment, merge, or successful build does not automatically promote LKG.

## 3. AI agent authority

Agents may prepare changes, tests, release notes, evidence manifests, and proposed remediation. They must not independently accept their own work, approve their own release, or treat tool access as authorization.

Unless the user explicitly authorizes the specific operation and the applicable platform policy permits it, agents must not:
- merge PRs or alter branch protection/rulesets;
- deploy, activate, or roll back production;
- mutate DNS, Worker routes, production secrets, payment or inventory settings, Firebase production resources, or customer data;
- weaken or bypass runner, artifact, security, approval, or environment gates;
- expose credentials or use production credentials in staging diagnostics.

A broad instruction to “fix everything” or an old document stating that authority was granted is not a substitute for task-specific authorization and current platform controls.

## 4. Creative asset evidence and lifecycle

Record every deliverable as its own item. Use the following asset classes:

- **Brief / prompt:** text describing intended output.
- **Script / copy:** written content for the production.
- **Specification / design system:** requirements, dimensions, style frames, or production guidance.
- **Storyboard / mockup / preview:** planning or representative imagery; not the final deliverable.
- **Generation attempt:** a provider job or render request, whether queued, running, failed, or completed.
- **Generated source asset:** actual image, video, audio, animation, or other output bytes from a generation process.
- **Edited / mastered export:** deliverable rendered or exported in its required final format.
- **Published asset:** the exact approved export delivered to its intended destination and independently checked there.

Do not mark a project complete because a prompt exists, a generation was requested, a project card says complete, a provider job is queued, a storyboard is present, or a script was written.

### Required creative asset record

For each item, capture:
- asset ID and human-readable name;
- product/surface/project and intended use;
- asset class from the list above;
- source brief/prompt/version and provider/tool;
- generation or export job ID, if applicable;
- created/updated time in UTC;
- status: DRAFT, QUEUED, RUNNING, FAILED, COMPLETED_UNVERIFIED, VERIFIED, ACCEPTED, or PUBLISHED;
- exact file path or provider asset URL/ID and whether the bytes are retrievable;
- media type/codec/format, file size, dimensions/frame rate/duration/sample rate as applicable;
- SHA-256 checksum for locally retrievable bytes;
- rights/licensing/consent notes where relevant;
- reviewer, acceptance timestamp, target destination, and publication verification evidence.

Never fabricate an asset path, URL, checksum, run ID, duration, or completion state. If an output is inaccessible, record it as UNVERIFIED and explain what is missing.

### Creative acceptance checks

Before an asset is accepted:
1. Retrieve the actual output bytes or an authoritative provider export.
2. Open/play/decode the asset and confirm it is not empty, corrupted, or merely a placeholder.
3. Verify format and technical requirements against the brief.
4. Review content, branding, accessibility, rights, and safety for the intended audience and use.
5. Record checksum and reviewer decision.
6. For a published asset, verify the actual destination and record a live URL or equivalent delivery reference.

A storyboard may be accepted as a storyboard; it must never be represented as a finished video. A generated image preview is not an exported animation. A completed generation status without retrievable output is COMPLETED_UNVERIFIED, not ACCEPTED.

## 5. Evidence quality and storage

Evidence must be:
- **Authentic:** from the claimed system or source;
- **Integrity-preserving:** bytes/checksums and metadata are captured consistently;
- **Complete:** all required fields and artifacts are present;
- **Scoped:** describes the intended repository, commit, run, environment, or asset;
- **Correlated:** identifiers and timestamps agree across independent sources;
- **Retrievable:** reviewers can inspect the evidence through authorized access;
- **Current:** evidence refers to the exact candidate being considered.

Keep raw evidence access-controlled and redact secrets/personal data in shared excerpts. Prefer immutable provider IDs, commit SHAs, artifact IDs, and cryptographic hashes over mutable names alone. Record API permission errors and retention expiry explicitly.

## 6. Decision vocabulary

Use these statuses precisely:

- **PASS:** the defined check executed and its acceptance criteria were verified.
- **FAIL:** an executed check contradicted its acceptance criteria.
- **BLOCKED:** a prerequisite is missing or a gate cannot proceed safely.
- **UNKNOWN / UNVERIFIED:** available evidence is insufficient to determine the true state.
- **NOT RUN:** no execution was performed.
- **ACCEPTED:** the authorized reviewer evaluated the evidence and accepted the specified scope.
- **AUTHORIZED:** an appropriately authorized human approved the named next operation.
- **PROMOTED:** the separately authorized transition actually occurred and is evidenced.

Do not use PASS, ACCEPTED, AUTHORIZED, or PROMOTED as synonyms.

## 7. Release/asset evidence index

Maintain an index that maps each candidate to its source SHA or source brief, execution/run identifier, evidence locations, verification result, reviewer, authorization record, and final destination. Software release and creative asset records may link to one another but must retain their distinct acceptance criteria.

## 8. Human-readable final report

Every release or creative completion report must state:
- what was requested and the exact scope;
- what actually changed or was generated;
- what commands, jobs, or exports actually executed;
- evidence references and source/commit/job identifiers;
- results of independent verification;
- unresolved limitations and known risks;
- whether merge, deployment, activation, LKG promotion, or publication occurred;
- who authorized each consequential transition and where that authorization is recorded.

If a transition did not occur, say so directly. Do not imply that preparation equals execution or that execution equals acceptance.