# AGENT WORKSPACE — Pipeline & Implementation Blueprint

> ⚠️ **LEGACY v0.x — superseded by v1.1 (2026-04-27)**.  
> This monolithic blueprint has been **decomposed** into modular files. For current canonical specs, use:
> - **Pipeline phase docs**: [`@./workspace/docs/pipeline/P0-INTAKE.md`](workspace/docs/pipeline/P0-INTAKE.md) … [`P10-LONG-TERM.md`](workspace/docs/pipeline/P10-LONG-TERM.md) + [`PATH-B/C/D-*.md`](workspace/docs/pipeline/)
> - **Operating workflows**: [`@./workspace/docs/workflows/W01-W12`](workspace/docs/workflows/)
> - **Rules system (11 rules)**: [`@../_shared/rules/`](../_shared/rules/)
> - **Harness operating principles**: [`@../_shared/rules/80-harness-rules.md`](../_shared/rules/80-harness-rules.md)
> - **Agent operating manual**: [`@../_shared/prompts/AGENT-MANUAL.md`](../_shared/prompts/AGENT-MANUAL.md)
>
> File này giữ làm reference history. **KHÔNG dùng làm source-of-truth cho execution**. Conflict với v1.1 → v1.1 thắng (R-MAS-12).

---

**Version:** 1.0 (legacy)  
**Created:** 2026-04-04  
**Superseded:** 2026-04-27 by modular v1.1  
**Status:** Reference only — do not execute from this file  
**Prerequisite:** MAESTRO Knowledge Graph (Baselines + Industries research)

---

## 1. VISION

### 1.1 What This Is

**Agent Workspace** là hệ thống orchestration + visualization cho phép:

1. User gửi yêu cầu (re-research kiến thức hoặc bài toán dự án thực tế)
2. Hệ thống tự động pick đúng combo **Baseline(s) + Industry + Agent team**
3. Agents làm việc theo pipeline — trao đổi, challenge, produce reports
4. User theo dõi real-time qua web interface (Mission Control + 3D Office)
5. Output: reports, architecture docs, implementation guides, JSON knowledge nodes

### 1.2 What This Is NOT

- ❌ Không thay thế MAESTRO Knowledge Graph (đó là kho kiến thức)
- ❌ Không phải code generator (agents produce knowledge, not deployable code)
- ❌ Không phải chatbot đơn thuần (đây là multi-agent orchestration system)

### 1.3 Relationship với MAESTRO Knowledge Graph

```
MAESTRO Knowledge Graph          Agent Workspace
━━━━━━━━━━━━━━━━━━━━━           ━━━━━━━━━━━━━━━
Kho vũ khí kiến thức             Phòng chỉ huy tác chiến
B01-B15 Baselines                Pick B + I + Agents
I01-I20 Industries               Orchestrate pipeline
300 Matrix Nodes                 Real-time monitoring
Agent Skill Cards                Agent execution engine
SOP & Conventions                Automated workflow

         Knowledge Graph ──feeds context──▶ Agent Workspace
         Agent Workspace ──enriches──▶ Knowledge Graph
```

---

## 2. ARCHITECTURE

### 2.1 Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 3: VISUALIZATION                                 │
│  ├── Mission Control Dashboard (React, ship first)      │
│  └── 3D Virtual Office (Three.js low-poly, ship later)  │
└─────────────────────┬───────────────────────────────────┘
                      │ WebSocket / SSE (real-time events)
┌─────────────────────┴───────────────────────────────────┐
│  LAYER 2: ORCHESTRATION ENGINE (core)                   │
│  ├── Task Decomposer (request → task graph)             │
│  ├── Agent Dispatcher (assign tasks → agents)           │
│  ├── State Machine (track agent states + transitions)   │
│  ├── Message Bus (agent-to-agent communication)         │
│  └── Checkpoint Manager (save/resume pipeline)          │
└─────────────────────┬───────────────────────────────────┘
                      │ Claude API calls (1 per agent step)
┌─────────────────────┴───────────────────────────────────┐
│  LAYER 1: KNOWLEDGE CONTEXT                             │
│  ├── Baseline JSONs (data/baselines/B01-B15.json)       │
│  ├── Industry JSONs (data/industries/I01-I20.json)      │
│  ├── Agent Skill Cards (.agents/tier-*/R-*.md)          │
│  ├── SOP & Templates (docs/SOP-AGENT-PROCESS.md)       │
│  └── Previous Reports (docs/reports/{MODULE_ID}/)       │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Tech Stack

