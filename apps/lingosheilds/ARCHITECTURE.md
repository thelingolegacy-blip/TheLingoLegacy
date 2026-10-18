# LINGOsheilds Architecture

## Control plane

The control plane owns identity, repository metadata, policy, agent orchestration, evidence, approvals and release state.

## Data plane

The data plane executes:
- git operations
- builds
- tests
- security scans
- CI jobs
- deployments
- artifact generation

## Adapter plane

Adapters translate provider-specific APIs into LINGOsheilds primitives:

- GitHub Adapter
- GitLab Adapter
- future Bitbucket Adapter
- future self-hosted Git Adapter

Adapters never silently elevate provider state to LINGO production authority.

## Agent plane

Agent workers are isolated by capability:

- Claude Reviewer
- Code Repair Agent
- Test Agent
- Security Agent
- Dependency Agent
- Documentation Agent
- Evidence Agent
- Integration Agent
- Release Agent

Each receives a scoped work order and returns a signed result.

## Native objects

LINGOsheilds should ultimately expose its own:
- Repository
- Branch
- Commit
- ChangeSet
- WorkItem
- Review
- Pipeline
- Artifact
- Finding
- EvidenceRecord
- Environment
- Release
- AgentRun
- Policy
- Gate

## Native workflow

```
WORK ITEM
   ↓
CHANGESET
   ↓
BRANCH
   ↓
AGENT / HUMAN WORK
   ↓
REVIEW
   ↓
PIPELINE
   ↓
SECURITY
   ↓
EVIDENCE
   ↓
ACCEPTANCE
   ↓
AUTHORIZED MERGE
   ↓
RELEASE CANDIDATE
   ↓
PROMOTION
```

## Synchronization

Two-way provider synchronization must be explicit.

No silent force-push.
No silent overwrite.
No automatic production promotion.

Conflicts become first-class LINGOsheilds work items.
