# QA Engineer Notes: Knowledge Graph (B11)
## By Hoang Thi Mai (R-QA) — Date: 2026-03-31

### 1. Testing Strategy Overview

KG systems require testing at multiple levels:

```
Ontology Validation → Pipeline Testing → Data Quality → Query Performance → Integration Testing → End-to-End
```

Each level catches different categories of defects. Traditional software testing alone is insufficient — KG systems need data-centric quality assurance.

### 2. Ontology Validation

The ontology defines what the KG should contain. Validating the ontology prevents structural defects.

**SHACL (Shapes Constraint Language) validation**:
- Define shape constraints for each entity type
- Validate that all entities conform to their shape
- Example constraints:
  - Every Company must have a `name` property (string, non-empty)
  - Every Company must have exactly one `country` relationship to a Location
  - Person `date_of_birth` must be a valid date before today

**OWL consistency checking**:
- Verify no contradictions in ontology definitions
- Check that class hierarchies are logically consistent
- Tools: HermiT reasoner, Pellet

**Automated checks in CI**:
- Ontology files (OWL/SHACL) committed to Git
- CI pipeline runs validation on every change
- Reject PRs that introduce inconsistencies

### 3. Data Quality Metrics

| Dimension | Metric | Measurement Method | Target |
|-----------|--------|--------------------|--------|
| Completeness | % entities with all required properties | SHACL validation | > 90% |
| Accuracy | % of sampled facts verified as correct | Human spot-check (100 random triples/week) | > 95% |
| Consistency | # contradictory triples (same subject+predicate, different objects for functional properties) | Automated Cypher query | 0 |
| Timeliness | Average age of entity data vs source update | Compare timestamps | < 7 days |
| Uniqueness | # duplicate entity pairs detected | Entity resolution pipeline metrics | < 0.1% |
| Provenance | % triples with source attribution | Cypher count query | 100% |

**Data quality dashboard**: Automated weekly report computing all metrics, tracked over time to detect degradation.

### 4. Regression Testing for KG Updates

Every KG update (new data load, ontology change, pipeline modification) must pass regression tests:

**Regression test suite**:
1. **Entity count stability**: Total entities per type should not drop unexpectedly (> 5% decrease triggers alert)
2. **Relationship count stability**: Same for relationships per type
3. **Known-good queries**: Set of 50+ Cypher queries with expected results, verified after each update
4. **Golden entity checks**: 20 hand-verified entities checked for property completeness and relationship accuracy
5. **Ontology conformance**: Full SHACL validation pass
6. **No orphan nodes**: Entities with zero relationships flagged for review

**Automation**: Run regression suite in CI after every pipeline execution; block deployment if tests fail.

### 5. Performance Testing Graph Queries

**Query performance benchmarks**:

| Query Pattern | Description | Target Latency (p95) |
|--------------|-------------|---------------------|
| Single entity lookup | Get entity by ID with properties | < 10ms |
| Entity search | Full-text search by name | < 100ms |
| 1-hop neighbors | All relationships of one entity | < 50ms |
| 2-hop expansion | Neighbors of neighbors | < 200ms |
| Shortest path | Between two entities (max 6 hops) | < 500ms |
| Aggregation | Count entities by type | < 1s |
| Complex pattern | Multi-hop pattern with filters | < 2s |

**Load testing**:
- Tool: k6 or Locust targeting the GraphQL API
- Scenarios:
  - Steady state: 100 concurrent users, 80% reads, 20% writes
  - Peak load: 500 concurrent users, 95% reads
  - Stress test: Ramp to 1000 concurrent users, find breaking point
- Monitor: Response times, error rates, Neo4j heap/page-cache metrics during test

**Query plan analysis**: For each benchmark query, run `PROFILE` in Neo4j and verify optimal index usage.

### 6. Testing KG Construction Pipeline Accuracy

