# ML Engineer Notes: Agentic AI (B10)
## By Linh Nguyen (R-MLE) — Date: 2026-03-31

### 1. Overview

Agentic AI pushes ML engineering beyond traditional model training into the realm of sequential decision-making. The ML Engineer must optimize LLMs for reliable tool use, design reward signals for agent behavior, build evaluation frameworks, and manage the cost-quality tradeoff inherent in multi-step agent tasks.

### 2. Fine-Tuning LLMs for Tool Use

- Tool-use fine-tuning teaches models to emit structured function calls with correct parameters.
- Training data format: (system prompt, user instruction, assistant response with tool_calls, tool results, final answer).
- Key datasets: ToolBench, API-Bank, ToolAlpaca, Gorilla, plus proprietary tool-call logs.
- Fine-tuning approaches:
  - **Full fine-tune**: Best quality, expensive. Use for core production agents.
  - **LoRA/QLoRA**: 10-20% quality gap but 10x cheaper. Good for domain-specific tool adapters.
  - **Prompt-based**: Zero fine-tuning cost, relies on in-context learning. Baseline approach.
- Critical: fine-tuned models must generalize to new tools not seen during training.

### 3. Reward Modeling for Agent Behavior

- Agent reward signals are sparse and delayed — success is only known at task completion.
- Design multi-level rewards:
  - **Task completion**: binary success/failure (primary signal).
  - **Efficiency**: fewer steps and lower cost = better (secondary signal).
  - **Safety**: no harmful actions, no data leaks (hard constraint).
- Process Reward Models (PRMs) score intermediate steps, not just final outcomes.
- Train reward models on human-annotated agent trajectories: (trajectory, step_scores, final_score).
- Use RLHF or DPO to align agent behavior with desired patterns.

### 4. Evaluation Frameworks

**Established Benchmarks:**
- **SWE-bench**: Software engineering tasks — can the agent fix real GitHub issues? Current SOTA ~50% on full set.
- **GAIA**: General AI Assistant benchmark — multi-step real-world tasks requiring tools.
- **AgentBench**: Suite covering OS, database, web browsing, and coding tasks.
- **WebArena**: Web navigation tasks in realistic environments.
- **HumanEval/MBPP**: Code generation (single-step, but useful as agent sub-capability).

**Custom Evaluation:**
- Build internal benchmarks from production use cases specific to target domains.
- Evaluate on axes: correctness, completeness, efficiency (steps), cost (tokens), safety.
- Use LLM-as-judge for subjective quality assessment; calibrate against human ratings.
- Track evaluation metrics over time to catch regressions.

### 5. Agent Trajectory Optimization

- An agent trajectory is the sequence of (thought, action, observation) tuples that form a complete run.
- Optimize trajectories using:
  - **Monte Carlo Tree Search (MCTS)**: Explore multiple action paths, select best.
  - **Best-of-N sampling**: Run N trajectories, pick the best by reward model score.
  - **Reflection/self-correction**: Let agents critique and retry failed steps.
- Trajectory distillation: train smaller models on optimal trajectories from larger models.
- Prune unnecessary steps: many agents over-explore when a direct path exists.

### 6. Few-Shot vs Fine-Tuned Tool Calling

| Aspect | Few-Shot (Prompting) | Fine-Tuned |
|--------|---------------------|------------|
| Setup cost | Minutes | Days |
| Quality on common tools | 85-90% | 95-98% |
| Quality on novel tools | 70-80% | 60-70% (if not in training) |
| Latency | Higher (longer prompt) | Lower |
| Flexibility | High (change tools instantly) | Low (retrain needed) |
| Cost per call | Higher (more input tokens) | Lower |

Recommendation: Start with few-shot for prototyping, fine-tune for production tools with high call volume.

### 7. Cost Optimization for Multi-Step Agent Tasks

- Multi-step agents can consume 10-100x more tokens than single-turn chatbots.
- Optimization strategies:
  - **Model routing**: Use cheap models for simple steps, expensive models for reasoning-heavy steps.
  - **Early stopping**: Detect when the agent is looping and terminate.
  - **Context compression**: Summarize earlier steps instead of passing full history.
  - **Caching**: Cache tool results for identical inputs across runs.
  - **Batch tool calls**: When multiple independent tools are needed, call them in parallel.
- Set per-run budgets: max tokens, max steps, max cost. Kill agents that exceed limits.
- Track cost per successful task, not just cost per run — failed runs waste budget.

### 8. Model Selection for Agent Tasks

- Reasoning capability matters more than raw benchmark scores for agents.
- Claude Opus/Sonnet, GPT-4o, Gemini 2.5 Pro: top tier for complex multi-step agents.
- Claude Haiku, GPT-4o-mini, Gemini Flash: good for simple tool-calling agents at lower cost.
- Open models (Llama 3.3, Qwen 2.5, DeepSeek-V3): viable for self-hosted with fine-tuning.
- Test on your specific agent tasks — general benchmarks do not predict agent performance well.

### 9. Vietnamese Language Considerations

- Most agent benchmarks are English-only; build Vietnamese evaluation sets for local use cases.
- Vietnamese tool-calling quality varies by model — test explicitly.
- Consider bilingual agents that reason in English internally but communicate in Vietnamese.

### Recommendations for B10

1. **Establish evaluation infrastructure first** — run SWE-bench, GAIA, and custom benchmarks before optimizing.
2. **Start with prompting, not fine-tuning** — fine-tune only after you have 1000+ production trajectories.
3. **Implement cost tracking from day one** — agent costs can spiral without visibility.
4. **Build a trajectory database** — every production run is training data for future improvements.
5. **Use model routing** — not every agent step needs the most powerful model.
6. **Invest in Process Reward Models** — they enable step-level optimization instead of only task-level.
