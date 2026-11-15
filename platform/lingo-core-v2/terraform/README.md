# Infrastructure as Code boundary

Terraform/OpenTofu resources are intentionally not provisioned in this implementation slice.

Before creating any cloud resources, obtain explicit approval for:
- AWS account and target region.
- Monthly budget and resource quotas.
- Remote state bucket, encryption key, locking, access policy, and recovery.
- Network CIDRs and private/public subnet design.
- IAM role boundaries and GitHub OIDC trust subjects.
- Log retention, backup retention, RPO/RTO, and recovery region.

Required workflow separation:
1. fmt / validate / static security checks — no credentials.
2. plan — read-only cloud role and artifact retention.
3. apply — separate protected environment, human approval, least-privilege role.
4. destroy — separately protected and disabled by default.

Never store Terraform state or plan files in the repository. Never commit credentials. Never run apply or destroy from an untrusted pull request.
