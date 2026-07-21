#!/usr/bin/env python3
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MCP_CONFIG = ROOT / ".bob" / "mcp.json"


class McpClient:
    def __init__(self, name, config):
        self.name = name
        self.url = config["url"]
        self.headers = dict(config.get("headers", {}))
        self.session_id = None
        self.request_id = 1

    def request(self, method, params=None):
        payload = {
            "jsonrpc": "2.0",
            "id": self.request_id,
            "method": method,
        }
        self.request_id += 1
        if params is not None:
            payload["params"] = params

        body = json.dumps(payload).encode("utf-8")
        headers = {
            **self.headers,
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "Content-Length": str(len(body)),
            "User-Agent": "python-httpx/0.27.0",
        }
        if self.session_id:
            headers["mcp-session-id"] = self.session_id

        req = urllib.request.Request(self.url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=120) as response:
                if response.headers.get("mcp-session-id"):
                    self.session_id = response.headers["mcp-session-id"]
                raw = response.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"HTTP {exc.code}: {detail[:500]}") from exc

        if response.headers.get("Content-Type", "").startswith("text/event-stream"):
            chunks = []
            for line in raw.splitlines():
                if line.startswith("data:"):
                    chunks.append(line[5:].strip())
            raw = "\n".join(chunks)

        last = None
        for item in raw.splitlines() or [raw]:
            if item.strip():
                last = json.loads(item)
        if not last:
            raise RuntimeError("Empty MCP response")
        if "error" in last:
            raise RuntimeError(json.dumps(last["error"])[:500])
        return last.get("result")

    def initialize(self):
        return self.request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "workshop-smoke-test", "version": "0.1.0"},
            },
        )

    def tools(self):
        result = self.request("tools/list")
        return result.get("tools", [])

    def call_tool(self, name, arguments):
        return self.request(
            "tools/call",
            {
                "name": name,
                "arguments": arguments,
            },
        )


def load_clients():
    config = json.loads(MCP_CONFIG.read_text())
    return {
        name: McpClient(name, cfg)
        for name, cfg in config.get("mcpServers", {}).items()
        if not cfg.get("disabled")
    }


def summarize_result(result):
    text = json.dumps(result, ensure_ascii=False)
    text = text.replace("\\n", " ")
    return text[:300] + ("..." if len(text) > 300 else "")


def assert_no_tool_error(result):
    for item in result.get("content", []) if isinstance(result, dict) else []:
        if item.get("type") == "text" and item.get("text", "").lstrip().startswith("Error executing tool"):
            raise RuntimeError(item["text"])


def pick_tool(tools, *names):
    available = {tool["name"]: tool for tool in tools}
    for name in names:
        if name in available:
            return name
    return None


def main():
    clients = load_clients()
    if not clients:
        raise SystemExit("No enabled MCP servers in .bob/mcp.json")

    name, pa = next(iter(clients.items()))
    print(f"Initializing Planning Analytics MCP server: {name}")
    pa.initialize()
    tools = pa.tools()
    tool_names = sorted(tool["name"] for tool in tools)
    print(f"Tools available: {len(tool_names)}")
    print(", ".join(tool_names))

    if "--schemas" in sys.argv:
        wanted = {
            "get_cube_dimensions_with_metadata",
            "get_cube_sample_members",
            "lookup_potential_members",
            "get_MDX_for_recommended_view",
            "get_tm1_process_details",
            "save_mdx_view",
            "get_tm1_metrics",
            "get_tm1_server_process_status",
            "get_tm1_server_process_threads",
            "get_tm1_server_process_execution_error_logs",
            "get_outlier_summary",
            "perform_outlier_detection",
            "get_impact_analysis_summary",
            "perform_impact_analysis",
        }
        for tool in tools:
            if tool["name"] in wanted:
                print(f"\nSCHEMA: {tool['name']}")
                print(json.dumps(tool.get("inputSchema", {}), indent=2))
        return 0

    tests = []

    tests.append(("available servers", "get_available_tm1_servers", {}))

    for name in ("get_tm1_cubes", "list_server_cubes_with_metadata"):
        if name in tool_names:
            tests.append(("NewRetail cubes", name, {"server": "NewRetail"}))
            break

    for name in ("list_cubes_with_ai_analysis_metadata",):
        if name in tool_names:
            tests.append(("AI-analyzed cubes", name, {"server": "NewRetail"}))

    for name in ("get_cube_dimensions_with_metadata", "get_cube_dimensions"):
        if name in tool_names:
            tests.append(("Revenue dimensions", name, {"server": "NewRetail", "cube": "Revenue"}))
            break

    if "get_cube_sample_members" in tool_names:
        tests.append(("Revenue sample members", "get_cube_sample_members", {"server": "NewRetail", "cube": "Revenue"}))

    if "lookup_potential_members" in tool_names:
        tests.append(("Product lookup", "lookup_potential_members", {"server": "NewRetail", "cube": "Revenue", "search_term": "5G", "dimension": "product"}))

    if "get_cubes_that_may_answer_query" in tool_names:
        tests.append(("Cube selection", "get_cubes_that_may_answer_query", {"server": "NewRetail", "query": "Q4 2023 revenue budget actual by region channel product"}))

    nl_tool = pick_tool(tools, "get_data_from_data_explorer")
    if nl_tool:
        for label, query in [
            ("Q4 revenue baseline", "Using the Revenue cube on NewRetail, show total Q4 2023 revenue. Include Actual and Budget if available."),
            ("Regional variance", "Show Q4 2023 revenue by region with Actual, Budget, variance dollars, and variance percent."),
            ("Channel mix", "Show Q4 2023 Actual revenue by channel and calculate each channel's share of total Q4 revenue."),
            ("Product performance", "Show Q4 2023 Actual revenue by product category. Rank the categories from highest to lowest revenue."),
            ("Monthly trend", "Show monthly Actual revenue for 2023 from the Revenue cube. Include month-over-month growth rates."),
            ("YoY comparison", "Compare Q4 2023 Actual revenue to Q4 2022 Actual revenue. Show total growth in dollars and percent."),
        ]:
            tests.append((label, nl_tool, {"server": "NewRetail", "query": query}))

    mdx_tool = pick_tool(tools, "get_MDX_for_recommended_view", "get_mdx_for_recommended_view")
    if mdx_tool:
        tests.append(("Reusable view MDX", mdx_tool, {"server": "NewRetail", "cube": "Revenue", "query": "Show Q4 2023 revenue by region with Actual and Budget versions"}))

    failures = []
    for label, tool, args in tests:
        print(f"\\nTEST: {label} -> {tool}")
        try:
            result = pa.call_tool(tool, args)
            assert_no_tool_error(result)
            print("PASS", summarize_result(result))
        except Exception as exc:
            failures.append((label, tool, str(exc)))
            print("FAIL", str(exc)[:500])

    if "get_tm1_process_details" in tool_names:
        print("\\nTEST: process details listing -> get_tm1_process_details")
        try:
            result = pa.call_tool("get_tm1_process_details", {"server": "NewRetail", "process_name": "Add_Product"})
            assert_no_tool_error(result)
            print("PASS", summarize_result(result))
        except Exception as exc:
            failures.append(("process details listing", "get_tm1_process_details", str(exc)))
            print("FAIL", str(exc)[:500])

    print("\\nSUMMARY")
    print(f"Tests run: {len(tests) + (1 if 'get_tm1_process_details' in tool_names else 0)}")
    print(f"Failures: {len(failures)}")
    for label, tool, error in failures:
        print(f"- {label} ({tool}): {error[:250]}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
