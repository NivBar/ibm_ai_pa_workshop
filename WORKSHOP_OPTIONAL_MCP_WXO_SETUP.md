# Optional Workshop Step: Connect Planning Analytics MCP to wxO With ADK

Use this when a participant starts with a blank workspace and wants to recreate
the wxO appendix setup from scratch. This path uses the hosted unified Planning
Analytics MCP endpoint directly. No Python wrapper or local MCP server is
needed.

## 1. Create the folder structure

```bash
mkdir -p wxo agent scripts
```

Expected structure after creating the files:

```text
.
├── .env.example
├── README_WXO_DEPLOYMENT.md
├── agent
│   └── pa_newretail_agent.yaml
├── scripts
│   └── import_pa_wxo.sh
└── wxo
    └── ibm_pa_tools_toolkit.yaml
```

## 2. Create `wxo/ibm_pa_tools_toolkit.yaml`

```yaml
name: ibm-pa-tools
description: IBM Planning Analytics unified MCP tools for NewRetail.
kind: mcp
transport: streamable_http
url: "https://eu-central-1.planninganalytics.saas.ibm.com/api/DLKN379EQ2M7/v0/agentic-ai/ibm-pa-tools/mcp"
tools:
  - "*"
```

## 3. Create `agent/pa_newretail_agent.yaml`

```yaml
name: pa_newretail_agent
description: |
  Agent for exploring IBM Planning Analytics data in the NewRetail TM1 server.

instructions: |
  You help users inspect IBM Planning Analytics content in the NewRetail TM1 server.

  Use the available tools to:
  - list the available TM1 server
  - list cubes and cube metadata
  - generate a useful starter MDX query for a requested cube
  - inspect TM1 process metadata

  When answering, be clear about which server, cube, or process was used.
  Do not invent cube names, process names, dimensions, or metadata. If a user
  asks for something ambiguous, first list the relevant available objects and
  then continue from the user's selection.

llm: groq/openai/gpt-oss-120b
style: default

tools:
  - ibm-pa-tools:get_available_tm1_servers
  - ibm-pa-tools:list_server_cubes_with_metadata
  - ibm-pa-tools:get_mdx_for_recommended_view
  - ibm-pa-tools:get_tm1_process_details

config:
  hidden: false
  enable_cot: false

tags:
  - planning-analytics
  - tm1
  - mcp
  - newretail
```

## 4. Create `scripts/import_pa_wxo.sh`

```bash
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
```

Make it executable:

```bash
chmod +x scripts/import_pa_wxo.sh
```

## 5. Create `.env.example`

```bash
# wxO target
WXO_ENV_NAME=replace-with-their-wxo-env-name
WXO_API_KEY=replace-with-their-wxo-api-key

# Planning Analytics auth
# Use the full header value, for example:
# PA_AUTHORIZATION_HEADER="Basic base64-of-apikey-colon-api-key"
PA_AUTHORIZATION_HEADER=replace-with-basic-auth-header

# Planning Analytics hosted MCP defaults
PA_TENANT_ID=DLKN379EQ2M7
PA_SERVER=NewRetail
PA_CONNECTION_URL=https://eu-central-1.planninganalytics.saas.ibm.com
PA_MCP_URL=https://eu-central-1.planninganalytics.saas.ibm.com/api/DLKN379EQ2M7/v0/agentic-ai/ibm-pa-tools/mcp
```

## 6. Create `README_WXO_DEPLOYMENT.md`

```markdown
# Deloitte PA wxO Project

This folder contains the working watsonx Orchestrate deployment assets for the
Planning Analytics NewRetail MCP connection.

## Important Files

- `wxo/ibm_pa_tools_toolkit.yaml` - reference toolkit YAML for the hosted unified Planning Analytics MCP endpoint.
- `agent/pa_newretail_agent.yaml` - agent definition for the PA NewRetail assistant.
- `scripts/import_pa_wxo.sh` - repeatable ADK import script for the connection, hosted MCP toolkit, and agent.
- `.env.example` - template for local environment variables. Copy it to `.env` and fill values locally.

## What This Deploys

The deployment creates a key-value connection named `pa_mcp_auth`, imports one
hosted MCP toolkit named `ibm-pa-tools`, and creates an agent named
`pa_newretail_agent`.

The agent currently references:

- `get_available_tm1_servers`
- `list_server_cubes_with_metadata`
- `get_mdx_for_recommended_view`
- `get_tm1_process_details`

## Basic Flow

1. Verify your wxO ADK CLI is installed and logged in.
2. Copy `.env.example` to `.env`.
3. Fill in non-placeholder values in `.env`.
4. Source `.env`.
5. Run `scripts/import_pa_wxo.sh`.
6. Verify with `orchestrate toolkits list` and `orchestrate agents list`.

Do not commit or share `.env`, API keys, private keys, or generated credential exports.
```

## 7. Run the setup

```bash
cp .env.example .env
```

Edit `.env`, then load it:

```bash
source .env
```

Import into the wxO environment:

```bash
bash scripts/import_pa_wxo.sh
```

Verify:

```bash
orchestrate toolkits list
orchestrate agents list
```

Test prompt:

```text
List the available TM1 server and show me the cubes.
```

## Rollback

This repository keeps rollback copies for the previous wrapper-based setup in:

```text
backups/wxo-adk-only-20260715/
```
