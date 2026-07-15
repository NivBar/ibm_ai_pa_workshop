#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

: "${WXO_ENV_NAME:?Set WXO_ENV_NAME}"
: "${WXO_API_KEY:?Set WXO_API_KEY}"
: "${PA_AUTHORIZATION_HEADER:?Set PA_AUTHORIZATION_HEADER}"

PA_MCP_URL="${PA_MCP_URL:-https://eu-central-1.planninganalytics.saas.ibm.com/api/DLKN379EQ2M7/v0/agentic-ai/ibm-pa-tools/mcp}"
PA_CONNECTION_URL="${PA_CONNECTION_URL:-https://eu-central-1.planninganalytics.saas.ibm.com}"

echo "Activating wxO environment: ${WXO_ENV_NAME}"
orchestrate env activate "$WXO_ENV_NAME" --api-key "$WXO_API_KEY" --skip-version-check

echo "Creating/updating PA key-value connection"
orchestrate connections add -a pa_mcp_auth || true
orchestrate connections configure -a pa_mcp_auth --env draft --type team --kind key_value --server-url "$PA_CONNECTION_URL" || true
orchestrate connections configure -a pa_mcp_auth --env live --type team --kind key_value --server-url "$PA_CONNECTION_URL" || true
orchestrate connections set-credentials -a pa_mcp_auth --env draft -e "Authorization=${PA_AUTHORIZATION_HEADER}"
orchestrate connections set-credentials -a pa_mcp_auth --env live -e "Authorization=${PA_AUTHORIZATION_HEADER}"

echo "Importing unified Planning Analytics MCP toolkit"
orchestrate toolkits add \
  --kind mcp \
  --name ibm-pa-tools \
  --description "IBM Planning Analytics unified MCP tools for NewRetail" \
  --url "$PA_MCP_URL" \
  --transport streamable_http \
  --tools "*" \
  --app-id pa_mcp_auth

echo "Creating PA NewRetail agent"
orchestrate agents create \
  --file "$PROJECT_ROOT/agent/pa_newretail_agent.yaml"

echo "Done. Verify with:"
echo "  orchestrate toolkits list"
echo "  orchestrate agents list"
