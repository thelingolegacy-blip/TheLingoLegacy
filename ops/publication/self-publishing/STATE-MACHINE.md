# Self-Publishing State Machine

| State | Required evidence | Establishment condition |
|---|---|---|
| PUBLICATION-READY | Complete owner-controlled release package | Package validated |
| SUBMITTED | Platform receipt/reference + exact asset/version manifest | Submission independently verified |
| APPROVED | Platform approval/review evidence | Approval independently verified |
| LISTED | Public catalog/store listing evidence | Listing independently verified |
| COMMERCIALLY PUBLISHED | Verified live commercial availability and publication record | Commercial state independently verified |

## Non-transitivity

ESTABLISHED(n) != ESTABLISHED(n+1)

EVIDENCE(n) != EVIDENCE(n+1)

No state inherits authority from the preceding state.

## Current implementation boundary

The channel defines workflow and evidence contracts only. It does not claim live publication for any LINGO book, game, or music release.
