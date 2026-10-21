# Changelog

All notable infrastructure and delivery changes are recorded here.

## Unreleased — Observability and smart-cache scaffold

- Added central config.yaml integration policy with production mutation disabled by default.
- Added CircleCI validation-only configuration.
- Added Prometheus self-scrape and Grafana Prometheus datasource provisioning.
- Added a loopback-only Elastic Stack development Compose scaffold and sample Logstash pipeline.
- Added SonarQube project properties without enabling a scan or storing credentials.
- Documented the future HashiCorp Vault secret-management contract.
- Added smart-cache policy with cache activation disabled pending benchmarks and trust-boundary review.
- Extended GitHub Actions, Jenkins, and GitLab validation definitions to cover the new YAML configuration.
- No observability stack was started, no secrets were configured, no cache was activated, and no production change was performed.

## Earlier — DevOps foundation scaffold

- Added pull-request-only validation workflow for the DevOps foundation.
- Added a non-deploying Jenkins validation pipeline.
- Added GitLab merge-request validation without deployment authority.
- Added provider-neutral Terraform validation scaffold with no cloud resources.
- Added a local-only, read-only Ansible diagnostics playbook.
- Documented Docker and Kubernetes prerequisites without inventing an application image or provisioning infrastructure.
- Preserved G02 acceptance, production, and last-known-good gates.
- Validation has not yet been executed by this commit; review and CI evidence are pending.
