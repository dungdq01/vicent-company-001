# Knowledge Node Data Schema

**Version:** 1.0  
**Used by:** All agents when creating knowledge node JSON files

---

## 1. NODE TYPES

```
TYPE 1: Baseline Node (B01-B15)
  → AI capability module (e.g., Forecasting, Computer Vision)
  → Deepest knowledge, most content

TYPE 2: Industry Node (I01-I20)  
  → Industry profile (e.g., Retail, Healthcare)
  → Domain context, pain points, data characteristics

TYPE 3: Matrix Node (BXX-IXX)
  → Intersection of Baseline × Industry
  → Industry-specific application of a capability

TYPE 4: Infrastructure Node (C01-C06)
  → Supporting capabilities (MLOps, Data Engineering, etc.)

TYPE 5: Strategy Node (D01-D06)
  → Business/consulting topics (AI Readiness, ROI, etc.)
```

---

## 1.5 DEPTH LEVEL REQUIREMENTS — Which fields at which level

Agents MUST only populate fields required at the target depth. This prevents over-work at L1 and ensures completeness at L3.

```
FIELD                          L1(skeleton)  L2(overview)  L3(deep)
─────────────────────────────────────────────────────────────────────
IDENTITY (id,name,slug,etc)    REQUIRED      REQUIRED      REQUIRED
overview.description           REQUIRED(1p)  REQUIRED(2p)  REQUIRED(3p)
overview.keyQuestions           —             REQUIRED      REQUIRED
overview.whenToUse/NotUse      —             REQUIRED      REQUIRED

academicFoundations.fieldTaxonomy    —       —             REQUIRED
academicFoundations.mathFound.       —       —             REQUIRED
academicFoundations.keyPapers        —       2 papers      ≥5 papers
academicFoundations.evolution        —       —             REQUIRED

concepts                       3 basic       5 mixed       ≥8 full
concepts.mathFormulation       —             —             REQUIRED
concepts.visualDiagram         —             —             optional

algorithms                     list names    3 with detail ≥5 full
algorithms.prosAndCons         —             REQUIRED      REQUIRED
algorithms.keyPapers           —             —             REQUIRED

techStack                      list names    by layer      full matrix
techStack.alternatives         —             —             REQUIRED

pipeline.description           1 sentence    1 paragraph   full
pipeline.stages                —             basic         detailed
pipeline.diagram               —             simple        main+sub

miniExamples                   —             —             ≥2 full
miniExamples.sampleData        —             —             REQUIRED
miniExamples.codeVerified      —             —             false(ok)

useCases                       2 basic       3 with detail ≥5 full
caseStudies                    —             1             ≥3
bestPractices/antiPatterns     —             3 each        ≥5 each

resources                      3 links       5 mixed       ≥10 full
relatedNodes                   2 basic       3             ≥5

feasibility (all scores)       —             —             REQUIRED
metadata                       REQUIRED      REQUIRED      REQUIRED
```

**Rule:** At L1, empty arrays `[]` and empty strings `""` are acceptable for non-required fields. At L3, every field listed as REQUIRED must be meaningfully populated.

---

## 2. BASELINE NODE SCHEMA (B01-B15)

