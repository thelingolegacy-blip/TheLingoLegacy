# LINGO G02 AWS Runner Host (review scaffold)

This Terraform scaffold provisions a dedicated EC2 runner host in an existing VPC/subnet. It does NOT install/register the GitHub runner, deploy application code, or configure production credentials.

## Safety
- Private address only; no inbound security-group rules.
- IMDSv2 required, encrypted gp3 root disk, SSM instance profile.
- Existing VPC/subnet and approved Ubuntu x86_64 AMI are inputs.
- Review outbound access, subnet routes, AWS account/region and cost before apply.
- The default egress CIDR is broad and must be reviewed/restricted for production.
- Never put runner registration tokens, PATs, or production secrets in Terraform or user-data.

## Validate
terraform init
terraform fmt -check
terraform validate
terraform plan -out=tfplan

Review the plan manually before any apply. Runner registration is a separate controlled task using GitHub's official instructions and a short-lived token.
