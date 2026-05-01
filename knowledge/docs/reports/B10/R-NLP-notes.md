# NLP Engineer Notes: Agentic AI (B10)
## By Hoa Pham (R-NLP) — Date: 2026-03-31

### 1. Overview

In agentic AI, the NLP Engineer is responsible for the language layer that sits between human intent and machine action. This includes crafting agent system prompts, designing structured output schemas for tool calls, managing context across long multi-step sessions, supporting Vietnamese language, and building robust error recovery patterns.

### 2. Prompt Engineering for Agent Instructions

**System Prompt Architecture:**
- Agent system prompts have a distinct structure: identity, capabilities, available tools, constraints, output format, and behavioral guidelines.
- Use a modular prompt template system: base prompt + tool descriptions + domain context + safety rules.
- Keep tool descriptions concise but unambiguous — the model must know when and how to use each tool.

**Key Principles:**
- Be explicit about the agent's decision-making process: "Think step by step. First analyze the request, then select appropriate tools, then execute."
- Define failure modes: "If a tool returns an error, retry once with corrected parameters. If it fails again, report the error to the user."
- Specify output expectations: "Always provide a final answer after completing tool calls. Do not end with a tool call."
- Use role-based framing: "You are a data analysis agent specialized in financial reports."

**Prompt Versioning:**
- Treat prompts as code: version control, code review, A/B testing.
- Track prompt-to-performance correlation: which prompt versions produce better task completion.

### 3. Structured Output for Tool Calls

**JSON Schema Enforcement:**
- Define strict JSON schemas for every tool's input and output.
- Use constrained decoding (e.g., Outlines, Instructor, OpenAI structured outputs) to guarantee valid JSON.
- Schema design: include required fields, types, enums for categorical inputs, and descriptions.

**Function Calling Patterns:**
- Single tool call: agent calls one tool and uses the result.
- Parallel tool calls: agent requests multiple independent tools simultaneously.
- Sequential chains: output of tool A becomes input of tool B.
- Nested calls: agent calls a tool that itself triggers sub-agent calls.

**Example Schema:**
```json
{
  "name": "search_database",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {"type": "string", "description": "SQL query to execute"},
      "database": {"type": "string", "enum": ["production", "analytics"]},
      "limit": {"type": "integer", "default": 100, "maximum": 1000}
    },
    "required": ["query", "database"]
  }
}
```

### 4. Context Management for Long Agent Sessions

- Complex agent tasks can span 50-200 turns, far exceeding typical context windows.
- Strategies:
  - **Sliding window**: Keep last N turns in full, summarize earlier turns.
  - **Hierarchical summarization**: Summarize completed sub-tasks; keep active sub-task in full.
  - **Selective retention**: Keep only tool inputs/outputs relevant to the current sub-task.
  - **External memory**: Store completed work in a scratchpad the agent can query.
- Implement a context budget manager: track token usage and trigger compression when approaching limits.
- Critical: never lose the original user request or key constraints during compression.

### 5. Vietnamese Language Support in Agent Prompts

- Vietnamese is a tonal, monosyllabic language with diacritics that are critical for meaning (e.g., "ma" vs "ma" vs "ma" have different tones/meanings).
- Challenges for agents:
  - Diacritic handling: ensure all pipeline components preserve Vietnamese diacritics.
  - Word segmentation: Vietnamese words can be multi-syllable (e.g., "hoc sinh" = student). Use VnCoreNLP or underthesea for segmentation when needed.
  - Code-switching: Vietnamese users often mix Vietnamese and English, especially for technical terms.
- Prompt strategy for bilingual agents:
  - System prompt in English (better instruction following).
  - User-facing responses in Vietnamese.
  - Internal reasoning can be in either language — let the model choose.
- Test all tool descriptions and error messages in Vietnamese to ensure clarity.

### 6. Multi-Turn Reasoning Chains

- Agentic tasks require the model to maintain a coherent plan across many turns.
- Implement chain-of-thought (CoT) prompting within the agent loop:
  - Before each action: "What is my current goal? What information do I have? What should I do next?"
  - After each observation: "Did this succeed? Does this change my plan? What is the next step?"
- ReAct pattern (Reason + Act): interleave thinking and tool calls explicitly.
- Plan-then-execute: have the agent create a plan first, then follow it step by step.
- Self-reflection: after completing a task, have the agent review its work before presenting to the user.

### 7. Error Recovery Prompting

- Agents encounter errors constantly: tool failures, unexpected outputs, ambiguous instructions.
- Design explicit error recovery instructions in the system prompt:
  - **Tool errors**: "If a tool returns an error, analyze the error message. Fix the input and retry. Max 2 retries per tool."
  - **Ambiguous input**: "If the user's request is unclear, ask one clarifying question before proceeding."
  - **Unexpected results**: "If a tool returns data that contradicts your expectations, verify by using an alternative approach."
  - **Stuck detection**: "If you have called the same tool 3 times without progress, try a different approach or ask the user for help."
- Include fallback strategies: "If the primary approach fails, try [alternative approach]."

### 8. Prompt Security

- Agent prompts are attack surfaces for prompt injection.
- Separate user input from system instructions clearly using delimiters.
- Validate that tool call parameters do not contain injected instructions.
- Use input sanitization for user-provided content that will be passed to tools.

### Recommendations for B10

1. **Build a prompt management system** — version control, A/B testing, and performance tracking for all agent prompts.
2. **Standardize tool description format** — consistent schema across all tools reduces model confusion.
3. **Implement context compression early** — agent sessions will exceed context windows faster than expected.
4. **Design for Vietnamese from the start** — retrofitting Vietnamese support is much harder than building it in.
5. **Create an error recovery playbook** — document common failure patterns and their prompt-based solutions.
6. **Use ReAct as the default reasoning pattern** — it provides the best balance of transparency and effectiveness.