```yaml
orchestration_engine:
  runtime: "Node.js (Next.js API Routes)"
  ai_api: "Claude API (claude-sonnet-4-20250514)"
  state: "Zustand (client) + in-memory state machine (server)"
  realtime: "Server-Sent Events (SSE) — simpler than WebSocket, sufficient"
  queue: "In-process async queue (Phase 1) → BullMQ + Redis (Phase 2+)"
  storage: "File system (JSON + Markdown) — Git-tracked"

visualization:
  framework: "Next.js 16 + React"
  dashboard: "shadcn/ui + Tailwind + Recharts (timeline)"
  3d_office: "Three.js (low-poly scene, later phase)"
  streaming: "react-markdown (stream agent output as it generates)"

data:
  knowledge_base: "JSON files from MAESTRO Knowledge Graph"
  reports: "Markdown files in docs/reports/"
  pipeline_state: "JSON file per project run"
```

---

## 3. PIPELINE — TWO MODES

### 3.1 Mode A: Knowledge Re-Research

Dùng khi nâng chất kiến thức trong kho (Round 2, Round 3...).

```
USER INPUT:
  "Re-research B14 Speech & Audio — update SOTA 2025-2026"

SYSTEM AUTO-DETECTS:
  Mode: Re-research
  Module: B14
  Current score: 6.4 (Tier B)
  Gap list: từ round-2-research-plan.md

PIPELINE:
  ┌─ Step 1: Load Context ─────────────────────────────┐
  │  • B14.json (current knowledge)                     │
  │  • docs/reports/B14/ (all existing reports)         │
  │  • round-2-research-plan.md (gap list for B14)     │
  │  • R-alpha skill card + relevant SOP section        │
  └─────────────────────────────────────────────────────┘
        │
        ▼
  ┌─ Step 2: α Research (gap-targeted) ─────────────────┐
  │  System prompt: R-alpha skill card                   │
  │  Context: B14.json + gap list + existing report      │
  │  Task: "Update these specific gaps: [gap list]"      │
  │  Tools: web_search enabled                           │
  │  Output: research-report-r2.md                       │
  │  Stream: real-time to dashboard                      │
  └─────────────────────────────────────────────────────┘
        │
        ▼
  ┌─ Step 3: γ Re-Score ────────────────────────────────┐
  │  System prompt: R-gamma skill card + scoring formula  │
  │  Context: updated research + existing tech-report     │
  │  Task: "Re-evaluate with 30/30/20/20 formula"       │
  │  Output: feasibility-report-r2.md + new score        │
  └─────────────────────────────────────────────────────┘
        │
        ▼
  ┌─ Step 4: σ Consolidate ─────────────────────────────┐
  │  System prompt: R-sigma skill card                    │
  │  Context: ALL reports (old + new)                    │
  │  Task: "Update final-report + JSON node"             │
  │  Output: final-report-r2.md + B14.json (updated)    │
  └─────────────────────────────────────────────────────┘
        │
        ▼
  ┌─ Step 5: Quality Gate ──────────────────────────────┐
  │  Automated: JSON schema validation                   │
  │  Automated: Score ≥ 7.0 check                        │
  │  Manual: Manager review flagged items                │
  │  PASS → commit to knowledge graph                    │
  │  FAIL → rollback + log failure reason                │
  └─────────────────────────────────────────────────────┘
```

### 3.2 Mode B: Real Project Research

Dùng khi có bài toán thực tế cần giải.

