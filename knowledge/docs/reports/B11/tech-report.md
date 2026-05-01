# Technical Report: Knowledge Graph (B11)
## By Dr. Praxis (R-beta) -- Date: 2026-03-31

---

## 1. Architecture Overview

Three reference architectures for Knowledge Graph systems, ranging from manual curation to fully autonomous enterprise platforms.

### 1.1 Simple: Manual/Curated KG with Graph DB + Query API

Best for: Small teams, domain-specific KGs under 1M triples, proof-of-concept.

```
+------------------+       +------------------+       +------------------+
|  Manual Curation |       |   Graph Database |       |    Query API     |
|  (CSV / JSON-LD) | ----> |   (Neo4j / SQLite| ----> |   (REST/GraphQL) |
|                  |       |    + RDF store)   |       |                  |
+------------------+       +------------------+       +------------------+
                                    |
                                    v
                           +------------------+
                           |  Visualization   |
                           |  (Neo4j Browser) |
                           +------------------+
```

**Characteristics:**
- Human-in-the-loop triple creation
- Schema-first approach (define ontology before populating)
- Single-node deployment, no streaming
- Typical latency: < 50ms for 2-hop queries on < 1M nodes

### 1.2 Intermediate: Automated KG Construction Pipeline

Best for: Mid-size teams, 1M-100M triples, document-driven KG building.

```mermaid
graph LR
    A[Document Corpus] --> B[NER + RE Pipeline]
    B --> C[Entity Linker]
    C --> D[Triple Validator]
    D --> E[Neo4j / ArangoDB]
    E --> F[Cypher API]
    E --> G[Visualization]
    F --> H[Application Layer]

    subgraph Construction
        B
        C
        D
    end

    subgraph Serving
        F
        G
        H
    end
```

```
 ┌─────────────┐    ┌──────────────────┐    ┌─────────────┐    ┌──────────┐
 │  Documents   │───>│  NER + RE Engine  │───>│ Entity      │───>│ Neo4j    │
 │  (PDF, HTML, │    │  (spaCy / LLM)   │    │ Linker      │    │ Cluster  │
 │   text)      │    │                  │    │ (Wikidata)  │    │          │
 └─────────────┘    └──────────────────┘    └─────────────┘    └────┬─────┘
                                                                     │
                              ┌───────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐    ┌──────────────────┐
                    │   Query API        │───>│  react-force-    │
                    │   (FastAPI/Cypher)  │    │  graph / D3.js   │
                    └────────────────────┘    └──────────────────┘
```

**Characteristics:**
- Automated entity/relation extraction from unstructured text
- Entity linking to canonical KBs (Wikidata, DBpedia)
- Confidence scores on extracted triples
- Batch processing with optional incremental updates

### 1.3 Advanced: Enterprise KG Platform (GraphRAG + LLM-Augmented)

Best for: Large orgs, 100M+ triples, multi-source, real-time, LLM-integrated.

```
 ┌──────────────────────────────────────────────────────────────────────┐
 │                        ENTERPRISE KG PLATFORM                       │
 │                                                                      │
 │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
 │  │ Structured  │  │ Unstructured│  │ API Feeds  │  │ Streaming    │  │
 │  │ (SQL, CSV)  │  │ (Docs, Web) │  │ (REST/GQL) │  │ (Kafka)      │  │
 │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘  │
 │        └───────────┬────┴──────────┬────┘                │          │
 │                    v               v                     v          │
 │           ┌────────────────┐  ┌──────────────┐  ┌──────────────┐   │
 │           │ LLM Extraction │  │ Rule-Based   │  │ Stream       │   │
 │           │ (Claude/GPT)   │  │ ETL (Airflow)│  │ Processor    │   │
 │           └───────┬────────┘  └──────┬───────┘  └──────┬───────┘   │
 │                   └──────────┬───────┘                  │          │
 │                              v                          v          │
 │                    ┌─────────────────────────────────────┐         │
 │                    │      Neo4j Cluster (Causal)         │         │
 │                    │      + Vector Index (embeddings)    │         │
 │                    └──────────┬──────────────────────────┘         │
 │                               │                                     │
 │              ┌────────────────┼────────────────────┐               │
 │              v                v                    v               │
 │     ┌──────────────┐  ┌─────────────┐  ┌────────────────┐        │
 │     │ GraphRAG     │  │ Query API   │  │ KG Embeddings  │        │
 │     │ (LangChain + │  │ (Cypher +   │  │ (PyKEEN /      │        │
 │     │  Claude)     │  │  GraphQL)   │  │  DGL-KE)       │        │
 │     └──────────────┘  └─────────────┘  └────────────────┘        │
 │              │                │                    │               │
 │              v                v                    v               │
 │     ┌──────────────────────────────────────────────────┐          │
 │     │              Application Layer                    │          │
 │     │  (Chat, Search, Analytics, Dashboards)           │          │
 │     └──────────────────────────────────────────────────┘          │
 └──────────────────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Multi-source ingestion (structured + unstructured + streaming)
- LLM-augmented extraction with human-in-the-loop validation
- GraphRAG for natural language querying over the KG
- Real-time incremental updates via Kafka/event streams
- KG embeddings for link prediction and similarity search
- Horizontal scaling via Neo4j Causal Clustering or TigerGraph distributed mode

---

## 2. Tech Stack

### Layer-by-Layer Breakdown

| Layer | Technology | Role | License |
|---|---|---|---|
| **Graph Database** | Neo4j (Community/Enterprise) | Property graph store, Cypher queries | GPL-3 / Commercial |
| | ArangoDB | Multi-model (graph + doc + key-value) | Apache 2.0 |
| | Amazon Neptune | Managed RDF + property graph (AWS) | Commercial |
| | Blazegraph | High-perf RDF triplestore, SPARQL | GPL-2 |
| | TigerGraph | Distributed graph analytics | Commercial |
| **KG Construction** | spaCy + spacy-llm | NER, dependency parsing, LLM extraction | MIT |
| | LlamaIndex PropertyGraphIndex | LLM-based KG extraction pipeline | MIT |
| | DeepKE | Neural relation extraction toolkit | MIT |
| | REBEL (Hugging Face) | End-to-end relation extraction model | Apache 2.0 |
| **KG Embeddings** | PyKEEN | KG embedding library (40+ models) | MIT |
| | DGL-KE | Distributed KG embeddings on DGL | Apache 2.0 |
| | LibKGE | Research-focused KG embedding framework | MIT |
| | GraphVite | GPU-accelerated graph embeddings | Apache 2.0 |
| **Visualization** | Neo4j Bloom | Interactive graph exploration (commercial) | Commercial |
| | react-force-graph | React component for force-directed graphs | MIT |
| | D3.js (force layout) | Low-level SVG graph rendering | ISC |
| | Gephi | Desktop graph visualization & analytics | GPL-3 |
| | yFiles | Enterprise graph visualization SDK | Commercial |
| **Query** | Cypher | Neo4j's declarative graph query language | -- |
| | SPARQL | W3C standard for RDF querying | W3C |
| | GraphQL + neo4j-graphql | Auto-generated GraphQL from Neo4j schema | Apache 2.0 |
| | Gremlin | Apache TinkerPop traversal language | Apache 2.0 |
| **Orchestration** | Apache Airflow | DAG-based ETL scheduling | Apache 2.0 |
| | Prefect | Python-native workflow orchestration | Apache 2.0 |
| | Dagster | Data-aware orchestration with typing | Apache 2.0 |
| **LLM Integration** | LangChain GraphCypherQAChain | Natural language to Cypher via LLM | MIT |
| | LlamaIndex KnowledgeGraphRAGRetriever | GraphRAG retrieval | MIT |
| | Microsoft GraphRAG | Global/local search over LLM-built KGs | MIT |

### Recommended Stack by Tier

**Starter:** Neo4j Community + spaCy + Python neo4j driver + D3.js
**Production:** Neo4j Enterprise + LLM extraction (Claude) + Airflow + LangChain GraphRAG + react-force-graph
**Enterprise:** Neo4j Causal Cluster + Kafka + Airflow + PyKEEN + LangChain + custom API layer

---

## 3. Pipeline Design

### 3.1 End-to-End KG Pipeline

```
 Stage 1          Stage 2              Stage 3             Stage 4
 INGEST           EXTRACT              BUILD               SERVE
 ──────           ───────              ─────               ─────
 ┌─────────┐     ┌──────────────┐     ┌──────────────┐    ┌─────────────┐
 │ Sources  │────>│ NER + RE +   │────>│ KG Builder   │───>│ Query API   │
 │ -CSV/DB  │     │ Entity Link  │     │ -Dedup       │    │ -Cypher     │
 │ -Docs    │     │ -spaCy/LLM   │     │ -Validate    │    │ -GraphRAG   │
 │ -APIs    │     │ -REBEL       │     │ -Ontology    │    │ -REST       │
 │ -Streams │     │              │     │  conformance │    │             │
 └─────────┘     └──────────────┘     └──────┬───────┘    └─────────────┘
                                              │
                                              v
                                      ┌──────────────┐    ┌─────────────┐
                                      │ KG Enrichment│───>│ Maintenance │
                                      │ -Embeddings  │    │ -Incremental│
                                      │ -Link pred.  │    │ -Conflict   │
                                      │ -Completion  │    │  resolution │
                                      └──────────────┘    └─────────────┘
