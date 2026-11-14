# LINGO Legacy Master Architecture & Surface Matrix

Version 1.0.0 | Canonical proposal for review; no production architecture change implied.

## Principles
One canonical registry; versioned contracts; clear control/data/creative/public planes; evidence attached to the object it proves; least privilege; environment isolation; observable and reversible operations; cost-aware design; accessible progressive enhancement; product-specific implementation under shared governance.

## Reference technology map
| Capability | Preferred technology | Constraint |
|---|---|---|
| Source | GitHub | Canonical code, docs, issues, PRs, artifacts |
| DNS/edge/runtime | Cloudflare | Authoritative zone, Workers, assets, Access, telemetry |
| Identity/app data | Firebase | Verify project, Auth, rules, indexes, backups |
| Web | React/Next | Shared design system, responsive, accessible |
| Mobile | Flutter | iOS/Android device matrix |
| Games | Unity where appropriate | Engine chosen per game; web demo is not native |
| AI orchestration | LLG-owned gateway | Adapters, policy, quotas, telemetry, evaluation |
| Commerce | Shopify | Catalog/order system where approved |
| Payments | Stripe | Disabled until account, webhooks, tax and reconciliation pass |
| Creative | Figma, Canva, Adobe | Editable source, rights, review and exports |
| CI/CD | GitHub Actions | Reproducible builds, tests, provenance and gates |
| Staging | AppDeploy and approved isolated environments | Respect credit and environment constraints |

## Logical layers
1. Experience: public website, account, studio, mobile, TV and game clients.
2. Presentation: navigation, design system, content, accessibility and localization.
3. Application: product APIs, workflows and business rules.
4. Identity/policy: authentication, authorization, consent, moderation, entitlements.
5. Data: operational database, object storage, cache, search, analytics.
6. Edge/execution: DNS, CDN, Workers, queues, scheduled jobs, bindings.
7. AI orchestration: provider adapters, model policies, prompt/version registry, evaluation.
8. Creative pipeline: briefs, assets, timeline, render jobs, approval, distribution.
9. Control plane: registry, configuration, deployment, access, approvals.
10. Evidence plane: tests, logs, hashes, attestations, audit events, acceptance.

## Five core engines
The canonical core remains THINK, PERCEIVE, CREATE, ACT and VERIFY. A proposed SUPER_ENGINE is an orchestration concept, not a sixth core engine, until an architecture decision approves it.
- THINK: reasoning, planning, policy-aware decision support.
- PERCEIVE: ingest, sensing, context normalization, source attribution.
- CREATE: text, code, image, audio, video, design and artifact generation.
- ACT: authorized tools, workflows, adapters and orchestration.
- VERIFY: tests, evidence validation, safety, monitoring and recovery.

Each engine needs input/output schema, permission scope, timeout, retry policy, idempotency key, audit record, evaluation suite and failure mode.

## Surface Matrix dimensions
| Dimension | Required fields |
|---|---|
| Product | product_id, canonical_name, owner, lifecycle_state |
| Surface | surface_id, platform, route_or_app_id, accessibility_profile |
| Runtime | environment, region, runtime_version, build_id |
| Source | repository, branch, commit_sha, artifact_digest |
| Dependencies | service_ids, integration_ids, data_store_ids |
| Identity | auth_provider, roles, session_policy, recovery_path |
| Security | data_classification, threat_model_ref, secret_refs, policy_status |
| Reliability | SLO, health_probe, alert_route, backup_policy |
| Release | gate_state, approval_ref, rollback_ref |
| Evidence | evidence_ids, state, observed_at, verified_at, expiry_at |