```typescript
interface BaselineNode {
  // ═══ IDENTITY ═══
  id: string;                    // "B01", "B02", ...
  name: string;                  // "Forecasting & Time Series"
  slug: string;                  // "forecasting-time-series"
  tagline: string;               // "Predict the future from historical patterns"
  category: "baseline";
  icon: string;                  // Lucide icon name
  color: string;                 // Hex color for graph node
  depthLevel: 1 | 2 | 3;        // Current research depth
  
  // ═══ OVERVIEW ═══
  overview: {
    description: string;         // 2-3 paragraph overview
    keyQuestions: string[];       // What questions does this capability answer?
    whenToUse: string[];         // When should you use this?
    whenNotToUse: string[];      // Anti-patterns
  };
  
  // ═══ ACADEMIC FOUNDATIONS ═══
  academicFoundations: {
    fieldTaxonomy: {
      parentField: string;         // e.g., "Machine Learning > Supervised Learning"
      subFields: string[];         // e.g., ["Statistical Methods", "ML Methods", "Deep Learning"]
      relatedFields: string[];     // e.g., ["Signal Processing", "Econometrics"]
      taxonomyDiagram: string;     // Mermaid or ASCII hierarchy tree
    };
    mathematicalFoundations: {
      topic: string;               // e.g., "Autoregression Theory"
      description: string;         // Intuitive explanation
      formulas: string[];          // LaTeX or plain text formulas
      assumptions: string[];       // Required conditions
      references: string[];        // Paper/textbook references
    }[];
    keyPapers: {
      title: string;
      authors: string;
      year: number;
      venue: string;               // NeurIPS, ICML, KDD, etc.
      contribution: string;        // 2-3 sentences core contribution
      impact: string;              // Why this paper matters
      link: string;                // arxiv/doi URL
      era: "foundational" | "recent";  // classic vs 2022-2026
    }[];
    evolutionTimeline: {
      year: number;
      milestone: string;           // What happened
      significance: string;        // Why it matters
    }[];
  };
  
  // ═══ CORE CONCEPTS ═══
  concepts: {
    id: string;
    name: string;
    description: string;         // 2-3 paragraphs (educational + technical)
    mathematicalFormulation: string; // Formula + explanation (if applicable)
    intuition: string;           // Simple language explanation
    difficulty: "beginner" | "intermediate" | "advanced";
    prerequisites: string[];     // concept IDs
    visualDiagram: string;       // Mermaid/ASCII diagram (if applicable)
  }[];
  
  // ═══ ALGORITHMS & METHODS ═══
  algorithms: {
    id: string;
    name: string;
    category: string;            // e.g., "statistical", "ml", "deep_learning"
    description: string;
    bestFor: string;
    complexity: "low" | "medium" | "high";
    maturity: "experimental" | "emerging" | "production" | "mature";
    prosAndCons: {
      pros: string[];
      cons: string[];
    };
    keyPapers: string[];         // Reference paper titles/links
  }[];
  
  // ═══ TECH STACK ═══
  techStack: {
    layer: string;               // e.g., "data", "model", "serving", "monitoring"
    tools: {
      name: string;
      category: string;          // e.g., "framework", "library", "platform"
      description: string;
      useCase: string;
      alternatives: string[];
      link: string;              // Official website/docs
    }[];
  }[];
  
  // ═══ PIPELINE ═══
  pipeline: {
    description: string;
    stages: {
      id: string;
      name: string;
      description: string;
      inputs: string[];
      outputs: string[];
      tools: string[];           // Tool names from techStack
    }[];
    diagram: string;             // Mermaid or ASCII diagram
  };
  
  // ═══ MINI EXAMPLES ═══
  miniExamples: {
    id: string;
    title: string;               // e.g., "Quick Start: Predict Daily Sales with Prophet"
    type: "quick_start" | "production" | "edge_case";
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: string;       // e.g., "30 minutes", "2 hours"
    problemStatement: {
      description: string;       // Specific problem description
      inputDescription: string;  // What data goes in
      expectedOutput: string;    // What comes out
    };
    sampleData: {
      format: string;            // "CSV", "JSON", etc.
      schema: string;            // Field names + types
      rows: string;              // 5-10 rows of realistic sample data
      source: string;            // Where data comes from (public dataset, synthetic, etc.)
    };
    solutionWalkthrough: {
      step: number;
      action: string;            // What to do
      rationale: string;         // Why this step
      codeSnippet: string;       // Real code (≤50 lines per step)
      tools: string[];           // Libraries/tools used
    }[];
    expectedResults: {
      output: string;            // Show actual output format
      metrics: string;           // What metrics achieved
      visualization: string;     // Chart/table description (if applicable)
    };
    commonPitfalls: string[];    // What could go wrong + how to fix
    codeType: "pseudocode" | "real_code";  // Phase 1: pseudocode OK
    codeVerified: boolean;       // false until human/CI verifies code runs
  }[];
  
  // ═══ USE CASES ═══
  useCases: {
    id: string;
    title: string;
    industry: string;            // Industry ID (I01, I02, ...)
    description: string;
    exampleInput: string;
    exampleOutput: string;
    difficulty: "easy" | "medium" | "hard";
  }[];
  
  // ═══ CASE STUDIES ═══
  caseStudies: {
    company: string;
    industry: string;
    problem: string;
    approach: string;
    results: string;
    lessonsLearned: string[];
    source: string;              // URL or reference
  }[];
  
  // ═══ BEST PRACTICES ═══
  bestPractices: string[];
  antiPatterns: string[];
  
  // ═══ LEARNING RESOURCES ═══
  resources: {
    type: "paper" | "course" | "tutorial" | "documentation" | "book" | "video" | "blog";
    title: string;
    url: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    free: boolean;
  }[];
  
  // ═══ RELATIONSHIPS ═══
  relatedNodes: {
    nodeId: string;
    relationship: string;        // e.g., "uses", "extends", "alternative_to", "prerequisite"
    description: string;
  }[];
  
  // ═══ FEASIBILITY ═══
  feasibility: {
    technicalFeasibility: number;  // 1-10
    marketDemand: number;          // 1-10
    dataAvailability: number;      // 1-10
    implementationRisk: number;    // 1-10
    overall: number;               // 1-10
    notes: string;
  };
  
  // ═══ METADATA ═══
  metadata: {
    createdAt: string;           // ISO date
    updatedAt: string;
    researchedBy: string[];      // Agent IDs
    version: string;
    status: "skeleton" | "draft" | "reviewed" | "published";
  };
}
```

