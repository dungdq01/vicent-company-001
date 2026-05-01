# QA Engineer Notes: Agentic AI (B10)
## By Mai Le (R-QA) — Date: 2026-03-31

### 1. Overview

Testing agentic AI systems is fundamentally harder than testing traditional software. Agents are non-deterministic, take variable paths to complete tasks, interact with external tools that may fail unpredictably, and can produce correct results through different approaches. The QA Engineer must build testing frameworks that account for this variability while ensuring reliability, safety, and performance.

### 2. End-to-End Agent Task Testing

- Test agents by giving them real tasks and evaluating the final output, not just individual steps.
- Design test cases as (instruction, expected_outcome, acceptance_criteria) triples.
- Acceptance criteria must be flexible: "the agent created a valid SQL query that returns the correct result" rather than "the agent used this exact SQL query."
- Use LLM-as-judge for evaluating subjective outputs: have a separate model score the agent's work on correctness, completeness, and quality.
- Build a test suite of 50-100 representative tasks covering the agent's intended use cases.
- Run the full suite on every prompt or tool change (automated regression).

### 3. Regression Testing for Prompt and Tool Changes

- Any change to system prompts, tool descriptions, or tool implementations can break agent behavior.
- Regression test strategy:
  - **Snapshot testing**: Record the agent's behavior (steps taken, tools called) on a fixed test set. Flag deviations after changes.
  - **Outcome testing**: Compare task success rate before/after the change.
  - **A/B testing in production**: Route a percentage of traffic to the new version, compare metrics.
- Maintain a "golden set" of 20-30 tasks that must always pass. Block deployment if any golden test fails.
- Track metrics over time: success rate, avg steps, avg cost, tool call distribution. Detect gradual degradation.

### 4. Benchmarking

**Established Benchmarks:**
- **SWE-bench**: Real GitHub issues. Tests agent's ability to navigate codebases and produce correct patches. Target: >30% on verified subset.
- **GAIA**: 466 real-world tasks requiring tool use (search, calculation, file reading). Three difficulty levels. Target: >50% on Level 1.
- **WebArena**: 812 web navigation tasks in realistic simulated websites. Tests browser-agent capabilities.
- **AgentBench**: Cross-domain benchmark covering OS, database, knowledge graph, web, and lateral thinking tasks.
- **HumanEval+/MBPP+**: Code generation with enhanced test cases. Tests coding sub-capability.

**Custom Benchmarks:**
- Build domain-specific benchmarks for your target use cases (e.g., Vietnamese e-commerce customer service scenarios).
- Include edge cases: ambiguous instructions, conflicting information, tasks requiring clarification.
- Update benchmarks quarterly to prevent overfitting.

### 5. Chaos Testing

- Agents must handle failures gracefully. Inject failures systematically:
  - **Tool failures**: Return errors from tools randomly (10-20% failure rate). Verify the agent retries or finds alternatives.
  - **Timeout simulation**: Make tool calls take 30-60 seconds. Verify the agent handles delays without breaking.
  - **Partial results**: Tools return incomplete data. Verify the agent detects and compensates.
  - **LLM errors**: Simulate rate limiting, context length exceeded, and model unavailability.
  - **Malformed tool output**: Return invalid JSON or unexpected schema from tools.
- Measure: recovery rate, time to recover, user impact during recovery.

### 6. Safety Testing

- Test for dangerous agent behaviors:
  - **Scope creep**: Give the agent a narrow task, provide tools that enable broader actions. Verify it stays within scope.
  - **Prompt injection resistance**: Include injection attempts in user inputs and tool results. Verify the agent ignores them.
  - **Data handling**: Provide sensitive data (PII, credentials) in context. Verify the agent does not leak it in outputs or tool calls.
  - **Loop detection**: Create scenarios where the agent might loop infinitely. Verify circuit breakers activate.
  - **Harmful actions**: Test that agents refuse to perform harmful actions even when explicitly instructed.
- Build a "red team" test suite: 30+ adversarial scenarios updated monthly.
- Automate safety testing in CI/CD — every deployment must pass safety tests.

### 7. Performance Testing

**Latency:**
- Measure end-to-end task completion time, not just LLM call latency.
- Breakdown: LLM thinking time, tool execution time, overhead (serialization, network).
- Targets: simple tasks <30s, medium tasks <2min, complex tasks <10min.

**Cost Per Task:**
- Track total token cost and tool execution cost per task category.
- Set cost budgets: alert when a task type exceeds 2x its historical average cost.
- Compare cost efficiency across model versions and prompt variants.

**Scalability:**
- Load test: run N concurrent agents and measure degradation.
- Identify bottlenecks: LLM rate limits, tool execution capacity, database connections.
- Target: support 50 concurrent agent runs without degradation.

### 8. Human Evaluation Protocols

- Automated metrics are insufficient for agent quality. Establish human evaluation:
  - **Weekly review**: Sample 20 production runs, have domain experts rate quality (1-5 scale).
  - **Failure analysis**: Review all failed runs weekly, categorize failure modes.
  - **Inter-annotator agreement**: Use 2+ evaluators, measure agreement. Resolve disagreements.
  - **User satisfaction**: Survey users after agent interactions (CSAT, NPS).
- Build an evaluation interface: present agent run with side-by-side expected vs actual output.

### 9. Test Infrastructure

- Use deterministic tool mocks for reproducible testing (real tools introduce flakiness).
- Seed random values and temperature=0 for maximum reproducibility (still not fully deterministic).
- Parallel test execution: run the benchmark suite across multiple workers to reduce wall-clock time.
- Test data management: maintain a versioned set of test inputs, expected outputs, and tool mock responses.

### Recommendations for B10

1. **Build the golden test suite first** — 20-30 must-pass tasks that gate every deployment.
2. **Run SWE-bench and GAIA as external benchmarks** — they provide objective capability measurement.
3. **Implement chaos testing early** — real-world tool failures will happen; test for them before users encounter them.
4. **Automate safety testing in CI/CD** — never deploy without passing adversarial safety tests.
5. **Establish weekly human evaluation** — automated metrics miss quality issues that humans catch.
6. **Track cost per task as a first-class metric** — it is as important as correctness for production viability.
