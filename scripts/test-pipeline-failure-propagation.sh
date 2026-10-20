#!/usr/bin/env bash
set -euo pipefail

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

set +e
bash -o pipefail -c 'printf "intentional validator failure\\n" >&2; exit 23' 2>&1 | tee "$tmp_dir/validator.log"
status=$?
set -e

if [[ "$status" -eq 0 ]]; then
  echo "FAIL: a nonzero validator exit was swallowed by tee" >&2
  exit 1
fi

if [[ "$status" -ne 23 ]]; then
  echo "FAIL: expected validator exit 23 to propagate, received $status" >&2
  exit 1
fi

if ! grep -q "intentional validator failure" "$tmp_dir/validator.log"; then
  echo "FAIL: validator output was not retained in the evidence log" >&2
  exit 1
fi

echo "PASS: nonzero validator exit propagates through tee and output is retained"
