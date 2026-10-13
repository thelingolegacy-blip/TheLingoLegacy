#!/usr/bin/env bash
# Shared line-oriented sanitizer for telemetry streams.
# Usage: source this file; sanitize_telemetry < input.txt > sanitized.txt
# Preserves ordinary telemetry while redacting common credential forms.
sanitize_telemetry() {
  sed -E \
    -e 's/(Authorization:[[:space:]]*Bearer[[:space:]]+)[^[:space:]]+/\1[REDACTED]/Ig' \
    -e 's/([[:alnum:]_]*SECRET_ACCESS_KEY[[:space:]]*=[[:space:]]*)[^[:space:]]+/\1[REDACTED]/Ig' \
    -e 's/((gh[pousr]_|github_pat_)[A-Za-z0-9_]{8,})/[REDACTED_GITHUB_TOKEN]/g' \
    -e 's/(--token[=[:space:]]+)[^[:space:]]+/\1[REDACTED]/g' \
    -e 's/(RUNNER_TOKEN=)[^[:space:]]+/\1[REDACTED]/g'
}
