# LINGO Forge — private Git service bootstrap

Phase 1 adds a self-hosted Gitea service to the local VSM Docker Compose stack. It is an independent Git server, not yet a drop-in GitHub/GitLab API replacement and not yet the authoritative remote for the existing project.

- Local UI: http://127.0.0.1:3000
- SSH: 127.0.0.1:2222
- Data: named Docker volume `lingo-forge-data`
- Registration: disabled by default
- Sign-in required to view repositories
- Default repositories private
- No public ingress or production DNS changes

Complete Gitea's first-run installation locally, create the initial administrator, and preserve its admin credentials in your own password manager. Do not reuse the VSM owner token. Configure an owner-controlled private repository before adding any remotes.

LINGO ID integration is staged: the VSM now issues a local Ed25519 owner identity and stamps its local principal ID into release evidence. Forge SSO, commit signing enforcement, and API-compatible mirroring are later integration work; do not represent them as complete.
