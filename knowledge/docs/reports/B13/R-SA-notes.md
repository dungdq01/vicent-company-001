# Solution Architect Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

The Solution Architect designs end-to-end prediction platforms that integrate data pipelines, model training, serving infrastructure, and enterprise systems. This note covers reference architectures for batch and real-time prediction, MLOps maturity levels, technology selection, enterprise integration patterns, and migration strategies from manual processes to ML-powered predictions.

## 2. Reference Architectures

### Batch Prediction Architecture
- **Flow**: Data Warehouse -> Feature Pipeline (Airflow) -> Model Training -> Model Registry -> Batch Scorer -> Prediction Table -> BI Dashboard/CRM.
- **Use cases**: Daily credit scoring, weekly churn predictions, monthly customer segmentation.
- **Latency**: Hours (acceptable for decisions made on next business day).
- **Advantages**: Simple, cost-effective, easy to debug and audit.
- **Storage**: Predictions written to warehouse table or served via REST API from cache.

### Real-Time Prediction Architecture
- **Flow**: API Request -> Feature Store (online) -> Model Server -> Response.
- **Use cases**: Instant loan approval, real-time fraud scoring, dynamic pricing.
- **Latency**: <100ms end-to-end.
- **Components**: API Gateway, Feature Store (Redis/DynamoDB), Model Server (FastAPI/BentoML), Load Balancer.
- **Challenges**: Feature freshness, training-serving skew, high availability requirements.

### Hybrid Architecture (Recommended)
- Batch-computed features stored in feature store; refreshed daily/hourly.
- Real-time API serves predictions using pre-computed features.
- Some features computed on-the-fly at request time (e.g., current session behavior).
- Combines cost-efficiency of batch with responsiveness of real-time.

## 3. MLOps Maturity Levels

### Level 0: Manual
- Manual data preparation, model training in notebooks, manual deployment.
- No monitoring, no versioning, no automated retraining.
- Common starting point for Vietnamese enterprises exploring ML.

### Level 1: ML Pipeline Automation
- Automated training pipeline (Airflow/Prefect).
- Model versioning in MLflow. Automated evaluation gates.
- Manual deployment approval.
- Basic monitoring (prediction volume, error rates).

### Level 2: CI/CD for ML
- Automated testing (data quality, model quality, fairness).
- Automated deployment with canary/blue-green strategies.
- Drift monitoring triggers automated retraining.
- Full audit trail for regulatory compliance.

### Level 3: Full MLOps
- Feature store with online/offline consistency.
- A/B testing framework for model experiments.
- Automated model selection and hyperparameter tuning.
- Self-healing: drift detected, retrained, evaluated, deployed automatically.

**Recommendation**: Most Vietnamese enterprises should target Level 1-2. Level 3 requires significant investment and is only justified for high-value, high-frequency prediction systems.

## 4. Technology Selection

### Cloud ML Platforms
| Platform | Strengths | Best For |
|----------|-----------|----------|
| AWS SageMaker | Full lifecycle, Autopilot | AWS-native enterprises |
| GCP Vertex AI | BigQuery integration, AutoML | Data-heavy, BigQuery users |
| Azure ML | Enterprise integration, .NET | Microsoft-stack enterprises |

### Open-Source Stack
| Component | Tool | Alternative |
|-----------|------|-------------|
| Orchestration | Airflow | Prefect, Dagster |
| Experiment tracking | MLflow | Weights & Biases |
| Feature store | Feast | Tecton (managed) |
| Model serving | BentoML | FastAPI + custom |
| Monitoring | Evidently AI | WhyLabs, custom |
| Data validation | Great Expectations | Pandera |

### Decision Framework
- **Cloud ML platforms**: faster to start, higher ongoing cost, vendor lock-in.
- **Open-source stack**: more control, requires DevOps expertise, lower cost at scale.
- **Hybrid**: use cloud for compute (training), open-source for orchestration and serving.
- Vietnamese context: cloud ML platforms may face data residency concerns in regulated industries.

## 5. Enterprise Integration Patterns

### BI Tools Integration
- Predictions as data source for Tableau, Power BI, Metabase.
- Write predictions to warehouse tables that BI tools already query.
- Embed prediction dashboards in existing BI portals.
- Scheduled refresh aligned with prediction refresh cadence.

### CRM Integration
- Push customer-level predictions (churn score, CLV) to Salesforce, HubSpot, or local CRM.
- API integration: CRM triggers prediction on lead/opportunity creation.
- Batch sync: nightly update of all customer scores.
- Vietnamese CRM: many enterprises use custom-built or local CRM systems requiring API adapters.

### ERP Integration
- Demand forecasting predictions feed into inventory management (SAP, Oracle).
- Financial predictions integrated with budgeting and planning modules.
- Use middleware (MuleSoft, custom API layer) for ERP integration.

## 6. Scalability Patterns

### Horizontal Scaling
- Stateless model servers behind load balancer; add replicas for throughput.
- Feature store (Redis cluster) scales independently from model servers.
- Batch processing scales via Spark cluster sizing or serverless (BigQuery, Lambda).

### Data Scaling
- Partition training data by time; train on recent windows.
- Feature computation: incremental updates, not full recomputation.
- Prediction storage: partition by date, archive old predictions.

### Multi-Model Scaling
- Single serving infrastructure for multiple models (multi-tenant).
- Model routing by endpoint or header.
- Shared feature store across models.

## 7. Migration from Excel/Manual to ML-Powered Predictions

### Phase 1: Shadow Mode (1-2 months)
- Build ML model alongside existing manual process.
- Compare ML predictions with manual decisions.
- Build trust: show where ML agrees and disagrees with humans.
- No business impact; purely observational.

### Phase 2: Assisted Mode (2-3 months)
- ML predictions shown to decision-makers as a recommendation.
- Humans make final decision, but ML provides input.
- Track human override rate; understand where humans disagree.
- Collect feedback to improve model.

### Phase 3: Automated with Override (3-6 months)
- ML predictions are the default; humans can override.
- Override requires justification (logged for audit).
- Gradual reduction in override rate as trust builds.

### Phase 4: Fully Automated (6+ months)
- ML predictions drive decisions automatically.
- Human review for edge cases (low confidence predictions).
- Continuous monitoring and retraining.

**Vietnamese enterprise reality**: Phase 1-2 typically takes longer due to organizational change management. Budget 6-12 months for full migration.

## 8. Cost Estimation

| Component | Monthly Cost (Small) | Monthly Cost (Medium) |
|-----------|---------------------|-----------------------|
| Training compute | $50-200 | $500-2,000 |
| Model serving (2 replicas) | $100-300 | $500-1,500 |
| Feature store (Redis) | $50-150 | $200-500 |
| Data warehouse | $100-500 | $1,000-5,000 |
| Monitoring tools | $0-100 | $200-500 |
| **Total** | **$300-1,250** | **$2,400-9,500** |

Tabular ML is one of the most cost-effective ML workloads due to CPU-only requirements.

## 9. Recommendations

1. Start with batch predictions; add real-time only when business latency requirements demand it.
2. Target MLOps Level 1-2; Level 3 is only justified for high-value, high-frequency systems.
3. Use the hybrid architecture: batch features + real-time serving for the best cost-performance ratio.
4. Plan a phased migration from manual to automated predictions; shadow mode builds trust.
5. Integrate predictions into existing BI tools and CRM first; standalone dashboards have lower adoption.
6. Budget 6-12 months for organizational change management in Vietnamese enterprises.
7. Open-source stack (MLflow + Airflow + Feast) provides the best balance of control and cost.
