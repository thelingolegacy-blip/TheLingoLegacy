# GitHub main branch protection — required administrator configuration

**Repository:** `thelingolegacy-blip/TheLingoLegacy`  
**Observed:** `main` is currently unprotected.  
**Status:** Policy documented; enforcement not yet applied.

## Required ruleset

Apply a repository ruleset targeting the default branch `main`:

1. Require a pull request before merging.
2. Require at least one approval from a reviewer other than the PR author.
3. Require CODEOWNERS review for changes under source, workflows, deployment configuration, Firebase, Cloudflare, and migrations.
4. Dismiss stale approvals when new commits are pushed.
5. Require approval of the most recent reviewable push where supported.
6. Require all review conversations to be resolved.
7. Require the branch to be up to date before merging.
8. Restrict force pushes and branch deletion.
9. Enforce the rules for administrators.
10. Require the following checks only after they have demonstrated successful job execution and retrievable evidence:
    - Lingo Legacy Static CI
    - Flutter Firebase Integrity
    - Mobile Native Build Recovery
    - G02 Runner Image Build (no publish), only for runner/build-image changes

Do not make Vercel checks required. Cloudflare is the canonical web delivery platform; Vercel is a retired/legacy deployment path.

## Current limitation

The connected GitHub integration can read repository metadata and PRs, but the available tools do not expose branch-protection/ruleset mutation or repository Actions permission settings. The API readback confirms `main.protected=false`; the available connector cannot apply the ruleset. A repository administrator must enable it in GitHub.

## Acceptance gate

Do not merge production-bound PRs until:
- the ruleset is active and read back from GitHub;
- GitHub Actions creates jobs and retrievable logs/artifacts;
- an independent reviewer approves the exact head SHA;
- the release-specific staging and production gates pass.
