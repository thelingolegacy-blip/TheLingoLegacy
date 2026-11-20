# LLG Dispatch Contract v1

This package establishes executable, fail-closed validation primitives for the
LLG Dispatch Control Plane described in
[the dispatch design proposal](../../docs/operations/LLG-DISPATCH-CONTROL-PLANE-v1.md).

## Included

- `contract.py`: validates bounded job envelopes and lifecycle transitions.
- `roles.json`: role catalog only; no people or service identities are assigned.
- `tests/test_contract.py`: standard-library unit tests for rejection paths and
  completion evidence requirements.

## Run tests

```sh
python -m unittest discover -s ops/dispatch/tests -v
```

## Safety boundary

This is not a live scheduler, queue, identity provider, worker runtime, event bus,
or administrator provisioning interface. It does not dispatch jobs, create
accounts, grant permissions, read secrets, or authorize deployments.

Production jobs are rejected by this validator and require a separate human
release authorization path. Default job cost ceiling is zero. A job cannot be
marked complete without retrievable evidence and an independent reviewer. The v1 job-envelope schema rejects an initial `COMPLETE` status; completion must be reached through the evidence-gated `transition()` path.

Role entries are permission templates, not assignments. Bind a role to a
verified individual or service principal only through a separately reviewed
identity integration with MFA and audit controls.
