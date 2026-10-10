#!/usr/bin/env bash
# Shared validator for G02_HOST_TELEMETRY_SCHEMA=1 reports.
# Usage: source this file; validate_telemetry_schema <report-file>
set -euo pipefail

_validate_exactly_one_nonempty_field() {
  local report="$1"
  local key="$2"
  awk -F= -v key="$key" '
    $1 == key {
      count++
      value = substr($0, index($0, "=") + 1)
      if (value == "") bad = 1
    }
    END { exit !(count == 1 && !bad) }
  ' "$report"
}

validate_telemetry_schema() {
  local report="${1:-}"
  local schema timestamp hostname normalized

  [[ -n "$report" && -f "$report" && -s "$report" ]] || return 1
  _validate_exactly_one_nonempty_field "$report" "G02_HOST_TELEMETRY_SCHEMA" || return 1
  _validate_exactly_one_nonempty_field "$report" "CAPTURED_AT_UTC" || return 1
  _validate_exactly_one_nonempty_field "$report" "HOSTNAME" || return 1

  schema="$(awk -F= '$1 == "G02_HOST_TELEMETRY_SCHEMA" {print substr($0, index($0, "=") + 1)}' "$report")"
  [[ "$schema" == "1" ]] || return 1

  timestamp="$(awk -F= '$1 == "CAPTURED_AT_UTC" {print substr($0, index($0, "=") + 1)}' "$report")"
  [[ "$timestamp" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$ ]] || return 1
  normalized="$(date -u -d "$timestamp" +%FT%TZ 2>/dev/null)" || return 1
  [[ "$normalized" == "$timestamp" ]] || return 1

  hostname="$(awk -F= '$1 == "HOSTNAME" {print substr($0, index($0, "=") + 1)}' "$report")"
  [[ -n "$hostname" && "$hostname" != *[[:space:]]* ]] || return 1
}