```

### 3.2 Stage 1: Data Ingestion

```python
# ingestion/loader.py -- Multi-source document loader
from pathlib import Path
from dataclasses import dataclass
from typing import Iterator
import json
import csv

@dataclass
class Document:
    text: str
    source: str
    metadata: dict

class KGIngestionPipeline:
    """Ingest documents from multiple sources for KG construction."""

    def ingest_csv(self, path: str, text_col: str) -> Iterator[Document]:
        """Ingest structured CSV data."""
        with open(path) as f:
            reader = csv.DictReader(f)
            for row in reader:
                yield Document(
                    text=row[text_col],
                    source=path,
                    metadata={k: v for k, v in row.items() if k != text_col}
                )

    def ingest_text_files(self, directory: str, glob: str = "*.txt") -> Iterator[Document]:
        """Ingest unstructured text files."""
        for path in Path(directory).glob(glob):
            yield Document(
                text=path.read_text(encoding="utf-8"),
                source=str(path),
                metadata={"filename": path.name}
            )

    def ingest_json_triples(self, path: str) -> Iterator[dict]:
        """Ingest pre-structured triples from JSON.
        Expected format: [{"head": "...", "relation": "...", "tail": "..."}]
        """
        with open(path) as f:
            triples = json.load(f)
        for t in triples:
            yield {"head": t["head"], "relation": t["relation"], "tail": t["tail"]}
```

### 3.3 Stage 2: Entity & Relation Extraction

```python
# extraction/ner_re.py -- NER + Relation Extraction with spaCy and LLM
import spacy
from dataclasses import dataclass

@dataclass
class Triple:
    head: str
    head_type: str
    relation: str
    tail: str
    tail_type: str
    confidence: float
    source: str

class SpacyExtractor:
    """Rule-based + NER extraction using spaCy."""

    def __init__(self, model: str = "en_core_web_trf"):
        self.nlp = spacy.load(model)

    def extract_entities(self, text: str) -> list[dict]:
        doc = self.nlp(text)
        return [
            {"text": ent.text, "label": ent.label_, "start": ent.start_char, "end": ent.end_char}
            for ent in doc.ents
        ]

    def extract_triples_rule_based(self, text: str) -> list[Triple]:
        """Extract SVO triples using dependency parsing."""
        doc = self.nlp(text)
        triples = []
        for sent in doc.sents:
            # Find subject-verb-object patterns
            root = [t for t in sent if t.dep_ == "ROOT"]
            if not root:
                continue
            verb = root[0]
            subjects = [c for c in verb.children if c.dep_ in ("nsubj", "nsubjpass")]
            objects = [c for c in verb.children if c.dep_ in ("dobj", "pobj", "attr")]
            for subj in subjects:
                for obj in objects:
                    triples.append(Triple(
                        head=subj.text, head_type="ENTITY",
                        relation=verb.lemma_, tail=obj.text, tail_type="ENTITY",
                        confidence=0.7, source="spacy_dep"
                    ))
        return triples


class LLMExtractor:
    """LLM-based extraction using Claude for high-quality triples."""

    def __init__(self, client, model: str = "claude-sonnet-4-20250514"):
        self.client = client
        self.model = model

    def extract_triples(self, text: str, entity_types: list[str] = None) -> list[Triple]:
        types_hint = f"Focus on these entity types: {', '.join(entity_types)}" if entity_types else ""
        prompt = f"""Extract knowledge graph triples from the following text.
Return JSON array of objects with keys: head, head_type, relation, tail, tail_type, confidence.

Rules:
- Normalize entity names (e.g., "Dr. Smith" -> "John Smith")
- Use canonical relation names (e.g., "works_at", "located_in", "founded_by")
- Confidence should be 0.0 to 1.0
{types_hint}

Text: {text}

Return ONLY valid JSON array:"""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}]
        )
        import json
        raw = response.content[0].text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
        data = json.loads(raw)
        return [
            Triple(
                head=t["head"], head_type=t.get("head_type", "ENTITY"),
                relation=t["relation"], tail=t["tail"],
                tail_type=t.get("tail_type", "ENTITY"),
                confidence=t.get("confidence", 0.8),
                source="llm_claude"
            )
            for t in data
        ]
```

### 3.4 Stage 3: KG Construction & Validation

```python
# construction/builder.py -- Build and validate KG in Neo4j
from neo4j import GraphDatabase
from dataclasses import dataclass

