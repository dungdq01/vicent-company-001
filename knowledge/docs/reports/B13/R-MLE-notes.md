# ML Engineer Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

Tabular data remains the dominant data type in enterprise ML. Gradient-boosted decision trees (GBDT) consistently outperform deep learning on structured tabular data. The ML Engineer's role is to build training pipelines, tune models, create ensembles, and manage the full model lifecycle from experiment to production.

## 2. Core Algorithms for Tabular Data

### XGBoost
- The original GBDT powerhouse. Excellent for structured data with moderate feature counts.
- Supports GPU training, built-in regularization (L1/L2), missing value handling.
- Best for: general-purpose tabular, Kaggle-style competitions.

### LightGBM
- Faster training than XGBoost via histogram-based splitting and leaf-wise growth.
- Better for high-cardinality categorical features (native categorical support).
- Best for: large datasets (>1M rows), high-cardinality features.

### CatBoost
- Best native categorical feature handling (ordered target encoding).
- Symmetric tree structure reduces overfitting.
- Best for: datasets with many categorical columns, minimal preprocessing needed.

### When to Use Deep Learning
- TabNet, FT-Transformer for very large datasets (>10M rows) with complex interactions.
- Generally not worth the added complexity for most enterprise tabular tasks.

## 3. Training Pipelines

- Structure training as reproducible scripts: data loading, preprocessing, training, evaluation, artifact saving.
- Use MLflow or Weights & Biases for experiment tracking.
- Log: hyperparameters, metrics, feature importance, training data version, model artifacts.
- Pin random seeds for reproducibility.

## 4. Hyperparameter Tuning

### Optuna
- Bayesian optimization with pruning (early stopping of bad trials).
- Define objective function, search space, and number of trials.
- Key hyperparameters for GBDT: learning_rate, max_depth, n_estimators, min_child_weight, subsample, colsample_bytree, reg_alpha, reg_lambda.

### Ray Tune
- Distributed hyperparameter tuning across multiple machines.
- Integrates with Optuna, HyperOpt, and other search algorithms.
- Best for: large search spaces or expensive-to-train models.

### Practical Tuning Strategy
1. Start with reasonable defaults (learning_rate=0.1, max_depth=6, n_estimators=1000 with early stopping).
2. Coarse search over key parameters (50-100 trials).
3. Fine search around best region (50 trials).
4. Total budget: 100-200 trials is usually sufficient for tabular.

## 5. Cross-Validation Strategies

- **K-Fold (k=5)**: Standard for i.i.d. data. Stratified for imbalanced classification.
- **Time-Series Split**: Mandatory for temporal data. Train on past, validate on future.
- **Group K-Fold**: When samples within a group are correlated (e.g., multiple transactions per customer).
- **Purged K-Fold**: For financial data where information leakage across time boundaries is a risk.
- Always match CV strategy to production deployment pattern.

## 6. Ensemble Methods

### Stacking
- Train base models (XGBoost, LightGBM, CatBoost, logistic regression).
- Use out-of-fold predictions as features for a meta-learner (typically logistic regression or ridge).
- Typical lift: 0.5-2% over best single model.

### Blending
- Simple weighted average of model predictions.
- Optimize weights on validation set.
- Lower risk of overfitting than stacking.

### Practical Guidance
- For production: blending of 2-3 models is usually sufficient.
- For competitions: full stacking with diverse base models.
- Diminishing returns beyond 3-5 base models.

## 7. AutoML Comparison

| Framework | Strengths | Weaknesses |
|-----------|-----------|------------|
| AutoGluon | Best out-of-box accuracy, multi-layer stacking | Heavy resource usage, less customizable |
| H2O AutoML | Enterprise support, good for quick baselines | Java-based, less flexible |
| FLAML | Fast, lightweight, cost-efficient | Less sophisticated ensembling |

- Use AutoML for baselines and feature importance discovery.
- Hand-tuned models typically match or beat AutoML with enough effort.

## 8. Model Registry (MLflow)

- Register models with versioning: staging, production, archived.
- Store model artifacts, metadata, and evaluation metrics.
- Tag models with training data version, feature set version.
- Automate promotion: if new model beats current production on holdout set, promote to staging.

## 9. A/B Testing Model Versions

- Deploy challenger model alongside champion using traffic splitting (e.g., 90/10).
- Monitor key business metrics (not just ML metrics) during A/B test.
- Run for statistically significant duration (typically 1-4 weeks depending on traffic).
- Use shadow mode first: serve both models, but only use champion for decisions.

## 10. Production Model Monitoring

### Performance Decay
- Track prediction accuracy over time using delayed ground truth labels.
- Set alert thresholds: if AUC drops >2% from baseline, trigger review.

### Data Drift
- Monitor input feature distributions vs training data.
- Use PSI, KS test, or Evidently AI for automated drift detection.

### Concept Drift
- The relationship between features and target changes over time.
- Retrain on recent data periodically (weekly/monthly depending on domain).
- For finance: post-COVID, post-regulation changes require immediate retraining.

## 11. Recommendations

1. Default to LightGBM for most tabular tasks; switch to CatBoost for heavy categorical data.
2. Always establish a simple baseline (logistic regression, single GBDT with defaults) before tuning.
3. Invest in proper cross-validation before hyperparameter tuning.
4. Use MLflow from experiment one; the cost of retrofitting tracking is high.
5. Monitor models in production from day one; silent model degradation is the biggest risk.
6. Blend 2-3 diverse models for production; avoid complex stacking unless justified.
7. Retrain models on a schedule (monthly minimum) with automated evaluation gates.
