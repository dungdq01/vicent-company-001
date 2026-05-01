# Frontend Engineer Notes: Agentic AI (B10)
## By Trang Do (R-FE) — Date: 2026-03-31

### 1. Overview

The frontend for agentic AI must go far beyond a simple chat interface. Users need to see what the agent is doing, understand its reasoning, approve or reject actions, and review historical runs. The Frontend Engineer must build an agent workbench that provides transparency, control, and usability across devices.

### 2. Agent Playground and Workbench

- The core workspace where users create, configure, test, and monitor agents.
- Key components:
  - **Agent configuration panel**: Select model, attach tools, set system prompt, configure limits (max steps, budget).
  - **Input area**: User provides task instructions. Support rich text, file uploads, and template-based inputs.
  - **Execution panel**: Real-time display of agent reasoning and actions (see Section 4).
  - **Output panel**: Final results with downloadable artifacts (files, reports, code).
- Use a split-pane layout: configuration on the left, execution in the center, output on the right.
- Support saving and loading agent configurations as templates.
- Implement a "playground mode" for experimentation and a "production mode" for monitored execution.

### 3. Workflow Visualization

- Agents follow complex execution paths that are hard to understand from text alone.
- Implement graph-based visualization:
  - Nodes represent agent steps: LLM call, tool call, human approval, branching decision.
  - Edges show flow and data dependencies between steps.
  - Color-code by status: green (completed), blue (in progress), yellow (waiting), red (failed).
- Use React Flow or D3.js for interactive graph rendering.
- Support zoom, pan, and click-to-inspect on any node.
- For multi-agent systems, show agent-to-agent communication as cross-lane flows (swim lane diagram).
- Collapse completed sub-tasks to reduce visual clutter.

### 4. Human-in-the-Loop Approval UI

- Critical for production agents: some actions require human approval before execution.
- Approval UI requirements:
  - Clear display of what the agent wants to do: tool name, parameters, expected effect.
  - Context: why the agent chose this action (show reasoning).
  - Options: Approve, Reject, Modify (edit parameters before approving).
  - Timeout handling: if human does not respond within X minutes, auto-reject or auto-approve based on policy.
- Implement approval queues: dashboard showing all pending approvals across agents.
- Push notifications (browser, email, Slack) for time-sensitive approvals.
- Audit trail: record who approved what and when.

### 5. Real-Time Agent Progress Streaming

- Users must see agent activity as it happens, not just the final result.
- Use Server-Sent Events (SSE) or WebSocket for real-time streaming.
- Stream these events:
  - `thinking`: Agent's internal reasoning (show as collapsible thought bubbles).
  - `tool_call`: Tool being invoked with parameters.
  - `tool_result`: Tool output (format based on type: table for data, code block for code, image for visuals).
  - `error`: Errors with context.
  - `approval_needed`: Trigger the HITL UI.
  - `completed`: Final result with summary.
- Implement progressive rendering: show partial results as they arrive.
- Show a timeline/progress bar with estimated completion when possible.

### 6. Tool Call Visualization

- Each tool call should be displayed as an expandable card showing:
  - Tool name and icon.
  - Input parameters (formatted JSON or key-value pairs).
  - Execution duration and status.
  - Output (truncated with "show more" for large outputs).
  - Token cost for the LLM call that generated this tool call.
- For code execution tools: show syntax-highlighted code and output.
- For search tools: show query and results in a structured format.
- For API tools: show request and response (sanitize credentials).

### 7. Agent History and Replay

- Users need to review past agent runs for debugging, auditing, and learning.
- History view: searchable and filterable list of past runs with key metrics (status, duration, cost, steps).
- Replay mode: step through a past run one action at a time, like a debugger.
  - Show the agent's state at each step: conversation history, plan, available information.
  - Allow "what-if" branching: resume from a historical step with different inputs.
- Compare mode: side-by-side comparison of two runs for the same task (e.g., before/after prompt change).
- Export runs as shareable reports (PDF or HTML).

### 8. Mobile-Responsive Agent Dashboard

- Not all agent interactions happen at a desktop. Build for mobile-first monitoring.
- Mobile priorities:
  - View agent run status and key metrics.
  - Receive and act on approval requests.
  - View final results and artifacts.
  - Start new runs from templates.
- De-prioritize for mobile: full workflow graph, detailed replay, configuration editing.
- Use responsive design (Tailwind CSS) with breakpoints at 640px, 768px, 1024px.
- Consider a PWA for push notifications on mobile.

### 9. Technology Stack

- **Framework**: Next.js 14+ (App Router) with React Server Components.
- **State management**: Zustand or Jotai for agent execution state.
- **Real-time**: Native EventSource API for SSE; Socket.io for WebSocket fallback.
- **Graph visualization**: React Flow for workflow graphs.
- **UI components**: shadcn/ui + Tailwind CSS for consistent design.
- **Code display**: Monaco Editor or CodeMirror for code blocks.

### 10. Accessibility and Internationalization

- Full Vietnamese language support in the UI (i18n with next-intl).
- Screen reader support for agent status updates (ARIA live regions).
- Keyboard navigation for approval workflows.

### Recommendations for B10

1. **Build the streaming execution panel first** — it is the core user experience for agentic AI.
2. **Implement HITL approval UI early** — production deployment requires human oversight.
3. **Use React Flow for workflow visualization** — it handles interactive graphs well and is actively maintained.
4. **Design for progressive disclosure** — show summary by default, details on demand. Agents produce a lot of information.
5. **Make history and replay a priority** — debugging agents is impossible without it.
6. **Test on mobile for approval workflows** — approvers are often away from their desks.