class KGBuilder:
    """Construct a knowledge graph in Neo4j with ontology validation."""

    def __init__(self, uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def create_constraints(self):
        """Create uniqueness constraints for entity deduplication."""
        with self.driver.session() as session:
            session.run("""
                CREATE CONSTRAINT entity_name IF NOT EXISTS
                FOR (e:Entity) REQUIRE e.name IS UNIQUE
            """)
            session.run("""
                CREATE INDEX entity_type_idx IF NOT EXISTS
                FOR (e:Entity) ON (e.type)
            """)

    def upsert_triple(self, head: str, head_type: str, relation: str,
                      tail: str, tail_type: str, confidence: float, source: str):
        """Insert or update a triple with confidence tracking."""
        query = """
        MERGE (h:Entity {name: $head})
        ON CREATE SET h.type = $head_type, h.created = datetime()
        ON MATCH SET h.type = CASE WHEN h.type IS NULL THEN $head_type ELSE h.type END

        MERGE (t:Entity {name: $tail})
        ON CREATE SET t.type = $tail_type, t.created = datetime()
        ON MATCH SET t.type = CASE WHEN t.type IS NULL THEN $tail_type ELSE t.type END

        MERGE (h)-[r:RELATES_TO {type: $relation}]->(t)
        ON CREATE SET r.confidence = $confidence, r.source = $source, r.created = datetime()
        ON MATCH SET r.confidence = CASE
            WHEN $confidence > r.confidence THEN $confidence ELSE r.confidence
        END
        """
        with self.driver.session() as session:
            session.run(query, head=head, head_type=head_type, relation=relation,
                        tail=tail, tail_type=tail_type, confidence=confidence, source=source)

    def bulk_upsert(self, triples: list[dict], batch_size: int = 500):
        """Batch insert triples for performance."""
        query = """
        UNWIND $triples AS t
        MERGE (h:Entity {name: t.head})
        ON CREATE SET h.type = t.head_type, h.created = datetime()
        MERGE (tail:Entity {name: t.tail})
        ON CREATE SET tail.type = t.tail_type, tail.created = datetime()
        MERGE (h)-[r:RELATES_TO {type: t.relation}]->(tail)
        ON CREATE SET r.confidence = t.confidence, r.source = t.source
        """
        with self.driver.session() as session:
            for i in range(0, len(triples), batch_size):
                batch = triples[i:i + batch_size]
                session.run(query, triples=batch)

    def validate_ontology_conformance(self, ontology_rules: dict) -> list[str]:
        """Check that KG conforms to ontology constraints.

        ontology_rules example:
        {
            "domain_range": {
                "works_at": {"domain": "PERSON", "range": "ORGANIZATION"},
                "located_in": {"domain": ["ORGANIZATION", "CITY"], "range": ["CITY", "COUNTRY"]}
            },
            "required_properties": {"PERSON": ["name"], "ORGANIZATION": ["name"]}
        }
        """
        violations = []
        with self.driver.session() as session:
            # Check domain/range constraints
            for rel, constraints in ontology_rules.get("domain_range", {}).items():
                domain = constraints["domain"]
                if isinstance(domain, str):
                    domain = [domain]
                range_ = constraints["range"]
                if isinstance(range_, str):
                    range_ = [range_]

                result = session.run("""
                    MATCH (h:Entity)-[r:RELATES_TO {type: $rel}]->(t:Entity)
                    WHERE NOT h.type IN $domain OR NOT t.type IN $range
                    RETURN h.name AS head, h.type AS h_type, t.name AS tail, t.type AS t_type
                    LIMIT 100
                """, rel=rel, domain=domain, range=range_)

                for record in result:
                    violations.append(
                        f"Domain/range violation: ({record['head']}:{record['h_type']})"
                        f"-[{rel}]->({record['tail']}:{record['t_type']})"
                    )
        return violations
```

### 3.5 Stage 4: KG Enrichment (Embeddings + Link Prediction)

```python
# enrichment/embeddings.py -- Train KG embeddings with PyKEEN
from pykeen.pipeline import pipeline
from pykeen.triples import TriplesFactory
import torch
import numpy as np

class KGEmbeddingTrainer:
    """Train knowledge graph embeddings for link prediction and similarity."""

    def __init__(self, neo4j_driver):
        self.driver = neo4j_driver

    def export_triples_from_neo4j(self) -> list[tuple[str, str, str]]:
        """Export all triples from Neo4j as (head, relation, tail) tuples."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (h:Entity)-[r:RELATES_TO]->(t:Entity)
                RETURN h.name AS head, r.type AS relation, t.name AS tail
            """)
            return [(r["head"], r["relation"], r["tail"]) for r in result]

    def train_embeddings(
        self,
        triples: list[tuple[str, str, str]],
        model_name: str = "RotatE",
        embedding_dim: int = 256,
        epochs: int = 200,
        batch_size: int = 256,
        lr: float = 0.001
    ) -> dict:
        """Train KG embeddings using PyKEEN.

        Supported models: TransE, RotatE, ComplEx, DistMult, ConvE, TuckER
        """
        # Create triples factory
        tf = TriplesFactory.from_labeled_triples(
            np.array(triples, dtype=str)
        )
        training, testing = tf.split([0.9, 0.1])

        # Run pipeline
        result = pipeline(
            training=training,
            testing=testing,
            model=model_name,
            model_kwargs={"embedding_dim": embedding_dim},
            optimizer="Adam",
            optimizer_kwargs={"lr": lr},
            training_kwargs={
                "num_epochs": epochs,
                "batch_size": batch_size,
            },
            evaluation_kwargs={"batch_size": batch_size},
        )

        # Extract results
        metrics = result.metric_results.to_dict()
        return {
            "model": model_name,
            "hits_at_10": metrics.get("hits_at_10", {}).get("both", {}).get("realistic", None),
            "mrr": metrics.get("mean_reciprocal_rank", {}).get("both", {}).get("realistic", None),
            "pipeline_result": result,
        }

    def predict_links(self, result, head: str, relation: str, top_k: int = 10) -> list[dict]:
        """Predict missing tail entities for a given (head, relation, ?)."""
        model = result["pipeline_result"].model
        tf = result["pipeline_result"].training

        head_id = tf.entity_to_id.get(head)
        rel_id = tf.relation_to_id.get(relation)
        if head_id is None or rel_id is None:
            return []

        # Score all possible tails
        h_tensor = torch.tensor([head_id], dtype=torch.long)
        r_tensor = torch.tensor([rel_id], dtype=torch.long)
        all_tails = torch.arange(tf.num_entities, dtype=torch.long)

        # Build (h, r, t) for all t
        hr = torch.stack([
            h_tensor.expand(tf.num_entities),
            r_tensor.expand(tf.num_entities),
            all_tails
        ], dim=1)

        with torch.no_grad():
            scores = model.score_hrt(hr).squeeze()

        top_indices = torch.topk(scores, k=min(top_k, len(scores))).indices
        id_to_entity = {v: k for k, v in tf.entity_to_id.items()}

        return [
            {"entity": id_to_entity[idx.item()], "score": scores[idx].item()}
            for idx in top_indices
        ]