---

## 3. INDUSTRY NODE SCHEMA (I01-I20)

```typescript
interface IndustryNode {
  id: string;                    // "I01", "I02", ...
  name: string;                  // "Retail & E-commerce"
  slug: string;
  category: "industry";
  icon: string;
  color: string;
  
  overview: {
    description: string;
    marketSizeVietnam: string;
    marketSizeSEA: string;
    aiMaturity: "L1" | "L2" | "L3" | "L4";
    aiAppetite: "low" | "medium" | "high";
  };
  
  domainKnowledge: {
    keyEntities: string[];
    keyProcesses: string[];
    dataTypes: string[];
    typicalDataVolume: string;
    dataQuality: string;
  };
  
  painPoints: {
    problem: string;
    severity: number;            // 1-10
    aiSolvable: boolean;
    mapsToBaseline: string[];    // Baseline IDs
  }[];
  
  regulations: {
    name: string;
    description: string;
    impact: "low" | "medium" | "high";
  }[];
  
  priorityBaselines: {
    high: string[];              // Baseline IDs
    medium: string[];
    low: string[];
  };
  
  competitiveLandscape: {
    competitor: string;
    strengths: string;
    weaknesses: string;
  }[];
  
  relatedNodes: {
    nodeId: string;
    relationship: string;
    description: string;
  }[];
  
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    status: "skeleton" | "draft" | "reviewed" | "published";
  };
}
```

---

## 4. MATRIX NODE SCHEMA (BXX-IXX)

```typescript
interface MatrixNode {
  id: string;                    // "B01-I01"
  name: string;                  // "Retail Demand Forecasting"
  slug: string;
  category: "matrix";
  baselineId: string;            // "B01"
  industryId: string;            // "I01"
  icon: string;
  color: string;
  
  overview: {
    description: string;
    businessValue: string;
    typicalClient: string;
  };
  
  industryAdaptation: {
    domainFeatures: string[];
    dataSchema: {
      primaryKey: string[];
      target: string;
      granularity: string;
      typicalVolume: string;
    };
    businessRules: string[];
    kpis: {
      primary: string;
      secondary: string[];
      business: string[];
    };
  };
  
  referenceSolutions: {
    company: string;
    approach: string;
    results: string;
  }[];
  
  effortEstimation: {
    mvp: string;
    production: string;
    enterprise: string;
  };
  
  relatedNodes: {
    nodeId: string;
    relationship: string;
    description: string;
  }[];
  
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    status: "skeleton" | "draft" | "reviewed" | "published";
  };
}
```

