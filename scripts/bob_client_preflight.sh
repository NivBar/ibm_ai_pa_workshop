#!/bin/zsh
set -eu

SCRIPT_DIR=${0:A:h}
WORKSHOP_DIR=${SCRIPT_DIR:h}
cd "$WORKSHOP_DIR"

echo "Bob version: $(bob --version)"
echo "Checking Planning Analytics MCP connection..."
MCP_STATUS=$(bob mcp list 2>&1)
echo "$MCP_STATUS"
echo "$MCP_STATUS" | grep -q "ibm-pa-tools.*Connected" || {
  echo "FAIL: ibm-pa-tools is not connected. Check network access and .bob/mcp.json."
  exit 1
}

test -r index.html || { echo "FAIL: index.html is not readable"; exit 1; }
test -w NewRetail_Planning_Performance_Dashboard.html || {
  echo "FAIL: NewRetail_Planning_Performance_Dashboard.html is not writable"
  exit 1
}

echo "Running Bob canary through ibm-pa-tools..."
CANARY=$(bob --output-format text --approval-mode auto_edit \
  "Use only the configured ibm-pa-tools MCP server. Call the available-server tool, confirm whether NewRetail is present, name the tool used, and do not edit any file.")
echo "$CANARY"
echo "$CANARY" | grep -qi "NewRetail" || {
  echo "FAIL: Bob answered without confirming NewRetail. Authenticate Bob and rerun."
  exit 1
}

echo "PASS: Bob authenticated, PA MCP connected, NewRetail confirmed, and workshop files are ready."