```

### 3.6 Stage 5: Serving (Query API + GraphRAG)

```python
# serving/api.py -- FastAPI query service
from fastapi import FastAPI, Query
from neo4j import GraphDatabase
from pydantic import BaseModel

app = FastAPI(title="KG Query API", version="1.0")

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

class TripleResponse(BaseModel):
    head: str
    relation: str
    tail: str
    confidence: float

class SubgraphResponse(BaseModel):
    nodes: list[dict]
    edges: list[dict]

@app.get("/entity/{name}", response_model=SubgraphResponse)
def get_entity_neighborhood(name: str, depth: int = Query(default=1, le=3)):
    """Get the subgraph around an entity up to N hops."""
    query = f"""
    MATCH path = (e:Entity {{name: $name}})-[r:RELATES_TO*1..{depth}]-(neighbor:Entity)
    WITH nodes(path) AS ns, relationships(path) AS rs
    UNWIND ns AS n
    WITH COLLECT(DISTINCT n) AS nodes, COLLECT(DISTINCT rs) AS all_rels
    UNWIND all_rels AS rels
    UNWIND rels AS rel
    RETURN nodes,
           COLLECT(DISTINCT {{
               source: startNode(rel).name,
               relation: rel.type,
               target: endNode(rel).name,
               confidence: rel.confidence
           }}) AS edges
    """
    with driver.session() as session:
        result = session.run(query, name=name).single()
        if not result:
            return SubgraphResponse(nodes=[], edges=[])
        nodes = [{"name": n["name"], "type": n.get("type", "ENTITY")} for n in result["nodes"]]
        return SubgraphResponse(nodes=nodes, edges=result["edges"])

@app.get("/search", response_model=list[TripleResponse])
def search_triples(
    head: str = None, relation: str = None, tail: str = None,
    min_confidence: float = 0.0, limit: int = 50
):
    """Search triples by head, relation, and/or tail with confidence filter."""
    conditions = []
    params = {"min_conf": min_confidence, "limit": limit}
    if head:
        conditions.append("h.name CONTAINS $head")
        params["head"] = head
    if relation:
        conditions.append("r.type = $relation")
        params["relation"] = relation
    if tail:
        conditions.append("t.name CONTAINS $tail")
        params["tail"] = tail

    where = "WHERE " + " AND ".join(conditions) if conditions else ""

    query = f"""
    MATCH (h:Entity)-[r:RELATES_TO]->(t:Entity)
    {where}
    AND r.confidence >= $min_conf
    RETURN h.name AS head, r.type AS relation, t.name AS tail, r.confidence AS confidence
    ORDER BY r.confidence DESC LIMIT $limit
    """
    with driver.session() as session:
        results = session.run(query, **params)
        return [TripleResponse(**dict(r)) for r in results]

@app.get("/path")
def find_path(source: str, target: str, max_hops: int = 5):
    """Find shortest path between two entities."""
    query = """
    MATCH path = shortestPath(
        (s:Entity {name: $source})-[r:RELATES_TO*1..""" + str(max_hops) + """]->(t:Entity {name: $target})
    )
    RETURN [n IN nodes(path) | n.name] AS entities,
           [r IN relationships(path) | r.type] AS relations
    """
    with driver.session() as session:
        result = session.run(query, source=source, target=target).single()
        if not result:
            return {"path": None}
        return {"entities": result["entities"], "relations": result["relations"]}
```

### 3.7 Stage 6: Maintenance (Incremental Updates + Conflict Resolution)

```python
# maintenance/updater.py -- Incremental KG update with conflict resolution
from datetime import datetime
from neo4j import GraphDatabase
import logging

logger = logging.getLogger(__name__)

class KGUpdater:
    """Handle incremental updates with conflict resolution strategies."""

    STRATEGIES = ("confidence_max", "recency", "source_priority")

    def __init__(self, driver: GraphDatabase.driver, strategy: str = "confidence_max"):
        self.driver = driver
        assert strategy in self.STRATEGIES
        self.strategy = strategy

    def apply_update(self, triples: list[dict]):
        """Apply a batch of triple updates with conflict resolution."""
        for triple in triples:
            existing = self._get_existing(triple["head"], triple["relation"], triple["tail"])
            if existing is None:
                self._insert(triple)
            else:
                self._resolve_conflict(existing, triple)

    def _get_existing(self, head: str, relation: str, tail: str) -> dict | None:
        with self.driver.session() as session:
            result = session.run("""
                MATCH (h:Entity {name: $head})-[r:RELATES_TO {type: $relation}]->(t:Entity {name: $tail})
                RETURN r.confidence AS confidence, r.source AS source, r.created AS created
            """, head=head, relation=relation, tail=tail).single()
            return dict(result) if result else None

    def _resolve_conflict(self, existing: dict, new: dict):
        should_update = False
        if self.strategy == "confidence_max":
            should_update = new.get("confidence", 0) > existing.get("confidence", 0)
        elif self.strategy == "recency":
            should_update = True  # Always take newest
        elif self.strategy == "source_priority":
            priority = {"llm_claude": 3, "llm_gpt": 2, "spacy_dep": 1, "manual": 4}
            should_update = priority.get(new.get("source"), 0) > priority.get(existing.get("source"), 0)

        if should_update:
            self._update(new)
            logger.info(f"Updated triple: ({new['head']})-[{new['relation']}]->({new['tail']})")
        else:
            logger.debug(f"Kept existing triple: ({new['head']})-[{new['relation']}]->({new['tail']})")

    def _insert(self, triple: dict):
        with self.driver.session() as session:
            session.run("""
                MERGE (h:Entity {name: $head})
                ON CREATE SET h.type = $head_type
                MERGE (t:Entity {name: $tail})
                ON CREATE SET t.type = $tail_type
                CREATE (h)-[r:RELATES_TO {
                    type: $relation, confidence: $confidence,
                    source: $source, created: datetime()
                }]->(t)
            """, **triple)

    def _update(self, triple: dict):
        with self.driver.session() as session:
            session.run("""
                MATCH (h:Entity {name: $head})-[r:RELATES_TO {type: $relation}]->(t:Entity {name: $tail})
                SET r.confidence = $confidence, r.source = $source, r.updated = datetime()
            """, **triple)

    def prune_low_confidence(self, threshold: float = 0.3):
        """Remove triples below confidence threshold."""
        with self.driver.session() as session:
            result = session.run("""
                MATCH ()-[r:RELATES_TO]->()
                WHERE r.confidence < $threshold
                DELETE r
                RETURN count(r) AS deleted
            """, threshold=threshold)
            count = result.single()["deleted"]
            logger.info(f"Pruned {count} low-confidence triples (threshold={threshold})")
            return count
