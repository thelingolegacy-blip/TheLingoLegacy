# G02 Deployment Path

This tree defines the deployment mechanics for the self-hosted G02 runner lane.

## Authority boundary

- Production authority: NONE
- Deployment promotion: BLOCKED until G02 P1-P9 are independently verified.
- Access targets are explicit allowlist entries only.
- No hosted-runner substitution is permitted.

## Path

preflight -> provision -> deploy -> verify -> evidence

Failure at any required stage stops the path.

## Authorized targets

- Kubeprod-1
- K35 cluster
- Protected homeland network
- Srv-prod-1

These names define intended targets only. Credentials, routes, firewall rules, and cluster permissions must be supplied by the authorized infrastructure administrator.

## Required runner

- name: lingo-legacy-g02
- type: self-hosted
- OS: Linux
- arch: X64
- labels: self-hosted,linux,x64,lingo-g02
