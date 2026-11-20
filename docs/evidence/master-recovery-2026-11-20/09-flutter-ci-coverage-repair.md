# Flutter workflow coverage repair — 2026-11-20

PR #614's direct GitHub Actions workflow had root Flutter analyze/tests and Oasis Flutter analyze, but no Oasis `flutter test` step. The preview shell script did run Oasis tests, but that did not establish CI coverage.

A step was added on the isolated PR branch:
- Branch: `recovery/firebase-hosting-quarantine-boundary`
- Commit: `7574ad6308f048547a604bd2ace22cab05dc1ef9`
- File: `.github/workflows/flutter-firebase-integrity.yml`
- Added: Oasis Flutter unit/widget test step, with working directory `studio-sites/games/oasis-platform/flutter`, command `flutter test`, after Oasis analysis.

GitHub readback confirmed the step. No current-head workflow run was returned at the time of the check; no test execution is claimed. PR #614 remains draft/unmerged, and Android wrapper/readiness and Actions admission blockers remain unresolved.
