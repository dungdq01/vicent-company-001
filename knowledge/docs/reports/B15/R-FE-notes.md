# Frontend Engineer Notes: Simulation & Digital Twin (B15)

## 1. Overview

The frontend for simulation and digital twin platforms is uniquely demanding: it combines 3D visualization of physical assets, real-time data overlays, complex parameter controls, and rich charting — all while maintaining responsive performance. The Frontend Engineer must bridge WebGL/3D rendering with traditional dashboard UX.

## 2. 3D Digital Twin Visualization

### Technology Selection
| Library | Strengths | Best For |
|---------|-----------|----------|
| Three.js | Mature, flexible, large ecosystem | Custom 3D scenes, full control |
| React Three Fiber (R3F) | React integration, declarative 3D | React-based applications |
| Cesium / CesiumJS | Geospatial, terrain, large-scale | City/infrastructure twins |
| Babylon.js | Game-quality rendering, physics | High-fidelity industrial twins |
| NVIDIA Omniverse (web) | Photorealistic, USD format | Enterprise digital twins |

### Implementation with React Three Fiber
```jsx
// Core twin scene structure
<Canvas camera={{ position: [10, 10, 10] }}>
  <ambientLight intensity={0.5} />
  <directionalLight position={[10, 10, 5]} />
  <AssetModel url="/models/factory-floor.glb" />
  <SensorOverlays data={sensorData} />
  <HeatmapLayer field={temperatureField} />
  <OrbitControls enableDamping />
</Canvas>
```

### 3D Model Formats
- **glTF/GLB** — standard for web 3D; lightweight, well-supported.
- **USD** — emerging standard for industrial digital twins (NVIDIA-backed).
- **IFC** — Building Information Modeling format for facility twins.
- Model optimization: LOD (Level of Detail), mesh simplification, texture compression (KTX2/Basis).

## 3. Real-Time Data Overlay on 3D Models

### Overlay Types
- **Color-coded sensors** — map sensor values to color gradients on 3D model surfaces.
- **Floating labels** — 2D HTML labels anchored to 3D positions (CSS2DRenderer).
- **Particle effects** — visualize flow, emissions, or vibrations.
- **Heatmaps** — temperature, stress, or pressure distribution mapped to surfaces.
- **Animated indicators** — rotating parts, flowing materials, blinking alerts.

### Data Binding
- WebSocket connection for real-time sensor updates (100ms-1s intervals).
- Map sensor IDs to 3D model node names for automatic binding.
- Interpolation between data points for smooth visual transitions.
- Threshold-based color changes (green → yellow → red) for anomaly highlighting.

## 4. Scenario Comparison Dashboards

### Layout Patterns
- **Side-by-side 3D views** — synchronized cameras showing two scenarios simultaneously.
- **Diff overlay** — single view with color-coded differences between scenarios.
- **Parameter comparison table** — highlight changed parameters between scenarios.
- **Result comparison charts** — overlay time-series from multiple scenarios.

### Implementation
- Shared camera state across multiple Canvas instances via Zustand store.
- Scenario selector with branching tree visualization (like Git graph).
- Drag-and-drop scenario comparison: drop two scenarios to auto-generate comparison view.

## 5. Time-Series Charts for Simulation Output

### Charting Libraries
- **Recharts** — React-native, simple, good for dashboards with moderate data.
- **ECharts (via echarts-for-react)** — high performance, handles millions of points with downsampling.
- **Plotly.js** — scientific charting, 3D plots, statistical charts.
- **uPlot** — ultra-lightweight, fastest for real-time streaming charts.

### Features
- Time range selection with zoom and pan.
- Multi-axis charts (temperature + pressure + flow on same timeline).
- Annotation markers for simulation events (parameter changes, anomalies).
- Real-time streaming mode with rolling window.
- Export to CSV/PNG for reporting.

## 6. Parameter Control Panels

### UI Components
- **Sliders** — continuous parameters (temperature: 0-500C, pressure: 0-100 bar).
- **Number inputs** — precise parameter entry with validation and units.
- **Dropdowns** — discrete parameters (material type, boundary condition type).
- **Toggle groups** — enable/disable simulation features.
- **Parameter presets** — save and load parameter combinations.

### Advanced Controls
- Multi-parameter sweep configuration (grid or random sampling).
- Constraint visualization — show valid parameter ranges, highlight violations.
- Parameter sensitivity display — show which parameters have most impact.
- Undo/redo for parameter changes.
- Form validation with physical constraint checking (e.g., temperature cannot exceed material limits).

## 7. Animation of Simulation Results

- **Temporal playback** — animate simulation results over time with play/pause/seek controls.
- **Playback speed control** — 0.1x to 100x speed for different time scales.
- **Keyframe interpolation** — smooth animation between discrete simulation time steps.
- **Recording** — export animation as video (MediaRecorder API) or GIF sequence.
- Frame buffer management: pre-load upcoming frames for smooth playback.

## 8. Mobile-Responsive 3D Visualization

- Detect device capabilities: reduce polygon count and texture resolution on mobile.
- Touch controls: pinch-to-zoom, two-finger rotate, swipe to pan.
- Progressive loading: show low-res model first, stream higher detail.
- Fallback: 2D dashboard view for devices that cannot handle WebGL.
- Target: 30 FPS minimum on mid-range mobile devices.
- Test on popular Vietnamese devices (Samsung Galaxy A series, Xiaomi Redmi).

## 9. Performance Optimization

- **Instanced rendering** — for repeated objects (machines on a production line).
- **Frustum culling** — only render objects in camera view.
- **Texture atlasing** — combine textures to reduce draw calls.
- **Web Workers** — offload data processing from main thread.
- **RequestAnimationFrame** — synchronize 3D rendering with display refresh rate.
- **Virtual scrolling** — for large parameter lists and result tables.

## 10. Recommendations

1. Use React Three Fiber as the primary 3D framework — it integrates naturally with React ecosystem and state management.
2. Choose ECharts for time-series visualization — it handles the data volumes simulation produces.
3. Implement WebSocket with automatic reconnection for real-time overlays — connection drops are common in industrial environments.
4. Design mobile-first for monitoring views, desktop-first for parameter configuration and scenario comparison.
5. Pre-compute LOD models during asset ingestion — do not rely on runtime simplification.
6. Use Zustand for shared state between 3D views and 2D dashboard components.
