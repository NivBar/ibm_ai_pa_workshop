# Planning Analytics + AI Workshop

## What we are building

- An audience-facing, hands-on Planning Analytics workshop delivered as an interactive HTML guide.
- A Bob-first experience in which participants copy one prompt and Bob performs the work.
- A cumulative local output named `NewRetail_Planning_Performance_Dashboard.html`.
- A business-facing dashboard centered on:
  - Actual versus Plan performance.
  - Variance drivers.
  - Trends and forecast context.
  - Scenarios, risks, decisions, and recommendations.
- Expandable technical traceability covering:
  - Cubes, dimensions, members, and hierarchies.
  - Exact query coordinates and filters.
  - Rules and feeders when exposed by the connected tools.
  - TurboIntegrator processes and parameters.
  - Dependencies and impact analysis.
  - Process status, threads, logs, and server metrics.
  - Outlier analysis.
  - Fact, inference, and unknown classifications.
- An optional watsonx Orchestrate activity that performs the whole investigation independently.

## Participant experience

- Open the deployed workshop guide.
- Work primarily in IBM Bob.
- Copy one prompt from an activity.
- Paste the prompt into Bob once.
- Bob queries the live `ibm-pa-tools` MCP server.
- Bob updates the same local HTML dashboard directly.
- Do not paste Bob responses back into the guide.
- Do not maintain working notes or completion checkboxes.
- Do not create Word, PDF, PowerPoint, Markdown, or static-report substitutes.

## Chapter flow

- Stage 1 — Connect:
  - Confirm the MCP connection and NewRetail server.
  - Understand the available read-only and write-capable tool boundaries.
- Stage 2 — Understand:
  - Discover relevant cubes.
  - Inspect dimensions, hierarchies, members, versions, and measures.
  - Compare related models and AI metadata.
- Stage 3 — Trace:
  - Inspect TurboIntegrator processes.
  - Trace calculations, rules, feeders, and dependencies where evidence is available.
- Stage 4 — Analyze:
  - Establish a comparable Actual-versus-Plan baseline.
  - Decompose performance by product, organization, channel, and period.
  - Explore trends, outliers, related cubes, and directional outlooks.
- Stage 5 — Explain:
  - Reproduce an anomaly.
  - Test competing business, data, hierarchy, rule, process, and cross-cube explanations.
  - Separate observation, hypothesis, evidence, and conclusion.
- Stage 6 — Operate:
  - Inspect process definitions, status, threads, logs, and metrics.
  - Diagnose safely without executing or cancelling processes.
- Stage 7 — Assess change:
  - Evaluate dependencies and bounded impact.
  - Define tests, rollback evidence, risks, and go/no-go gates.
- Stage 8 — Document:
  - Produce durable model guidance, operating guidance, maintenance controls, and executive communication.
- Stage 9 — Assemble:
  - Refine the cumulative output into an advanced interactive Planning & Performance Dashboard.
  - Audit evidence, interaction, accessibility, responsiveness, and consistency.
- Optional wxO:
  - Run a standalone unified investigation through watsonx Orchestrate.
  - Do not assume access to Bob history or local files.

## Activity model

- Activities within a chapter are different but interchangeable.
- Participants may choose one activity when time or role focus is narrow.
- Participants may run several activities when broader evidence is useful.
- Every activity contributes evidence compatible with the next chapter.
- The chapter sequence remains meaningful even when different participants choose different activities.
- No activity depends on a hidden timestamp or fixed current period.
- Prompts require exact resolved members and explicit evidence gaps.

## Bob output contract

- Bob directly creates or updates `NewRetail_Planning_Performance_Dashboard.html`.
- Bob preserves previously verified results.
- Bob improves the visualization appropriate to each new result.
- Business outcomes stay in the foreground.
- Technical details remain available through progressive disclosure.
- The output remains one self-contained HTML file containing its CSS and JavaScript.
- Bob must not fabricate missing values, rules, dependencies, causes, or operational state.

## Optional watsonx Orchestrate contract

- The wxO prompt is intentionally standalone.
- wxO must rediscover the server, tools, model, data, dependencies, and operating evidence.
- wxO must not read or update `NewRetail_Planning_Performance_Dashboard.html`.
- wxO must not assume access to Bob conversation history.
- wxO returns a complete self-contained HTML dashboard in its response or supported artifact output.
- The optional result can be compared with the step-by-step Bob workflow.

## Safety boundary

- Workshop actions are read-only.
- The Bob MCP configuration pre-approves only the listed read-only tools.
- The workshop does not pre-approve:
  - Create, update, or delete operations.
  - Process execution or cancellation.
  - Sandbox publish or discard operations.
  - Saved-view creation or overwrite.
- Participants must stop and explain when required evidence is unavailable.
- A fluent answer is not proof.

## Bob readiness

- Required Bob version in the tested environment: `0.0.32`.
- Verify MCP connectivity:

  ```bash
  cd /Users/nivbardas/Desktop/deloitte_PA_WX
  bob mcp list
  ```

- Expected MCP status:

  ```text
  ibm-pa-tools ... Connected
  ```

- Run the Bob-only client preflight after authenticating Bob:

  ```bash
  scripts/bob_client_preflight.sh
  ```

- Expected final result:

  ```text
  PASS: Bob authenticated, PA MCP connected, NewRetail confirmed, and workshop files are ready.
  ```

- Bob authentication and PA MCP authentication are separate:
  - A connected PA MCP server does not prove Bob AI authentication.
  - W3ID or API-key authentication must succeed before Bob can answer prompts.
  - Do not commit or paste authentication secrets into the participant guide.

## Files

- `index.html` — deployed participant workshop.
- `styles.css` — workshop presentation styles.
- `app.js` — copy behavior, chapter choices, output contracts, and wxO isolation.
- `NewRetail_Planning_Performance_Dashboard.html` — local cumulative Bob output.
- `.bob/mcp.json` — Bob MCP connection and read-only `alwaysAllow` list.
- `scripts/bob_client_preflight.sh` — Bob-only readiness check.
- `scripts/smoke_test_workshop_mcp.py` — direct read-only MCP diagnostic used by facilitators.

## Deployment

- Repository: `https://github.com/NivBar/ibm_ai_pa_workshop`
- Workshop URL: `https://nivbar.github.io/ibm_ai_pa_workshop/`
- The local cumulative dashboard is generated and updated in the participant workspace by Bob.
- The deployed dashboard template is illustrative; the participant’s live evidence remains local unless they intentionally publish it.

## Validation completed

- GitHub Pages serves the workshop.
- The PA MCP endpoint connects successfully.
- NewRetail is visible through the MCP server.
- The direct read-only MCP smoke suite passes.
- The workshop renders 37 distinct activity prompts.
- Every Bob activity carries the local HTML update contract.
- The wxO activity carries a separate standalone output contract.
- No manual response-capture forms, completion widgets, or paste-back workflow are present.
- The local dashboard is self-contained and opens without external assets.

## Remaining client-readiness gate

- Bob’s AI authentication must complete successfully in the client environment.
- In the current test environment, W3ID authentication was blocked by Cloudflare even though PA MCP remained connected.
- Do not declare the Bob-only workflow ready until `scripts/bob_client_preflight.sh` passes end to end.
