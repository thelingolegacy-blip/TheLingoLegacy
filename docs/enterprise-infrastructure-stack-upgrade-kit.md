# LINGO Legacy — Enterprise Infrastructure Stack Upgrade Kit

Status: **INSTALLATION PLAN COMMITTED; HOST INSTALLATION NOT EXECUTED; PRODUCTION ACTIVATION BLOCKED**

Target repository: `thelingolegacy-blip/TheLingoLegacy`
Target branch: `studio/prototype-quality-pass-2026-10-13`

## Guardrails

This kit is for local development, reproducible builds, test execution, and evidence collection. It does not authorize production deployment, DNS changes, Firebase rules/function deployment, Cloudflare Worker promotion, release activation, or changes to the protected last-known-good state.

The Firebase + Flutter C.O.S. v3.0 Phase-50 baseline remains locked. Upgrade dependencies and tooling in an isolated working tree first. Do not run infrastructure apply/deploy commands until a separate evidence-based promotion approval is recorded.

## Toolchain inventory and official installation sources

| Layer | Tool/framework | Official install source | Purpose |
|---|---|---|---|
| Source control | Git | https://git-scm.com/downloads | Source checkout and version control |
| Git hosting / CI | GitHub CLI (`gh`) | https://cli.github.com/ | Inspect repository, Actions and releases |
| JavaScript runtime | Node.js LTS | https://nodejs.org/en/download/ | Next.js, scripts, Firebase CLI, Wrangler |
| Package manager | pnpm | https://pnpm.io/installation | Reproducible JS workspace management |
| Web application | Next.js / TypeScript | https://nextjs.org/docs | LINGO Legacy web app |
| Flutter application | Flutter SDK | https://docs.flutter.dev/install | Cross-platform Super App |
| Firebase services | Firebase CLI | https://firebase.google.com/docs/cli | Auth, Firestore, Functions, Messaging, Analytics tooling |
| Flutter/Firebase bridge | FlutterFire CLI | https://firebase.google.com/docs/flutter/setup | Generate app configuration for existing Firebase project |
| Edge / hosting | Cloudflare Wrangler | https://developers.cloudflare.com/workers/wrangler/install-and-update/ | Local Worker build and test; deploy only after approval |
| Cloud infrastructure as code | Terraform | https://developer.hashicorp.com/terraform/install | Versioned infrastructure plans; use a single source of state |
| Containers | Docker Desktop / Engine | https://docs.docker.com/engine/install/ | Reproducible local services and test environments |
| Browser QA | Playwright | https://playwright.dev/docs/intro | Browser-based regression and E2E testing |
| Error monitoring CLI | Sentry CLI | https://cli.sentry.dev/getting-started/ | Release/telemetry workflows after project setup |
| Design | Figma | https://www.figma.com/downloads/ | UI/UX and design-system handoff |
| Game production | GDevelop | https://gdevelop.io/download | Existing game development workflow |
| Unity (only where project requires it) | Unity Hub | https://unity.com/download | Unity-based game projects; not a replacement for GDevelop |
| Commerce | Shopify | https://www.shopify.com/ | Loyalty Lane storefront; production changes require separate approval |
| Deployment platform | Vercel CLI | https://vercel.com/docs/cli | Preview/deployment inspection; not proof of Cloudflare production health |

Use official sources only. Download the version compatible with the host OS/architecture. Prefer supported LTS/stable releases and pin project dependencies in lockfiles. Do not blindly upgrade all application dependencies to latest.

## Suggested installation commands

Run only on the intended developer workstation or a dedicated build host, after reviewing each official installer. Commands below install tools on that machine; they do not run from the GitHub repository connector.

### Node.js, npm, pnpm, Firebase CLI, Wrangler, Sentry CLI

Install Node.js LTS from https://nodejs.org/en/download/ (a Node version manager is preferred). Then:

```bash
node --version
npm --version
npm install --global pnpm
npm install --global firebase-tools
npm install --global wrangler
npm install --global sentry
```

Use the project's pinned Wrangler version via the package manifest for CI rather than relying on an unpinned global install.

### Flutter and FlutterFire

Install Flutter using the OS-specific instructions at https://docs.flutter.dev/install, then verify:

```bash
flutter --version
flutter doctor -v
dart --version
dart pub global activate flutterfire_cli
```

Authenticate with the appropriate account and inspect the intended Firebase project before using `flutterfire configure`. Do not create or change Firebase apps until the target project and platform list have been verified.

### GitHub CLI

Install from https://cli.github.com/ and verify:

```bash
gh --version
gh auth status
```

Authentication is local to the workstation. Never paste access tokens into source files, logs, or this conversation.

### Terraform and Docker

Install from the official OS-specific instructions:
- Terraform: https://developer.hashicorp.com/terraform/install
- Docker: https://docs.docker.com/engine/install/

Verify with `terraform version` and `docker version`. Before any Terraform apply, confirm the backend/state, workspace, account, plan, and exact resources to be changed. Never run `terraform apply` as a generic upgrade step.

### Browser testing

From the project directory, after reviewing its existing package manifest and lockfile:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright --version
```

Install Playwright browser dependencies only where required by the repository's test configuration. Do not generate or replace a lockfile without reviewing the resulting diff.

## LINGO Legacy upgrade sequence

1. **Inventory:** record host OS/architecture, existing tool versions, repo branch/commit, package manager and lockfiles.
2. **Protect:** preserve Phase-50 baseline, current last-known-good state, and production mutation freeze.
3. **Install:** install only missing developer tools using official sources; record versions and checksums where published.
4. **Restore dependencies:** use the repository's existing lockfile and frozen install mode; avoid blanket dependency upgrades.
5. **Build/test locally:** syntax, unit/contract tests, static validation, runtime tests, Cloudflare local asset test, Flutter analyze/test where the Flutter project exists.
6. **Evidence:** capture exact commit SHA, tool versions, command exit codes, test logs, artifact hashes, and the source of each result.
7. **CI recovery:** fix runner assignment independently. A queued/completed workflow record without instantiated steps and logs is not test evidence.
8. **Acceptance:** independently verify evidence completeness, integrity, scope, and correlation.
9. **Promotion review:** separately approve any infrastructure plan, Firebase deployment, Worker deployment, DNS change, store publication, or activation.
10. **Activation:** only after the promotion gate passes and public reachability/rollback are verified.

## Current blockers to clear before any activation

- G02 runner assignment/daemon remains unverified; prior workflow jobs completed failure with no instantiated steps, logs unavailable, and no evidence artifacts.
- The latest quality workflow run on commit `490c73c40ba656feee205eb4cf869b259173b721` failed before step initialization. This does not establish test pass/fail.
- Prior public reachability validation was not established even when Cloudflare internal traces passed.
- Production mutation freeze and last-known-good protection remain in force.

## Acceptance checklist

- [ ] Host OS and architecture identified
- [ ] Official installers downloaded and signatures/checksums verified where available
- [ ] Tool versions recorded
- [ ] Dependency lockfiles preserved
- [ ] Local build/test results captured and successful
- [ ] GitHub Actions runner has a real assignment, instantiated steps, executed sentinel, and retrievable logs
- [ ] Evidence artifact is retrievable and correlated to the exact commit/run/attempt
- [ ] Independent acceptance completed
- [ ] Separate production promotion authorization recorded
- [ ] Rollback path and public reachability verified

**This document does not assert that tools have been downloaded or installed.** It defines the approved stack and installation path. The connected GitHub repository interface can commit this kit, but it cannot install software on the user's workstation or start services on the remote runner host.
