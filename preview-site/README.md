# Isolated website preview root

This directory retains an alternate static website preview entrypoint. The connected Cloudflare Pages project currently builds from the repository root and invokes `scripts/cloudflare-pages-preview-build.sh`, which delegates to the curated `scripts/build-website-preview.sh` and writes the allowlisted artifact to `build/web/`.

The publication script copies only explicitly listed public files and directories. Internal admin, economy, integration-configuration, identity implementation, backend, workflow, infrastructure, test and secret-bearing paths are excluded or rejected. This preview remains non-production; access protection must be independently verified and must not be assumed from this README.
