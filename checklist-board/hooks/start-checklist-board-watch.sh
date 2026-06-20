#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PID_FILE="$ROOT/.cursor/.checklist-board-watch.pid"
WATCH_SCRIPT="$ROOT/.cursor/scripts/sync-checklist-board-watch.mjs"

if [[ ! -f "$ROOT/checklist.md" ]]; then
  exit 0
fi

if [[ -f "$PID_FILE" ]]; then
  OLD_PID="$(tr -d '[:space:]' < "$PID_FILE" || true)"
  if [[ -n "$OLD_PID" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
    exit 0
  fi
fi

nohup node "$WATCH_SCRIPT" >> "$ROOT/.cursor/checklist-board-watch.log" 2>&1 &
disown >/dev/null 2>&1 || true

exit 0
