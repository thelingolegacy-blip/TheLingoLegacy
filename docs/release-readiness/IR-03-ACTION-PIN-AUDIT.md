# IR-03 — GitHub Actions Pin Audit (Isolated Draft)

**Disposition:** Partial audit evidence; do not mark IR-03 PASS until the complete workflow tree and every third-party action reference have been independently enumerated and reviewed.

## Verified action revisions

The following immutable references were resolved against the corresponding canonical action repositories and their `action.yml` files:

| Action | Verified full commit SHA |
|---|---|
| `actions/checkout` | `11bd71901bbe5b1630ceea73d27597364c9af683` |
| `actions/setup-node` | `49933ea5288caeca8642d1e84afbd3f7d6820020` |
| `actions/upload-artifact` | `65c4c4a1ddee5b72f698fdd19549f0f0fb45cf08` |
| `actions/download-artifact` | `634f93cb2916e3fdff6788551b99b062d0335ce0` |
| `subosito/flutter-action` | `1a449444c387b1966244ae4d4f8c696479add0b2` |

The Flutter action reference is the v2.23.0 release commit. The selected action SHAs are immutable commit references; a SHA must still be reviewed for suitability and provenance before adoption.

## Incorrect pins supplied in the proposed mapping

GitHub could not resolve these proposed references in their canonical action repositories:

- `actions/setup-node@39370e3970a6d050c38000417208d132cb0ae0e7`
- `actions/upload-artifact@b4b15b3c7f6a221c038d3144863002554e1262d3`
- `actions/download-artifact@fa0a91b85d4f404e444e00e005971372ec807734`

They were not applied. A failed SHA resolution is a block, not a reason to guess or fall back to a tag.

## Workflow scan performed

A read-only scan of 17 discovered workflow paths on this Draft PR branch found 39 external `uses:` references. Every discovered reference is pinned to a 40-character hexadecimal commit SHA. No unpinned external `uses:` reference remained in those scanned files.

The scan included:

- `.github/workflows/jekyll-docker.yml`
- `.github/workflows/sentinel-check.yml`
- `.github/workflows/g02-run-wrapper.yml`
- `.github/workflows/studio-sandbox-guard.yml`
- `.github/workflows/production-promotion.yml`
- `.github/workflows/studio-preview-package.yml`
- `.github/workflows/lingo-autorepair-deploy.yml`
- `.github/workflows/studio-static-validation.yml`
- `.github/workflows/studio-surface-integrity.yml`
- `.github/workflows/flutter-firebase-integrity.yml`
- `.github/workflows/g02-sentinel.yml`
- `.github/workflows/recovery-foundation.yml`
- `.github/workflows/runner-dispatch-diagnostic.yml`
- `.github/workflows/g02-isolated-staging-sentinel.yml`
- `.github/workflows/runner-self-hosted-g02.yml`
- `.github/workflows/ci-runner-observation.yml`
- `.github/workflows/ir06-detached-evidence-isolated.yml`

## Limitations and acceptance criteria

This was a path-based scan of discovered workflow files, not a proven exhaustive listing of every workflow file in the repository. It does not audit nested composite actions, reusable workflows in other repositories, action internals, or all supply-chain dependencies. The pin updates were made only on the isolated Draft PR branch; no production deployment was initiated.

To accept IR-03, independently enumerate the complete `.github/workflows/` tree at the exact candidate commit, audit every external action and reusable workflow reference, verify each full SHA against its canonical repository, review transitive dependencies and permitted-action policy, and retain machine-readable results tied to that commit.

**Current release posture:** IR-03 remains pending final exhaustive verification. G02 remains BLOCKED; IR-06 remains NOT ACCEPTED; production promotion remains ON HOLD; last-known-good remains PROTECTED.
