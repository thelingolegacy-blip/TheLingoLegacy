# LINGO Shield — GitLab Adapter

GitLab is a secondary execution and collaboration plane inside LINGO Shield.

## Current state

The connected GitLab account currently exposes no LINGO project. The adapter therefore remains **configured but unbound**.

No GitLab project, namespace, credentials, or remote URL is invented by this system.

## Intended flow

```
GitLab Project
     ↓
GitLab Branch / MR
     ↓
LINGO Shield Intake
     ↓
Diff + Provenance
     ↓
Security Review
     ↓
Claude / Repair / Evidence Bots
     ↓
Integration Branch
     ↓
Authorized Merge
```

## Provider separation

GitLab does not automatically become production authority merely by being connected.

GitHub remains the current canonical repository/gate plane until a deliberate authority transition is independently established.

## Required binding

A real GitLab project must be identified before provider-specific branch creation, CI configuration, or merge operations are attempted.