The NLP pipeline (NER + RE + Entity Linking) that builds the KG must be evaluated against gold-standard annotations.

**Gold-standard dataset**:
- 500 annotated Vietnamese documents with manually labeled entities, relations, and linked entities
- Stratified across domains (healthcare, finance, general)
- Created by domain experts, reviewed by second annotator (inter-annotator agreement > 0.85 Cohen's kappa)

**Evaluation metrics per component**:

| Component | Precision | Recall | F1 Target |
|-----------|-----------|--------|-----------|
| NER (entity-level) | > 92% | > 88% | > 90% |
| Relation Extraction | > 80% | > 70% | > 75% |
| Entity Linking | > 88% | > 82% | > 85% |
| End-to-end triples | > 70% | > 60% | > 65% |

**Regression tracking**: Run evaluation on gold-standard after every model update; F1 must not decrease by more than 1%.

### 7. Benchmarking Against Gold-Standard KGs

Compare our constructed KG against authoritative reference KGs:

**Reference KGs**:
- Wikidata Vietnamese subset (for general entities)
- DangKyKinhDoanh (for Vietnamese companies)
- Domain-specific gold KGs (manually curated by domain experts)

**Comparison metrics**:
- **Entity coverage**: % of reference KG entities present in our KG
- **Relationship coverage**: % of reference relationships present
- **Attribute accuracy**: For shared entities, % of properties that match
- **Novel discoveries**: Entities/relations in our KG not in reference (potential value or errors)

### 8. Test Data Management

- **Synthetic KG for development**: Script-generated graph with known properties for deterministic testing
- **Anonymized production snapshot**: Monthly snapshot with PII replaced for staging tests
- **Golden test entities**: 100 fully verified entities maintained as regression anchors
- **Test data versioning**: Test datasets tracked in Git LFS alongside test code

### 9. Continuous Quality Monitoring

Beyond release-time testing, monitor KG quality in production:

- **Anomaly detection**: Alert when daily entity creation rate deviates > 2 standard deviations from rolling average
- **Broken link detection**: Weekly scan for relationships pointing to non-existent entities
- **Staleness detection**: Flag entities not updated in > 90 days with active source data
- **User feedback loop**: UI button for users to report incorrect facts — feeds into quality dashboard

### 10. Test Automation Framework

```
tests/
  ontology/
    test_shacl_validation.py       — SHACL constraint checks
    test_ontology_consistency.py   — OWL reasoning checks
  data_quality/
    test_completeness.py           — Property completeness checks
    test_consistency.py            — Contradiction detection
    test_uniqueness.py             — Duplicate entity detection
  pipeline/
    test_ner_accuracy.py           — NER against gold standard
    test_re_accuracy.py            — RE against gold standard
    test_entity_linking.py         — Entity linking accuracy
    test_end_to_end_triples.py     — Full pipeline evaluation
  performance/
    test_query_benchmarks.py       — Query latency benchmarks
    locustfile.py                  — Load testing scenarios
  regression/
    test_entity_counts.py          — Entity/relationship count stability
    test_golden_entities.py        — Known-good entity verification
    test_known_queries.py          — Expected query results
```

### Recommendations for B11

1. **Create the gold-standard dataset before building the pipeline** — you cannot evaluate what you cannot measure
2. **Implement SHACL validation in CI from the start** — ontology constraint violations caught early are 10x cheaper to fix
3. **Run data quality metrics weekly and track trends** — gradual quality degradation is harder to detect than sudden failures
4. **Build regression tests around golden entities** — 20 hand-verified entities catch most pipeline regressions
5. **Performance test with realistic graph sizes** — a query that takes 10ms on 1,000 nodes may take 10 seconds on 1,000,000 nodes
6. **Establish inter-annotator agreement before trusting gold data** — gold-standard data with low agreement produces misleading metrics
7. **Automate everything in CI** — manual QA does not scale; every pipeline run must trigger the full test suite automatically