```
USER INPUT:
  "Khách hàng logistics cần hệ thống dự đoán nhu cầu vận tải.
   Budget: $50K, Timeline: 3 tháng, Team: 2 ML engineers + 1 backend.
   Data: 2 năm lịch sử đơn hàng, GPS tracking, weather API."

SYSTEM AUTO-DETECTS:
  Mode: Real project
  Baselines: B01 (Forecasting) + B06 (Optimization)
  Industry: I06 (Logistics)
  Scale: MVP → Production

PIPELINE:
  ┌─ Phase 1: BRIEFING (automated, ~2 min) ────────────┐
  │                                                      │
  │  1a. Parse request → extract requirements            │
  │  1b. Match Baselines: similarity search in B01-B15   │
  │  1c. Match Industry: classify to I01-I20             │
  │  1d. Load knowledge context:                         │
  │      • B01.json + B06.json (baseline knowledge)      │
  │      • I06.json (industry knowledge)                 │
  │      • B01-I06 matrix node (if exists)               │
  │  1e. Auto-select agent team:                         │
  │      Layer 1: α, β, γ (always)                       │
  │      Layer 2: R-MLE, R-DE, R-BE, R-DO, R-D06        │
  │      Layer 3: σ (always)                             │
  │  1f. Generate project brief → user confirms          │
  │                                                      │
  │  OUTPUT: project-brief.md (auto-generated)           │
  │  USER ACTION: review + confirm/modify team           │
  └──────────────────────────────────────────────────────┘
        │ user confirms
        ▼
  ┌─ Phase 2: DEEP RESEARCH (α, ~15-20 min) ───────────┐
  │                                                      │
  │  Context loaded:                                     │
  │  • Project brief                                     │
  │  • B01.json + B06.json (pre-researched knowledge)    │
  │  • I06.json (industry context)                       │
  │  • Client constraints (budget, timeline, team)       │
  │                                                      │
  │  α produces:                                         │
  │  • Adapted SOTA review (filtered for this use case)  │
  │  • Recommended algorithms (with justification)       │
  │  • Architecture options (2-3 alternatives)           │
  │  • Data requirements assessment                      │
  │  • Risk identification                               │
  │                                                      │
  │  OUTPUT: research-report.md                          │
  │  STREAM: real-time paragraphs to dashboard           │
  └──────────────────────────────────────────────────────┘
        │
        ▼
  ┌─ Phase 3: TECH DESIGN (β, ~15-20 min) ─────────────┐
  │                                                      │
  │  Context: project brief + α output + baseline tech   │
  │                                                      │
  │  β produces:                                         │
  │  • Recommended tech stack (with cost estimate)       │
  │  • Pipeline architecture (detailed diagram)          │
  │  • API design (endpoints, data contracts)            │
  │  • Infrastructure requirements                       │
  │  • Implementation timeline (sprint plan)             │
  │  • Code patterns + starter templates                 │
  │                                                      │
  │  OUTPUT: tech-report.md                              │
  │  PARALLEL: Layer 2 agents run simultaneously         │
  │            R-MLE: model selection + training plan     │
  │            R-DE: data pipeline design                 │
  │            R-BE: API architecture notes               │
  │            R-DO: deployment strategy                  │
  │            R-D06: logistics domain validation         │
  └──────────────────────────────────────────────────────┘
        │
        ▼
  ┌─ Phase 4: EVALUATION (γ, ~10-15 min) ──────────────┐
  │                                                      │
  │  Context: ALL previous outputs + market data          │
  │                                                      │
  │  γ produces:                                         │
  │  • Feasibility score (30/30/20/20 formula)           │
  │  • Budget fit analysis                               │
  │  • Timeline risk assessment                          │
  │  • Competitive landscape (existing solutions)        │
  │  • GO / CONDITIONAL GO / NO-GO verdict               │
  │  • Challenges to α and β (specific disagreements)    │
  │                                                      │
  │  OUTPUT: feasibility-report.md                       │
  └──────────────────────────────────────────────────────┘
        │
        ▼
  ┌─ Phase 5: CONSOLIDATION (σ, ~10-15 min) ───────────┐
  │                                                      │
  │  Context: ALL reports from ALL agents                 │
  │                                                      │
  │  σ produces:                                         │
  │  • Executive summary (1-page, for client/manager)    │
  │  • Full project report (Vietnamese)                  │
  │  • Implementation checklist                          │
  │  • Risk register with mitigations                    │
  │  • Recommended next steps                            │
  │                                                      │
  │  OUTPUT: final-report.md + project-summary.md        │
  └──────────────────────────────────────────────────────┘
        │
        ▼
  ┌─ Phase 6: DELIVERY ─────────────────────────────────┐
  │                                                      │
  │  All reports packaged:                               │
  │  • /projects/{PROJECT_ID}/                           │
  │    ├── project-brief.md                              │
  │    ├── research-report.md                            │
  │    ├── tech-report.md                                │
  │    ├── feasibility-report.md                         │
  │    ├── layer2/{ROLE_ID}-notes.md (×N)                │
  │    ├── final-report.md                               │
  │    └── project-summary.md (executive, 1-page)        │
  │                                                      │
  │  Optional: feed back into Knowledge Graph            │
  │  (new insights → update B01.json, I06.json)          │
  └──────────────────────────────────────────────────────┘
```

---

## 4. ORCHESTRATION ENGINE — DETAILED DESIGN

### 4.1 State Machine

Mỗi agent trong pipeline có 6 trạng thái:

```
IDLE ──dispatch──▶ LOADING_CONTEXT ──ready──▶ WORKING
                                                 │
                                    ┌────────────┤
                                    │            │
                                    ▼            ▼
                                CHALLENGE    COMPLETED
                                (debate)        │
                                    │       ──handoff──▶ next agent
                                    └──resolve──▶ COMPLETED

ERROR ◀── (any state can transition to ERROR)
  └── retry (max 2) or escalate to user
```

### 4.2 Agent Execution Model

Mỗi agent step = 1 Claude API call:

```javascript
// Pseudocode — single agent execution
async function executeAgent(agentConfig) {
  const { agentId, skillCard, context, task, previousOutput } = agentConfig;
  
  // 1. Build system prompt from skill card
  const systemPrompt = buildSystemPrompt(skillCard, task);
  
  // 2. Build user message with context
  const userMessage = buildContextMessage({
    projectBrief: context.brief,
    previousAgentOutput: previousOutput,
    knowledgeBase: context.relevantNodes,  // B01.json, I06.json...
    constraints: context.constraints,
    gapList: context.gaps,                 // for re-research mode
  });
  
  // 3. Call Claude API with streaming
  const stream = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    stream: true,
    tools: agentId === "alpha" ? [webSearchTool] : [],  // α gets web search
  });
  
  // 4. Stream events to frontend
  for await (const event of stream) {
    emitToFrontend({
      agentId,
      type: "chunk",
      content: event.delta?.text,
      timestamp: Date.now(),
    });
  }
  
  // 5. Save checkpoint
  await saveCheckpoint(agentId, fullOutput);
  
  // 6. Return for next agent
  return { agentId, output: fullOutput, status: "completed" };
}
```

