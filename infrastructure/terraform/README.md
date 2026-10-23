# Terraform foundation

Status: scaffold only; no cloud resources are declared.

## Validation

Run:

```sh
terraform fmt -check -recursive
terraform init -backend=false -input=false
terraform validate
```

## Prohibited until separately authorized

- Do not run `terraform apply`.
- Do not configure production credentials in local files or CI variables for this scaffold.
- Do not create cloud resources or alter DNS, Cloudflare routes, or the existing production runtime.
- Do not initialize or migrate production state from this scaffold.

Before provider-specific work, record the provider, account/project/subscription, region, network boundary, remote state and locking design, identity permissions, cost controls, recovery plan, and approval owner. A reviewed plan is required before any apply can be considered.
