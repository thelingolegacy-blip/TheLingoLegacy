#!/bin/sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$ROOT"
[ -f .env ] || { echo "Create vsm/.env before using backup/restore."; exit 2; }
BACKUP_ROOT="${VSM_BACKUP_DIR:-$HOME/.local/share/lingo-vsm/backups}"
ACTION="${1:-help}"
BACKUP_ID="${2:-}"
VOLUMES="lingo-vsm-data lingo-forge-data lingo-forge-config"

need_docker() {
  command -v docker >/dev/null 2>&1 || { echo "Docker CLI is required."; exit 2; }
  docker compose version >/dev/null 2>&1 || { echo "Docker Compose v2 is required."; exit 2; }
  docker info >/dev/null 2>&1 || { echo "Docker daemon is unavailable."; exit 2; }
}
safe_id() {
  case "$BACKUP_ID" in ""|"."|".."|*[!A-Za-z0-9._-]*) echo "Invalid backup ID."; exit 2 ;; esac
}
service_was_running() {
  docker compose -f docker-compose.yml ps --status running -q "$1" 2>/dev/null | grep -q .
}
STOPPED=0
VSM_WAS_RUNNING=0
FORGE_WAS_RUNNING=0
restart_services() {
  if [ "$STOPPED" -eq 1 ]; then
    [ "$VSM_WAS_RUNNING" = "1" ] && docker compose -f "$ROOT/docker-compose.yml" start vsm-control >/dev/null || true
    [ "$FORGE_WAS_RUNNING" = "1" ] && docker compose -f "$ROOT/docker-compose.yml" start lingo-forge >/dev/null || true
  fi
}
stop_services() {
  service_was_running vsm-control && VSM_WAS_RUNNING=1 || true
  service_was_running lingo-forge && FORGE_WAS_RUNNING=1 || true
  STOPPED=1
  docker compose -f "$ROOT/docker-compose.yml" stop vsm-control lingo-forge >/dev/null
}
case "$ACTION" in
  backup)
    need_docker
    mkdir -p "$BACKUP_ROOT"
    chmod 700 "$BACKUP_ROOT"
    BACKUP_ROOT="$(CDPATH= cd -- "$BACKUP_ROOT" && pwd)"
    BACKUP_ID="$(date -u +%Y%m%dT%H%M%SZ)"
    DEST="$BACKUP_ROOT/$BACKUP_ID"
    mkdir -m 700 "$DEST"
    trap restart_services EXIT INT TERM
    stop_services
    for volume in $VOLUMES; do
      docker volume inspect "$volume" >/dev/null 2>&1 || { echo "Required volume is missing: $volume"; exit 2; }
      archive="$volume.tar.gz"
      docker run --rm -v "$volume:/data:ro" -v "$DEST:/backup" alpine:3.20 sh -c "tar -czf '/backup/$archive' -C /data ."
    done
    docker run --rm -v "$DEST:/backup" alpine:3.20 sh -c "cd /backup && sha256sum *.tar.gz > SHA256SUMS && sha256sum -c SHA256SUMS && for archive in *.tar.gz; do tar -tzf \"$archive\" >/dev/null; done"
    printf 'backup_format=1\nbackup_id=%s\ncreated_at=%s\nvolumes=%s\nchecksum=SHA256\nencrypted=false\n' "$BACKUP_ID" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$VOLUMES" > "$DEST/MANIFEST"
    chmod 600 "$DEST"/*
    restart_services
    STOPPED=0
    echo "VSM_BACKUP=PASS"
    echo "BACKUP_ID=$BACKUP_ID"
    echo "BACKUP_PATH=$DEST"
    echo "Sensitive backup files use owner-only permissions."
    ;;
  restore)
    need_docker
    [ "${ALLOW_DESTRUCTIVE:-false}" = "true" ] || { echo "Restore is destructive. Set ALLOW_DESTRUCTIVE=true and retry."; exit 2; }
    safe_id
    BACKUP_ROOT="$(CDPATH= cd -- "$BACKUP_ROOT" && pwd)"
    [ -d "$BACKUP_ROOT/$BACKUP_ID" ] || { echo "Backup ID not found."; exit 2; }
    [ -f "$BACKUP_ROOT/$BACKUP_ID/MANIFEST" ] && [ -f "$BACKUP_ROOT/$BACKUP_ID/SHA256SUMS" ] || { echo "Backup manifest/checksum file missing."; exit 2; }
    docker run --rm -v "$BACKUP_ROOT/$BACKUP_ID:/backup:ro" alpine:3.20 sh -c "cd /backup && sha256sum -c SHA256SUMS"
    for volume in $VOLUMES; do
      [ -s "$BACKUP_ROOT/$BACKUP_ID/$volume.tar.gz" ] || { echo "Backup archive missing: $volume"; exit 2; }
      docker run --rm -v "$BACKUP_ROOT/$BACKUP_ID:/backup:ro" alpine:3.20 sh -c "tar -tzf '/backup/$volume.tar.gz' >/dev/null"
    done
    trap restart_services EXIT INT TERM
    stop_services
    for volume in $VOLUMES; do
      archive="$volume.tar.gz"
      docker run --rm -v "$volume:/data" -v "$BACKUP_ROOT/$BACKUP_ID:/backup:ro" alpine:3.20 sh -c "find /data -mindepth 1 -maxdepth 1 -exec rm -rf {} \\; && tar -xzf '/backup/$archive' -C /data"
    done
    restart_services
    STOPPED=0
    echo "VSM_RESTORE=PASS"
    echo "RESTORED_BACKUP_ID=$BACKUP_ID"
    ;;
  *)
    echo "Usage: sh vsm/backup.sh {backup|restore BACKUP_ID}"
    exit 2
    ;;
esac