### 4.3 Pipeline Orchestrator

```javascript
// Pseudocode — pipeline orchestration
async function runPipeline(projectConfig) {
  const { mode, modules, industry, agents, brief } = projectConfig;
  
  // Phase 1: Load all knowledge context
  const context = await loadContext(modules, industry);
  
  // Phase 2: Execute Layer 1 (sequential)
  const alphaOutput = await executeAgent({
    agentId: "alpha",
    skillCard: loadSkillCard("R-alpha"),
    context,
    task: brief,
    previousOutput: null,
  });
  
  const betaOutput = await executeAgent({
    agentId: "beta",
    skillCard: loadSkillCard("R-beta"),
    context,
    task: brief,
    previousOutput: alphaOutput,
  });
  
  // Phase 3: Layer 2 (parallel) — runs alongside or after β
  const layer2Outputs = await Promise.all(
    agents.layer2.map(role =>
      executeAgent({
        agentId: role.id,
        skillCard: loadSkillCard(role.id),
        context,
        task: brief,
        previousOutput: null,  // Layer 2 researches independently
      })
    )
  );
  
  const gammaOutput = await executeAgent({
    agentId: "gamma",
    skillCard: loadSkillCard("R-gamma"),
    context,
    task: brief,
    previousOutput: { alpha: alphaOutput, beta: betaOutput },
  });
  
  // Phase 4: Consolidation (σ reads everything)
  const sigmaOutput = await executeAgent({
    agentId: "sigma",
    skillCard: loadSkillCard("R-sigma"),
    context,
    task: brief,
    previousOutput: {
      alpha: alphaOutput,
      beta: betaOutput,
      gamma: gammaOutput,
      layer2: layer2Outputs,
    },
  });
  
  // Phase 5: Quality gate
  const qgResult = await runQualityGate(sigmaOutput, mode);
  
  return {
    status: qgResult.passed ? "COMPLETE" : "NEEDS_REVIEW",
    reports: collectAllReports(),
    score: qgResult.score,
  };
}
```

### 4.4 Context Builder — Smart Knowledge Loading

```
RULE: Load MINIMUM context needed (Hermes H2 principle).
      Claude API has token limits — don't dump everything.

CONTEXT LOADING STRATEGY:

For α (Research):
  LOAD:  Baseline JSON (full), Industry JSON (summary only),
         Gap list (if re-research), project brief
  SKIP:  Previous tech-report, Layer 2 notes
  TOOLS: web_search enabled

For β (Engineering):
  LOAD:  α output (full), Baseline JSON (techStack + pipeline sections),
         project brief (constraints section)
  SKIP:  Industry JSON (α already synthesized), full research-report
  TOOLS: none (uses α's research as source)

For γ (Evaluation):
  LOAD:  α output (summary), β output (summary),
         Industry JSON (market section), project brief
  SKIP:  Full research details (γ evaluates, not researches)
  TOOLS: web_search (for market data, competitor lookup)

For Layer 2 (Practical roles):
  LOAD:  Project brief, role-specific skill card,
         Baseline JSON (section relevant to that role only)
  SKIP:  Other Layer 2 outputs, Layer 1 full reports
  TOOLS: none

For σ (Consolidation):
  LOAD:  ALL outputs (α, β, γ, Layer 2) — full
  SKIP:  Raw baseline/industry JSONs (already synthesized by others)
  TOOLS: none
```

### 4.5 Checkpoint & Resume

```
Mỗi agent hoàn thành → save checkpoint:

/projects/{PROJECT_ID}/
├── _state.json                    # Pipeline state machine snapshot
├── _checkpoints/
│   ├── alpha.json                 # { status, output_path, timestamp }
│   ├── beta.json
│   ├── gamma.json
│   ├── sigma.json
│   └── layer2/
│       ├── R-MLE.json
│       ├── R-DE.json
│       └── ...
├── research-report.md             # α output
├── tech-report.md                 # β output
├── feasibility-report.md          # γ output
├── layer2/
│   ├── R-MLE-notes.md
│   └── ...
├── final-report.md                # σ output
└── project-summary.md             # σ executive summary

RESUME LOGIC:
  On pipeline restart:
  1. Read _state.json
  2. Find last completed checkpoint
  3. Resume from next agent in sequence
  4. Load previous agent outputs from saved files
  5. Continue pipeline as normal
```

---

## 5. VISUALIZATION LAYER

### 5.1 Mission Control Dashboard (Ship First)

