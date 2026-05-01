# Data Analyst Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

Exploratory Data Analysis (EDA) is the foundation of any successful tabular ML project. Before any model is trained, the Data Analyst must understand the data deeply: its distributions, relationships, anomalies, and business context. This note covers systematic EDA workflows, visualization strategies, and reporting for stakeholders.

## 2. Statistical Profiling

- Generate automated data profiles using ydata-profiling (formerly pandas-profiling) or sweetviz.
- Key statistics per column: count, missing %, unique values, mean/median/mode, std dev, min/max, skewness, kurtosis.
- Data type inference: numeric, categorical, datetime, boolean, text, high-cardinality ID.
- Memory usage analysis: identify columns that can be downcast (float64 to float32).
- Profile report serves as the starting point for all further analysis.

## 3. Distribution Analysis

### Numeric Features
- Histograms and KDE plots for each numeric feature.
- Check for: skewness (log-transform candidates), multimodality, zero-inflation, truncation at boundaries.
- Box plots for outlier visualization (IQR method).
- QQ plots to assess normality (relevant for linear models).

### Categorical Features
- Value frequency bar charts.
- Identify: rare categories (<1% frequency), high cardinality (>50 unique), potential encoding errors.
- Vietnamese-specific: inconsistent naming (e.g., "TP.HCM" vs "Ho Chi Minh" vs "HCMC").

### Target Variable
- Class distribution for classification (imbalance ratio).
- Distribution shape for regression (skewness, outliers).
- Temporal trends in target (concept drift indicator).

## 4. Correlation Analysis

- Pearson correlation matrix for numeric features (heatmap visualization).
- Spearman rank correlation for non-linear monotonic relationships.
- Cramers V for categorical-categorical associations.
- Point-biserial correlation for numeric-binary relationships.
- Flag highly correlated feature pairs (>0.95) for potential removal.
- Mutual information for non-linear dependencies.

## 5. Target Variable Analysis

- Bivariate analysis: each feature vs target.
- For classification: distribution of each feature split by target class.
- For regression: scatter plots with trend lines, binned feature vs mean target.
- Identify features with strong predictive signal early.
- Check for data leakage: features that perfectly predict target are suspicious.

## 6. Outlier Detection

- Statistical methods: Z-score (>3), IQR (1.5x), Mahalanobis distance.
- Isolation Forest for multivariate outlier detection.
- Domain-specific rules: negative revenue, age >150, future dates.
- Document outlier handling decisions: remove, cap, or keep with flag.
- Vietnamese data quirk: government data may have placeholder values (9999, -1) for missing data.

## 7. Feature Importance Ranking

- Preliminary importance using: correlation with target, mutual information, chi-squared test.
- Tree-based importance: train a quick Random Forest or LightGBM, extract feature importances.
- Permutation importance for more reliable rankings.
- SHAP summary plots for global feature importance.
- Share top-20 features list with domain experts for validation.

## 8. Visualization Tools

### Plotly
- Interactive charts ideal for stakeholder dashboards.
- Drill-down capability, hover info, export to HTML.
- Best for: presentations, web-based reports, executive summaries.

### Seaborn/Matplotlib
- Publication-quality static plots.
- Pair plots, heatmaps, violin plots.
- Best for: technical reports, notebooks, documentation.

### Key Visualizations for Tabular ML
- Feature distribution grid (all features at a glance).
- Correlation heatmap (filtered to top features).
- Target vs feature scatter/box plots.
- Missing value heatmap (missingno library).
- Time-series of key features (if temporal component exists).

## 9. Vietnamese Business Data Patterns

### Seasonality
- Lunar New Year (Tet): January-February spike/dip depending on industry.
- Mid-Autumn Festival: September retail spike.
- Government fiscal year: January-December (affects B2G data).
- Agricultural cycles: rice harvesting seasons affect rural economic data.

### Regional Differences
- North (Ha Noi) vs South (Ho Chi Minh City) vs Central: distinct economic patterns.
- Urban vs rural divide in consumer behavior data.
- Industrial zones (Binh Duong, Dong Nai) have different patterns from service economies.

### Data Quality Patterns
- National ID changes (9-digit to 12-digit migration) cause deduplication issues.
- Address standardization is challenging (no consistent format).
- Phone number format changes (10-digit to 11-digit and back).

## 10. Report Generation for Stakeholders

- Executive summary: 1-page with key findings, data quality score, recommended next steps.
- Technical EDA report: full Jupyter notebook with all analyses.
- Feature recommendation memo: which features to include/exclude and why.
- Data quality report: missing values, outliers, inconsistencies with remediation plan.
- Use Quarto or Jupyter Book for polished report generation.

## 11. Recommendations

1. Always start with automated profiling (ydata-profiling) before manual EDA.
2. Spend 30-40% of project time on EDA; it directly determines model quality.
3. Validate findings with domain experts; statistical patterns need business context.
4. Document all data quality issues discovered; they become pipeline validation rules.
5. Create reusable EDA templates for recurring project types (credit scoring, churn, etc.).
6. Use interactive Plotly dashboards for stakeholder communication; static plots for technical docs.
7. Pay special attention to Vietnamese data encoding, date formats, and regional naming inconsistencies.