```

---

## 4. Mini Examples

### Example 1: Quick Start -- Build a Company Knowledge Graph with Neo4j + Python

**Level:** Beginner | **Time:** 45 minutes | **Prerequisites:** Python 3.10+, Docker

#### Step 1: Start Neo4j with Docker

```bash
# Start Neo4j (accessible at http://localhost:7474)
docker run -d \
  --name neo4j-kg \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/kg_password_123 \
  -e NEO4J_PLUGINS='["apoc"]' \
  neo4j:5.18-community
```

#### Step 2: Install Dependencies

```bash
pip install neo4j spacy
python -m spacy download en_core_web_sm
```

#### Step 3: Extract Entities from Company Text

```python
# example1_company_kg.py
import spacy
from neo4j import GraphDatabase

# --- Step A: Extract entities from company descriptions ---
nlp = spacy.load("en_core_web_sm")

company_docs = [
    "Apple Inc. was founded by Steve Jobs in Cupertino, California in 1976. "
    "Tim Cook is the current CEO of Apple. Apple acquired Beats Electronics in 2014.",
    "Microsoft Corporation was founded by Bill Gates and Paul Allen in Redmond, Washington. "
    "Satya Nadella became CEO of Microsoft in 2014. Microsoft acquired LinkedIn in 2016.",
    "Google was founded by Larry Page and Sergey Brin at Stanford University. "
    "Sundar Pichai serves as CEO of Alphabet, Google's parent company.",
]

# Simple extraction: identify entities and build triples from patterns
def extract_triples_simple(text: str) -> list[dict]:
    doc = nlp(text)
    entities = [(ent.text, ent.label_) for ent in doc.ents]
    triples = []

    # Pattern: "X was founded by Y"
    for i, token in enumerate(doc):
        if token.lemma_ == "found" and token.dep_ == "ROOT":
            subjects = [c.text for c in token.children if c.dep_ == "nsubjpass"]
            agents = []
            for child in token.children:
                if child.dep_ == "agent":
                    for pobj in child.children:
                        if pobj.dep_ == "pobj":
                            agents.append(pobj.text)
            for s in subjects:
                for a in agents:
                    triples.append({"head": a, "relation": "FOUNDED", "tail": s})

    # Pattern: "X is CEO of Y" -- simple regex-like
    import re
    ceo_pattern = re.findall(r"(\w[\w\s]+?) (?:is|serves as|became) (?:the )?CEO of (\w[\w\s]+?)(?:\.|,| in)", text)
    for person, company in ceo_pattern:
        triples.append({"head": person.strip(), "relation": "CEO_OF", "tail": company.strip()})

    # Pattern: "X acquired Y"
    acq_pattern = re.findall(r"(\w[\w\s]+?) acquired (\w[\w\s]+?)(?:\.|,| in)", text)
    for acquirer, target in acq_pattern:
        triples.append({"head": acquirer.strip(), "relation": "ACQUIRED", "tail": target.strip()})

    # Add location info from NER
    orgs = [e[0] for e in entities if e[1] == "ORG"]
    locs = [e[0] for e in entities if e[1] == "GPE"]
    if orgs and locs:
        triples.append({"head": orgs[0], "relation": "LOCATED_IN", "tail": locs[0]})

    return triples

all_triples = []
for doc_text in company_docs:
    all_triples.extend(extract_triples_simple(doc_text))

print(f"Extracted {len(all_triples)} triples:")
for t in all_triples:
    print(f"  ({t['head']}) -[{t['relation']}]-> ({t['tail']})")

# --- Step B: Load into Neo4j ---
driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "kg_password_123"))

def setup_and_load(tx, triples):
    # Create constraint
    tx.run("CREATE CONSTRAINT IF NOT EXISTS FOR (e:Entity) REQUIRE e.name IS UNIQUE")

    for t in triples:
        tx.run("""
            MERGE (h:Entity {name: $head})
            MERGE (t:Entity {name: $tail})
            MERGE (h)-[r:RELATES_TO {type: $relation}]->(t)
        """, head=t["head"], tail=t["tail"], relation=t["relation"])

with driver.session() as session:
    session.execute_write(setup_and_load, all_triples)
    print("\nLoaded into Neo4j!")

# --- Step C: Query the KG ---
def query_kg(session):
    # Who founded what?
    print("\n--- Founders ---")
    result = session.run("""
        MATCH (p:Entity)-[r:RELATES_TO {type: 'FOUNDED'}]->(c:Entity)
        RETURN p.name AS founder, c.name AS company
    """)
    for record in result:
        print(f"  {record['founder']} founded {record['company']}")

    # Who are the CEOs?
    print("\n--- CEOs ---")
    result = session.run("""
        MATCH (p:Entity)-[r:RELATES_TO {type: 'CEO_OF'}]->(c:Entity)
        RETURN p.name AS ceo, c.name AS company
    """)
    for record in result:
        print(f"  {record['ceo']} is CEO of {record['company']}")

    # Two-hop query: Who founded a company that acquired another company?
    print("\n--- Founder -> Company -> Acquisition ---")
    result = session.run("""
        MATCH (founder:Entity)-[:RELATES_TO {type: 'FOUNDED'}]->(company:Entity)
              -[:RELATES_TO {type: 'ACQUIRED'}]->(target:Entity)
        RETURN founder.name AS founder, company.name AS company, target.name AS acquired
    """)
    for record in result:
        print(f"  {record['founder']} founded {record['company']} which acquired {record['acquired']}")

with driver.session() as session:
    query_kg(session)

driver.close()
```

#### Expected Output

```
Extracted 9 triples:
  (Steve Jobs) -[FOUNDED]-> (Apple Inc.)
  (Tim Cook) -[CEO_OF]-> (Apple)
  (Apple) -[ACQUIRED]-> (Beats Electronics)
  (Apple Inc.) -[LOCATED_IN]-> (Cupertino)
  ...

--- Founders ---
  Steve Jobs founded Apple Inc.
  Bill Gates founded Microsoft Corporation
  ...

--- CEOs ---
  Tim Cook is CEO of Apple
  Satya Nadella is CEO of Microsoft
  ...

--- Founder -> Company -> Acquisition ---
  Steve Jobs founded Apple Inc. which acquired Beats Electronics
```

---

### Example 2: Production -- GraphRAG: Knowledge Graph Enhanced RAG Pipeline

**Level:** Advanced | **Time:** 4 hours | **Prerequisites:** Python 3.10+, Docker, Anthropic API key

#### Architecture

```
 ┌──────────┐    ┌───────────────┐    ┌──────────────┐    ┌──────────────┐
 │ Documents│───>│ LLM Extraction│───>│   Neo4j KG   │───>│  GraphRAG    │
 │          │    │ (Claude)      │    │              │    │  Query Engine│
 └──────────┘    └───────────────┘    └──────────────┘    └──────┬───────┘
                                                                  │
                                              ┌───────────────────┘
                                              v
                                      ┌──────────────┐
                                      │ LLM Answer   │
                                      │ Generation   │
                                      │ (Claude)     │
                                      └──────────────┘
```

#### Step 1: Install Dependencies

```bash
pip install neo4j anthropic langchain langchain-community langchain-anthropic
```

#### Step 2: Build KG from Documents using LLM

```python
# example2_graphrag.py
import anthropic
import json
from neo4j import GraphDatabase