```
LAYOUT (desktop):
┌──────────────────────────────────────────────────────┐
│  HEADER: Project name + mode badge + elapsed time    │
├──────────────┬───────────────────────────────────────┤
│              │                                       │
│  LEFT PANEL  │  MAIN AREA                            │
│  (280px)     │                                       │
│              │  ┌─ Pipeline Progress ──────────────┐ │
│  Project     │  │  ● α ──▶ ◉ β ──▶ ○ γ ──▶ ○ σ   │ │
│  Config      │  │  (done)  (work)  (wait)  (wait)  │ │
│              │  └──────────────────────────────────┘ │
│  Team        │                                       │
│  Roster      │  ┌─ Active Agent Card ─────────────┐ │
│              │  │  β Dr. Praxis — WORKING          │ │
│  Knowledge   │  │  Task: Tech stack analysis       │ │
│  Context     │  │  ┌─ Live Output ──────────────┐  │ │
│  (B01, I06)  │  │  │  [streaming markdown...]   │  │ │
│              │  │  │  ...real-time agent output  │  │ │
│              │  │  └─────────────────────────────┘  │ │
│  Quick       │  └──────────────────────────────────┘ │
│  Actions     │                                       │
│              │  ┌─ Activity Log ───────────────────┐ │
│              │  │  14:23 α: Completed research      │ │
│              │  │  14:25 β: Analyzing tech stack...  │ │
│              │  │  14:27 β: Comparing frameworks...  │ │
│              │  └──────────────────────────────────┘ │
│              │                                       │
├──────────────┴───────────────────────────────────────┤
│  FOOTER: Token usage | Est. time remaining | Cost    │
└──────────────────────────────────────────────────────┘
```

**Key Components:**

| Component | Purpose | Tech |
|-----------|---------|------|
| PipelineProgress | Visual timeline of agent pipeline | React + CSS |
| AgentCard | Shows active agent status + live output | react-markdown + SSE |
| ActivityLog | Chronological event stream | Virtualized list |
| TeamRoster | Agent avatars with status indicators | Grid of cards |
| KnowledgeContext | Shows which B + I nodes are loaded | Tag chips |
| ReportViewer | Read completed reports | Markdown renderer |

### 5.2 3D Virtual Office (Build After Dashboard Works)

