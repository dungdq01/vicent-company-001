# ML Engineer Notes: Anomaly Detection & Monitoring (B07)
## By Model Ops Lead (R-MLE) — Date: 2026-03-31

### 1. Unsupervised vs Semi-Supervised vs Supervised Approaches

**Unsupervised** (no labels required — start here):
- **Isolation Forest**: Best general-purpose choice. O(n) training, handles high dimensions. Set contamination parameter to estimated anomaly rate.
- **Local Outlier Factor (LOF)**: Density-based, good for clustered data. Not natively suited for streaming (use incremental LOF variant).
- **One-Class SVM**: Works well in moderate dimensions (<100 features). Kernel choice matters — RBF default is usually fine.
- **DBSCAN clustering**: Points not assigned to any cluster are anomalies. Good for spatial/geographic anomaly detection.
- **Statistical methods**: Z-score, IQR, Grubbs test. Simple, interpretable, effective for univariate cases. Always the baseline.

**Semi-supervised** (only normal labels available — most practical scenario):
- Train on verified normal data only. Anything deviating from learned normal is anomalous.
- Autoencoders trained on normal data; high reconstruction error = anomaly.
- One-Class SVM or SVDD fitted to normal data envelope.
- This is often the most practical approach since collecting "known normal" is much easier than collecting "known anomalous."

**Supervised** (both normal and anomaly labels — best if available):
- XGBoost/LightGBM with class weights or SMOTE. Often the best performer when labels exist.
- Requires sufficient anomaly examples (minimum ~100-500 per anomaly type).
- Risk: model only detects known anomaly types, misses novel ones.

**Recommended progression**: Start unsupervised (Isolation Forest) -> collect labels from production alerts -> move to semi-supervised -> accumulate enough labels -> add supervised ensemble member.

### 2. Model Selection Criteria

| Criterion | Weight | Notes |
|-----------|--------|-------|
| Latency requirement | High | Streaming needs <10ms inference; batch is flexible |
| Interpretability need | High | Fraud/compliance requires explainable scores |
| Dimensionality | Medium | >1000 features favors tree-based or autoencoder |
| Data volume | Medium | >1M records/day favors scalable methods (IF, LOF variants) |
| Label availability | High | Determines unsupervised vs supervised path |
| Anomaly types | High | Point vs contextual vs collective anomalies need different approaches |

**Point anomalies**: Individual outliers. Most methods handle these.
**Contextual anomalies**: Normal value in wrong context (e.g., high AC usage in winter). Requires conditional models or time-series approaches.
**Collective anomalies**: Individually normal points that are anomalous as a group. Requires sequence models or graph methods.

### 3. Hyperparameter Tuning for Anomaly Models

Tuning without labels is the core challenge. Strategies:

**Isolation Forest:**
- `n_estimators`: 100-300 (diminishing returns beyond 300)
- `max_samples`: 256 (paper default) works surprisingly well; increase for very large datasets
- `contamination`: Set to business estimate of anomaly rate, or use "auto"

**One-Class SVM:**
- `nu`: Upper bound on fraction of anomalies. Set to estimated contamination.
- `gamma`: Use grid search with stability-based criteria (not accuracy — no labels)

**Tuning without labels:**
- **Stability-based**: Good hyperparameters produce stable anomaly rankings across bootstrap samples
- **Excess mass / mass-volume curves**: Theoretical framework for unsupervised evaluation
- **Internal metrics**: Silhouette score on anomaly vs normal clusters
- **Synthetic anomaly injection**: Inject known synthetic anomalies, tune to detect them. Risk: synthetic may not match real anomaly distribution.

**When some labels exist:**
- Optimize precision at fixed recall (e.g., maximize precision at 90% recall)
- Use PR-AUC, not ROC-AUC (ROC-AUC is misleadingly optimistic with imbalanced data)
- Bayesian optimization (Optuna) over cross-validated PR-AUC

### 4. Threshold Calibration

The anomaly score threshold determines the precision-recall tradeoff. This is a business decision, not a modeling decision.

**Methods:**
- **Fixed percentile**: Flag top 1% of scores as anomalous. Simple, predictable alert volume.
- **Statistical**: Mean + k*stddev of anomaly scores on normal data. k=3 is conservative.
- **Precision-targeted**: Set threshold where estimated precision >= target (e.g., 80%). Requires labeled validation set.
- **Alert-budget**: "We can investigate 50 alerts/day." Set threshold to produce ~50 alerts/day.
- **Dynamic thresholds**: Threshold adapts to time-of-day, day-of-week patterns. Essential for seasonal data.

**Implementation:**
- Store threshold as a separate config, not baked into the model. Allows adjustment without retraining.
- Implement threshold A/B testing infrastructure.
- Track threshold performance metrics: alerts/day, precision (from feedback), mean-time-to-investigate.

### 5. Ensemble Methods

Combining multiple anomaly detectors almost always outperforms a single model.

**Score-level fusion:**
- Normalize scores to [0,1] (min-max per model on a calibration set)
- Average normalized scores (simple, robust)
- Maximum score (aggressive — any model flags it)
- Learned combiner: train a meta-model on normalized scores (requires labels)

**Diversity strategies:**
- Combine methods from different families (density + distance + tree-based)
- Use different feature subsets per model
- Use different time windows per model
- Example ensemble: Isolation Forest + Autoencoder + Statistical (z-score) + XGBoost (if labels exist)

**PyOD library** provides 40+ anomaly detection algorithms with a consistent API. Use `pyod.models.combination` for score fusion.

### 6. Online Learning for Streaming

Models must adapt to evolving data distributions without full retraining.

**Incremental update strategies:**
- **Windowed retraining**: Retrain on last N days of data every M hours. Simple, effective.
- **Incremental Isolation Forest**: Replace oldest trees with trees trained on new data.
- **Online One-Class SVM**: Stochastic gradient descent updates to decision boundary.
- **Exponential forgetting**: Weight recent data more heavily in statistics.

**Implementation pattern:**
1. Deploy model V1 trained on historical data
2. Buffer incoming data in a sliding window (e.g., 7 days)
3. Every N hours, retrain on the window -> model V2
4. Shadow-score with V2 alongside V1 for validation period
5. If V2 meets quality gate, promote to primary
6. Archive V1, repeat

**Concept drift handling:**
- Monitor model prediction distribution; drift in predictions suggests concept drift
- Page-Hinkley test or ADWIN for detecting distribution changes in score stream
- When drift detected, trigger accelerated retraining

### Recommendations for B07

1. **Start with Isolation Forest + z-score ensemble** as baseline. It requires no labels, is fast, and interpretable.
2. **Use PR-AUC as the primary metric**, never accuracy or ROC-AUC on imbalanced anomaly data.
3. **Separate the threshold from the model**. Threshold tuning is the most frequent adjustment; make it operationally cheap.
4. **Build the feedback loop first**: production alerts -> analyst review -> labels -> model improvement. This loop is worth more than any model architecture choice.
5. **Implement windowed retraining** (daily retrain on 30-day window) as the default online learning strategy. Only move to true online learning if latency demands it.
6. **Track novel anomaly detection rate**: percentage of detected anomalies that are new types. If this drops, the model is overfitting to known patterns.