# --- Config ---
ANTHROPIC_API_KEY = "your-key-here"  # Set via env var in production
NEO4J_URI = "bolt://localhost:7687"
NEO4J_AUTH = ("neo4j", "kg_password_123")

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
driver = GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH)

# --- Sample documents (in production: load from files/DB) ---
documents = [
    {
        "id": "doc1",
        "text": """
        Acme Corp is a technology company headquartered in San Francisco, California.
        Founded in 2015 by Dr. Sarah Chen and Marcus Williams, the company specializes
        in artificial intelligence and machine learning solutions. Acme Corp raised
        $50 million in Series B funding led by Sequoia Capital in 2022. The company's
        flagship product, AcmeAI, uses transformer architecture for enterprise document
        processing. Dr. Chen previously worked at Google Brain and holds a PhD from MIT.
        """
    },
    {
        "id": "doc2",
        "text": """
        In January 2024, Acme Corp acquired DataFlow Inc, a data pipeline startup
        based in Austin, Texas, for $120 million. DataFlow was founded by James Park
        in 2018 and had 150 employees. The acquisition strengthened Acme Corp's data
        infrastructure capabilities. Following the acquisition, James Park joined
        Acme Corp as VP of Data Engineering. Acme Corp now has over 500 employees
        and serves clients including JPMorgan Chase, Pfizer, and Toyota.
        """
    },
    {
        "id": "doc3",
        "text": """
        Acme Corp's main competitor is NeuralTech Systems, founded by Dr. Wei Zhang
        in 2016. NeuralTech is based in New York and also focuses on enterprise AI.
        Both companies are competing for a major contract with the US Department of
        Defense. NeuralTech recently partnered with Amazon Web Services for cloud
        deployment of their models. Acme Corp uses Google Cloud Platform as its
        primary cloud provider.
        """
    }
]

# --- Step A: LLM-based triple extraction ---
def extract_triples_llm(text: str, doc_id: str) -> list[dict]:
    """Use Claude to extract structured triples from text."""
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": f"""Extract knowledge graph triples from this text.

Return a JSON array where each element has:
- "head": source entity (normalized name)
- "head_type": one of [PERSON, ORGANIZATION, LOCATION, PRODUCT, EVENT, DATE, MONEY]
- "relation": relationship (use snake_case, e.g., founded_by, headquartered_in, acquired, works_at, funded_by, competes_with, partners_with, uses_technology, client_of)
- "tail": target entity (normalized name)
- "tail_type": same types as head_type
- "confidence": 0.0 to 1.0

Be thorough. Extract ALL factual relationships.

Text:
{text}

Return ONLY the JSON array:"""
        }]
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
    triples = json.loads(raw)
    for t in triples:
        t["source"] = doc_id
    return triples

# Extract from all documents
all_triples = []
for doc in documents:
    triples = extract_triples_llm(doc["text"], doc["id"])
    all_triples.extend(triples)
    print(f"[{doc['id']}] Extracted {len(triples)} triples")

print(f"\nTotal: {len(all_triples)} triples")

# --- Step B: Load into Neo4j ---
def load_kg(triples: list[dict]):
    with driver.session() as session:
        session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (e:Entity) REQUIRE e.name IS UNIQUE")

        # Batch load
        session.run("""
            UNWIND $triples AS t
            MERGE (h:Entity {name: t.head})
            ON CREATE SET h.type = t.head_type
            MERGE (tail:Entity {name: t.tail})
            ON CREATE SET tail.type = t.tail_type
            MERGE (h)-[r:RELATES_TO {type: t.relation}]->(tail)
            ON CREATE SET r.confidence = t.confidence, r.source = t.source,
                          r.created = datetime()
        """, triples=all_triples)

    print("KG loaded into Neo4j!")

load_kg(all_triples)

# --- Step C: GraphRAG Query Engine ---
class GraphRAGEngine:
    """Answer natural language questions using KG-grounded retrieval."""

    def __init__(self, neo4j_driver, anthropic_client):
        self.driver = neo4j_driver
        self.client = anthropic_client

    def _extract_entities_from_question(self, question: str) -> list[str]:
        """Use LLM to identify entities in the question."""
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=256,
            messages=[{
                "role": "user",
                "content": f"Extract entity names from this question. Return JSON array of strings only.\n\nQuestion: {question}"
            }]
        )
        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(raw)

    def _retrieve_subgraph(self, entities: list[str], max_hops: int = 2) -> str:
        """Retrieve relevant subgraph from Neo4j."""
        all_facts = []
        with self.driver.session() as session:
            for entity in entities:
                # Fuzzy match entity name
                result = session.run("""
                    MATCH (e:Entity)
                    WHERE toLower(e.name) CONTAINS toLower($name)
                    WITH e LIMIT 3
                    MATCH path = (e)-[r:RELATES_TO*1..2]-(neighbor:Entity)
                    RETURN e.name AS source,
                           [rel IN relationships(path) |
                            startNode(rel).name + ' -[' + rel.type + ']-> ' + endNode(rel).name
                           ] AS facts
                """, name=entity)

                for record in result:
                    all_facts.extend(record["facts"])

        # Deduplicate
        unique_facts = list(set(all_facts))
        return "\n".join(f"- {fact}" for fact in unique_facts)

    def query(self, question: str) -> str:
        """Answer a question using GraphRAG."""
        # Step 1: Extract entities
        entities = self._extract_entities_from_question(question)
        print(f"  Identified entities: {entities}")

        # Step 2: Retrieve subgraph
        context = self._retrieve_subgraph(entities)
        print(f"  Retrieved {len(context.splitlines())} facts from KG")

        # Step 3: Generate answer with KG context
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": f"""Answer the question using ONLY the knowledge graph facts below.
If the facts don't contain enough information, say so.
Cite specific facts in your answer.

Knowledge Graph Facts:
{context}

Question: {question}