---

## 5. GRAPH STRUCTURE (graph.json)

```typescript
interface GraphData {
  nodes: {
    id: string;
    name: string;
    category: "baseline" | "industry" | "matrix" | "infrastructure" | "strategy";
    group: number;               // For color grouping in visualization
    size: number;                // Node size (based on importance/connections)
    depthLevel: number;          // Research depth achieved
    color: string;
  }[];
  
  edges: {
    source: string;              // Node ID
    target: string;              // Node ID
    relationship: string;        // Edge label
    weight: number;              // 1-10 strength of connection
  }[];
}
```

---

## 6. SAMPLE DATA

### Sample Baseline Node (skeleton)

```json
{
  "id": "B01",
  "name": "Forecasting & Time Series",
  "slug": "forecasting-time-series",
  "tagline": "Predict the future from historical patterns",
  "category": "baseline",
  "icon": "TrendingUp",
  "color": "#00FF88",
  "depthLevel": 1,
  "overview": {
    "description": "Time series forecasting uses historical data patterns to predict future values...",
    "keyQuestions": [
      "What will demand look like next week/month?",
      "How many patients will arrive tomorrow?",
      "What revenue can we expect next quarter?"
    ],
    "whenToUse": [
      "Historical data available (min 2 years ideal)",
      "Patterns are somewhat repeatable",
      "Decisions depend on future values"
    ],
    "whenNotToUse": [
      "No historical data exists",
      "Domain is entirely unpredictable",
      "One-time events with no patterns"
    ]
  },
  "concepts": [],
  "algorithms": [],
  "techStack": [],
  "pipeline": { "description": "", "stages": [], "diagram": "" },
  "useCases": [],
  "caseStudies": [],
  "bestPractices": [],
  "antiPatterns": [],
  "resources": [],
  "relatedNodes": [],
  "feasibility": {
    "technicalFeasibility": 0,
    "marketDemand": 0,
    "dataAvailability": 0,
    "implementationRisk": 0,
    "overall": 0,
    "notes": ""
  },
  "metadata": {
    "createdAt": "2026-03-30",
    "updatedAt": "2026-03-30",
    "researchedBy": [],
    "version": "0.1",
    "status": "skeleton"
  }
}
```

---

---

## 7. SUB-NODE SCHEMA (Planetary View)

Each researched module generates sub-nodes representing individual agent outputs.
Sub-nodes are computed at runtime from the `docs/reports/{MODULE_ID}/` directory.

```typescript
type SubNodeLayer = "academic" | "practical" | "consolidation";

interface SubNode {
  id: string;              // "{parentId}-{agentId}" e.g. "B01-R-alpha"
  parentId: string;        // "B01"
  agentId: string;         // "R-alpha", "R-DE", "R-sigma"
  agentName: string;       // "α Research", "Data Engineer", "σ Final Report"
  layer: SubNodeLayer;
  reportFile: string;      // "research-report.md" or "R-DE-notes.md"
  status: "pending" | "complete";  // Based on file existence
  color: string;           // Hex color for orbital display
}
```

### Agent → Report File Mapping

