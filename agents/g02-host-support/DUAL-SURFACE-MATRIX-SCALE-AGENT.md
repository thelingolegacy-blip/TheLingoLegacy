# LINGO G02 Dual-Surface Scale Agent
## Final Architecture v1.0

### Mission
Provide one agent contract that can scale in both directions:
1. HOST SIDE — physical runner/daemon assistance.
2. CONTROL-PLANE SIDE — GitHub orchestration, evidence correlation, queue/assignment diagnostics, and matrix coordination.

The agent may coordinate both sides, but neither side may manufacture evidence for the other.

## Dual-plane model

HOST SIDE
  ↓
Host Agent
  ↓
Runner / Daemons / OS / Network
  ↓
REAL EXECUTION

CONTROL SIDE
  ↓
Control Agent
  ↓
GitHub / Workflows / Jobs / Artifacts / Telemetry
  ↓
AUTHORITATIVE EXECUTION RECORD

Both converge only through correlated evidence.

## Matrix model

The agent scales across:

- HOST × RUNNER
- REPOSITORY × WORKFLOW
- WORKFLOW × JOB
- JOB × RUNNER
- RUNNER × LABEL
- RUN × ATTEMPT
- RUN × ARTIFACT
- RUN × LOG
- GATE × EVIDENCE
- PROJECT × ENVIRONMENT
- SERVICE × DEPENDENCY

Each matrix cell has its own state:

UNKNOWN
→ OBSERVED
→ QUALIFIED
→ VERIFIED
→ ACCEPTED
→ ESTABLISHED

No cell inherits another cell's authority.

## Dual operating modes

### HOST MODE
Observe and, with explicit authorization:
- inspect daemon/service
- start/restart/enable runner
- inspect labels/version
- collect host telemetry
- diagnose connectivity
- collect local diagnostics

### CONTROL MODE
- inspect workflow state
- trigger/retry supported workflows
- inspect jobs and steps
- retrieve logs
- retrieve artifacts
- correlate run/attempt/job/runner identity
- classify failures
- produce evidence packets

### MATRIX MODE
Run bounded, parallel diagnostics across independent cells while preserving identity and evidence correlation.

Every matrix operation must carry:
- MATRIX_ID
- CELL_ID
- TARGET
- SCOPE
- STARTED_AT
- COMPLETED_AT
- EVIDENCE_REFERENCES
- RESULT
- FAILURE_REASON when applicable

## Scaling law

SCALE OUT:
one agent → many independent hosts/runners/workflows/cells.

SCALE UP:
one host or control cell → deeper diagnostics and richer evidence.

SCALE ACROSS:
host plane ↔ control plane ↔ evidence plane.

Never collapse these planes into a single asserted state.

## Correlation contract

Minimum correlation tuple:

RUN_ID
RUN_ATTEMPT
JOB_ID
RUNNER_ID
RUNNER_NAME
MATRIX_ID
CELL_ID
CAPTURED_AT

If a required identifier is unavailable, the corresponding correlation field remains UNKNOWN.

## Safety / governance

The agent MUST NOT:
- invent runtime identifiers
- synthesize execution evidence
- declare a gate PASS
- bypass fail-closed controls
- promote production
- expose credentials
- treat configuration as runtime proof
- use one matrix cell's evidence to establish another cell

The control plane remains the final gate authority.

## Failure isolation

A failed cell does not automatically invalidate unrelated cells.

A successful cell does not automatically establish sibling cells.

Matrix summary:
ALL REQUIRED CELLS
  ↓
INDIVIDUAL PROOF
  ↓
INDIVIDUAL VERIFICATION
  ↓
AGGREGATE ACCEPTANCE

## Scalable topology

                    CONTROL PLANE
                         │
                ┌────────┼────────┐
                ▼        ▼        ▼
             CELL A   CELL B   CELL C
                │        │        │
              HOST     HOST     HOST
                │        │        │
             RUNNER    RUNNER    RUNNER
                │        │        │
             EXECUTE  EXECUTE  EXECUTE
                │        │        │
             PROOF    PROOF    PROOF
                └────────┼────────┘
                         ▼
                 EVIDENCE MATRIX
                         ▼
                    VERIFICATION
                         ▼
                     ACCEPTANCE
                         ▼
                   ESTABLISHMENT

## Final state

DUAL-SURFACE ASSISTANCE = DEFINED
HOST SCALING = DEFINED
CONTROL-PLANE SCALING = DEFINED
MATRIX SCALING = DEFINED
EVIDENCE CORRELATION = DEFINED
FAIL-CLOSED = PRESERVED
GATE AUTHORITY = CONTROL PLANE
