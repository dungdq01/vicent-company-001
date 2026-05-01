# Technical Report: Agentic AI (B10)
## By Dr. Praxis (R-beta) -- Date: 2026-03-31

**Classification:** Baseline Technology Node B10
**Domain:** Artificial Intelligence > Autonomous Systems > LLM-based Agents
**Report Type:** Technical Implementation Guide
**Cross-references:** B04 (Software Engineering), B06 (Optimization), B08 (Conversational AI), B09 (Generative AI), B11 (Knowledge Graphs), B12 (RAG)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack Recommendation](#2-tech-stack-recommendation)
3. [Pipeline Design](#3-pipeline-design)
4. [Mini Examples](#4-mini-examples)
5. [Integration Patterns](#5-integration-patterns)
6. [Performance & Cost](#6-performance--cost)
7. [Technology Selection Matrix](#7-technology-selection-matrix)

---

## 1. Architecture Overview

Three reference architectures form the progression path from prototype to production agentic systems.

### 1.1 Simple: Single-Agent with Tool Use (ReAct Loop)

The minimal viable agent. One LLM instance reasons and acts in a loop until the task is complete.

```
┌─────────────────────────────────────────────┐
│                USER REQUEST                 │
└────────────────────┬────────────────────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │    LLM (Claude /    │
          │    GPT-4 / Llama)   │◄──────────────────┐
          │                     │                    │
          │  Prompt:            │                    │
          │  "Think step by     │                    │
          │   step, then act"   │                    │
          └─────────┬───────────┘                    │
                    │                                │
            ┌───────▼───────┐                        │
            │   Decision:   │                        │
            │  Tool call or │                        │
            │  Final answer?│                        │
            └───┬───────┬───┘                        │
                │       │                            │
        Tool call   Final answer                     │
                │       │                            │
                ▼       ▼                            │
        ┌───────────┐ ┌──────────┐                   │
        │ Execute   │ │ Return   │                   │
        │ Tool      │ │ Response │                   │
        │ (search,  │ └──────────┘                   │
        │  code,    │                                │
        │  API)     │                                │
        └─────┬─────┘                                │
              │                                      │
              └──────── observation ──────────────────┘
```

**When to use:** Single-purpose tasks, prototyping, internal tools with trusted users.

**Characteristics:**
- 1 LLM, N tools
- Stateless between requests (or minimal session memory)
- Typically 3-15 reasoning steps
- Failure mode: infinite loops, tool misuse

### 1.2 Intermediate: Workflow Agent (LangGraph -- Deterministic + LLM Hybrid)

Combines hard-coded control flow with LLM decision points. The state machine provides guard rails; the LLM provides flexibility.

```mermaid
graph TD
    START([Start]) --> CLASSIFY[Classify Intent<br/>LLM Node]
    CLASSIFY -->|research| PLAN[Plan Research<br/>LLM Node]
    CLASSIFY -->|simple_qa| ANSWER[Direct Answer<br/>LLM Node]
    CLASSIFY -->|action| VALIDATE[Validate Action<br/>Deterministic]

    PLAN --> SEARCH[Execute Search<br/>Tool Node]
    SEARCH --> EVALUATE{Enough info?<br/>LLM Decision}
    EVALUATE -->|no| SEARCH
    EVALUATE -->|yes| SYNTHESIZE[Synthesize<br/>LLM Node]

    VALIDATE -->|valid| EXECUTE[Execute Action<br/>Tool Node]
    VALIDATE -->|invalid| ERROR[Error Response]
    EXECUTE --> CONFIRM[Confirm Result<br/>Deterministic]

    SYNTHESIZE --> REVIEW{Quality OK?<br/>LLM Decision}
    REVIEW -->|no| PLAN
    REVIEW -->|yes| OUTPUT[Return Result]

    ANSWER --> OUTPUT
    CONFIRM --> OUTPUT
    ERROR --> OUTPUT

    OUTPUT --> END([End])

    style CLASSIFY fill:#3498db,color:#fff
    style PLAN fill:#3498db,color:#fff
    style ANSWER fill:#3498db,color:#fff
    style SYNTHESIZE fill:#3498db,color:#fff
    style VALIDATE fill:#2ecc71,color:#fff
    style CONFIRM fill:#2ecc71,color:#fff
    style SEARCH fill:#e67e22,color:#fff
    style EXECUTE fill:#e67e22,color:#fff
```

**When to use:** Production systems where reliability matters more than flexibility. Most business applications.

**Characteristics:**
- State machine with typed state
- Deterministic routing where possible, LLM routing where needed
- Built-in retry, timeout, and error handling
- Checkpointing for long-running tasks

### 1.3 Advanced: Multi-Agent Platform (Orchestrator + Specialist Agents)

Multiple specialized agents coordinated by an orchestrator. Each agent has its own tools, prompts, and domain expertise.

```
┌────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                   │
│                                                        │
│  Role: Task decomposition, delegation, synthesis       │
│  LLM: Claude Opus / GPT-4 (high capability)           │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐            │
│  │ Task     │  │ Agent    │  │ Result    │            │
│  │ Planner  │─▶│ Router   │─▶│ Assembler │            │
│  └──────────┘  └────┬─────┘  └───────────┘            │
│                     │                                  │
└─────────────────────┼──────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐┌──────────────┐┌──────────────┐
│ RESEARCH     ││ CODE         ││ DATA         │
│ AGENT        ││ AGENT        ││ AGENT        │
│              ││              ││              │
│ LLM: Sonnet  ││ LLM: Sonnet  ││ LLM: Sonnet  │
│ Tools:       ││ Tools:       ││ Tools:       │
│ - Web search ││ - Code exec  ││ - SQL query  │
│ - PDF reader ││ - Git ops    ││ - Charts     │
│ - Summarizer ││ - Test run   ││ - CSV parse  │
└──────┬───────┘└──────┬───────┘└──────┬───────┘
       │               │               │
       ▼               ▼               ▼
┌──────────────┐┌──────────────┐┌──────────────┐
│ Shared Memory Layer (Vector DB + Redis)      │
│                                              │
│ - Conversation history                       │
│ - Task state & progress                      │
│ - Retrieved documents                        │
│ - Intermediate results                       │
└──────────────────────────────────────────────┘
```

**When to use:** Complex enterprise workflows, research platforms, autonomous software teams.

**Characteristics:**
- N agents, each with distinct system prompts and tool sets
- Shared memory for coordination
- Orchestrator handles planning, delegation, conflict resolution
- Human-in-the-loop at critical decision points

---

## 2. Tech Stack Recommendation

### 2.1 LLM Providers

| Name | Category | Description | Use Case | Alternatives | Link |
|------|----------|-------------|----------|--------------|------|
| **Claude 3.5/4 (Anthropic)** | Cloud LLM | Best-in-class tool use, long context (200K), structured output | Primary agent brain, complex reasoning | GPT-4o | https://docs.anthropic.com |
| **GPT-4o (OpenAI)** | Cloud LLM | Strong general reasoning, function calling, vision | Multi-modal agents, legacy integrations | Claude 4 | https://platform.openai.com |
| **Llama 3.3 70B/405B** | Open-weight LLM | Self-hosted, fine-tunable, no API costs at scale | Cost-sensitive deployments, data-sovereign environments | Mixtral, Qwen 2.5 | https://llama.meta.com |
| **Gemini 2.5 Pro (Google)** | Cloud LLM | 1M context, native multimodal, grounding with Google Search | Long-document agents, multimodal pipelines | Claude 4 | https://ai.google.dev |

### 2.2 Orchestration Frameworks

| Name | Category | Description | Use Case | Alternatives | Link |
|------|----------|-------------|----------|--------------|------|
| **LangGraph** | Agent Framework | State machine-based agent orchestration with persistence, streaming, human-in-the-loop | Production workflow agents, complex multi-step pipelines | CrewAI, custom | https://langchain-ai.github.io/langgraph/ |
| **CrewAI** | Multi-Agent Framework | Role-based multi-agent collaboration with minimal boilerplate | Rapid multi-agent prototypes, content pipelines | AutoGen, LangGraph | https://crewai.com |
| **AutoGen (Microsoft)** | Multi-Agent Framework | Conversation-based multi-agent with code execution | Research, code generation, group chat agents | CrewAI | https://microsoft.github.io/autogen/ |
| **Semantic Kernel (Microsoft)** | Enterprise SDK | .NET/Python SDK for AI orchestration with planner and plugins | Enterprise .NET shops, Azure-heavy stacks | LangGraph | https://learn.microsoft.com/semantic-kernel/ |
| **Claude Agent SDK** | Agent Framework | Anthropic's official SDK for building agents with Claude | Claude-native agents, tool-use-heavy workflows | LangGraph | https://docs.anthropic.com/agent-sdk |

### 2.3 Tool Execution

| Name | Category | Description | Use Case | Alternatives | Link |
|------|----------|-------------|----------|--------------|------|
| **E2B** | Sandboxed Code | Cloud sandboxes for executing LLM-generated code safely | Code agents, data analysis agents | Modal, Docker | https://e2b.dev |
| **Composio** | Tool Integration | 250+ pre-built tool integrations (GitHub, Slack, CRM, etc.) | Rapid tool connection without custom code | Custom API wrappers | https://composio.dev |
| **Browserbase / Playwright** | Browser Automation | Headless browser for web agents | Web scraping, form filling, testing agents | Selenium, Puppeteer | https://browserbase.com |
| **MCP (Model Context Protocol)** | Tool Protocol | Anthropic's open standard for connecting LLMs to tools/data | Standardized tool interfaces across providers | Custom function calling | https://modelcontextprotocol.io |

### 2.4 Memory

| Name | Category | Description | Use Case | Alternatives | Link |
|------|----------|-------------|----------|--------------|------|
| **Pinecone / Qdrant** | Vector DB | Similarity search over embeddings for semantic memory | Long-term agent memory, document retrieval | Weaviate, Chroma | https://pinecone.io |
| **Redis** | In-memory Cache | Fast key-value store for session state and short-term memory | Agent working memory, task queues, rate limiting | Memcached | https://redis.io |
| **PostgreSQL** | Relational DB | Structured storage with pgvector extension | Task logs, user data, hybrid vector+relational queries | MySQL | https://postgresql.org |
| **LangGraph Checkpointer** | State Persistence | Built-in checkpointing for LangGraph state machines | Pause/resume agent workflows, crash recovery | Custom Redis store | https://langchain-ai.github.io/langgraph/ |

### 2.5 Observability

| Name | Category | Description | Use Case | Alternatives | Link |
|------|----------|-------------|----------|--------------|------|
| **LangSmith** | LLM Observability | Trace, debug, and evaluate LangChain/LangGraph pipelines | Development and production monitoring of agent chains | Phoenix | https://smith.langchain.com |
| **Arize Phoenix** | Open-source Observability | Open-source LLM tracing with evaluation and experiment tracking | Teams wanting self-hosted observability | LangSmith | https://phoenix.arize.com |
| **OpenTelemetry + Grafana** | General Observability | Industry-standard distributed tracing adapted for LLM workloads | Enterprise integration with existing monitoring | Datadog | https://opentelemetry.io |
| **Braintrust** | Eval Platform | Evaluation, logging, and prompt management for LLM apps | Systematic agent quality measurement | LangSmith evals | https://braintrust.dev |

### 2.6 Agent UI

| Name | Category | Description | Use Case | Alternatives | Link |
|------|----------|-------------|----------|--------------|------|
| **Streamlit** | Python UI | Rapid prototyping of chat + visualization interfaces | Internal tools, demos, MVPs | Gradio | https://streamlit.io |
| **Custom React + Vercel AI SDK** | Production UI | Full control over streaming, tool call rendering, auth | Customer-facing agent products | Next.js + custom | https://sdk.vercel.ai |
| **CopilotKit** | Agent UI Framework | React components for AI copilots with agent state visibility | Embedded AI assistants in SaaS products | Custom React | https://copilotkit.ai |

---

## 3. Pipeline Design

### 3.1 Agent Execution Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT EXECUTION PIPELINE                     │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │ 1. TASK  │──▶│ 2. PLAN  │──▶│ 3. EXEC  │──▶│ 4. MEM   │    │
│  │ INTAKE   │   │          │   │ LOOP     │   │ MGMT     │    │
│  └──────────┘   └──────────┘   └────┬─────┘   └──────────┘    │
│                                     │                          │
│                                     │ (iterate)               │
│                                     ▼                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                   │
│  │ 6. HUMAN │◀──│ 5. OUTPUT│◀──│ TOOL     │                   │
│  │ REVIEW   │   │ ASSEMBLY │   │ RESULT   │                   │
│  └──────────┘   └──────────┘   └──────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Stage 1: Task Intake

```python
from pydantic import BaseModel, Field
from enum import Enum

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AgentTask(BaseModel):
    """Structured task representation after intake processing."""
    task_id: str
    user_request: str              # Raw user input
    intent: str                    # Classified intent
    sub_tasks: list[str] = []     # Decomposed sub-tasks
    priority: TaskPriority = TaskPriority.MEDIUM
    constraints: dict = {}         # Time limits, cost limits, scope
    context: dict = {}             # Retrieved relevant context

async def task_intake(user_request: str, llm) -> AgentTask:
    """Decompose user request into structured task."""
    decomposition_prompt = f"""Analyze this request and decompose it:

    Request: {user_request}

    Return JSON with:
    - intent: what the user wants (1 sentence)
    - sub_tasks: list of concrete steps to accomplish this
    - priority: low/medium/high/critical
    - constraints: any time, cost, or scope limits mentioned
    """
    result = await llm.ainvoke(decomposition_prompt)
    return AgentTask(
        task_id=generate_id(),
        user_request=user_request,
        **parse_json(result.content)
    )
```

### Stage 2: Planning (Chain-of-Thought / Tree-of-Thought)

```python
from typing import Literal

class ActionPlan(BaseModel):
    """Ordered sequence of actions the agent will attempt."""
    steps: list[PlanStep]
    estimated_tokens: int
    estimated_tool_calls: int
    fallback_strategy: str

class PlanStep(BaseModel):
    step_number: int
    description: str
    tool_needed: str | None
    depends_on: list[int] = []  # Step numbers this depends on
    timeout_seconds: int = 30

async def plan_actions(task: AgentTask, llm, available_tools: list[str]) -> ActionPlan:
    """Generate action plan using Chain-of-Thought reasoning."""
    planning_prompt = f"""You are a planning agent. Given the task and available tools,
    create a step-by-step action plan.

    Task: {task.intent}
    Sub-tasks: {task.sub_tasks}
    Available tools: {available_tools}
    Constraints: {task.constraints}

    For each step, specify:
    1. What to do
    2. Which tool to use (or "reasoning" for pure thought)
    3. What steps it depends on
    4. Timeout in seconds

    Think carefully about ordering and parallelism.
    """
    result = await llm.ainvoke(planning_prompt)
    return ActionPlan(**parse_json(result.content))
```

### Stage 3: Execution Loop (ReAct Pattern)

```python
import asyncio
from datetime import datetime, timedelta

class ExecutionState(BaseModel):
    """Tracks the agent's progress through the action plan."""
    plan: ActionPlan
    current_step: int = 0
    observations: list[dict] = []
    tool_results: list[dict] = []
    errors: list[dict] = []
    started_at: datetime = Field(default_factory=datetime.utcnow)
    max_iterations: int = 20
    iteration_count: int = 0

async def execution_loop(state: ExecutionState, llm, tools: dict) -> ExecutionState:
    """Core ReAct loop: Reason -> Act -> Observe -> Repeat."""

    while state.iteration_count < state.max_iterations:
        state.iteration_count += 1

        # REASON: Decide next action based on current state
        reasoning_prompt = f"""Current state:
        - Plan step: {state.current_step + 1}/{len(state.plan.steps)}
        - Current step: {state.plan.steps[state.current_step].description}
        - Previous observations: {state.observations[-3:]}  # Last 3
        - Errors so far: {state.errors}

        Decide: Execute the planned tool, skip this step, or declare task complete.
        Return JSON: {{"action": "execute"|"skip"|"complete", "tool": "...", "args": {{...}}, "reasoning": "..."}}
        """

        decision = await llm.ainvoke(reasoning_prompt)
        parsed = parse_json(decision.content)

        if parsed["action"] == "complete":
            break

        if parsed["action"] == "skip":
            state.current_step += 1
            continue

        # ACT: Execute the tool
        tool_name = parsed["tool"]
        tool_args = parsed["args"]

        try:
            result = await asyncio.wait_for(
                tools[tool_name].ainvoke(tool_args),
                timeout=state.plan.steps[state.current_step].timeout_seconds
            )
            state.tool_results.append({
                "step": state.current_step,
                "tool": tool_name,
                "result": result,
                "timestamp": datetime.utcnow().isoformat()
            })
        except asyncio.TimeoutError:
            state.errors.append({"step": state.current_step, "error": "timeout"})
        except Exception as e:
            state.errors.append({"step": state.current_step, "error": str(e)})

        # OBSERVE: Process tool result and update state
        observation = await llm.ainvoke(
            f"Summarize this tool result in 1-2 sentences: {result}"
        )
        state.observations.append({
            "step": state.current_step,
            "observation": observation.content
        })

        state.current_step += 1
        if state.current_step >= len(state.plan.steps):
            break

    return state
```

### Stage 4: Memory Management

```python
from langchain_core.vectorstores import VectorStore
import redis.asyncio as redis
import json

class AgentMemory:
    """Three-tier memory system for agent state."""

    def __init__(self, vector_store: VectorStore, redis_client: redis.Redis, pg_pool):
        self.vector_store = vector_store   # Long-term semantic memory
        self.redis = redis_client           # Short-term working memory
        self.pg = pg_pool                   # Persistent structured memory

    async def save_working_memory(self, session_id: str, key: str, value: dict, ttl: int = 3600):
        """Save to Redis with TTL. For current task state."""
        await self.redis.setex(
            f"agent:{session_id}:{key}",
            ttl,
            json.dumps(value)
        )

    async def retrieve_similar(self, query: str, k: int = 5) -> list[dict]:
        """Semantic search over long-term memory."""
        docs = await self.vector_store.asimilarity_search(query, k=k)
        return [{"content": d.page_content, "metadata": d.metadata} for d in docs]

    async def save_long_term(self, content: str, metadata: dict):
        """Persist to vector store for future retrieval."""
        await self.vector_store.aadd_texts(
            texts=[content],
            metadatas=[metadata]
        )

    async def log_task(self, task: AgentTask, result: dict):
        """Structured log to PostgreSQL for analytics."""
        async with self.pg.acquire() as conn:
            await conn.execute("""
                INSERT INTO agent_tasks (task_id, user_request, intent, result,
                                         tokens_used, duration_ms, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
            """, task.task_id, task.user_request, task.intent,
                json.dumps(result), result.get("tokens"), result.get("duration_ms"))
```

### Stage 5: Output Assembly

```python
async def assemble_output(state: ExecutionState, task: AgentTask, llm) -> dict:
    """Synthesize all tool results and observations into final output."""

    synthesis_prompt = f"""You completed a task. Synthesize the results.

    Original request: {task.user_request}
    Observations collected: {state.observations}
    Tool results: {state.tool_results}
    Errors encountered: {state.errors}

    Provide:
    1. A clear, direct answer to the user's request
    2. Key sources/evidence used
    3. Confidence level (high/medium/low)
    4. Any caveats or limitations
    """

    response = await llm.ainvoke(synthesis_prompt)

    return {
        "answer": response.content,
        "sources": extract_sources(state.tool_results),
        "tokens_used": sum_tokens(state),
        "duration_ms": calculate_duration(state),
        "steps_completed": state.current_step,
        "errors": state.errors
    }
```

### Stage 6: Human Review (Approval Gates)

```python
from enum import Enum

class ReviewDecision(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"
    MODIFY = "modify"
    ESCALATE = "escalate"

class HumanReviewGate:
    """Configurable human-in-the-loop approval system."""

    def __init__(self, require_review_for: list[str] = None):
        # Actions that always need human approval
        self.require_review_for = require_review_for or [
            "send_email",
            "make_payment",
            "delete_record",
            "publish_content",
            "modify_production_data"
        ]

    def needs_review(self, action: str, confidence: float) -> bool:
        """Determine if this action needs human approval."""
        if action in self.require_review_for:
            return True
        if confidence < 0.7:
            return True
        return False

    async def request_review(self, action: str, context: dict) -> ReviewDecision:
        """Send to review queue and wait for human decision."""
        review_id = await self.create_review_request(action, context)
        # In production: webhook, Slack notification, email, or UI queue
        decision = await self.wait_for_decision(review_id, timeout=3600)
        return decision
```

### 3.2 Full Pipeline Diagram (Mermaid)

```mermaid
graph TD
    USER[User Request] --> INTAKE[1. Task Intake]
    INTAKE --> DECOMPOSE[Decompose into Sub-tasks]
    DECOMPOSE --> PLAN[2. Planning - CoT/ToT]
    PLAN --> EXEC_START[3. Execution Loop Start]

    EXEC_START --> REASON[Reason: What next?]
    REASON --> DECIDE{Tool call or<br/>final answer?}

    DECIDE -->|tool call| TOOL[Execute Tool]
    TOOL --> OBSERVE[Observe Result]
    OBSERVE --> MEM_SAVE[4. Save to Memory]
    MEM_SAVE --> CHECK{More steps?}
    CHECK -->|yes| REASON
    CHECK -->|no| ASSEMBLE[5. Output Assembly]

    DECIDE -->|final answer| ASSEMBLE

    ASSEMBLE --> REVIEW{6. Needs Human<br/>Review?}
    REVIEW -->|yes| HUMAN[Human Review Gate]
    HUMAN -->|approve| DELIVER[Deliver Result]
    HUMAN -->|reject| PLAN
    HUMAN -->|modify| ASSEMBLE
    REVIEW -->|no| DELIVER

    DELIVER --> LOG[Log to DB]
    LOG --> END([Done])
```

---

## 4. Mini Examples

### 4.1 Example 1: Quick Start -- Build a Research Agent with LangGraph + Claude

**Level:** Beginner | **Time:** 45 minutes | **Stack:** Python, LangGraph, Claude, Tavily

An agent that searches the web, reads documents, and synthesizes an answer.

#### Step 1: Install dependencies

```bash
pip install langgraph langchain-anthropic langchain-community tavily-python
```

#### Step 2: Define the agent state

```python
# research_agent.py
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_anthropic import ChatAnthropic
from langchain_community.tools.tavily_search import TavilySearchResults

class ResearchState(TypedDict):
    messages: Annotated[list, add_messages]
    research_topic: str
    search_results: list[dict]
    draft_answer: str
    iteration: int
```

#### Step 3: Define tools

```python
import os

os.environ["TAVILY_API_KEY"] = "tvly-..."
os.environ["ANTHROPIC_API_KEY"] = "sk-ant-..."

search_tool = TavilySearchResults(
    max_results=5,
    search_depth="advanced",
    include_raw_content=True
)

llm = ChatAnthropic(
    model="claude-sonnet-4-20250514",
    temperature=0,
    max_tokens=4096
)
```

#### Step 4: Define graph nodes

```python
async def plan_search(state: ResearchState) -> dict:
    """Generate search queries based on the research topic."""
    response = await llm.ainvoke([
        {"role": "system", "content": "You are a research assistant. Generate 2-3 focused search queries."},
        {"role": "user", "content": f"Research topic: {state['research_topic']}\n\nGenerate search queries as a JSON list of strings."}
    ])
    queries = parse_json(response.content)
    return {"messages": [response], "search_results": [], "iteration": state.get("iteration", 0)}


async def execute_search(state: ResearchState) -> dict:
    """Run searches and collect results."""
    all_results = []
    # Extract queries from the last LLM response
    queries = parse_json(state["messages"][-1].content)

    for query in queries[:3]:
        results = await search_tool.ainvoke({"query": query})
        all_results.extend(results)

    return {"search_results": all_results}


async def synthesize(state: ResearchState) -> dict:
    """Synthesize search results into a coherent answer."""
    sources = "\n\n".join([
        f"Source: {r.get('url', 'N/A')}\nContent: {r.get('content', '')[:1000]}"
        for r in state["search_results"]
    ])

    response = await llm.ainvoke([
        {"role": "system", "content": "Synthesize the search results into a comprehensive answer. Cite sources."},
        {"role": "user", "content": f"Topic: {state['research_topic']}\n\nSources:\n{sources}"}
    ])

    return {"draft_answer": response.content, "messages": [response]}


async def evaluate_quality(state: ResearchState) -> dict:
    """Evaluate if the answer is good enough or needs more research."""
    response = await llm.ainvoke([
        {"role": "system", "content": "Evaluate this research answer. Return JSON: {\"sufficient\": true/false, \"gaps\": [...]}"},
        {"role": "user", "content": f"Topic: {state['research_topic']}\n\nAnswer:\n{state['draft_answer']}"}
    ])
    return {"messages": [response], "iteration": state["iteration"] + 1}
```

#### Step 5: Define routing logic

```python
def should_continue(state: ResearchState) -> str:
    """Route based on quality evaluation."""
    if state["iteration"] >= 3:
        return "finish"  # Max iterations reached

    last_message = state["messages"][-1].content
    try:
        evaluation = parse_json(last_message)
        if evaluation.get("sufficient", False):
            return "finish"
        return "research_more"
    except Exception:
        return "finish"
```

#### Step 6: Build the graph

```python
graph = StateGraph(ResearchState)

# Add nodes
graph.add_node("plan_search", plan_search)
graph.add_node("execute_search", execute_search)
graph.add_node("synthesize", synthesize)
graph.add_node("evaluate", evaluate_quality)

# Add edges
graph.add_edge(START, "plan_search")
graph.add_edge("plan_search", "execute_search")
graph.add_edge("execute_search", "synthesize")
graph.add_edge("synthesize", "evaluate")

# Conditional edge
graph.add_conditional_edges(
    "evaluate",
    should_continue,
    {
        "research_more": "plan_search",
        "finish": END
    }
)

# Compile
research_agent = graph.compile()
```

#### Step 7: Run the agent

```python
import asyncio

async def main():
    result = await research_agent.ainvoke({
        "messages": [],
        "research_topic": "What are the latest advances in agentic AI frameworks in 2026?",
        "search_results": [],
        "draft_answer": "",
        "iteration": 0
    })

    print("=== RESEARCH RESULT ===")
    print(result["draft_answer"])

asyncio.run(main())
```

**Expected output:** A well-sourced, multi-paragraph answer about agentic AI frameworks, with 1-3 research iterations depending on topic complexity.

---

### 4.2 Example 2: Production -- Multi-Agent Customer Service Platform

**Level:** Advanced | **Time:** 6 hours | **Stack:** LangGraph, FastAPI, PostgreSQL, Redis, Claude

A multi-agent system with an orchestrator that routes customer requests to specialist agents (orders, billing, technical support), with human escalation and conversation memory.

#### Architecture

```
                    ┌─────────────┐
                    │  Customer   │
                    │  (Chat UI)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  FastAPI    │
                    │  Gateway    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ ORCHESTRATOR│
                    │   AGENT     │
                    │ (Router +   │
                    │  Supervisor)│
                    └──┬───┬───┬──┘
                       │   │   │
          ┌────────────┘   │   └────────────┐
          │                │                │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
   │   ORDER     │ │  BILLING    │ │  TECHNICAL  │
   │   AGENT     │ │  AGENT      │ │  AGENT      │
   │             │ │             │ │             │
   │ Tools:      │ │ Tools:      │ │ Tools:      │
   │ - order_db  │ │ - stripe    │ │ - kb_search │
   │ - shipping  │ │ - invoice   │ │ - jira      │
   │ - inventory │ │ - refund    │ │ - logs      │
   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
          │                │                │
          └────────┬───────┴────────┬───────┘
                   │                │
          ┌────────▼────┐   ┌──────▼──────┐
          │  PostgreSQL │   │    Redis     │
          │  (history,  │   │  (session,   │
          │   tasks)    │   │   cache)     │
          └─────────────┘   └─────────────┘
```

#### Step 1: Define the shared state and specialist agents

```python
# agents/state.py
from typing import Annotated, Literal
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from pydantic import BaseModel

class CustomerState(TypedDict):
    messages: Annotated[list, add_messages]
    customer_id: str
    session_id: str
    current_agent: Literal["orchestrator", "order", "billing", "technical", "human"]
    task_context: dict        # Accumulated context from tools
    escalation_reason: str    # Why escalated to human
    resolved: bool

class RouteDecision(BaseModel):
    agent: Literal["order", "billing", "technical", "human"]
    confidence: float
    reasoning: str
```

#### Step 2: Orchestrator agent

```python
# agents/orchestrator.py
from langchain_anthropic import ChatAnthropic

orchestrator_llm = ChatAnthropic(model="claude-sonnet-4-20250514", temperature=0)

ORCHESTRATOR_SYSTEM = """You are a customer service orchestrator. Your job:
1. Understand the customer's issue
2. Route to the right specialist agent
3. If the specialist can't resolve, escalate to human

Route to:
- "order": order status, shipping, returns, exchanges
- "billing": charges, invoices, refunds, payment methods
- "technical": product issues, bugs, how-to questions
- "human": angry customer, legal threats, complex multi-department issues

Return JSON: {"agent": "...", "confidence": 0.0-1.0, "reasoning": "..."}
"""

async def orchestrator_node(state: CustomerState) -> dict:
    response = await orchestrator_llm.ainvoke([
        {"role": "system", "content": ORCHESTRATOR_SYSTEM},
        *state["messages"]
    ])

    decision = RouteDecision(**parse_json(response.content))

    if decision.confidence < 0.6:
        return {
            "current_agent": "human",
            "escalation_reason": f"Low routing confidence: {decision.reasoning}"
        }

    return {"current_agent": decision.agent, "messages": [response]}
```

#### Step 3: Specialist agents with tools

```python
# agents/order_agent.py
from langchain_core.tools import tool

@tool
async def lookup_order(order_id: str) -> dict:
    """Look up order details by order ID."""
    async with get_db_pool().acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM orders WHERE order_id = $1", order_id
        )
        return dict(row) if row else {"error": "Order not found"}

@tool
async def check_shipping_status(tracking_number: str) -> dict:
    """Check real-time shipping status."""
    # Integration with shipping provider API
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://api.shippo.com/tracks/{tracking_number}")
        return resp.json()

@tool
async def initiate_return(order_id: str, reason: str) -> dict:
    """Start a return process. Requires human approval for orders over $500."""
    order = await lookup_order.ainvoke({"order_id": order_id})
    if order.get("total", 0) > 500:
        return {"status": "pending_approval", "message": "High-value return requires manager approval"}
    # Process return...
    return {"status": "return_initiated", "return_label_url": "https://..."}

ORDER_AGENT_SYSTEM = """You are an order specialist. Help customers with:
- Order status inquiries
- Shipping tracking
- Returns and exchanges

Always verify the customer's order ID before taking action.
Be empathetic but efficient. Use tools to get real data, never guess.
"""

order_tools = [lookup_order, check_shipping_status, initiate_return]
order_llm = ChatAnthropic(model="claude-sonnet-4-20250514", temperature=0).bind_tools(order_tools)

async def order_agent_node(state: CustomerState) -> dict:
    response = await order_llm.ainvoke([
        {"role": "system", "content": ORDER_AGENT_SYSTEM},
        *state["messages"]
    ])

    # Handle tool calls
    if response.tool_calls:
        tool_results = []
        for tc in response.tool_calls:
            tool_fn = {t.name: t for t in order_tools}[tc["name"]]
            result = await tool_fn.ainvoke(tc["args"])
            tool_results.append({"tool": tc["name"], "result": result})

        return {
            "messages": [response],
            "task_context": {**state.get("task_context", {}), "tool_results": tool_results}
        }

    return {"messages": [response]}
```

#### Step 4: Build the multi-agent graph

```python
# agents/graph.py
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

def route_to_specialist(state: CustomerState) -> str:
    return state["current_agent"]

def check_resolution(state: CustomerState) -> str:
    last_msg = state["messages"][-1].content.lower()
    if "resolved" in last_msg or "anything else" in last_msg:
        return "resolved"
    if "escalat" in last_msg:
        return "escalate"
    return "continue"

# Build graph
graph = StateGraph(CustomerState)

# Add nodes
graph.add_node("orchestrator", orchestrator_node)
graph.add_node("order", order_agent_node)
graph.add_node("billing", billing_agent_node)       # Similar to order_agent_node
graph.add_node("technical", technical_agent_node)    # Similar to order_agent_node
graph.add_node("human_handoff", human_handoff_node)

# Entry: always go to orchestrator first
graph.add_edge(START, "orchestrator")

# Orchestrator routes to specialist
graph.add_conditional_edges(
    "orchestrator",
    route_to_specialist,
    {
        "order": "order",
        "billing": "billing",
        "technical": "technical",
        "human": "human_handoff"
    }
)

# Each specialist can resolve, continue, or escalate
for agent in ["order", "billing", "technical"]:
    graph.add_conditional_edges(
        agent,
        check_resolution,
        {
            "resolved": END,
            "continue": agent,       # Loop back for multi-turn
            "escalate": "human_handoff"
        }
    )

graph.add_edge("human_handoff", END)

# Compile with PostgreSQL checkpointing for session persistence
checkpointer = AsyncPostgresSaver.from_conninfo(
    "postgresql://user:pass@localhost:5432/agents"
)
customer_service_agent = graph.compile(checkpointer=checkpointer)
```

#### Step 5: FastAPI gateway

```python
# api/main.py
from fastapi import FastAPI, WebSocket
from agents.graph import customer_service_agent
import redis.asyncio as redis
import json

app = FastAPI()
redis_client = redis.from_url("redis://localhost:6379")

@app.websocket("/ws/chat/{session_id}")
async def chat_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()

    # Load or create session
    session_data = await redis_client.get(f"session:{session_id}")
    customer_id = json.loads(session_data)["customer_id"] if session_data else "anonymous"

    config = {"configurable": {"thread_id": session_id}}

    try:
        while True:
            user_message = await websocket.receive_text()

            # Stream agent responses
            async for event in customer_service_agent.astream_events(
                {"messages": [{"role": "user", "content": user_message}],
                 "customer_id": customer_id,
                 "session_id": session_id,
                 "current_agent": "orchestrator",
                 "task_context": {},
                 "escalation_reason": "",
                 "resolved": False},
                config=config
            ):
                if event["event"] == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    if chunk.content:
                        await websocket.send_json({
                            "type": "token",
                            "content": chunk.content,
                            "agent": event.get("metadata", {}).get("langgraph_node", "unknown")
                        })

                elif event["event"] == "on_tool_end":
                    await websocket.send_json({
                        "type": "tool_result",
                        "tool": event["name"],
                        "result": event["data"].output
                    })

            await websocket.send_json({"type": "done"})

    except Exception as e:
        await websocket.close(code=1000)

@app.get("/sessions/{session_id}/history")
async def get_history(session_id: str):
    """Retrieve conversation history for a session."""
    config = {"configurable": {"thread_id": session_id}}
    state = await customer_service_agent.aget_state(config)
    return {"messages": [m.dict() for m in state.values.get("messages", [])]}
```

#### Step 6: Docker Compose for local development

```yaml
# docker-compose.yml
version: "3.9"
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DATABASE_URL=postgresql://agents:agents@postgres:5432/agents
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: agents
      POSTGRES_USER: agents
      POSTGRES_PASSWORD: agents
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## 5. Integration Patterns

### 5.1 Upgrading Chatbots to Agents (B08 -> B10)

The most common entry point. Existing chatbots gain tool use and planning capabilities.

```python
# Before: Simple chatbot (B08)
response = llm.invoke(user_message)

# After: Agent with tools (B10)
# 1. Wrap existing chatbot logic as a "fallback" tool
# 2. Add domain-specific tools
# 3. Wrap in ReAct loop or LangGraph

from langgraph.prebuilt import create_react_agent

# Reuse your existing chatbot's system prompt
agent = create_react_agent(
    model=llm,
    tools=[existing_kb_search, order_lookup, schedule_appointment],
    prompt="You are the upgraded version of our customer assistant..."
)
```

**Migration checklist:**
- [ ] Inventory existing intents and map to tools
- [ ] Identify which intents need multi-step reasoning (those become agent workflows)
- [ ] Add guardrails: max iterations, token budgets, fallback to human
- [ ] A/B test agent vs chatbot on same traffic

### 5.2 CRM/ERP Integration

```python
@tool
async def search_crm_contacts(query: str, filters: dict = {}) -> list[dict]:
    """Search CRM contacts. Filters: company, role, last_contact_date."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.hubspot.com/crm/v3/objects/contacts/search",
            headers={"Authorization": f"Bearer {HUBSPOT_TOKEN}"},
            json={"query": query, "filterGroups": build_filters(filters)}
        )
        return resp.json()["results"]

@tool
async def create_erp_order(customer_id: str, items: list[dict]) -> dict:
    """Create order in ERP system. REQUIRES HUMAN APPROVAL."""
    # This tool is gated by the HumanReviewGate
    return await erp_client.create_order(customer_id=customer_id, items=items)
```

### 5.3 Code Repository Integration (GitHub)

```python
@tool
async def search_codebase(query: str, repo: str = "org/main-app") -> list[dict]:
    """Search code in GitHub repository using code search API."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.github.com/search/code?q={query}+repo:{repo}",
            headers={"Authorization": f"Bearer {GITHUB_TOKEN}"}
        )
        return [{"path": r["path"], "url": r["html_url"]} for r in resp.json()["items"][:10]]

@tool
async def create_pull_request(repo: str, title: str, body: str, branch: str, base: str = "main") -> dict:
    """Create a GitHub pull request. REQUIRES HUMAN APPROVAL."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.github.com/repos/{repo}/pulls",
            headers={"Authorization": f"Bearer {GITHUB_TOKEN}"},
            json={"title": title, "body": body, "head": branch, "base": base}
        )
        return resp.json()
```

### 5.4 Document Systems (MCP-based)

Using Model Context Protocol for standardized document access:

```python
# Use MCP servers for document integration
# Example: Connect to a filesystem MCP server for company docs

from langchain_mcp import MCPToolkit

# Connect to MCP server that exposes company documents
mcp_toolkit = MCPToolkit(server_url="http://localhost:3001")
doc_tools = mcp_toolkit.get_tools()
# Automatically provides: read_file, search_files, list_directory, etc.

agent = create_react_agent(
    model=llm,
    tools=[*doc_tools, web_search, calculator]
)
```

### 5.5 Vietnamese Business Tool Integration

```python
# Common integrations for Vietnamese market
@tool
async def lookup_tax_code(tax_code: str) -> dict:
    """Look up Vietnamese business by tax code (ma so thue)."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://api.vietqr.io/v2/business/{tax_code}")
        return resp.json()

@tool
async def generate_vat_invoice(invoice_data: dict) -> dict:
    """Generate Vietnamese e-invoice (hoa don dien tu) via VNPT/Viettel provider."""
    return await einvoice_client.create(invoice_data)

@tool
async def bank_transfer_lookup(account_number: str, bank_code: str) -> dict:
    """Verify Vietnamese bank account via Napas interbank system."""
    return await napas_client.verify_account(account_number, bank_code)
```

---

## 6. Performance & Cost

### 6.1 Cost Per Agent Task

| Task Type | Avg Tokens (In/Out) | Avg Tool Calls | Claude Sonnet Cost | GPT-4o Cost | Latency |
|-----------|---------------------|----------------|-------------------|-------------|---------|
| Simple Q&A with 1 tool | 2K / 500 | 1 | $0.009 | $0.008 | 2-4s |
| Research (3 searches + synthesis) | 15K / 2K | 4-6 | $0.06 | $0.055 | 15-30s |
| Multi-step workflow (5-10 steps) | 40K / 5K | 8-12 | $0.16 | $0.14 | 45-90s |
| Complex multi-agent task | 100K+ / 10K+ | 20-30 | $0.40+ | $0.35+ | 2-5min |

*Prices as of March 2026. Token costs decrease roughly 30-50% annually.*

### 6.2 Latency Budgets

```
Target: < 5 seconds for first visible token (streaming)
Target: < 30 seconds for simple agent tasks
Target: < 2 minutes for complex multi-step tasks

Breakdown for a typical 5-step agent task:
┌─────────────────────────────────────────────┐
│ Task intake + classification:    500ms      │
│ Planning LLM call:               1.5s      │
│ Tool execution (avg per call):   800ms x5  │
│ Reasoning between tools:         1.2s x4   │
│ Output synthesis:                2.0s      │
│ ────────────────────────────────────────    │
│ Total:                          ~12.8s     │
└─────────────────────────────────────────────┘
```

### 6.3 Token Usage Optimization

```python
# Strategy 1: Sliding window context (keep only recent + summary)
def compress_messages(messages: list, max_tokens: int = 8000) -> list:
    """Keep system prompt + summary of old messages + recent messages."""
    if estimate_tokens(messages) <= max_tokens:
        return messages

    system = messages[0]
    recent = messages[-6:]  # Keep last 3 turns

    # Summarize everything in between
    middle = messages[1:-6]
    summary = llm.invoke(f"Summarize this conversation concisely:\n{format_messages(middle)}")

    return [system, {"role": "assistant", "content": f"[Previous context summary: {summary.content}]"}, *recent]

# Strategy 2: Tool result truncation
def truncate_tool_result(result: str, max_chars: int = 2000) -> str:
    """Truncate verbose tool results to save tokens."""
    if len(result) <= max_chars:
        return result
    return result[:max_chars] + f"\n... [truncated, {len(result) - max_chars} chars omitted]"

# Strategy 3: Use smaller models for simple routing
router_llm = ChatAnthropic(model="claude-haiku-3-20250307")  # Cheap, fast routing
worker_llm = ChatAnthropic(model="claude-sonnet-4-20250514")  # Capable execution
```

### 6.4 Caching Strategies

```python
import hashlib
from functools import lru_cache

class AgentCache:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def cached_tool_call(self, tool_name: str, args: dict, ttl: int = 3600):
        """Cache deterministic tool results (e.g., DB lookups, API calls)."""
        cache_key = f"tool:{tool_name}:{hashlib.md5(json.dumps(args, sort_keys=True).encode()).hexdigest()}"

        cached = await self.redis.get(cache_key)
        if cached:
            return json.loads(cached)

        result = await execute_tool(tool_name, args)
        await self.redis.setex(cache_key, ttl, json.dumps(result))
        return result

    async def cached_llm_call(self, prompt_hash: str, llm_fn, ttl: int = 86400):
        """Cache deterministic LLM calls (e.g., classification, extraction)."""
        cached = await self.redis.get(f"llm:{prompt_hash}")
        if cached:
            return json.loads(cached)

        result = await llm_fn()
        await self.redis.setex(f"llm:{prompt_hash}", ttl, json.dumps(result))
        return result
```

### 6.5 When NOT to Use Agents

| Scenario | Use Instead | Why |
|----------|-------------|-----|
| Single-turn Q&A | Direct LLM call | Agent overhead adds latency and cost for no benefit |
| Deterministic workflows | Traditional code + LLM for specific steps | Agents add unpredictability; hard-code what you can |
| High-volume, low-value tasks | Classification + rules engine | Cost per agent call is too high at 10K+ requests/day |
| Real-time (<500ms) requirements | Pre-computed or cached responses | Agent loops cannot meet sub-second latency |
| Tasks requiring 100% accuracy | Human workflow with AI assist | Agents hallucinate; critical decisions need humans |

---

## 7. Technology Selection Matrix

### 7.1 Framework Comparison

| Criteria (weight) | LangGraph | CrewAI | AutoGen | Semantic Kernel | Custom Build |
|---|---|---|---|---|---|
| **Learning Curve** (0.10) | 7 - Moderate, requires graph thinking | 9 - Simple role-based API | 6 - Complex conversation patterns | 7 - Familiar for .NET devs | 4 - Build everything yourself |
| **Production Readiness** (0.20) | 9 - Battle-tested, LangChain ecosystem | 5 - Maturing, limited enterprise features | 6 - Microsoft backing but frequent API changes | 8 - Enterprise-grade, Azure integration | 8 - Full control, your responsibility |
| **Flexibility** (0.15) | 9 - Arbitrary graph topologies | 6 - Constrained to crew/task model | 7 - Flexible conversation patterns | 7 - Plugin architecture | 10 - Unlimited |
| **Multi-Agent Support** (0.15) | 8 - Via subgraphs and message passing | 9 - Native multi-agent, role-based | 9 - Native group chat, debate patterns | 6 - Plugins, not native multi-agent | 7 - Implement yourself |
| **Streaming & UX** (0.10) | 9 - First-class streaming, LangSmith integration | 5 - Limited streaming support | 5 - Console-oriented | 7 - Good SDK experience | 6 - Build your own |
| **Persistence & Recovery** (0.15) | 9 - Built-in checkpointing (Postgres, SQLite, Redis) | 4 - Manual state management | 5 - Basic conversation persistence | 7 - Azure Durable Functions | 7 - Implement yourself |
| **Ecosystem & Community** (0.10) | 9 - Massive LangChain ecosystem, LangSmith | 7 - Growing community, good docs | 7 - Microsoft ecosystem, active research | 8 - .NET/Azure ecosystem | 3 - No community |
| **Cost Efficiency** (0.05) | 7 - Open source, LangSmith paid | 8 - Open source | 8 - Open source | 7 - Open source, Azure costs | 9 - No framework overhead |
| **Weighted Score** | **8.45** | **6.35** | **6.45** | **7.10** | **6.85** |

### 7.2 Recommendation by Use Case

| Use Case | Recommended | Runner-up | Rationale |
|----------|-------------|-----------|-----------|
| **Startup MVP** | CrewAI | LangGraph | Fastest time-to-prototype for multi-agent |
| **Production SaaS** | LangGraph | Custom | Best balance of control and built-in features |
| **Enterprise (.NET)** | Semantic Kernel | LangGraph | Native .NET, Azure ecosystem alignment |
| **Research/Experimentation** | AutoGen | CrewAI | Best for novel multi-agent patterns |
| **High-scale Production** | Custom + LangGraph components | Custom | Cherry-pick what you need, own the rest |
| **Claude-native Applications** | Claude Agent SDK + LangGraph | LangGraph | Official Anthropic SDK, optimized for Claude tool use |

### 7.3 Decision Flowchart

```
Start
  │
  ├── Do you need multi-agent collaboration?
  │   ├── No → Single agent with tools
  │   │         ├── Simple prototype? → create_react_agent (LangGraph prebuilt)
  │   │         └── Production? → LangGraph custom graph
  │   │
  │   └── Yes → Multi-agent system
  │             ├── .NET/Azure shop? → Semantic Kernel
  │             ├── Quick prototype? → CrewAI
  │             ├── Research patterns? → AutoGen
  │             └── Production Python? → LangGraph with subgraphs
  │
  ├── Do you need persistence & recovery?
  │   ├── Yes → LangGraph (built-in checkpointing)
  │   └── No → Any framework works
  │
  └── Do you need streaming to UI?
      ├── Yes → LangGraph (first-class streaming support)
      └── No → Any framework works
```

---

## Appendix: Quick Reference

### A. Essential Imports

```python
# Core LangGraph
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import create_react_agent, ToolNode
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

# LLM Providers
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI

# Tools
from langchain_core.tools import tool
from langchain_community.tools.tavily_search import TavilySearchResults

# State
from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages
```

### B. Minimal Agent Template (Copy-Paste Starter)

```python
"""Minimal LangGraph agent - copy and customize."""
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool

# 1. State
class State(TypedDict):
    messages: Annotated[list, add_messages]

# 2. Tools
@tool
def search(query: str) -> str:
    """Search the web."""
    return f"Results for: {query}"  # Replace with real search

# 3. LLM with tools
llm = ChatAnthropic(model="claude-sonnet-4-20250514").bind_tools([search])

# 4. Nodes
async def agent(state: State):
    return {"messages": [await llm.ainvoke(state["messages"])]}

async def tools(state: State):
    last = state["messages"][-1]
    results = []
    for tc in last.tool_calls:
        result = await {search.name: search}[tc["name"]].ainvoke(tc["args"])
        results.append({"role": "tool", "content": str(result), "tool_call_id": tc["id"]})
    return {"messages": results}

# 5. Graph
def route(state: State):
    return "tools" if state["messages"][-1].tool_calls else END

graph = StateGraph(State)
graph.add_node("agent", agent)
graph.add_node("tools", tools)
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", route, {"tools": "tools", END: END})
graph.add_edge("tools", "agent")
app = graph.compile()

# 6. Run
if __name__ == "__main__":
    import asyncio
    result = asyncio.run(app.ainvoke({"messages": [{"role": "user", "content": "Search for LangGraph tutorials"}]}))
    print(result["messages"][-1].content)
```

---

*Technical Report B10 -- Dr. Praxis (R-beta) -- MAESTRO Knowledge Graph*
*Cross-references: B04 (Software Engineering), B06 (Optimization), B08 (Conversational AI), B09 (Generative AI), B11 (Knowledge Graphs), B12 (RAG)*
