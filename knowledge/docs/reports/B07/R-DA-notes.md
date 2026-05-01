# Data Analyst Notes: Anomaly Detection & Monitoring (B07)
## By Insight Strategist (R-DA) — Date: 2026-03-31

### 1. Statistical Profiling

Before building any anomaly detector, thoroughly profile every feature in the dataset.

**Univariate profiling checklist:**
- Distribution type: normal, log-normal, power-law, multimodal, zero-inflated
- Central tendency: mean, median, mode (divergence between mean and median signals skew)
- Dispersion: stddev, IQR, MAD (Median Absolute Deviation — robust to outliers)
- Tail behavior: kurtosis, percentiles (p1, p5, p95, p99, p99.9)
- Stationarity: Augmented Dickey-Fuller test for time series features

**Key insight**: The p99.9 percentile behavior is where anomaly detection lives. Visualize tails explicitly — boxplots truncate them, use scatter plots or ECDF plots instead.

**Multivariate profiling:**
- Correlation matrix (Pearson + Spearman for nonlinear)
- Mutual information between features
- PCA variance explained — if first 5 components explain >90%, dimensionality reduction is viable
- Mahalanobis distance distribution — tail of this distribution reveals multivariate outliers

**Tools:** pandas-profiling (ydata-profiling) for automated reports, scipy.stats for statistical tests, Sweetviz for comparison reports between normal vs suspected-anomaly subsets.

### 2. Distribution Analysis

**Why distributions matter for anomaly detection:**
- Gaussian-assumption methods (z-score) fail on non-Gaussian data
- Heavy-tailed distributions (common in finance, network traffic) make fixed thresholds unreliable
- Multimodal distributions need mixture-model-aware anomaly detection

**Practical distribution analysis workflow:**
1. Plot histogram + KDE for each feature
2. Apply Shapiro-Wilk test (n<5000) or Anderson-Darling test (larger n) for normality
3. If non-normal: try log, Box-Cox, or Yeo-Johnson transforms. Retest.
4. Fit candidate distributions (scipy.stats.fit) and compare via AIC/BIC
5. For multimodal data: fit Gaussian Mixture Model, identify modes

**Common distribution patterns in anomaly domains:**
- Financial transactions: log-normal amounts, power-law in frequency
- Sensor readings: Gaussian with periodic mean shift (temperature, pressure)
- Network traffic: heavy-tailed (Pareto), bursty arrival times
- User behavior: zero-inflated (many users do nothing, active users follow log-normal)

### 3. Seasonality Decomposition

Most real-world data has temporal patterns. Anomalies must be detected relative to expected patterns, not raw values.

**Decomposition methods:**
- **STL (Seasonal-Trend-Loess)**: Robust, handles multiple seasonalities. Use `statsmodels.tsa.seasonal.STL`.
- **MSTL**: Multiple seasonal periods (hourly data with daily + weekly + yearly patterns).
- **Prophet**: Facebook's tool, good for business time series with holidays and changepoints.

**Practical approach:**
1. Decompose: observed = trend + seasonal + residual
2. Anomaly detection on the **residual** component, not the raw signal
3. This dramatically reduces false positives from predictable patterns

**Common seasonalities to check:**
- Hourly (intraday patterns)
- Daily (weekday vs weekend)
- Weekly
- Monthly (billing cycles, payroll)
- Annual (holidays, fiscal quarters)
- Custom (Lunar New Year for Vietnam, Ramadan for MENA markets)

### 4. Correlation Analysis for Anomaly Context

**Cross-feature correlation shifts as anomaly signals:**
- Normal: temperature and pressure are positively correlated in a machine
- Anomaly: correlation breaks (temperature rises but pressure stays flat = sensor failure or abnormal state)
- Monitor rolling correlation coefficients between feature pairs

**Conditional analysis:**
- Segment data by context (time-of-day, customer segment, product category)
- What is anomalous in one segment may be normal in another
- Build segment-specific statistical profiles

**Granger causality for temporal anomalies:**
- Does feature A predict feature B? If causality breaks, something changed.
- Useful for root cause analysis after anomaly detection.

### 5. Visualization Techniques for Anomalies

**Static visualizations:**
- **Scatter plot with anomaly overlay**: Plot features, color-code anomaly scores. Most intuitive.
- **Heatmap of anomaly scores over time**: Rows = entities, columns = time, color = score. Reveals temporal clustering of anomalies.
- **ECDF (Empirical CDF)**: Plot normal vs anomalous distributions. Clear separation = good detection.
- **Parallel coordinates plot**: Each feature is an axis. Anomalous samples cross axes at unusual positions. Good for high-dimensional data.
- **t-SNE / UMAP**: Reduce to 2D, color by anomaly score. Shows if anomalies form clusters or are scattered.

**Time-series specific:**
- **Control chart (Shewhart)**: Value over time with UCL/LCL bands. Classic, effective, familiar to operations teams.
- **CUSUM chart**: Cumulative sum of deviations. Detects slow drifts that point-anomaly methods miss.
- **Deviation timeline**: Plot residual (after seasonal decomposition) with anomaly markers.

**Best practices:**
- Always show context: mark known events (deployments, holidays, outages) on time-series plots
- Use consistent color coding: red for anomaly, green for normal, yellow for borderline
- Show confidence: use opacity or size to encode anomaly score magnitude
- Interactive filtering: allow filtering by anomaly type, severity, time range

### 6. Dashboard Design for Anomaly Monitoring

**Tier 1: Executive overview (1 screen)**
- Total anomaly count (24h, 7d, 30d) with trend arrows
- Anomaly rate (anomalies / total events) with historical comparison
- Top 5 anomaly categories by volume
- System health: green/yellow/red per monitored domain

**Tier 2: Analyst workbench (interactive)**
- Anomaly feed: sortable by score, time, type, entity
- Drill-down: click anomaly -> see feature values, historical context, similar past anomalies
- Feedback buttons: Confirm anomaly / Dismiss as false positive / Escalate
- Filtering: time range, entity, anomaly type, score range, status (new/reviewed/resolved)

**Tier 3: Data scientist deep-dive**
- Model performance metrics: precision, recall, F1 over time
- Feature importance for current anomalies (SHAP values)
- Score distribution histogram with threshold line
- Drift metrics dashboard: feature-level drift indicators

**Tool recommendations:**
- Grafana: excellent for time-series anomaly dashboards, native alerting
- Superset/Metabase: good for SQL-based anomaly exploration
- Streamlit: rapid prototyping of analyst-facing anomaly tools
- Custom React dashboard: when Grafana limitations are hit (complex interactions)

**Alert fatigue prevention:**
- Group related anomalies (same entity, same time window) into incidents
- Show precision rate prominently (what % of past alerts were true positives)
- Implement "snooze" and "suppress similar" functionality
- Rank by business impact, not just anomaly score

### Recommendations for B07

1. **Profile data exhaustively** before modeling. 80% of false positives come from misunderstanding normal data behavior (seasonality, multimodality, heavy tails).
2. **Decompose seasonality first**. Running anomaly detection on raw seasonal data produces useless results.
3. **Build the analyst feedback dashboard early**. The feedback loop (alert -> review -> label) is more valuable than any model improvement.
4. **Track precision at the dashboard level**. If analysts see mostly false positives, they stop investigating alerts entirely.
5. **Use UMAP visualization** to validate that anomaly models are actually separating anomalies from normal data in feature space.
6. **Design dashboards for the three tiers** — executives need different views than analysts and data scientists.