**Style: Low-poly, flat-shaded, neon-accent sci-fi**  
(Consistent with MAESTRO's dark theme + neon green palette)

```
SCENE LAYOUT (top-down view):

    ┌─────────────────────────────────────────┐
    │              WHITEBOARD                   │
    │   (shows pipeline diagram, live updates)  │
    ├─────────────────────────────────────────┤
    │                                           │
    │    [α desk]        [β desk]               │
    │    Dr. Archon      Dr. Praxis             │
    │                                           │
    │              [round table]                 │
    │              (debate zone)                 │
    │                                           │
    │    [γ desk]        [σ desk]               │
    │    Dr. Sentinel    Ms. Scribe             │
    │                                           │
    │    ┌─── Layer 2 area ──────────────┐      │
    │    │  [desk] [desk] [desk] [desk]  │      │
    │    │  R-MLE  R-DE   R-BE   R-D06   │      │
    │    └───────────────────────────────┘      │
    │                                           │
    └─────────────────────────────────────────┘
```

**Agent Avatar Behaviors:**

```yaml
states:
  idle:
    animation: "sitting, slight breathing motion"
    visual: "dim glow, gray tint"
    
  loading_context:
    animation: "reading documents at desk"
    visual: "papers appearing on desk"
    
  working:
    animation: "typing at computer, occasional thinking pose"
    visual: "bright glow (agent's color), screen light on face"
    speech_bubble: "streaming output summary (key phrases)"
    
  challenge:
    animation: "stands up, walks to round table"
    visual: "red/amber glow, exclamation indicator"
    speech_bubble: "challenge point (short)"
    
  completed:
    animation: "stands, carries document to next agent's desk"
    visual: "green checkmark, document hand-off animation"
    
  error:
    animation: "confused gesture, red alert on screen"
    visual: "red glow, error icon"

transitions:
  handoff: "agent A stands → walks to agent B's desk → hands document → returns"
  debate: "2 agents walk to round table → speech bubbles alternate → resolve → return"
  parallel: "Layer 2 agents all typing simultaneously, slight variation in rhythm"
```

**Three.js Implementation Approach:**

```yaml
scene:
  background: "#010A05"  # MAESTRO dark theme
  lighting:
    ambient: { color: "#0A1A10", intensity: 0.3 }
    point_lights:
      - { position: [0, 8, 0], color: "#00FF88", intensity: 0.5 }  # center green
      - { position: [-5, 6, 3], color: "#00E5FF", intensity: 0.3 } # cyan accent

  floor:
    geometry: "PlaneGeometry(20, 16)"
    material: "grid pattern (reuse MAESTRO GridFloor component)"

  furniture:
    style: "Low-poly, flat-shaded (no textures, solid colors)"
    desks: "BoxGeometry, dark gray (#1A1A2E), slight bevel"
    chairs: "Simple geometric, match agent color accent"
    screens: "PlaneGeometry with emissive material (shows agent output)"
    whiteboard: "Large PlaneGeometry, shows pipeline SVG"
    round_table: "CylinderGeometry, center of room"

  agents:
    model: "Simple humanoid (capsule body + sphere head + limb cylinders)"
    # NOT realistic — stylized geometric characters
    # Each agent has unique color accent matching their role:
    alpha_color: "#00FF88"   # Neon green (research)
    beta_color: "#00E5FF"    # Cyan (engineering)
    gamma_color: "#FF6B35"   # Coral (evaluation)
    sigma_color: "#FFD700"   # Gold (consolidation)
    layer2_color: "#8B5CF6"  # Purple (practical roles)

  camera:
    type: "PerspectiveCamera"
    position: [0, 12, 10]  # 45-degree overhead view
    controls: "OrbitControls (constrained — pan + zoom, limited rotation)"
    auto_focus: "camera smoothly pans to active agent when state changes"

  effects:
    particles: "Reuse ShootingStars from MAESTRO (subtle, background)"
    glow: "Active agent desk has soft glow shell"
    speech_bubbles: "CSS overlay positioned via CSS2DRenderer"
```

**Interaction Model:**

```
Click agent avatar → opens agent detail panel (side panel)
  Shows: current task, live output stream, status history

Click whiteboard → shows full pipeline diagram (overlay)

Click round table → shows debate log (when agents challenge each other)

Toggle button → switch between "3D Office View" and "Dashboard View"

Mobile → auto-fallback to Dashboard View only (no 3D)
```

---

## 6. REAL-TIME EVENT SYSTEM

### 6.1 Event Types

```typescript
type WorkspaceEvent = {
  timestamp: number;
  projectId: string;
} & (
  | { type: "pipeline.started"; agents: string[]; mode: "research" | "project" }
  | { type: "agent.state_changed"; agentId: string; from: AgentState; to: AgentState }
  | { type: "agent.output_chunk"; agentId: string; chunk: string }
  | { type: "agent.completed"; agentId: string; outputPath: string; summary: string }
  | { type: "agent.error"; agentId: string; error: string; retryCount: number }
  | { type: "handoff"; from: string; to: string; documentPath: string }
  | { type: "challenge"; from: string; to: string; point: string }
  | { type: "quality_gate.result"; passed: boolean; score: number; issues: string[] }
  | { type: "pipeline.completed"; totalTime: number; reportPaths: string[] }
);
```

### 6.2 SSE Endpoint

```
GET /api/workspace/{projectId}/events

Headers:
  Content-Type: text/event-stream
  Cache-Control: no-cache
  Connection: keep-alive

Events streamed:
  data: {"type":"agent.state_changed","agentId":"beta","to":"working",...}
  data: {"type":"agent.output_chunk","agentId":"beta","chunk":"Analyzing..."}
  data: {"type":"agent.completed","agentId":"beta","summary":"Tech stack selected"}
  ...
```

### 6.3 Frontend Event Handling

```
Dashboard:
  agent.state_changed → update agent card status + pipeline progress bar
  agent.output_chunk  → append to live output stream (markdown render)
  agent.completed     → flash checkmark, enable "View Report" button
  handoff             → animate progress bar transition
  challenge           → show debate indicator between 2 agent cards
  pipeline.completed  → show completion banner + report download links

3D Office:
  agent.state_changed → trigger avatar animation transition
  agent.output_chunk  → update speech bubble text (last 50 chars)
  agent.completed     → trigger handoff walk animation
  handoff             → agent A walks document to agent B
  challenge           → both agents walk to round table, speech bubbles
  pipeline.completed  → all agents stand, celebration animation
```

---

## 7. API ENDPOINTS

```
POST   /api/workspace/projects              # Create new project (auto or manual config)
GET    /api/workspace/projects              # List all projects
GET    /api/workspace/projects/{id}         # Get project details + status
POST   /api/workspace/projects/{id}/start   # Start pipeline execution
POST   /api/workspace/projects/{id}/pause   # Pause pipeline (checkpoint)
POST   /api/workspace/projects/{id}/resume  # Resume from checkpoint
GET    /api/workspace/projects/{id}/events  # SSE event stream
GET    /api/workspace/projects/{id}/reports # List generated reports
GET    /api/workspace/projects/{id}/reports/{filename}  # Get report content

POST   /api/workspace/knowledge/match       # Match request → B + I + agents
GET    /api/workspace/agents                # List available agents + status
GET    /api/workspace/agents/{id}/skill-card  # Get agent skill card

# Re-research specific
POST   /api/workspace/reresearch            # Start re-research for a module
GET    /api/workspace/reresearch/plan       # Get current round plan
```

---

## 8. IMPLEMENTATION PHASES

### Phase W1: Orchestration Engine MVP (Week 1-2)

```
Goal: Pipeline chạy được end-to-end qua API, chưa cần UI đẹp.

Tasks:
  □ Project model + state machine
  □ Agent executor (single agent → Claude API call)
  □ Pipeline orchestrator (α → β → γ → σ sequential)
  □ Context builder (load B/I JSONs + skill cards)
  □ Checkpoint save/load
  □ SSE event endpoint
  □ Basic test: run Mode A (re-research B14) → verify output

Exit criteria:
  - POST /api/workspace/projects creates project
  - POST /api/workspace/projects/{id}/start triggers full pipeline
  - Events stream correctly via SSE
  - Reports saved to /projects/{id}/
  - Checkpoint allows resume after interruption
```

### Phase W2: Mission Control Dashboard (Week 2-3)

```
Goal: Web UI hiển thị pipeline real-time.

Tasks:
  □ Project creation form (input request + auto-detect mode)
  □ Pipeline progress bar component
  □ Agent status cards (4 PhD + N Layer 2)
  □ Live output stream (react-markdown + SSE)
  □ Activity log (chronological events)
  □ Report viewer (markdown with syntax highlighting)
  □ Team roster with knowledge context chips

Exit criteria:
  - User creates project via UI
  - Sees agents working in real-time
  - Reads streaming output as agents write
  - Downloads completed reports
  - Pipeline pause/resume works from UI
```

### Phase W3: Parallel Pipeline + Layer 2 (Week 3-4)

```
Goal: Full pipeline with parallel execution.

Tasks:
  □ Layer 2 parallel execution (Promise.all for practical roles)
  □ Agent team auto-selection (based on module type)
  □ β + Layer 2 parallel (β and Layer 2 run simultaneously)
  □ Challenge/debate visualization in dashboard
  □ Quality gate automation (JSON schema check + score threshold)
  □ Mode B: Real project pipeline (full flow)
  □ Project history + re-run

Exit criteria:
  - Mode A (re-research) works fully with auto team selection
  - Mode B (real project) works with user confirmation step
  - Layer 2 agents run in parallel, results consolidated by σ
  - Quality gate auto-checks score ≥ 7.0
```

### Phase W4: 3D Virtual Office (Week 4-6)

```
Goal: 3D low-poly office visualization layer.

Tasks:
  □ Scene setup (room, furniture, lighting — Three.js)
  □ Agent avatar model (geometric humanoid, 6 poses)
  □ Avatar state machine (idle/working/walking/debating animations)
  □ Speech bubble system (CSS2DRenderer overlay)
  □ Event-driven animation (SSE events → avatar behaviors)
  □ Camera auto-focus (smooth pan to active agent)
  □ Handoff animation (walk + document pass)
  □ Toggle between Dashboard view and 3D Office view
  □ Mobile detection → force Dashboard view

Exit criteria:
  - 3D office renders with all agent avatars
  - Avatars animate correctly based on pipeline events
  - Camera follows active agent
  - Speech bubbles show agent thinking in real-time
  - Toggle between views works seamlessly
  - Performance: 60fps on mid-range laptop
```

### Phase W5: Polish & Advanced (Week 6+)

```
Goal: Production quality, advanced features.

Tasks:
  □ User intervention mid-pipeline (redirect agent, give feedback)
  □ Debate visualization (2 agents at round table)
  □ Token usage + cost tracking dashboard
  □ Project templates (common project types pre-configured)
  □ Export reports as PDF/DOCX
  □ Knowledge Graph feedback loop (project insights → update B/I JSONs)
  □ Multi-project parallel execution
  □ Whiteboard component (shows pipeline + progress in 3D)
```

---

## 9. FILE STRUCTURE

```
maestro-knowledge-graph/
├── src/
│   ├── app/
│   │   ├── workspace/                    # Agent Workspace pages
│   │   │   ├── page.tsx                  # Workspace home — project list
│   │   │   ├── new/page.tsx              # Create new project
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx              # Project view (dashboard + 3D toggle)
│   │   │       └── reports/page.tsx      # Report viewer
│   │   └── api/
│   │       └── workspace/
│   │           ├── projects/route.ts     # CRUD projects
│   │           ├── projects/[id]/
│   │           │   ├── route.ts          # Project details
│   │           │   ├── start/route.ts    # Start pipeline
│   │           │   ├── events/route.ts   # SSE stream
│   │           │   └── reports/route.ts  # Reports
│   │           ├── knowledge/
│   │           │   └── match/route.ts    # Auto-match B + I
│   │           └── agents/route.ts       # Agent listing
│   │
│   ├── components/
│   │   └── workspace/
│   │       ├── dashboard/
│   │       │   ├── PipelineProgress.tsx
│   │       │   ├── AgentCard.tsx
│   │       │   ├── LiveOutputStream.tsx
│   │       │   ├── ActivityLog.tsx
│   │       │   ├── TeamRoster.tsx
│   │       │   ├── KnowledgeContext.tsx
│   │       │   └── ReportViewer.tsx
│   │       ├── office3d/
│   │       │   ├── OfficeScene.tsx       # Three.js scene setup
│   │       │   ├── AgentAvatar.tsx       # Geometric humanoid
│   │       │   ├── Furniture.tsx         # Desks, chairs, table
│   │       │   ├── Whiteboard.tsx        # Pipeline display
│   │       │   ├── SpeechBubble.tsx      # CSS2D overlay
│   │       │   └── OfficeCamera.tsx      # Camera controls
│   │       └── shared/
│   │           ├── ProjectForm.tsx
│   │           ├── ViewToggle.tsx        # Dashboard ↔ 3D
│   │           └── CostTracker.tsx
│   │
│   ├── lib/
│   │   └── workspace/
│   │       ├── orchestrator.ts           # Pipeline orchestrator
│   │       ├── agent-executor.ts         # Single agent execution
│   │       ├── context-builder.ts        # Smart context loading
│   │       ├── state-machine.ts          # Agent state management
│   │       ├── checkpoint.ts             # Save/resume
│   │       ├── knowledge-matcher.ts      # Auto-match B + I
│   │       ├── quality-gate.ts           # Automated checks
│   │       └── event-emitter.ts          # SSE event system
│   │
│   └── types/
│       └── workspace.ts                  # TypeScript interfaces
│
├── projects/                             # Project outputs (git-tracked)
│   └── {PROJECT_ID}/
│       ├── _state.json
│       ├── _checkpoints/
│       ├── research-report.md
│       ├── tech-report.md
│       ├── feasibility-report.md
│       ├── layer2/
│       ├── final-report.md
│       └── project-summary.md
│
├── data/                                 # Knowledge Graph (existing)
│   ├── baselines/
│   ├── industries/
│   └── graph.json
│
└── .agents/                              # Agent skill cards (existing)
    ├── tier-1-research/
    ├── tier-2-engineering/
    ├── tier-3-domain/
    └── tier-4-delivery/
```

---

## 10. COST ESTIMATION

### Per Pipeline Run (Claude API)

```
Mode A (re-research, Tier B — 3 agents):
  α: ~4K input + ~4K output = ~8K tokens
  γ: ~3K input + ~2K output = ~5K tokens  
  σ: ~8K input + ~4K output = ~12K tokens
  Total: ~25K tokens ≈ $0.15-0.25

Mode A (re-research, Tier A — full pipeline):
  α + β + γ + σ + 8 Layer 2 = ~12 agent calls
  Total: ~120K tokens ≈ $0.80-1.50

Mode B (real project — full pipeline):
  Layer 1: 4 agents × ~15K avg = ~60K tokens
  Layer 2: 6 agents × ~8K avg = ~48K tokens
  Total: ~108K tokens ≈ $0.70-1.20

Note: Using claude-sonnet-4 (not opus) keeps costs low.
      Opus reserved for quality-critical re-runs only.
```

---

## 11. OPTIMIZATION STRATEGIES

### 11.1 Token Optimization

```
1. SUMMARIZE before passing to next agent:
   α produces 4000 words → extract 800-word structured summary for β
   Saves 3200 tokens per handoff

2. SECTION-SPECIFIC loading:
   β only needs techStack + pipeline from baseline JSON, not full node
   γ only needs market + risk sections

3. SKILL CARD compression:
   Full skill cards are 2000+ tokens each
   Create "runtime" versions: 500 tokens with only essential instructions

4. CACHE common context:
   Industry JSONs rarely change — cache in memory
   Baseline JSONs — invalidate cache only on update
```

### 11.2 Speed Optimization

```
1. PARALLEL Layer 2:
   8 agents run simultaneously → total time = max(single agent)
   Instead of 8 × 3min = 24min → becomes 3min

2. STREAMING output:
   User sees agent "thinking" immediately
   No waiting for full completion before displaying

3. PRELOAD next agent:
   While α is finishing, preload β's context
   Handoff latency: < 2 seconds

4. EARLY TERMINATION:
   If γ scores < 4.0 (NO-GO), skip σ consolidation
   Save time + tokens on clearly unviable projects
```

### 11.3 Quality Optimization

```
1. STRUCTURED OUTPUT:
   Force agents to output in specific markdown template
   Easier to parse, validate, and display

2. CITATION TRACKING:
   α must cite sources → downstream agents can verify
   Reduces hallucination propagation

3. CROSS-VALIDATION:
   γ explicitly challenges α and β
   Debate log preserved for user review

4. SCORE CALIBRATION:
   Use calibration anchors (see round-2-research-plan.md)
   Consistent scoring across all modules and projects
```

---

*Agent Workspace Pipeline Blueprint v1.0*  
*Created: 2026-04-04*  
*Next: Implement Phase W1 (Orchestration Engine MVP)*
