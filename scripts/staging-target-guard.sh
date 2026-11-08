#!/usr/bin/env bash
set -euo pipefail
die(){ echo "STAGING_GUARD=FAIL: $*" >&2; exit 64; }
req(){ [[ -n "${!1:-}" ]] || die "missing $1"; }
req STAGING_ENV; [[ "$STAGING_ENV" == staging ]] || die "STAGING_ENV must be staging"
req STAGING_HOST; [[ "$STAGING_HOST" =~ ^[a-z0-9-]+-(staging|stg)\.[a-z0-9.-]+$ ]] || die "invalid staging host"
for v in CF_ACCOUNT_ID STAGING_EXPECTED_CF_ACCOUNT_ID FIREBASE_SITE_NAME STAGING_EXPECTED_FIREBASE_SITE_NAME CLOUD_RUN_SERVICE STAGING_EXPECTED_CLOUD_RUN_SERVICE GCP_PROJECT_ID STAGING_EXPECTED_GCP_PROJECT_ID; do req "$v"; done
[[ "$CF_ACCOUNT_ID" == "$STAGING_EXPECTED_CF_ACCOUNT_ID" ]] || die "Cloudflare account is not the declared staging account"
[[ "$FIREBASE_SITE_NAME" == "$STAGING_EXPECTED_FIREBASE_SITE_NAME" ]] || die "Firebase site is not the declared staging site"
[[ "$CLOUD_RUN_SERVICE" == "$STAGING_EXPECTED_CLOUD_RUN_SERVICE" ]] || die "Cloud Run service is not the declared staging service"
[[ "$GCP_PROJECT_ID" == "$STAGING_EXPECTED_GCP_PROJECT_ID" ]] || die "GCP project is not the declared staging project"
[[ "$FIREBASE_SITE_NAME" =~ ^[a-z0-9-]+-(staging|stg)$ ]] || die "Firebase target naming guard failed"
[[ "$CLOUD_RUN_SERVICE" =~ ^[a-z0-9-]+-(staging|stg)$ ]] || die "Cloud Run target naming guard failed"
[[ "${STAGING_MUTATION_CONFIRM:-}" == I_UNDERSTAND_STAGING_ONLY ]] || die "explicit staging mutation confirmation required"
echo "STAGING_GUARD=PASS"
