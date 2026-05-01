# Security Engineer Notes: Agentic AI (B10)
## By An Dang (R-SE) — Date: 2026-03-31

### 1. Overview

Agentic AI introduces a fundamentally new threat surface: autonomous systems that can read files, execute code, call APIs, and make decisions without human approval on every step. The Security Engineer must build defense-in-depth controls that constrain agent capabilities while preserving their usefulness. The stakes are higher than traditional applications because a compromised agent can take actions, not just leak data.

### 2. Sandboxing Agent Actions

**File System Sandboxing:**
- Agents must operate in isolated temporary directories with no access to host file systems.
- Use container-level isolation (gVisor, Firecracker) or OS-level sandboxing (seccomp, AppArmor).
- Read-only mounts for reference data; write access only to the agent's workspace.
- Workspace is destroyed after run completion.

**Network Sandboxing:**
- Default-deny network policy for all agent containers.
- Allow-list specific endpoints per tool (e.g., a search tool can reach the search API, nothing else).
- Use an egress proxy to log and filter all outbound requests.
- Block access to internal infrastructure (metadata services, databases) from agent containers.

**Code Execution Sandboxing:**
- Agent-generated code runs in a restricted runtime: no file system access beyond workspace, no network, limited libraries.
- Time limits (60s default), memory limits (512MB default), no subprocess spawning.
- Use WASM-based sandboxes (e.g., Extism) for lightweight isolation.

### 3. Permission Systems

- Implement a capability-based permission model:
  - Each agent has a set of granted capabilities: read_file, write_file, execute_code, call_api, send_email, etc.
  - Capabilities are granted per agent configuration, not per run.
  - Sensitive capabilities (send_email, modify_database, transfer_money) require human-in-the-loop approval.
- Principle of least privilege: agents start with minimal permissions, escalate only when needed and approved.
- Permission inheritance in multi-agent systems: a sub-agent cannot have more permissions than its parent.

### 4. Prompt Injection in Agent Chains

- Prompt injection is the #1 security risk for agentic AI.
- Attack vectors:
  - **Direct injection**: Malicious instructions in user input.
  - **Indirect injection**: Malicious content in tool results (e.g., a web page containing "Ignore previous instructions and...").
  - **Cross-agent injection**: In multi-agent systems, one agent's output contains instructions that hijack another agent.
- Defenses:
  - Strong delimiter separation between system prompt, user input, and tool results.
  - Input validation: scan user inputs for known injection patterns.
  - Output validation: scan tool results for instruction-like content before feeding back to the LLM.
  - Use separate LLM calls for "should I do this?" (judgment) vs "do this" (execution).
  - Monitor for behavioral anomalies: agent suddenly accessing tools it never used before.

### 5. Tool Call Validation

- Validate every tool call before execution:
  - Schema validation: parameters match the tool's JSON schema.
  - Semantic validation: parameter values are within expected ranges.
  - Authorization check: agent has permission to call this tool with these parameters.
  - Rate limiting: prevent rapid-fire tool calls that could indicate injection or loops.
- Implement a tool call firewall: a middleware layer that intercepts and validates all tool calls.
- Log denied tool calls for security review.

### 6. Preventing Agent Escalation

- Escalation: an agent gaining more capabilities than intended through clever exploitation.
- Common escalation paths:
  - Using a code execution tool to make network requests (bypassing network sandbox).
  - Crafting tool parameters that trigger unintended behavior (e.g., SQL injection via a database query tool).
  - Convincing a human-in-the-loop approver to grant excessive permissions.
- Mitigations:
  - Defense in depth: even if one layer is bypassed, the next layer catches it.
  - Tool parameter sanitization: escape special characters, validate against allow-lists.
  - Limit agent self-modification: agents cannot change their own system prompt or tool list.

### 7. Audit Logging

- Log every action an agent takes, without exception:
  - LLM calls: prompt (or hash), response, model, token count.
  - Tool calls: tool name, input, output, duration, success/failure.
  - Human approvals: who approved, what was approved, timestamp.
  - Permission changes: any escalation or de-escalation of agent capabilities.
- Logs must be tamper-proof: write to append-only storage, separate from agent-accessible systems.
- Retain audit logs for minimum 1 year (align with compliance requirements).
- Enable forensic analysis: given an incident, reconstruct the full sequence of agent actions.

### 8. Data Exfiltration Prevention

- Agents can potentially exfiltrate data through:
  - Tool outputs sent to external APIs.
  - Encoded data in seemingly innocuous outputs (steganography in generated text).
  - File uploads to external services.
- Defenses:
  - DLP (Data Loss Prevention) scanning on all agent outputs leaving the system.
  - Classify data sensitivity levels; restrict agent access to sensitive data.
  - Monitor outbound data volume per agent run; alert on anomalies.
  - Watermark sensitive data so exfiltration can be traced.

### 9. Compliance for Autonomous Systems

- Vietnam's Cybersecurity Law (2018) and Decree 13/2023 on Personal Data Protection apply to agent systems.
- Key requirements:
  - Data localization: personal data of Vietnamese citizens must be stored in Vietnam.
  - Consent: if agents process personal data, user consent must be obtained.
  - Transparency: users must know when they are interacting with an AI agent.
  - Accountability: a human must be responsible for agent actions.
- For financial agents: State Bank of Vietnam regulations on automated systems handling financial data.
- Maintain a compliance matrix mapping agent capabilities to regulatory requirements.

### Recommendations for B10

1. **Implement sandboxing before any tool execution goes live** — this is non-negotiable for production.
2. **Build the tool call firewall early** — it is your primary defense against agent misbehavior.
3. **Treat prompt injection as a top-3 risk** — invest in detection and mitigation from day one.
4. **Default to human-in-the-loop for all sensitive actions** — remove the human only after proven safety.
5. **Audit log everything** — you will need complete agent action history for incident response and compliance.
6. **Design permission systems before building agents** — retrofitting access control is extremely difficult.
