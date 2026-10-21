# HashiCorp Vault integration contract
Status: design only; no Vault endpoint, authentication method, policy, or secret has been configured.
## Requirements
- Prefer workload identity or short-lived credentials over static tokens.
- Scope policies to the minimum paths and operations required.
- Separate read-only validation identities from deployment identities.
- Enable audit logging, credential rotation, and revocation procedures.
- Never print secret values or put them into artifacts, Terraform state outputs, caches, or committed YAML.
- Use separate identities and policies for development, staging, and production.
- Require an explicit review before connecting Vault to Jenkins, GitHub Actions, GitLab, CircleCI, or Kubernetes.
The project does not yet have a selected Vault endpoint or approved authentication method. Do not configure placeholder secrets or claim the integration is operational.
