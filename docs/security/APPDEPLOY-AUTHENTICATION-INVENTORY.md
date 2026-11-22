# AppDeploy Authentication and Secret-Binding Inventory

**Observed:** 2026-11-16  
**Scope:** read-only inventory of the 18 applications returned by the AppDeploy account used for LINGO staging work.  
**Release posture:** `PROTECTED_HOLD`

## Result

- 18 applications enumerated.
- All 18 applications returned an empty backend secret-name inventory.
- All 18 resource inventories reported an empty `resource_requirements` array.
- Three applications reported static public resource paths; the other 15 reported no resource paths.
- No secret entries were created, submitted, or bound.
- Two AppDeploy connection records resolve to the same AppDeploy user and return the same 18-app inventory; a third connection resolves to a different account identity and returns zero apps. This is treated as a duplicate/alternate connection, not as a second LINGO app portfolio.

An empty secret inventory is an observation, **not** proof that an app does not require authentication. Do not add placeholder secrets or bind credentials simply to make the inventory non-empty. Each app must first have an approved backend/authentication design and a documented reason for every required secret.

## Per-application evidence

| Application | App ID | Secret names | Resource requirements | Public resource paths |
|---|---|---:|---:|---:|
| LINGO Studio Hub | `lingo-legacy-studio-hub-nhda3b` | 0 | 0 | 11 |
| Jersey Shore: The Undead | `jersey-shore-the-undead-l4h5ea` | 0 | 0 | 0 |
| Crazy Weasols | `crazy-weasels-0j3ujc` | 0 | 0 | 0 |
| LINGO Enterprise Control Center | `lingo-enterprise-control-center-qos4ix` | 0 | 0 | 0 |
| LINGOlegacy Universe Gateway | `lingolegacy-universe-gateway-h6kqu4` | 0 | 0 | 0 |
| LINGOloyalty | Staging Preview | `lingoloyalty-staging-preview-x4ld0h` | 0 | 0 | 0 |
| LINGO AI Sonic Boom | `lingo-ai-sonic-boom-2030-7plgl2` | 0 | 0 | 0 |
| LINGO Legacy Master Project Plan | `lingo-legacy-master-project-plan-rkh6r6` | 0 | 0 | 0 |
| Hello The Lingo Legacy | `hello-the-lingo-legacy-ois1rj` | 0 | 0 | 0 |
| That’s My Lingo | `that-s-my-lingo-casino-studio-2xntye` | 0 | 0 | 12 |
| LINGO Legacy Universe | `lingo-legacy-universe-rpekc0` | 0 | 0 | 0 |
| The Lingo Legacy Flagship | `the-lingo-legacy-y67ewl` | 0 | 0 | 0 |
| Obsidian Closet & Design Studio | `obsidian-closet-design-studio-zk6va7` | 0 | 0 | 0 |
| The Lingo Legacy HQ | `the-lingo-legacy-hq-vhjt6i` | 0 | 0 | 0 |
| Kotton's Code Cartoon Studio | `kotton-s-code-cartoon-studio-509py3` | 0 | 0 | 4 |
| Loyalty Lane Community Hub | `loyalty-lane-community-hub-zb39n2` | 0 | 0 | 0 |
| Lingo Legacy Verification Bridge | `lingo-legacy-verification-bridge-wwagn2` | 0 | 0 | 0 |
| Lingo Travel | `lingo-traveltm-uyd57n` | 0 | 0 | 0 |

## Authentication decisions

1. Keep credentials out of source, frontend bundles, app descriptions, logs, and chat.
2. Prefer provider-managed workload identity for server-to-server access where supported.
3. Use user-scoped authentication for end-user accounts; never reuse a shared static Firebase ID token.
4. Create AppDeploy secret entries only after the app owner approves the provider, exact secret purpose, target app, and environment.
5. Bind development/staging credentials only to staging apps; production bindings require a separate release acceptance.
6. Verify each app's actual source routes and backend requirements before classifying it as public-only or authenticated.
7. Do not redeploy or replace any app version as part of this inventory.

## Evidence boundary

This inventory verifies account-visible app IDs, secret-name lists, resource-requirement lists, and resource paths at the time observed. It does not verify runtime login behavior, provider-side user pools, database authorization, OAuth callback configuration, or production readiness.
