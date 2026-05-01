# Frontend Engineer Notes: Tabular ML & Predictive Analytics (B13)

## 1. Overview

The Frontend Engineer builds the user-facing layer for prediction systems: dashboards for model performance monitoring, input forms for ad-hoc predictions, result visualizations, explainability displays, and batch upload interfaces. The goal is to make ML outputs accessible and actionable for non-technical stakeholders.

## 2. Model Performance Dashboard

### Key Metrics Display
- Classification: accuracy, precision, recall, F1, AUC-ROC, confusion matrix.
- Regression: MAE, RMSE, R-squared, MAPE.
- Display current vs baseline performance with trend lines over time.
- Traffic light indicators: green (healthy), yellow (degrading), red (action needed).

### Time-Series Performance Tracking
- Line charts showing metric trends over days/weeks/months.
- Overlay model version changes as vertical markers.
- Highlight drift detection events.
- Use Recharts or Chart.js for React-based dashboards; Plotly.js for interactive exploration.

### Model Comparison Table
- Side-by-side comparison of champion vs challenger models.
- Metrics, training data period, feature count, training time, inference latency.
- Toggle between test set metrics and live production metrics.

## 3. Prediction Input Forms

### Single Prediction
- Dynamic form generated from model feature schema.
- Input validation matching feature constraints (min/max, allowed categories, required fields).
- Dropdown for categorical features with search (React Select).
- Tooltips explaining each feature in business terms.
- Submit button triggers API call; display result with loading state.

### Smart Defaults
- Pre-fill with median/mode values for quick exploration.
- Save and recall previous prediction inputs.
- "What-if" mode: adjust one feature at a time and see prediction change.

## 4. Result Visualization

### Probability Gauges
- Semi-circular gauge showing prediction probability (0-100%).
- Color-coded zones: green (low risk), yellow (medium), red (high).
- Numeric display with confidence interval where available.

### Feature Contribution Charts
- Horizontal bar chart showing each feature's contribution to the prediction.
- Positive contributions (pushing prediction up) in one color, negative in another.
- Sorted by absolute contribution magnitude.
- Interactive: hover for exact values, click to see feature distribution.

### Decision Boundary Display
- For binary classification: show where the input falls relative to the decision threshold.
- Allow threshold adjustment slider to see how classification changes.
- Display business impact of threshold change (precision-recall tradeoff).

## 5. SHAP Explainability Displays

### Waterfall Plot
- Step-by-step breakdown from base value to final prediction.
- Each feature shown as a step adding or subtracting from the prediction.
- Render using D3.js or a custom React component (SHAP.js does not exist natively).
- Backend computes SHAP values; frontend renders the visualization.

### Force Plot
- Horizontal bar showing features pushing prediction higher (red) or lower (blue).
- Interactive: hover for feature names and values.
- Compact representation suitable for inline display in prediction results.

### Summary Plot (Global)
- Beeswarm plot showing SHAP values for all features across the dataset.
- Each dot is a sample; color indicates feature value (low to high).
- Use for model-level explainability in dashboard, not per-prediction.

## 6. Batch Upload and Download

### Upload Interface
- Drag-and-drop CSV/Excel upload with file validation.
- Preview first 10 rows before submitting.
- Column mapping UI: map uploaded columns to expected features.
- Progress bar for large batch processing.
- Error handling: show which rows failed and why.

### Download Results
- Download predictions as CSV/Excel with original data plus prediction columns.
- Include: prediction, probability, confidence, top contributing features.
- Support filtered download (e.g., only high-risk predictions).

## 7. Model Comparison Views

- Side-by-side prediction comparison for the same input across model versions.
- Difference highlighting: which features changed importance between versions.
- A/B test results dashboard: conversion rates, business metrics per model version.
- Statistical significance indicators for A/B comparisons.

## 8. Mobile-Responsive Analytics Dashboard

- Responsive grid layout (CSS Grid or Flexbox) for charts and metrics.
- Priority-based layout: key metrics visible on mobile, detailed charts on desktop.
- Touch-friendly interactions: swipe between views, tap for drill-down.
- Progressive loading: show summary cards first, load detailed charts on demand.
- Offline support for field agents (insurance assessors, loan officers) via PWA.

## 9. Technology Stack

| Component | Recommended | Alternative |
|-----------|-------------|-------------|
| Framework | Next.js / React | Vue.js |
| Charts | Recharts, Plotly.js | Chart.js, D3.js |
| UI Library | Ant Design, Shadcn | Material UI |
| State | Zustand, React Query | Redux Toolkit |
| Tables | TanStack Table | AG Grid |
| Forms | React Hook Form + Zod | Formik |

## 10. Recommendations

1. Generate input forms dynamically from model feature schemas to support multiple models without code changes.
2. Always show explainability (SHAP/feature contributions) alongside predictions; bare numbers lack trust.
3. Build the batch upload flow early; most enterprise users operate on spreadsheets, not single predictions.
4. Use React Query for API state management; predictions are naturally cacheable.
5. Design mobile-first for field-facing prediction tools (loan officers, insurance agents).
6. Provide CSV/Excel export for every view; stakeholders will paste into their own reports.
7. Use WebSocket or SSE for long-running batch predictions to show real-time progress.