| Agent ID | Agent Name | Layer | Report File |
|----------|-----------|-------|-------------|
| R-alpha | α Research | academic | `research-report.md` |
| R-beta | β Tech Stack | academic | `tech-report.md` |
| R-gamma | γ Feasibility | academic | `feasibility-report.md` |
| R-MLE | ML Engineer | practical | `R-MLE-notes.md` |
| R-DE | Data Engineer | practical | `R-DE-notes.md` |
| R-DA | Data Analyst | practical | `R-DA-notes.md` |
| R-BE | Backend Engineer | practical | `R-BE-notes.md` |
| R-DO | DevOps Engineer | practical | `R-DO-notes.md` |
| R-QA | QA Engineer | practical | `R-QA-notes.md` |
| R-D06 | D06 Specialist | practical | `R-D06-notes.md` |
| R-SA | Solutions Architect | practical | `R-SA-notes.md` |
| R-FE | Frontend Engineer | practical | `R-FE-notes.md` |
| R-sigma | σ Final Report | consolidation | `final-report.md` |

### API Endpoints

```
GET /api/nodes/{id}/reports          → { files: string[] }
GET /api/nodes/{id}/reports/{file}   → { content: string }
GET /api/nodes/{id}/notes            → { notes: NoteEntry[] }
```

### Planetary View Layout

```
  INNER ORBIT (Layer 1 — Academic):
    ● α Research    ● β Tech    ● γ Feasibility

  OUTER ORBIT (Layer 2 — Practical):
    ● R-MLE  ● R-DE  ● R-DA  ● R-BE  ● R-DO  ● R-QA  ● R-D06  ● R-SA  ● R-FE

  BOTTOM (Layer 3 — Consolidation):
    ★ σ Final Report
```

---

## 8. NORMALIZED NODE SCHEMA (Frontend Canonical Format)

The `NormalizedNode` interface is the **single source of truth** for what the frontend expects. The R-BE normalization step (Step A5 in `docs/SOP-AGENT-PROCESS.md`) transforms raw JSON from any node type into this canonical shape before serving to the frontend.

**Implementation:** `src/lib/normalize-node.ts` — `normalizeNode()` function
**Type definition:** `src/types/node.ts` — `NormalizedNode` interface
**Applied in:** `src/app/api/nodes/[id]/route.ts` — runs on every API response

### What normalization handles:
- **Field name variations:** `depth` → `depthLevel`, `techStack` → `tech_stack`, `concepts` → `core_concepts`, `useCases` → `industry_applications`, `relatedNodes` → `cross_domain_connections`, `resources` → `key_papers`
- **Color correction:** Raw JSON may have arbitrary colors; normalizer maps `category` → approved palette (CONVENTIONS §7)
- **Nested vs flat fields:** `description` may be flat or nested inside `overview` — normalizer extracts to flat field AND populates `overview.description`
- **Missing fields:** Defaults to empty arrays `[]`, empty strings `""`, or `null` for optional objects
- **Metadata enrichment:** Sets `normalizedAt` and `normalizedBy` fields
- **Legacy array formats:** `techStack` as array (old schema) converted to object (new schema)

### NormalizedNode fields:

| Field Group | Key Fields | Notes |
|-------------|-----------|-------|
| Identity | `id`, `name`, `slug`, `tagline`, `category`, `icon`, `color`, `depthLevel` | `color` always from approved palette |
| Overview | `description` (flat), `aliases`, `maturity_level`, `trl` | `description` also in `overview.description` for legacy |
| Core content | `core_concepts[]`, `algorithms[]` | Mapped from `concepts` if needed |
| Tech stack | `tech_stack` (object keyed by layer) | Converted from array if legacy format |
| Feasibility | `feasibility_score` (with `overall_score`, `verdict`, `dimensions`) | Mapped from `feasibility` or `feasibility_score` |
| Applications | `industry_applications[]` | Mapped from `useCases` if needed |
| Resources | `key_papers[]`, `cross_domain_connections[]` | Mapped from `resources`, `relatedNodes` |
| Risks | `risks[]` | String risks converted to `{ description }` objects |
| Metadata | `metadata` with `normalizedAt`, `normalizedBy` | Added by normalizer |

See `src/types/node.ts` for the full TypeScript interface definition.

---

*Data Schema — MAESTRO Knowledge Graph Platform*
*All knowledge node files MUST conform to this schema.*
