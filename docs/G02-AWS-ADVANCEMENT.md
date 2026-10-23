# G02 AWS Advancement and Acceptance

## Gate contract
G02 remains BLOCKED until independent evidence proves:
1. A real matching runner is online and polling.
2. The job has a positive runner ID and exact name `lingo-legacy-g02`.
3. Workflow steps are instantiated and the sentinel exits zero.
4. GitHub job logs are retrievable and the evidence artifact downloads.
5. Run, attempt, job, commit SHA, runner identity, and host evidence correlate.
6. An independent reviewer verifies authenticity, integrity, completeness, scope, and correlation.

## AWS preparation
- Use a dedicated EC2 instance in an existing VPC; private subnet preferred.
- Use SSM Session Manager and an instance role; no inbound SSH rule.
- Confirm outbound route or approved egress proxy/endpoints for GitHub.
- Review AMI publisher, instance type/cost, EBS size, AWS account and region.
- Review Terraform plan before applying. This starter does not auto-apply.
- Install/register the GitHub runner as a separate controlled action. Never store the short-lived registration token in Git, Terraform, user data, logs, or chat.
- Use labels: self-hosted, linux, x64, lingo-g02.

A queued job or Online/Idle runner is not proof of execution. A green Vercel check is not a substitute for GitHub job evidence.

## Merge and production
This starter does not configure branch protection and does not authorize merge, deploy, promotion, or activation. Keep production and last-known-good state protected until current-head preview, CI execution, G02 evidence, Worker/source version reconciliation, and branch protection are independently verified.
