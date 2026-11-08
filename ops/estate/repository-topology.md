# LINGO Legacy Repository Topology

## Authority and proposed repositories

The existing `thelingolegacy-blip/TheLingoLegacy` repository remains the canonical source of truth. The following repositories are **proposals only**; they have not been created.

| Proposed repository | Purpose | Initial visibility | Boundary |
|---|---|---|---|
| `thelingolegacy-blip/LingoStudioOps` | Studio CI/CD, design system, UI/UX and build manifests | Private recommended | No production secrets |
| `thelingolegacy-blip/LingoRunnerHost` | Linux host bootstrap, runner service health, telemetry and G02 sentinel | Private recommended | No application source or production secrets |
| `thelingolegacy-blip/LingoMediaPipeline` | Asset registry, license records, metadata, media transforms and checksums | Private recommended | No unlicensed media |
| `thelingolegacy-blip/LingoRecoveryEvidence` | Signed/hashed evidence bundles, checkpoint indexes, restore rehearsals | Private recommended | Append-only evidence; no credentials |

## Creation order
1. Establish GitHub owner/organization authority and approved repository names.
2. Create the private repositories with README, security policy, and default branch.
3. Apply branch rulesets before pushing application code.
4. Configure GitHub Actions permissions to read-only by default.
5. Add required status checks only after their workflows have executed successfully at least once.
6. Install secret scanning/dependency security features if available under the account plan.
7. Create cross-repository access through a GitHub App with minimum permissions; never use a broad personal token in source.
8. Add each created repository's real ID, default branch, ruleset ID, and creation timestamp to the estate manifest.

## Rules
- No repository is production-authoritative by virtue of being created.
- No automatic cross-repository merge or push.
- Promotion into the canonical repository occurs only through reviewed pull requests.
- Do not place runner registration tokens, PATs, private keys, Cloudflare API tokens, Firebase service-account keys, or customer data in repositories or CI logs.
- Repositories intended for self-hosted runner configuration must not run untrusted fork pull-request code on that runner.
- New repositories remain proposals until creation and rulesets are independently verified.
