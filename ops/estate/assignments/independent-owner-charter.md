# Independent Recovery Owner Charter

**Designation:** Independent Recovery Owner (IRO-01)  
**Planning identity:** Morgan Vale — *fictional placeholder; not a real person or GitHub account*  
**Status:** ROLE DEFINED / HUMAN APPOINTMENT PENDING  
**Scope:** G02 runner recovery, CI evidence acceptance, production-readiness review, and activation-gate oversight.

## Purpose

IRO-01 is an independent control owner who protects the evidence chain and challenges unsupported PASS claims. The role is separate from the operator who provisions the host, the engineer who changes workflows, and the release approver who authorizes activation.

The fictional planning identity is used only to make the ownership model concrete. It does not represent a hired, appointed, available, or consenting individual. A real authorized person must be appointed before this role can exercise authority.

## Responsibilities

1. Maintain the G00–G11 gate matrix and record the source of every status change.
2. Verify G02 evidence independently: matching runner identity and labels; runner ID greater than zero; populated runner name; assigned job; instantiated steps; sentinel result; retrievable logs and artifact; checksums; and correlation to the run, job, commit, and runner.
3. Reject evidence that is incomplete, uncorrelated, unverifiable, or produced by an ineligible execution environment.
4. Confirm CI, security, build, test, telemetry, and release-candidate evidence before recommending any downstream gate transition.
5. Verify that production activation has explicit, separate authorization and that post-activation checks are defined before any activation is attempted.
6. Preserve the last-known-good state and record blockers without bypassing failed gates.

## Separation of duties

- **Host operator:** provisions and operates the authorized Linux host; does not self-certify the evidence they produce.
- **CI maintainer:** owns workflow changes and controlled test execution; does not independently accept their own evidence.
- **IRO-01:** reviews evidence and recommends gate status; cannot provision infrastructure, mint credentials, register a runner, merge a pull request, deploy production, change DNS, or activate services by virtue of this role alone.
- **Release approver / operations owner:** provides the separate, explicit authorization required for a release or activation. IRO-01 cannot substitute for this approval.

## Current assignment and gate status

- Actual human owner: **UNASSIGNED — appointment required**.
- GitHub identity: **NONE — do not invent or infer an account**.
- Runner host: **NOT VERIFIED / NOT PROVISIONED by this charter**.
- G02: **FAIL / BLOCKED pending real runner assignment and independently verifiable evidence**.
- G03–G11: **BLOCKED** until their respective acceptance predicates are met.
- Production mutation: **PROHIBITED while the protected hold remains active**.
- Deployment mutex: **LOCKED**.
- Last-known-good (LKG): **PROTECTED**.

## Appointment acceptance checklist

Before IRO-01 is considered active, record all of the following in an auditable change:
- the actual person's name and verified organization/GitHub identity;
- confirmation that the person accepts the role;
- confirmation of independence from the implementation and host-operation work they review;
- the precise authority granted and explicit exclusions;
- a named alternate, if authorized by governance;
- the effective date and the approving authority.

Do not replace the fictional planning identity with an assumed real person. Do not treat this document, a pull request, a queued workflow, or a successful build as proof that a human owner has accepted the assignment.

## Decision rule

Until a real independent owner is appointed and the relevant evidence is independently verified, the role remains **DEFINED / UNSTAFFED**, G02 remains **FAIL / BLOCKED**, downstream gates remain blocked, production remains frozen, and LKG remains protected.