Answer:"""
            }]
        )
        return response.content[0].text

# --- Step D: Run queries ---
engine = GraphRAGEngine(driver, client)

questions = [
    "Who founded Acme Corp and where is it located?",
    "What companies has Acme Corp acquired and who joined from those acquisitions?",
    "How do Acme Corp and NeuralTech Systems compare? What cloud platforms do they use?",
    "Trace the career path of Dr. Sarah Chen.",
]

for q in questions:
    print(f"\nQ: {q}")
    answer = engine.query(q)
    print(f"A: {answer}\n")
    print("-" * 80)

driver.close()
```

#### Expected Output

```
[doc1] Extracted 8 triples
[doc2] Extracted 10 triples
[doc3] Extracted 7 triples

Total: 25 triples
KG loaded into Neo4j!

Q: Who founded Acme Corp and where is it located?
  Identified entities: ["Acme Corp"]
  Retrieved 12 facts from KG
A: Based on the knowledge graph, Acme Corp was founded by Dr. Sarah Chen
   and Marcus Williams. The company is headquartered in San Francisco,
   California. Dr. Chen previously worked at Google Brain and holds a
   PhD from MIT.
```

---

## 5. Integration Patterns

### 5.1 With RAG Systems (B12)

```python
# Pattern: KG-augmented retrieval for RAG
# Instead of pure vector similarity, combine vector search with graph traversal

from langchain_anthropic import ChatAnthropic
from langchain_community.graphs import Neo4jGraph
from langchain.chains import GraphCypherQAChain

graph = Neo4jGraph(url="bolt://localhost:7687", username="neo4j", password="password")
llm = ChatAnthropic(model="claude-sonnet-4-20250514")

# LangChain's built-in Graph QA chain translates NL -> Cypher -> answer
chain = GraphCypherQAChain.from_llm(
    llm=llm,
    graph=graph,
    verbose=True,
    allow_dangerous_requests=True,  # Required for Cypher generation
)

result = chain.invoke({"query": "Which companies were acquired by organizations founded after 2010?"})
print(result["result"])
```

### 5.2 With LLM Agents (B10)

```python
# Pattern: KG as a tool for an LLM agent
# Agent decides when to query the KG vs. using its parametric knowledge

import anthropic
import json

client = anthropic.Anthropic()

tools = [
    {
        "name": "query_knowledge_graph",
        "description": "Query the company knowledge graph. Supports finding entities, relationships, and paths. Input should be a Cypher query.",
        "input_schema": {
            "type": "object",
            "properties": {
                "cypher": {"type": "string", "description": "A Cypher query to run against the Neo4j knowledge graph"},
            },
            "required": ["cypher"]
        }
    },
    {
        "name": "search_kg_entities",
        "description": "Search for entities in the knowledge graph by name (fuzzy match).",
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
            },
            "required": ["name"]
        }
    }
]

def execute_tool(name: str, input: dict) -> str:
    """Execute KG tool calls from the agent."""
    driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))
    with driver.session() as session:
        if name == "query_knowledge_graph":
            result = session.run(input["cypher"])
            return json.dumps([dict(r) for r in result], default=str)
        elif name == "search_kg_entities":
            result = session.run("""
                MATCH (e:Entity)
                WHERE toLower(e.name) CONTAINS toLower($name)
                OPTIONAL MATCH (e)-[r:RELATES_TO]-(neighbor)
                RETURN e.name, e.type, collect({rel: r.type, neighbor: neighbor.name})[..5] AS connections
                LIMIT 5
            """, name=input["name"])
            return json.dumps([dict(r) for r in result], default=str)
    driver.close()

# Agent conversation loop
messages = [{"role": "user", "content": "What do you know about Acme Corp's acquisitions?"}]
response = client.messages.create(
    model="claude-sonnet-4-20250514", max_tokens=1024,
    tools=tools, messages=messages
)

# Handle tool use in a loop
while response.stop_reason == "tool_use":
    tool_block = next(b for b in response.content if b.type == "tool_use")
    tool_result = execute_tool(tool_block.name, tool_block.input)
    messages.append({"role": "assistant", "content": response.content})
    messages.append({"role": "user", "content": [
        {"type": "tool_result", "tool_use_id": tool_block.id, "content": tool_result}
    ]})
    response = client.messages.create(
        model="claude-sonnet-4-20250514", max_tokens=1024,
        tools=tools, messages=messages
    )

print(next(b.text for b in response.content if hasattr(b, "text")))
```

### 5.3 With Existing Databases

```python
# Pattern: Sync SQL database to KG (incremental ETL)
# Run via Airflow DAG on schedule

import psycopg2
from neo4j import GraphDatabase

def sync_postgres_to_kg():
    """Sync relational data to knowledge graph."""
    pg = psycopg2.connect("postgresql://user:pass@localhost/mydb")
    neo = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

    with pg.cursor() as cur:
        # Example: employees and departments
        cur.execute("""
            SELECT e.name, e.title, d.name AS dept, e.hire_date
            FROM employees e JOIN departments d ON e.dept_id = d.id
            WHERE e.updated_at > NOW() - INTERVAL '1 day'
        """)
        rows = cur.fetchall()

    with neo.session() as session:
        for name, title, dept, hire_date in rows:
            session.run("""
                MERGE (p:Entity {name: $name})
                SET p.type = 'PERSON', p.title = $title
                MERGE (d:Entity {name: $dept})
                SET d.type = 'DEPARTMENT'
                MERGE (p)-[r:RELATES_TO {type: 'works_in'}]->(d)
                SET r.since = $hire_date
            """, name=name, title=title, dept=dept, hire_date=str(hire_date))

    pg.close()
    neo.close()
```

### 5.4 With Search Engines

```python
# Pattern: KG-enhanced search with entity expansion
# Expand search queries by traversing related entities in the KG

def kg_enhanced_search(query: str, search_engine, neo4j_driver) -> list[dict]:
    """Expand search query using KG relationships."""
    # Step 1: Identify entities in query (simple NER)
    import spacy
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(query)
    entities = [ent.text for ent in doc.ents]

    # Step 2: Expand with KG neighbors
    expanded_terms = set(entities)
    with neo4j_driver.session() as session:
        for entity in entities:
            result = session.run("""
                MATCH (e:Entity)-[r:RELATES_TO]-(neighbor:Entity)
                WHERE e.name CONTAINS $name AND r.confidence > 0.7
                RETURN neighbor.name AS name, r.type AS relation
                LIMIT 5
            """, name=entity)
            for record in result:
                expanded_terms.add(record["name"])

    # Step 3: Run expanded search
    expanded_query = query + " " + " ".join(expanded_terms - set(entities))
    return search_engine.search(expanded_query)
```

---

## 6. Performance

### 6.1 Graph Query Optimization

| Technique | Description | Impact |
|---|---|---|
| **Indexes** | Create indexes on frequently queried properties | 10-100x speedup on lookups |
| **Composite indexes** | Multi-property indexes for complex WHERE clauses | 5-20x for multi-filter queries |
| **PROFILE/EXPLAIN** | Neo4j query planner analysis | Identifies full scans |
| **Relationship direction** | Always specify direction in MATCH | 2-5x on dense graphs |
| **LIMIT early** | Push LIMIT into subqueries | Prevents memory blowup |
| **APOC periodic iterate** | Batch large write operations | Avoids transaction OOM |

```cypher
-- BEFORE: Full scan (slow on large KGs)
MATCH (h:Entity)-[r:RELATES_TO]->(t:Entity)
WHERE h.name = "Acme Corp"
RETURN t

-- AFTER: Index-backed lookup (fast)
-- First create index:
CREATE INDEX entity_name FOR (e:Entity) ON (e.name)
-- Then query uses index automatically:
MATCH (h:Entity {name: "Acme Corp"})-[r:RELATES_TO]->(t:Entity)
RETURN t

-- Profile a query to see the execution plan:
PROFILE MATCH (h:Entity {name: "Acme Corp"})-[:RELATES_TO*1..3]-(t:Entity)
RETURN DISTINCT t.name LIMIT 50
```

### 6.2 Scaling Strategies

| Scale | Triples | Strategy | Stack |
|---|---|---|---|
| Small | < 1M | Single Neo4j instance | Neo4j Community, 8GB RAM |
| Medium | 1M-50M | Neo4j with tuned page cache | Neo4j Enterprise, 32GB RAM |
| Large | 50M-500M | Neo4j Causal Cluster (3+ nodes) | Neo4j Enterprise HA, 64GB+ RAM each |
| Very Large | 500M+ | TigerGraph distributed or Neptune | Dedicated cluster, 256GB+ total |

**Memory sizing for Neo4j:**

```
Page cache = 0.5 * (total_store_size)
Heap = min(31GB, 0.25 * total_RAM)
OS memory = total_RAM - heap - page_cache

# Example for 50M triples (~20GB store):
dbms.memory.pagecache.size=10g
dbms.memory.heap.initial_size=8g
dbms.memory.heap.max_size=8g
# Recommended: 32GB RAM total
```

### 6.3 KG Embedding Training Benchmarks

Benchmarks on FB15k-237 (14,541 entities, 237 relations, 310K triples):

| Model | Dim | MRR | Hits@10 | Train Time (GPU) | Memory |
|---|---|---|---|---|---|
| TransE | 256 | 0.294 | 0.465 | 5 min (A100) | 2 GB |
| RotatE | 256 | 0.338 | 0.533 | 15 min (A100) | 4 GB |
| ComplEx | 256 | 0.348 | 0.536 | 8 min (A100) | 3 GB |
| DistMult | 256 | 0.281 | 0.446 | 4 min (A100) | 2 GB |
| ConvE | 256 | 0.325 | 0.501 | 25 min (A100) | 5 GB |
| TuckER | 200 | 0.358 | 0.544 | 30 min (A100) | 6 GB |

**Scaling rule of thumb:** Training time scales roughly linearly with number of triples and quadratically with embedding dimension. For a 10M triple KG with dim=256, expect ~2-4 hours on a single A100.

### 6.4 Query Latency Benchmarks

| Operation | 1M Triples | 10M Triples | 100M Triples |
|---|---|---|---|
| Single entity lookup (indexed) | < 1ms | < 1ms | < 2ms |
| 1-hop neighborhood | 2-5ms | 5-15ms | 10-30ms |
| 2-hop neighborhood | 10-50ms | 50-200ms | 200ms-1s |
| 3-hop path finding | 50-200ms | 200ms-2s | 1-10s |
| Shortest path (< 5 hops) | 5-20ms | 20-100ms | 100-500ms |
| Full-text search (APOC) | 10-30ms | 30-80ms | 50-200ms |
| GraphRAG (KG retrieval + LLM) | 500ms-2s | 1-3s | 2-5s |

---

## 7. Technology Selection Matrix

| Criteria | Neo4j | ArangoDB | Amazon Neptune | Blazegraph | TigerGraph |
|---|---|---|---|---|---|
| **Graph Model** | Property Graph | Multi-model (Graph + Doc + KV) | Property Graph + RDF | RDF (triples) | Property Graph |
| **Query Language** | Cypher | AQL | Gremlin + SPARQL | SPARQL | GSQL |
| **Max Scale** | Billions of nodes (Enterprise) | Billions (distributed) | Unlimited (managed) | ~10B triples | Trillions of edges |
| **Clustering** | Causal Cluster (Enterprise) | Sharding + Replication | Fully managed HA | Single node | Distributed native |
| **Cloud Managed** | Aura (Neo4j cloud) | Oasis (ArangoDB cloud) | AWS Native | No | TigerGraph Cloud |
| **Learning Curve** | Low (Cypher is intuitive) | Medium (AQL is flexible) | Medium (Gremlin verbose) | Medium (SPARQL standard) | High (GSQL proprietary) |
| **Community/Ecosystem** | Largest (APOC, GDS, Bloom) | Growing | AWS ecosystem | Academic, Wikidata | Enterprise-focused |
| **LLM Integration** | Excellent (LangChain, LlamaIndex) | Good (LangChain) | Good (LangChain) | Limited | Limited |
| **KG Construction Tools** | spaCy, REBEL, LLM pipelines | Same (language agnostic) | Same + AWS Comprehend | RDF-native tools | Custom loaders |
| **Embedding Support** | Via PyKEEN export/import | Via PyKEEN export | Via SageMaker | Via PyKEEN | Built-in graph ML |
| **Visualization** | Bloom, Browser, react-force-graph | Built-in Web UI | Neptune Workbench | None built-in | GraphStudio |
| **License** | GPL-3 (Community) / Commercial | Apache 2.0 | Commercial (pay-per-use) | GPL-2 | Commercial |
| **Best For** | General-purpose KG, GraphRAG | Polyglot persistence needs | AWS-native, serverless | Academic, SPARQL workloads | Large-scale analytics |
| **Price (Production)** | $0 (Community) / ~$2K/mo (Aura) | $0 (OSS) / ~$1K/mo (Oasis) | ~$0.10/hr per instance | Free (self-hosted) | ~$3K/mo (Cloud) |

### Recommendation by Use Case

| Use Case | Recommended | Why |
|---|---|---|
| **Startup/POC** | Neo4j Community | Free, largest ecosystem, best docs, LangChain native |
| **Enterprise KG + GraphRAG** | Neo4j Enterprise | Causal clustering, Bloom visualization, mature tooling |
| **Multi-model (graph + document)** | ArangoDB | Single engine for graph + JSON docs + key-value |
| **AWS-native, serverless** | Amazon Neptune | Zero ops, auto-scaling, IAM integration |
| **Academic/RDF/Linked Data** | Blazegraph | SPARQL native, powers Wikidata Query Service |
| **Massive-scale graph analytics** | TigerGraph | Distributed MPP engine, real-time deep-link analytics |

---

## References

1. Bordes, A. et al. (2013). "Translating Embeddings for Modeling Multi-relational Data." NeurIPS.
2. Sun, Z. et al. (2019). "RotatE: Knowledge Graph Embedding by Relational Rotation in Complex Space." ICLR.
3. Ali, M. et al. (2021). "PyKEEN 1.0: A Python Library for Training and Evaluating Knowledge Graph Embeddings." JMLR.
4. Schlichtkrull, M. et al. (2018). "Modeling Relational Data with Graph Convolutional Networks." ESWC.
5. Microsoft Research. (2024). "GraphRAG: Unlocking LLM Discovery on Narrative Private Data."
6. Neo4j Documentation. (2025). "Neo4j Graph Database 5.x." https://neo4j.com/docs/
7. LangChain Documentation. (2025). "Graph QA Chains." https://python.langchain.com/docs/
8. Pan, J.Z. et al. (2024). "Unifying Large Language Models and Knowledge Graphs: A Roadmap." IEEE TKDE.
