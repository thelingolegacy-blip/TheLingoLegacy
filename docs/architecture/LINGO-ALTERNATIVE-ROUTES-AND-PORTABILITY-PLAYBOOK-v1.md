# LINGO Alternative Routes & Portability Playbook v1

**Date:** 2026-11-08  
**Status:** Architecture evaluation; proposals only  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy`  
**Release posture:** PROTECTED HOLD; G02 FAIL / UNVERIFIED  
**Cost posture:** $0 incremental spend unless separately approved

## 1. Purpose

Every critical LINGO capability must have a primary route, credible fallback, low-cost/open-source route where practical, manual recovery path, data export procedure, tested rollback and accountable owner. “Exhaustive” means the capability taxonomy and decision process are comprehensive and continuously updated—not that every global vendor has been tested.

## 2. Provider alternatives register

| Capability | Current / preferred | Managed alternatives | Open / portable alternatives | Recovery / exit requirement |
|---|---|---|---|---|
| Source control | GitHub | GitLab, Bitbucket | Forgejo, Gitea | Git mirrors, signed tags, issue export |
| Work planning | Linear | Jira, Asana, monday.com, ClickUp, Shortcut | OpenProject, Plane, GitHub Projects | Export issues and preserve GitHub links |
| DNS / edge | Cloudflare | AWS Route 53/CloudFront, Azure Front Door, Google Cloud CDN, Fastly | Caddy, NGINX, Envoy | DNS export, origin map, TLS/WAF/route runbook |
| Runtime / hosting | Cloudflare Workers; approved existing runtimes | AWS, Azure, GCP, Render, Fly.io, Railway | OCI containers; Kubernetes only when justified | Portable images, IaC, health probes, rollback |
| Backend / DB | Decision pending | Firebase, Supabase, Cloud SQL, RDS, Azure Database | PostgreSQL; SQLite for local/test | Domain ownership, logical backup, restore and migration test |
| Customer identity | Decision pending | Firebase Identity Platform, Auth0, Cognito, Clerk, Entra External ID, WorkOS | Keycloak, Ory | OIDC/OAuth, stable subject mapping, issuer migration plan |
| Workforce IAM | Not designated | Entra ID, Okta, Google Workspace | Keycloak, LDAP where appropriate | MFA, SCIM/export, break-glass and access review |
| API gateway | LINGO-owned contracts | Cloudflare, AWS API Gateway, Apigee, Kong Konnect | Kong OSS, Envoy, NGINX | OpenAPI, auth, rate limits, canary and rollback |
| Cache / messaging | Add only when needed | Redis Cloud, Upstash, managed queues | Redis/Valkey, RabbitMQ, NATS, Kafka/Redpanda | Idempotency, replay, dead-letter queue |
| Observability | Datadog | New Relic, Dynatrace, Honeycomb, Grafana Cloud | OpenTelemetry, Prometheus, Grafana, Loki, Tempo, Jaeger, SigNoz | OTel-first instrumentation, portable SLOs and logs |
| Error tracking | Verify existing features | Sentry, Datadog, New Relic | GlitchTip, self-hosted Sentry-compatible options | Release/source map retention and event export |
| Product analytics | PostHog / Amplitude | Mixpanel, Heap, Pendo | Matomo, self-hosted PostHog | Canonical event schema, consent and event export |
| Warehouse | Defer until justified | BigQuery, Snowflake, Redshift, Databricks, MotherDuck | DuckDB, ClickHouse, Trino, Iceberg | Open formats, SQL models and scheduled exports |
| Data transformation | Not designated | dbt Cloud, managed ELT | dbt Core, SQLMesh, Airbyte, Meltano, Dagster, Prefect | Versioned models, tests and lineage |
| Data catalog | Alation pending connection | Alation, Collibra, Atlan, Purview | OpenMetadata, DataHub | Versioned glossary, classification, ownership |
| BI | Power BI pending connection | Power BI, Tableau, Looker, Omni | Metabase, Superset, Evidence | Governed metrics and exportable SQL |
| CI / build | GitHub Actions (startup failures observed) | GitLab CI, Buildkite, CircleCI, Azure Pipelines | Jenkins, Woodpecker, isolated self-hosted runners | Reproducible scripts, signed artifacts, hosted smoke fallback |
| Browser / mobile QA | No single standard | BrowserStack, Sauce Labs, LambdaTest | Playwright, Cypress, Selenium, Appium | Deterministic tests, device matrix, traces |
| Security testing | No single scanner | Snyk, GitHub Advanced Security, Semgrep, Wiz, Burp | Semgrep CE, Trivy, Grype, Gitleaks, OWASP ZAP, Checkov | SBOM, pinned dependencies, signed artifacts, independent pentest |
| Secrets / workload identity | Provider-scoped secrets | Vault Cloud, cloud secret managers | OpenBao, SOPS, age, SPIFFE/SPIRE | Short-lived credentials, rotation and revocation |
| Payments | Stripe test mode | Adyen, Braintree, Checkout.com, PayPal | Hosted checkout; do not store card data | Payment abstraction, webhook replay, ledger reconciliation |
| Commerce | Shopify | BigCommerce, WooCommerce, commercetools | Medusa, Saleor | Catalog/order/customer export and fulfillment runbook |
| Support | HubSpot onboarding incomplete | Zendesk, Intercom, Freshdesk, Help Scout | Zammad, FreeScout | Ticket, macro, KB and consent export |
| CRM | HubSpot | Salesforce, Zoho, Attio, Dynamics | EspoCRM, SuiteCRM | Stable customer IDs and full activity export |
| Email / lifecycle | Not designated | Postmark, SendGrid, Resend, SES, Mailgun, Klaviyo | SMTP-compatible provider | Domain auth, suppression export, template source |
| SEO / market intel | Ahrefs | Semrush, Moz, Similarweb | Search Console, Keyword Planner, Bing Webmaster Tools | Retain keyword sets, landing pages, metadata and UTM taxonomy |
| App distribution | Apple App Store / Google Play | Alternative stores where lawful/permitted | Direct web/PWA | Signed builds, privacy disclosures, staged rollout |
| Game distribution | Product-specific | Steam, Epic Games Store, console/mobile stores | itch.io, web distribution | Engine-neutral assets, save export, entitlement checks |
| Design / creative | Figma, Adobe, Canva | Other commercial suites | SVG, PNG, glTF, USD, open formats | Editable source, license, font and provenance records |
| AI model access | LINGO-owned provider adapters | OpenAI, Anthropic, Google, xAI and approved APIs | Local/open-weight models where feasible | Evals, provider abstraction, data controls, rate/spend limits |
| Automation | GitHub / Linear / approved Automations | n8n Cloud, Make, Zapier, Workato | n8n self-hosted, Temporal, Windmill | Idempotency, retries, audit, disable switch |
| Status / incidents | Not designated | Statuspage, Better Stack, incident.io | Cachet, Uptime Kuma, OneUptime | Static status page, incident archive |
| Backup / DR | Must be verified per domain | Cloud-native backups and managed DR | pgBackRest, WAL-G, restic, Velero | Immutable/offline copies and restore drills |

These are candidate routes, not approvals. Verify product fit, current terms, regional availability, price, quotas, data residency and support before selection.

## 3. LINGO recommended topology

### Control plane
- GitHub is canonical for source, ADRs, policies, change records and release evidence.
- Linear is the planning and coordination layer; it is not the code/release authority.
- GitHub Issues/Projects are the work-tracking fallback.
- Evidence archive retains raw logs, signed artifacts, hashes, approvals and review records.

### Shared platform
- One approved customer identity issuer; separate workforce and service identities.
- LINGO-owned API contracts and provider adapters.
- One authoritative writer per data domain; no accidental dual-write.
- Append-only wallet ledger with idempotency and reconciliation.
- OpenTelemetry instrumentation and provider-neutral SLOs.
- Versioned event schemas, consent-aware analytics and retention.

### Product plane
- Web, mobile and games consume shared contracts.
- Commerce/payment processing stays separate from wallet balances and virtual game credits.
- Each product owns its runtime, data classification, release channel, support path and rollback.
- Preserve first-party domains, consent records and portable campaign/event taxonomies.

## 4. Architecture decisions required

| ADR | Decision | Gate |
|---|---|---|
| ADR-001 | Firebase vs Supabase vs PostgreSQL data-domain ownership | No new backend provisioning or dual-write |
| ADR-002 | Customer identity issuer and migration | No production auth rollout before issuer/audience, recovery and negative tests |
| ADR-003 | Workforce IAM and privileged access | No operator production access without MFA, least privilege and audit |
| ADR-004 | API gateway and service identity | No trust based on header presence or static shared bearer secrets |
| ADR-005 | CI and G02 architecture | No runner activity before host/registration/token reconciliation |
| ADR-006 | Observability and retention | No sensitive payload logging; cost/retention limits required |
| ADR-007 | Wallet/payment boundaries | No live money movement/cash-out before legal, security and reconciliation approval |
| ADR-008 | Warehouse/catalog timing | No paid warehouse before volume and use case justify it |
| ADR-009 | Publishing by product type | No public release before platform/legal/privacy/accessibility gates |
| ADR-010 | Vendor exit and DR | No critical provider accepted without export and restore evidence |

## 5. Resilience patterns

1. Isolate vendor APIs behind adapters; keep vendor-specific types out of core domain models.
2. Use portable contracts: OpenAPI, AsyncAPI, JSON Schema, OIDC/OAuth, SCIM where applicable.
3. Maintain routine encrypted exports, stable IDs, checksums, retention and restore tests.
4. Use short-lived credentials, scoped workload identity and documented break-glass procedures.
5. Implement timeouts, bounded retries with jitter, circuit breakers, idempotency and dead-letter queues.
6. Use immutable artifacts, environment parity, staged rollout, health checks and rollback.
7. Use OpenTelemetry, trace correlation, provider-neutral SLOs and alert ownership.
8. Set quotas, spend ceilings and approval before paid expansion.
9. Name an owner, runbook, escalation path and manual fallback for every critical service.
10. Test provider export/re-import and exit plans annually for critical dependencies.

## 6. Cost and estimation

For every route estimate integration/migration effort, fixed fees, seats, usage, build minutes, storage, egress, logs, events, support tiers, security/compliance testing, backup/DR, operating labor and exit/dual-running cost. Produce lean pilot, growth and enterprise scenarios with quantities, assumptions, unit rates, confidence, exclusions and annualized totals. A free tier is not a guarantee of zero cost. This playbook authorizes no spend.

## 7. Verification and admission gates

Require provider/account identity and permissions; data-flow and API contract review; threat model; positive and negative tests; rate-limit/timeout/retry/outage tests; export/import integrity; restore and rollback; cost/quota alert; owner/support path; independent review and evidence link.

Status vocabulary: DISCOVERED → AVAILABLE → CONNECTED → CONFIGURED → REACHABLE → EXECUTED → VERIFIED → INDEPENDENTLY ACCEPTED → PRODUCTION. Do not infer one status from another.

## 8. Current LINGO constraints

- Master registry and this playbook are proposals until reviewed and merged.
- Cloudflare is intended authoritative edge; route/DNS/Worker reconciliation is separate.
- Firebase/Supabase authority remains unresolved; project reachability is not an authority decision.
- GitHub Actions startup failures are not successful tests. G02 remains FAIL / UNVERIFIED.
- Linear workspace is newly connected; the Lingo Legacy team has no projects in the inspected listing. Avoid duplicating task truth.
- Ahrefs is connected; this does not prove site ownership or SEO performance.
- Alation and Power BI remain unconnected; OpenMetadata/DataHub and Metabase/Superset are viable alternatives.
- No production deployment, runner activity, DNS/Worker mutation, live payment activation, paid provisioning or spend is authorized.

## 9. Acceptance

Accept this playbook only when the register covers every product and shared capability; each critical dependency has primary, secondary and exit routes; authority boundaries and ADRs are approved; security/data handling is reviewed; cost and operating effort are estimated; outage/restore/migration tests have evidence; each route has an owner and review date; and release gates remain independently reviewable.

**This is a target architecture proposal, not a production-readiness certification or deployment authorization.**
