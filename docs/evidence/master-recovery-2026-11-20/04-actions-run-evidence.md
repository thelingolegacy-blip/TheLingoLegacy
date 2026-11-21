# GitHub Actions run evidence refinement — 2026-11-20

A current-head workflow lookup was performed for the recovery PR set. The sampled runs for #574, #589, #592, #594, #596, #602, #613, and #614 all ended in `startup_failure`. No test execution should be inferred from those conclusions.

## PR #611 exception: one job object, but zero executed steps

For PR #611 head `026eab54b461453059c29857bf002f16819118c3`:
- Workflow run: `44804312033` (LLG Dispatch Contract CI)
- Run conclusion: `failure`
- GitHub returned one job: `136524173411`
- Job conclusion: `failure`
- Job steps endpoint: empty array
- Job logs endpoint: `BlobNotFound` / HTTP 404
- Run artifacts: empty

This is a job-level failure before step evidence. It is **not** a failing unit-test assertion, because the test step did not execute; it is also not a pass. The root cause remains unknown.

PR #611 comments:
- Source defects: #7051202896
- Run evidence refinement: #7051243616

The owner/admin Actions admission and policy inspection remains required. Do not dispatch or rerun workflows until the owner-side blocker is resolved and isolated execution is authorized.
