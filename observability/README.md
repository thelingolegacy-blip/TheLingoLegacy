# Observability and code quality foundation
## Components
- Prometheus: metrics collection scaffold. Only the Prometheus self-scrape is configured until real endpoints are verified.
- Grafana: provisioned Prometheus datasource; dashboards and production targets are not yet configured.
- Elastic Stack: loopback-only development Compose scaffold and a sample Logstash pipeline. Do not treat it as production-ready.
- SonarQube: project properties are present; scans remain disabled until the server URL, project key, token handling, and test/coverage outputs are verified.
- HashiCorp: Terraform is the infrastructure-as-code foundation. Vault integration is a future secret-provider option, not enabled by this scaffold.
## ELK development guardrails
The Compose file binds exposed ports to loopback. Set required passwords through a secret manager or protected shell environment; never commit env files containing values. Before running the stack, verify host memory and disk capacity and review the selected image versions against the organization's supported patch policy. This Compose scaffold has not been executed or security-certified.
The Logstash pipeline currently writes to stdout only. It does not ship data to Elasticsearch, and no production log sources are configured. A production setup needs TLS, authenticated output, retention/index lifecycle, access control, and data minimization.
## HashiCorp Vault
Do not place secrets in config.yaml, Terraform variables committed to Git, Kubernetes manifests, CI logs, or artifacts. A future Vault integration must use workload identity or short-lived credentials, least privilege, audited secret access, and documented rotation/revocation. No Vault server or policy is created here.