## Shared TypeScript contracts
    export type LifecycleState =
      | "PLANNED" | "PROTOTYPE" | "STAGING" | "SERVING"
      | "VERIFIED" | "ACCEPTED" | "PRODUCTION" | "BLOCKED" | "UNKNOWN";
    export type EvidenceState =
      | "UNKNOWN" | "OBSERVED" | "QUALIFIED" | "VERIFIED" | "ACCEPTED" | "ESTABLISHED";
    export type Environment =
      | "LOCAL" | "CI" | "PREVIEW" | "STAGING" | "PREPRODUCTION" | "PRODUCTION";
    export type Platform =
      | "WEB" | "IOS" | "ANDROID" | "DESKTOP" | "TV" | "GAME" | "API" | "DEVICE";
    export type EngineName = "THINK" | "PERCEIVE" | "CREATE" | "ACT" | "VERIFY";

    export interface Product {
      productId: string; canonicalName: string; parentProductId: string | null;
      ownerId: string | null; lifecycleState: LifecycleState;
      repositoryRefs: string[]; surfaceIds: string[]; assetIds: string[];
      createdAt: string; updatedAt: string;
    }
    export interface Surface {
      surfaceId: string; productId: string; platform: Platform; environment: Environment;
      routeOrAppId: string; sourceCommit: string | null; runtimeVersion: string | null;
      dependencyIds: string[]; healthProbeUrl: string | null;
      evidenceState: EvidenceState; lastVerifiedAt: string | null;
    }
    export interface ServiceDependency {
      dependencyId: string; sourceServiceId: string; targetServiceId: string;
      dependencyType: "HTTP" | "EVENT" | "DATABASE" | "STORAGE" | "IDENTITY" | "QUEUE" | "DEVICE" | "NETWORK";
      required: boolean; healthState: "HEALTHY" | "DEGRADED" | "FAILED" | "UNKNOWN";
      versionConstraint: string | null; lastCheckedAt: string | null;
    }
    export interface EngineContract {
      engineId: string; engineName: EngineName; version: string;
      inputSchemaRef: string; outputSchemaRef: string; permissionScopes: string[];
      timeoutMs: number; retryLimit: number; idempotencyRequired: boolean;
      evaluationSuiteRef: string; lifecycleState: LifecycleState;
    }
    export interface Evidence {
      evidenceId: string; subjectType: string; subjectId: string; evidenceType: string;
      sourceSystem: string; sourceUri: string; commitSha: string | null;
      artifactDigest: string | null; observedAt: string; verifiedAt: string | null;
      expiresAt: string | null; state: EvidenceState; reviewerId: string | null;
    }
    export interface Integration {
      integrationId: string; provider: string; capability: string; environment: Environment;
      status: LifecycleState; authSecretRef: string | null; scopes: string[];
      healthProbeRef: string | null; ownerId: string | null; evidenceIds: string[];
    }
    export interface Asset {
      assetId: string; productId: string; title: string;
      assetType: "IMAGE" | "VIDEO" | "AUDIO" | "FONT" | "LOGO" | "ICON" | "ANIMATION" | "DOCUMENT" | "SOURCE" | "ARCHIVE";
      mimeType: string; storageUri: string; version: string; sha256: string | null;
      rightsState: "UNKNOWN" | "PENDING_REVIEW" | "CLEARED" | "LICENSED" | "RESTRICTED";
      approvalState: LifecycleState; metadata: Record<string, string | number | boolean | null>;
    }
    export interface ReleaseGate {
      gateId: string; productId: string; environment: Environment;
      state: "PASS" | "FAIL" | "BLOCKED" | "UNKNOWN";
      criteriaRefs: string[]; evidenceIds: string[]; evaluatedAt: string | null;
      evaluatorVersion: string;
    }
    export interface ChangeManifest {
      changeId: string; actorId: string; authorizationRef: string; environment: Environment;
      changeType: string; beforeDigest: string; afterDigest: string | null;
      rollbackRef: string; createdAt: string; verificationEvidenceIds: string[];
    }

## Evidence transitions
UNKNOWN → OBSERVED → QUALIFIED → VERIFIED → ACCEPTED → ESTABLISHED. Each transition requires evidence and evaluator/reviewer. Evidence expires or is invalidated when commit, artifact, environment, dependency, configuration or tests change.

## Master Control Unit
The Master Control Unit is a logical software control plane, not a claim of a physical electrical controller. It provides product/service registry, environment/dependency map, telemetry, access/approval, deployment/rollback references, creative orchestration, audit log and evidence explorer. Mutations require scoped APIs, policy checks, idempotency, audit and rollback.

## Connections and equipment
Digital dependencies use typed service/integration records. Physical equipment inventory must record manufacturer, model, serial, location, rated supply, interface, installer, permit, inspection, lockout/tagout, maintenance interval and commissioning certificate. Software agents must not energize, rewire, reset or bypass physical equipment.

## Architecture decisions
Each decision records context, options, decision, consequences, security/cost impact, migration, rollback and owner. Conflicts remain unresolved decisions until approved.
