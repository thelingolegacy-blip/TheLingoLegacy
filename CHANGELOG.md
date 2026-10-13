# Changelog

All notable infrastructure and delivery changes are recorded here.

## Unreleased — DevOps foundation scaffold

- Added pull-request-only validation workflow for the DevOps foundation.
- Added a non-deploying Jenkins validation pipeline.
- Added GitLab merge-request validation without deployment authority.
- Added provider-neutral Terraform validation scaffold with no cloud resources.
- Added a local-only, read-only Ansible diagnostics playbook.
- Documented Docker and Kubernetes prerequisites without inventing an application image or provisioning infrastructure.
- Preserved G02 acceptance, production, and last-known-good gates.
- Validation has not yet been executed by this commit; review and CI evidence are pending.
