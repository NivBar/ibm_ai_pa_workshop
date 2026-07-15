#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups/wxo-adk-only-20260715"

test -d "$BACKUP_DIR" || {
  echo "Backup directory not found: $BACKUP_DIR" >&2
  exit 1
}

cp "$BACKUP_DIR/pa_newretail_agent.yaml.bak" "$PROJECT_ROOT/agent/pa_newretail_agent.yaml"
cp "$BACKUP_DIR/import_pa_wxo.sh.bak" "$PROJECT_ROOT/scripts/import_pa_wxo.sh"
cp "$BACKUP_DIR/README_WXO_DEPLOYMENT.md.bak" "$PROJECT_ROOT/README_WXO_DEPLOYMENT.md"
cp "$BACKUP_DIR/WORKSHOP_OPTIONAL_MCP_WXO_SETUP.md.bak" "$PROJECT_ROOT/WORKSHOP_OPTIONAL_MCP_WXO_SETUP.md"

rm -f "$PROJECT_ROOT/wxo/ibm_pa_tools_toolkit.yaml"

echo "Restored wxO deployment files from $BACKUP_DIR"
