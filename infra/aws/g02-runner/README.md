# LINGO G02 AWS Runner Host (review scaffold)

This Terraform scaffold describes a dedicated EC2 runner host in an existing VPC/subnet. It does NOT install/register the GitHub runner, deploy application code, or configure production credentials.

## Safety
- Private address only; no inbound security-group rules.
- IMDSv2 required, encrypted gp3 root disk, SSM instance profile.
- Existing VPC/subnet and an approved Ubuntu x86_64 AMI are inputs.
- The egress allow-list is intentionally required and has no permissive default. Configure an approved outbound proxy/firewall or explicitly reviewed destination CIDRs before planning.
- Do not use `0.0.0.0/0` for runner egress. Confirm required GitHub, package, and SSM connectivity against the selected network design.
- Never put runner registration tokens, PATs, or production secrets in Terraform or user-data.

## Validate
```sh
terraform init
terraform fmt -check
terraform validate
terraform plan -out=tfplan
```

The example variables file intentionally leaves `allowed_egress_cidrs` commented so an unreviewed global egress rule cannot be copied into a deployment. The plan should not proceed until a network owner fills this value with the approved path and reviews the resulting security-group rules.

Review the plan manually before any apply. Runner registration is a separate controlled task using GitHub's official instructions and a short-lived token. This scaffold is not approved for apply, and its presence does not authorize host provisioning, runner registration, merge, deployment, or production promotion.
