# CircleCI Secondary Validation — Setup and Safety Record

**Status:** PREPARED / NOT CONNECTED / NOT RUN  
**Canonical source:** `thelingolegacy-blip/TheLingoLegacy` on GitHub  
**Purpose:** Provide a secondary CI execution route while GitHub Actions startup admission is investigated. This does not replace GitHub as source of truth and does not authorize production deployment.

## Verified repository state

- The repository already contains `.circleci/config.yml`.
- The existing CircleCI configuration runs `validate-devops-config` on non-main branches. It checks selected YAML files with pinned yamllint/PyYAML and parses them. It does **not** run Flutter analysis, Flutter tests, web builds, or Android builds.
- The existing Flutter/Firebase integrity workflow is `.github/workflows/flutter-firebase-integrity.yml`. It runs Flutter dependency resolution, analysis, tests, web release build, Android debug build, and a Firebase Hosting configuration check. It contains no deployment step and declares read-only GitHub contents permissions.
- GitHub Actions has repeated pre-job `startup_failure` results with zero jobs and zero artifacts. Do not repeatedly dispatch it until owner/admin Actions admission and hosted-runner entitlement/policy are checked.

## Recommended CircleCI route

Use CircleCI's **GitHub Actions workflow support (Preview)** to run the existing Flutter workflow on CircleCI compute. This avoids maintaining a second copy of the Flutter build steps.

1. The repository owner opens CircleCI and creates/selects the organization.
2. Connect GitHub Cloud through the CircleCI GitHub App and authorize access to **only** `thelingolegacy-blip/TheLingoLegacy`.
3. Add a pipeline using the existing GitHub Actions workflow file as the config source: `.github/workflows/flutter-firebase-integrity.yml`.
4. Set the CircleCI trigger to **PR opened or pushed to** (or the equivalent PR-only trigger). Do not use all-pushes for the initial trial.
5. Do not add GitHub/Firebase/Cloudflare/payment secrets. The current workflow is intended to run as a non-deploying validation job.
6. Run one controlled test on an isolated draft PR. Inspect the actual CircleCI job list, every step, and raw logs—not only the overall green/red status.
7. Record the CircleCI pipeline/run URL, job IDs, step results, commit SHA, and any artifacts. Compare the checked-out SHA to the exact GitHub PR head SHA.

## Important Preview limitations

- CircleCI documents GitHub Actions workflow support as **Preview**, not a fully equivalent GitHub Actions runtime.
- CircleCI's trigger controls the event. The `on:` filters in the GitHub workflow (including branch, path, and event filters) are not applied by this integration. Configure PR-only triggers in CircleCI itself.
- Public GitHub Actions are supported only partially. The Flutter setup action must be observed in the first run to confirm the SDK is actually on PATH before later Flutter commands.
- The integration does not reproduce GitHub's deployment protection semantics. Do not add deploy jobs or rely on CircleCI approval gates as a substitute for SAAAE.
- GitHub Actions `concurrency` is not enforced by this Preview integration. Keep this validation workflow non-deploying and do not reuse it for overlapping production operations.
- Any secret needed by a workflow must be separately reviewed and configured in CircleCI. Do not copy production secrets into the secondary CI project.

## Acceptance criteria

A CircleCI result is useful only when all of the following are captured:

- Pipeline and run IDs/URLs
- Exact repository and commit SHA
- Job ID and job name
- Instantiated steps with start/end status
- Raw logs for checkout, Flutter setup, dependency resolution, analysis, tests, web build, Android debug build, and Firebase configuration check
- Artifacts, if any, with names and checksums
- Explicit statement of any Preview compatibility issue

A passing CircleCI run is secondary validation evidence. It does **not** prove GitHub Actions admission is repaired, does not satisfy the G02 self-hosted runner requirement, and does not authorize merge or production promotion.

## Owner action required

CircleCI is not connected through an available ChatGPT connector in this session. The repository file can be prepared in GitHub, but the owner must complete the CircleCI GitHub App authorization and project/pipeline setup in CircleCI's own UI. No CircleCI account, pipeline, trigger, subscription, or paid resource has been created from this session.

## References

- CircleCI: [Use a GitHub Actions workflow file as your pipeline configuration (Preview)](https://circleci.com/docs/guides/orchestrate/use-a-github-actions-workflow-file-as-your-pipeline-configuration/)
- CircleCI: [Pull request build settings](https://circleci.com/docs/guides/integration/pull-request-build-settings/)
- CircleCI: [Free plan overview](https://circleci.com/docs/guides/plans-pricing/plan-free/)
