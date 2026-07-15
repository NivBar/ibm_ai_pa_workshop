# Deloitte PA wxO Project

This folder contains the working watsonx Orchestrate deployment assets for the Planning Analytics NewRetail MCP connection.

## Important Files

- `wxo/ibm_pa_tools_toolkit.yaml` - reference toolkit YAML for the hosted unified Planning Analytics MCP endpoint.
- `agent/pa_newretail_agent.yaml` - agent definition for the PA NewRetail assistant.
- `scripts/import_pa_wxo.sh` - repeatable ADK import script for the connection, hosted MCP toolkit, and agent.
- `.env.example` - template for local environment variables. Copy it to `.env` and fill values locally.

## What This Deploys

The deployment creates a key-value connection named `pa_mcp_auth`, imports one hosted MCP toolkit named `ibm-pa-tools`, and creates an agent named `pa_newretail_agent`.

The unified toolkit imports all available Planning Analytics MCP tools from:

`https://eu-central-1.planninganalytics.saas.ibm.com/api/DLKN379EQ2M7/v0/agentic-ai/ibm-pa-tools/mcp`

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

## Rollback

Rollback copies for the pre-ADK-only version are stored in `backups/wxo-adk-only-20260715/`.
