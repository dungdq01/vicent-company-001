# Technical Report: Simulation & Digital Twin (B15)
## By Dr. Praxis (R-β) — Date: 2026-03-31

---

## 1. Architecture Overview

### 1.1 Simple — Discrete Event Simulation (SimPy + Analysis Scripts)

```
┌─────────────────────────────────────────────────┐
│  Python Script                                  │
│                                                 │
│  ┌──────────┐   ┌──────────┐   ┌────────────┐  │
│  │ SimPy    │──>│ Logger   │──>│ matplotlib │  │
│  │ Environment│ │ (CSV)    │   │ / pandas   │  │
│  └──────────┘   └──────────┘   └────────────┘  │
│       │                             │           │
│  Resources,                    Charts, KPIs     │
│  Processes,                    Throughput,       │
│  Events                       Utilization       │
└─────────────────────────────────────────────────┘
```

**When to use:** Quick what-if analysis, process modeling, educational projects, PoC validation.

### 1.2 Intermediate — Digital Twin Platform (IoT → Pipeline → Sim → Dashboard)

```
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌────────────┐
│ Physical │    │ Message  │    │ Time-Series  │    │ Simulation │
│ Sensors  │───>│ Broker   │───>│ Database     │───>│ Engine     │
│ (IoT)    │    │ (MQTT)   │    │ (InfluxDB)   │    │ (SimPy)    │
└──────────┘    └──────────┘    └──────────────┘    └─────┬──────┘
                                                          │
                                                          v
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌────────────┐
│ Alerts / │<───│ FastAPI  │<───│ Results      │<───│ What-If    │
│ Actions  │    │ Backend  │    │ Store        │    │ Scenarios  │
└──────────┘    └──────────┘    └──────────────┘    └────────────┘
                     │
                     v
              ┌──────────────┐
              │ React +      │
              │ Grafana      │
              │ Dashboard    │
              └──────────────┘
```

**When to use:** Single-asset monitoring, predictive maintenance, production line optimization.

### 1.3 Advanced — Enterprise Digital Twin (Multi-Physics, Real-Time, AI-Augmented)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Enterprise Digital Twin                      │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Edge     │  │ Cloud    │  │ AI/ML    │  │ 3D Rendering  │  │
│  │ Gateway  │  │ IoT Hub  │  │ Inference│  │ (Omniverse /  │  │
│  │ (MQTT/  │──>│ (Azure / │──>│ (PINNs / │──>│  Three.js)    │  │
│  │  OPC-UA) │  │  AWS)    │  │  GP/NDE) │  │               │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
│       ^                           │               │             │
│       │         ┌─────────────────v───────────────v──┐          │
│       │         │  Orchestration (Airflow / K8s Jobs)│          │
│       │         └─────────────────┬──────────────────┘          │
│       │                           v                             │
│  ┌────┴─────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Actuator │  │ SCADA /  │  │ Scenario │  │ Data Lake     │  │
│  │ Feedback │<─│ MES / ERP│  │ Manager  │  │ (S3/ADLS)     │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**When to use:** Factory-wide or city-scale twins, multi-physics coupling, closed-loop autonomous control.

---

## 2. Tech Stack

| Layer | Technology | Purpose | License |
|-------|-----------|---------|---------|
| **Simulation — DES** | SimPy 4.x | Process-based discrete event simulation | MIT |
| **Simulation — ABM** | Mesa 2.x | Agent-based modeling in Python | Apache 2.0 |
| **Simulation — Commercial** | AnyLogic | Multi-method simulation (DES + ABM + SD) | Commercial |
| **Physics — FEM** | FEniCSx | Finite element PDE solver | LGPL |
| **Physics — CFD** | OpenFOAM 11 | Computational fluid dynamics | GPL |
| **Physics — PINN** | DeepXDE 1.x | Physics-informed neural networks | Apache 2.0 |
| **Physics — PINN** | NVIDIA Modulus | Production PINNs with multi-GPU | Apache 2.0 |
| **Neural ODE** | torchdiffeq | Neural ODE solver for PyTorch | MIT |
| **Digital Twin Platform** | Azure Digital Twins | Graph-based twin modeling (DTDL) | Cloud SaaS |
| **Digital Twin Platform** | AWS IoT TwinMaker | 3D scene + data binding | Cloud SaaS |
| **3D Visualization** | NVIDIA Omniverse | USD-based collaborative 3D platform | Commercial |
| **3D — Web** | Three.js / R3F | Browser-based 3D rendering | MIT |
| **3D — Geospatial** | CesiumJS | Globe-scale 3D visualization | Apache 2.0 |
| **Time-Series DB** | InfluxDB 3.x | High-ingest time-series storage | MIT / Commercial |
| **Time-Series DB** | TimescaleDB | PostgreSQL extension for time-series | Apache 2.0 |
| **Messaging** | Eclipse Mosquitto | Lightweight MQTT broker | EPL 2.0 |
| **Messaging** | EMQX | Scalable MQTT broker (clustering) | Apache 2.0 |
| **Dashboard** | Grafana | Metrics dashboards + alerting | AGPL |
| **Orchestration** | Apache Airflow | Workflow scheduling | Apache 2.0 |
| **Orchestration** | Kubernetes Jobs | Container-based simulation runs | Apache 2.0 |
| **Backend** | FastAPI | REST/WebSocket API layer | MIT |
| **Frontend** | React + Vite | Dashboard UI | MIT |

---

## 3. Pipeline Design

### 3.1 End-to-End Digital Twin Pipeline

```
 ┌────────┐   ┌────────┐   ┌──────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐
 │ INGEST │──>│ STORE  │──>│ SYNC     │──>│ SIMULATE  │──>│ VISUALIZE│──>│ ACTUATE  │
 └────────┘   └────────┘   └──────────┘   └───────────┘   └──────────┘   └──────────┘
  Sensors      InfluxDB     State Update   Physics/ML      Three.js       Closed-loop
  MQTT/OPC-UA  TimescaleDB  Twin Graph     What-if         Grafana        Control
```

### Stage 1: IoT Data Ingestion

```python
# mqtt_ingestion.py — Sensor data to InfluxDB
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
import json, os

INFLUX_URL = os.getenv("INFLUX_URL", "http://localhost:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN")
INFLUX_ORG = "factory"
INFLUX_BUCKET = "sensor_data"

influx = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
write_api = influx.write_api(write_options=SYNCHRONOUS)

def on_message(client, userdata, msg):
    data = json.loads(msg.payload.decode())
    point = (
        Point(data["measurement"])
        .tag("sensor_id", data["sensor_id"])
        .tag("location", data["location"])
        .field("value", float(data["value"]))
        .field("unit", data["unit"])
    )
    write_api.write(bucket=INFLUX_BUCKET, record=point)

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_message = on_message
client.connect("localhost", 1883, 60)
client.subscribe("factory/sensors/#")
client.loop_forever()
```

### Stage 2: Digital Twin State Update

```python
# twin_state.py — Maintains live twin state from sensor streams
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Optional
import json

@dataclass
class MachineState:
    machine_id: str
    temperature: float = 0.0
    vibration: float = 0.0
    rpm: float = 0.0
    power_kw: float = 0.0
    status: str = "idle"  # idle | running | warning | fault
    last_updated: Optional[datetime] = None

    def update_from_sensor(self, sensor_type: str, value: float):
        setattr(self, sensor_type, value)
        self.last_updated = datetime.utcnow()
        self._evaluate_status()

    def _evaluate_status(self):
        if self.temperature > 85.0 or self.vibration > 10.0:
            self.status = "warning"
        elif self.temperature > 95.0 or self.vibration > 15.0:
            self.status = "fault"
        elif self.rpm > 0:
            self.status = "running"
        else:
            self.status = "idle"


class DigitalTwinRegistry:
    """Registry holding all asset twins in memory."""

    def __init__(self):
        self._twins: Dict[str, MachineState] = {}

    def get_or_create(self, machine_id: str) -> MachineState:
        if machine_id not in self._twins:
            self._twins[machine_id] = MachineState(machine_id=machine_id)
        return self._twins[machine_id]

    def update(self, machine_id: str, sensor_type: str, value: float):
        twin = self.get_or_create(machine_id)
        twin.update_from_sensor(sensor_type, value)
        return twin

    def snapshot(self) -> dict:
        return {mid: vars(t) for mid, t in self._twins.items()}
```

### Stage 3: Simulation Execution

```python
# simulation_runner.py — Run SimPy simulation parameterized by twin state
import simpy
import random
from typing import Dict

def production_line_sim(
    env: simpy.Environment,
    twin_snapshot: Dict,
    sim_hours: float = 8.0,
    results: dict = None,
):
    """Simulate production using live twin state as initial conditions."""

    machines = {}
    for mid, state in twin_snapshot.items():
        # Degrade processing speed based on real temperature
        temp_factor = max(0.5, 1.0 - (state["temperature"] - 60) / 100)
        machines[mid] = {
            "resource": simpy.Resource(env, capacity=1),
            "process_time": 5.0 / temp_factor,  # minutes, degraded by heat
            "failure_prob": 0.01 * (state["vibration"] / 5.0),
        }

    produced = {"count": 0, "downtime_minutes": 0}

    def job(env, job_id, machine_id):
        m = machines[machine_id]
        with m["resource"].request() as req:
            yield req
            if random.random() < m["failure_prob"]:
                repair_time = random.uniform(10, 30)
                produced["downtime_minutes"] += repair_time
                yield env.timeout(repair_time)
            yield env.timeout(m["process_time"])
            produced["count"] += 1

    def job_generator(env):
        job_id = 0
        machine_ids = list(machines.keys())
        while True:
            yield env.timeout(random.expovariate(1.0 / 3.0))  # avg 3 min between arrivals
            mid = random.choice(machine_ids)
            env.process(job(env, job_id, mid))
            job_id += 1

    env.process(job_generator(env))
    env.run(until=sim_hours * 60)

    if results is not None:
        results.update(produced)
    return produced
```

### Stage 4: What-If Scenario Management

```python
# scenario_manager.py
from dataclasses import dataclass
from typing import Dict, Any, List
import copy
import simpy

@dataclass
class Scenario:
    name: str
    description: str
    overrides: Dict[str, Any]  # twin state overrides

class ScenarioManager:
    def __init__(self, base_snapshot: dict):
        self.base = base_snapshot

    def create_scenario(self, name: str, desc: str, overrides: dict) -> Scenario:
        return Scenario(name=name, description=desc, overrides=overrides)

    def apply(self, scenario: Scenario) -> dict:
        modified = copy.deepcopy(self.base)
        for machine_id, changes in scenario.overrides.items():
            if machine_id in modified:
                modified[machine_id].update(changes)
        return modified

    def run_comparison(self, scenarios: List[Scenario], sim_func, sim_hours=8.0):
        results = {}
        # Baseline
        env = simpy.Environment()
        res = {}
        sim_func(env, self.base, sim_hours, res)
        results["baseline"] = res

        # Each scenario
        for sc in scenarios:
            snapshot = self.apply(sc)
            env = simpy.Environment()
            res = {}
            sim_func(env, snapshot, sim_hours, res)
            results[sc.name] = res

        return results


# Usage
if __name__ == "__main__":
    from simulation_runner import production_line_sim

    base = {
        "M1": {"temperature": 72.0, "vibration": 4.5, "rpm": 1500},
        "M2": {"temperature": 80.0, "vibration": 7.2, "rpm": 1450},
    }

    mgr = ScenarioManager(base)

    scenarios = [
        mgr.create_scenario(
            "cool_m2", "Add cooling to M2",
            {"M2": {"temperature": 65.0}}
        ),
        mgr.create_scenario(
            "replace_m2", "Replace M2 entirely",
            {"M2": {"temperature": 55.0, "vibration": 2.0, "rpm": 1500}}
        ),
    ]

    results = mgr.run_comparison(scenarios, production_line_sim)
    for name, r in results.items():
        print(f"{name}: produced={r['count']}, downtime={r['downtime_minutes']:.1f} min")
```

### Stage 5: Visualization & Dashboard (WebSocket API)

```python
# api.py — FastAPI backend serving twin state + simulation results
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio, json

app = FastAPI(title="Digital Twin API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# In-memory twin registry (production: inject via DI)
from twin_state import DigitalTwinRegistry
registry = DigitalTwinRegistry()

@app.get("/api/twins")
def get_all_twins():
    return registry.snapshot()

@app.get("/api/twins/{machine_id}")
def get_twin(machine_id: str):
    twin = registry.get_or_create(machine_id)
    return vars(twin)

@app.post("/api/simulate")
def run_simulation(sim_hours: float = 8.0):
    import simpy
    from simulation_runner import production_line_sim
    env = simpy.Environment()
    results = {}
    production_line_sim(env, registry.snapshot(), sim_hours, results)
    return results

@app.websocket("/ws/twins")
async def twin_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(registry.snapshot())
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
```

### Stage 6: Closed-Loop Feedback

```python
# feedback_controller.py — Send control signals back to physical system
import paho.mqtt.client as mqtt
import json

class FeedbackController:
    def __init__(self, broker="localhost", port=1883):
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.client.connect(broker, port)

    def send_command(self, machine_id: str, action: str, params: dict):
        payload = {
            "machine_id": machine_id,
            "action": action,
            "params": params,
            "source": "digital_twin",
        }
        topic = f"factory/commands/{machine_id}"
        self.client.publish(topic, json.dumps(payload), qos=1)

    def auto_respond(self, twin_snapshot: dict):
        """Automatic responses based on twin state."""
        for mid, state in twin_snapshot.items():
            if state.get("temperature", 0) > 90:
                self.send_command(mid, "reduce_speed", {"target_rpm": 1000})
            if state.get("vibration", 0) > 12:
                self.send_command(mid, "schedule_maintenance", {"priority": "high"})
```

---

## 4. Mini Examples

### Example 1: Quick Start — Factory Production Line Simulation with SimPy

**Level:** Beginner | **Time:** 45 minutes | **Stack:** Python, SimPy, matplotlib

```bash
# Setup
mkdir factory-sim && cd factory-sim
python -m venv .venv && source .venv/bin/activate
pip install simpy matplotlib pandas numpy
```

```python
# factory_sim.py — Complete factory line simulation
import simpy
import random
import pandas as pd
import matplotlib.pyplot as plt
from dataclasses import dataclass, field
from typing import List

# ── Configuration ──────────────────────────────────────
RANDOM_SEED = 42
SIM_DURATION = 480          # minutes (8-hour shift)
NUM_MACHINES = 3
BUFFER_CAPACITY = 10
INTER_ARRIVAL = 2.5         # avg minutes between raw material arrivals
MACHINE_PROCESS_TIMES = [4.0, 6.0, 3.5]   # minutes per machine
MACHINE_FAILURE_RATE = 0.02                # probability per job
REPAIR_TIME_RANGE = (15, 45)               # minutes

@dataclass
class SimMetrics:
    produced: int = 0
    rejected: int = 0
    buffer_overflows: int = 0
    machine_downtime: List[float] = field(default_factory=lambda: [0.0, 0.0, 0.0])
    wait_times: List[float] = field(default_factory=list)
    throughput_log: List[dict] = field(default_factory=list)

metrics = SimMetrics()

def machine_process(env, name, machine_idx, resource, buffer_in, buffer_out, process_time):
    """A machine takes from input buffer, processes, puts to output buffer."""
    while True:
        item = yield buffer_in.get()
        arrival = env.now

        with resource.request() as req:
            yield req
            wait = env.now - arrival
            metrics.wait_times.append(wait)

            # Random failure
            if random.random() < MACHINE_FAILURE_RATE:
                repair = random.uniform(*REPAIR_TIME_RANGE)
                metrics.machine_downtime[machine_idx] += repair
                yield env.timeout(repair)

            # Process
            yield env.timeout(random.expovariate(1.0 / process_time))

        if buffer_out is not None:
            if len(buffer_out.items) < buffer_out.capacity:
                yield buffer_out.put(item)
            else:
                metrics.buffer_overflows += 1
        else:
            metrics.produced += 1

def material_arrival(env, buffer):
    """Generate raw materials arriving at the first buffer."""
    item_id = 0
    while True:
        yield env.timeout(random.expovariate(1.0 / INTER_ARRIVAL))
        if len(buffer.items) < buffer.capacity:
            yield buffer.put(f"item_{item_id}")
        else:
            metrics.buffer_overflows += 1
        item_id += 1

def throughput_monitor(env, interval=30):
    """Log throughput every `interval` minutes."""
    prev = 0
    while True:
        yield env.timeout(interval)
        delta = metrics.produced - prev
        metrics.throughput_log.append({"time": env.now, "units": delta, "cumulative": metrics.produced})
        prev = metrics.produced

def run_simulation():
    random.seed(RANDOM_SEED)
    env = simpy.Environment()

    # Create buffers between machines
    buffers = [simpy.Store(env, capacity=BUFFER_CAPACITY) for _ in range(NUM_MACHINES)]

    # Create machine resources
    resources = [simpy.Resource(env, capacity=1) for _ in range(NUM_MACHINES)]

    # Wire up the line
    env.process(material_arrival(env, buffers[0]))
    for i in range(NUM_MACHINES):
        buf_out = buffers[i + 1] if i + 1 < NUM_MACHINES else None
        env.process(machine_process(
            env, f"Machine_{i}", i, resources[i],
            buffers[i], buf_out, MACHINE_PROCESS_TIMES[i]
        ))
    env.process(throughput_monitor(env))

    env.run(until=SIM_DURATION)
    return metrics

def plot_results(m: SimMetrics):
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))

    # Throughput over time
    df = pd.DataFrame(m.throughput_log)
    if not df.empty:
        axes[0].bar(df["time"], df["units"], width=25, color="#2196F3")
        axes[0].set_xlabel("Time (min)")
        axes[0].set_ylabel("Units produced")
        axes[0].set_title("Throughput per 30-min window")

    # Machine downtime
    axes[1].barh([f"M{i}" for i in range(NUM_MACHINES)], m.machine_downtime, color="#FF5722")
    axes[1].set_xlabel("Downtime (min)")
    axes[1].set_title("Machine Downtime")

    # Wait time distribution
    if m.wait_times:
        axes[2].hist(m.wait_times, bins=20, color="#4CAF50", edgecolor="black")
        axes[2].set_xlabel("Wait time (min)")
        axes[2].set_title("Queue Wait Time Distribution")

    plt.tight_layout()
    plt.savefig("factory_sim_results.png", dpi=150)
    plt.show()

if __name__ == "__main__":
    result = run_simulation()
    print(f"Total produced:     {result.produced}")
    print(f"Buffer overflows:   {result.buffer_overflows}")
    print(f"Avg wait time:      {sum(result.wait_times)/len(result.wait_times):.2f} min" if result.wait_times else "")
    for i, dt in enumerate(result.machine_downtime):
        print(f"Machine {i} downtime: {dt:.1f} min")
    plot_results(result)
```

**Key learning points:**
- `simpy.Store` = buffer with finite capacity (models WIP inventory)
- `simpy.Resource` = shared resource with queuing (models machines/workers)
- `env.timeout()` = deterministic or stochastic delay
- Monitor metrics over time for bottleneck identification

---

### Example 2: Production — Real-Time Manufacturing Digital Twin

**Level:** Advanced | **Time:** 6 hours | **Stack:** FastAPI, React, Three.js, InfluxDB, SimPy, MQTT

#### Project Structure

```
manufacturing-twin/
├── docker-compose.yml
├── backend/
│   ├── requirements.txt
│   ├── main.py              # FastAPI app
│   ├── twin_state.py        # Twin registry
│   ├── simulation.py        # SimPy engine
│   ├── mqtt_listener.py     # MQTT ingestion
│   └── sensor_simulator.py  # Fake sensors for demo
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── FactoryScene.tsx    # Three.js 3D scene
│   │   │   ├── MachineModel.tsx    # Individual machine 3D
│   │   │   ├── Dashboard.tsx       # KPI panels
│   │   │   └── ScenarioPanel.tsx   # What-if controls
│   │   └── hooks/
│   │       └── useTwinSocket.ts    # WebSocket hook
│   └── index.html
└── mosquitto/
    └── mosquitto.conf
```

#### docker-compose.yml

```yaml
services:
  mosquitto:
    image: eclipse-mosquitto:2
    ports: ["1883:1883", "9001:9001"]
    volumes:
      - ./mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf

  influxdb:
    image: influxdb:2.7
    ports: ["8086:8086"]
    environment:
      DOCKER_INFLUXDB_INIT_MODE: setup
      DOCKER_INFLUXDB_INIT_USERNAME: admin
      DOCKER_INFLUXDB_INIT_PASSWORD: admin12345
      DOCKER_INFLUXDB_INIT_ORG: factory
      DOCKER_INFLUXDB_INIT_BUCKET: sensor_data
      DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: my-super-secret-token

  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      INFLUX_URL: http://influxdb:8086
      INFLUX_TOKEN: my-super-secret-token
      MQTT_BROKER: mosquitto
    depends_on: [mosquitto, influxdb]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
```

#### backend/sensor_simulator.py — Fake IoT Sensors for Demo

```python
# sensor_simulator.py — Generates realistic sensor data over MQTT
import paho.mqtt.client as mqtt
import json, time, random, math

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.connect("localhost", 1883)

MACHINES = {
    "CNC_01": {"base_temp": 55, "base_vib": 3.0, "base_rpm": 2400},
    "CNC_02": {"base_temp": 60, "base_vib": 3.5, "base_rpm": 2200},
    "PRESS_01": {"base_temp": 70, "base_vib": 5.0, "base_rpm": 800},
}

t = 0
while True:
    for mid, base in MACHINES.items():
        # Simulate daily temperature cycle + random noise
        temp = base["base_temp"] + 10 * math.sin(t / 200) + random.gauss(0, 2)
        vib = base["base_vib"] + 1.5 * math.sin(t / 150) + random.gauss(0, 0.5)
        rpm = base["base_rpm"] + random.gauss(0, 20)

        for sensor_type, value in [("temperature", temp), ("vibration", vib), ("rpm", rpm)]:
            payload = {
                "measurement": "machine_sensors",
                "sensor_id": f"{mid}_{sensor_type}",
                "location": mid,
                "value": round(value, 2),
                "unit": {"temperature": "°C", "vibration": "mm/s", "rpm": "rpm"}[sensor_type],
            }
            client.publish(f"factory/sensors/{mid}/{sensor_type}", json.dumps(payload))

    time.sleep(1.0)
    t += 1
```

#### backend/main.py — Full Backend

```python
# main.py — FastAPI backend with twin state, simulation, WebSocket
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio, threading

from twin_state import DigitalTwinRegistry
from mqtt_listener import MQTTListener
from simulation import run_whatif_simulation

registry = DigitalTwinRegistry()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start MQTT listener in background thread
    listener = MQTTListener(registry, broker="mosquitto")
    thread = threading.Thread(target=listener.start, daemon=True)
    thread.start()
    yield
    listener.stop()

app = FastAPI(title="Manufacturing Digital Twin", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/api/twins")
def list_twins():
    return registry.snapshot()

@app.post("/api/simulate")
def simulate(scenario: dict = None, sim_hours: float = 8.0):
    snapshot = registry.snapshot()
    if scenario:
        for mid, overrides in scenario.items():
            if mid in snapshot:
                snapshot[mid].update(overrides)
    return run_whatif_simulation(snapshot, sim_hours)

@app.websocket("/ws/live")
async def live_twin_feed(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = registry.snapshot()
            # Add computed KPIs
            for mid, state in data.items():
                state["health_score"] = max(0, 100 - (state.get("temperature", 60) - 60) * 2
                                            - state.get("vibration", 0) * 5)
            await ws.send_json(data)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
```

#### frontend/src/components/FactoryScene.tsx — 3D Twin Visualization

```tsx
// FactoryScene.tsx — Three.js 3D factory floor
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Box, Cylinder } from "@react-three/drei";
import { useTwinSocket } from "../hooks/useTwinSocket";

interface MachineProps {
  id: string;
  position: [number, number, number];
  state: {
    temperature: number;
    vibration: number;
    status: string;
    health_score: number;
  };
}

function Machine({ id, position, state }: MachineProps) {
  // Color based on health: green → yellow → red
  const health = state?.health_score ?? 100;
  const r = Math.min(1, (100 - health) / 50);
  const g = Math.min(1, health / 50);
  const color = `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, 50)`;

  // Vibration effect: shake the mesh
  const vibScale = (state?.vibration ?? 0) * 0.005;

  return (
    <group position={position}>
      {/* Machine body */}
      <Box
        args={[2, 1.5, 1.5]}
        position={[Math.sin(Date.now() * vibScale) * 0.02, 0.75, 0]}
      >
        <meshStandardMaterial color={color} />
      </Box>

      {/* Spindle */}
      <Cylinder args={[0.15, 0.15, 0.8]} position={[0, 1.9, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#888" />
      </Cylinder>

      {/* Label */}
      <Text position={[0, 2.5, 0]} fontSize={0.3} color="white">
        {id}
      </Text>
      <Text position={[0, -0.3, 0]} fontSize={0.2} color="white">
        {`${state?.temperature?.toFixed(1) ?? "--"}°C | HP: ${health.toFixed(0)}%`}
      </Text>
    </group>
  );
}

const MACHINE_POSITIONS: Record<string, [number, number, number]> = {
  CNC_01: [-4, 0, 0],
  CNC_02: [0, 0, 0],
  PRESS_01: [4, 0, 0],
};

export default function FactoryScene() {
  const twins = useTwinSocket("ws://localhost:8000/ws/live");

  return (
    <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      {/* Factory floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Machines */}
      {Object.entries(MACHINE_POSITIONS).map(([id, pos]) => (
        <Machine key={id} id={id} position={pos} state={twins[id] ?? {}} />
      ))}

      <OrbitControls />
    </Canvas>
  );
}
```

#### frontend/src/hooks/useTwinSocket.ts

```typescript
// useTwinSocket.ts — WebSocket hook for live twin state
import { useState, useEffect, useRef } from "react";

export function useTwinSocket(url: string) {
  const [twins, setTwins] = useState<Record<string, any>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          setTwins(JSON.parse(event.data));
        } catch (e) {
          console.error("Failed to parse twin data", e);
        }
      };

      ws.onclose = () => {
        // Auto-reconnect after 2 seconds
        setTimeout(connect, 2000);
      };

      ws.onerror = () => ws.close();
    };

    connect();
    return () => wsRef.current?.close();
  }, [url]);

  return twins;
}
```

---

## 5. Integration Patterns

### 5.1 IoT Platform Integration (Azure IoT Hub)

```python
# azure_iot_twin_sync.py — Sync Azure IoT Hub device twins with local simulation
from azure.iot.hub import IoTHubRegistryManager
from azure.iot.hub.models import Twin
import os, json

CONNECTION_STRING = os.getenv("IOTHUB_CONNECTION_STRING")
registry = IoTHubRegistryManager(CONNECTION_STRING)

def read_device_twin(device_id: str) -> dict:
    twin = registry.get_twin(device_id)
    return twin.properties.reported.as_dict()

def update_desired_properties(device_id: str, desired: dict):
    """Push simulation-derived targets back to the device."""
    twin_patch = Twin(properties={"desired": desired})
    registry.update_twin(device_id, twin_patch, twin.etag)

# Example: simulation recommends RPM reduction
update_desired_properties("CNC_01", {
    "target_rpm": 2000,
    "reason": "simulation_thermal_protection",
})
```

### 5.2 SCADA/OPC-UA Integration

```python
# opcua_connector.py — Read from OPC-UA server (e.g., factory SCADA)
from opcua import Client

OPCUA_URL = "opc.tcp://plc-server:4840"

def read_scada_values(node_ids: list[str]) -> dict:
    client = Client(OPCUA_URL)
    client.connect()
    try:
        results = {}
        for nid in node_ids:
            node = client.get_node(nid)
            results[nid] = node.get_value()
        return results
    finally:
        client.disconnect()

# Example node IDs from a Siemens S7 PLC
values = read_scada_values([
    "ns=2;s=CNC_01.Temperature",
    "ns=2;s=CNC_01.Vibration",
    "ns=2;s=CNC_01.SpindleRPM",
])
```

### 5.3 CAD/3D Model Integration (glTF)

```typescript
// LoadCADModel.tsx — Load glTF CAD model into Three.js scene
import { useGLTF } from "@react-three/drei";

interface CADModelProps {
  url: string;                          // "/models/cnc_machine.glb"
  position: [number, number, number];
  healthColor?: string;
}

export function CADModel({ url, position, healthColor }: CADModelProps) {
  const { scene } = useGLTF(url);
  const cloned = scene.clone();

  // Apply health-based coloring to all meshes
  if (healthColor) {
    cloned.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color.set(healthColor);
      }
    });
  }

  return <primitive object={cloned} position={position} scale={0.01} />;
}
```

### 5.4 B06 Optimization Integration

```python
# sim_optimization.py — Use simulation as objective function for optimization (B06)
from scipy.optimize import minimize
import simpy
from simulation_runner import production_line_sim

def objective(params):
    """Minimize negative throughput (maximize throughput) by tuning buffer sizes and speeds."""
    buffer_cap, m1_speed, m2_speed = params

    snapshot = {
        "M1": {"temperature": 60, "vibration": 3.0, "rpm": m1_speed},
        "M2": {"temperature": 60, "vibration": 3.0, "rpm": m2_speed},
    }

    env = simpy.Environment()
    results = {}
    production_line_sim(env, snapshot, sim_hours=8.0, results=results)
    return -results["count"]  # negative because we minimize

result = minimize(
    objective,
    x0=[10, 1500, 1500],
    bounds=[(5, 50), (500, 3000), (500, 3000)],
    method="Nelder-Mead",
)
print(f"Optimal: buffer={result.x[0]:.0f}, M1_rpm={result.x[1]:.0f}, M2_rpm={result.x[2]:.0f}")
print(f"Max throughput: {-result.fun:.0f} units/shift")
```

---

## 6. Performance & Cost

### 6.1 Compute Benchmarks

| Workload | Hardware | Time | Cost (Cloud) |
|----------|----------|------|-------------|
| DES — 10K events, single run | 1 vCPU | ~0.5s | ~$0.00001 |
| DES — 1000 Monte Carlo replications | 4 vCPU | ~30s | ~$0.003 |
| FEM — 100K element mesh, single solve | 8 vCPU, 32GB | ~5 min | ~$0.05 |
| CFD — 1M cell mesh, steady-state | 32 vCPU, 128GB | ~2 hours | ~$4.00 |
| PINN training — 2D heat equation | 1x A100 GPU | ~15 min | ~$0.80 |
| PINN inference — real-time | 1x T4 GPU | ~5 ms/query | ~$0.20/hr |
| 3D rendering — Three.js (client) | Browser GPU | 60 FPS | $0 (client) |
| Omniverse — full factory scene | RTX 4090 | 30+ FPS | ~$2.50/hr (cloud) |

### 6.2 Real-Time Requirements

| Component | Latency Target | Strategy |
|-----------|---------------|----------|
| Sensor ingestion | < 100 ms | MQTT QoS 0, edge buffering |
| Twin state update | < 200 ms | In-memory state, WebSocket push |
| Simulation (fast loop) | < 1 s | Pre-trained surrogate model |
| 3D visualization | 16 ms (60 FPS) | LOD, instanced geometry, culling |
| Closed-loop feedback | < 500 ms | Edge compute, direct MQTT publish |

### 6.3 Scaling Strategies

```
Single Asset Twin                    Factory-Scale Twin
─────────────────                    ──────────────────
1 MQTT topic                         1000+ MQTT topics
1 SimPy process                      Parallel sim workers (Celery/K8s Jobs)
1 InfluxDB instance                  InfluxDB cluster / TimescaleDB multi-node
Single WebSocket                     Redis pub/sub → multiple WS servers
1 Three.js scene                     LOD + scene partitioning + streaming
```

**Cost optimization tips:**
- Use **spot/preemptible instances** for batch simulation runs (60-80% savings)
- **Surrogate models** replace expensive physics simulations after training (1000x speedup)
- **Edge compute** for latency-sensitive ingestion; cloud for heavy simulation
- **Time-series data retention policies**: raw data 7 days, downsampled 1 year, aggregates forever

---

## 7. Technology Selection Matrix

| Criteria | SimPy | AnyLogic | Azure DT | AWS TwinMaker | NVIDIA Omniverse |
|----------|-------|----------|----------|---------------|------------------|
| **Cost** | Free (MIT) | $$$$ (>$20K/yr) | Pay-per-use (~$0.01/msg) | Pay-per-use | $$$$ (Enterprise) |
| **Learning curve** | Low (Python) | Medium (GUI+Java) | Medium (DTDL+REST) | Medium (AWS stack) | High (USD+Connectors) |
| **Simulation types** | DES only | DES+ABM+SD | Graph-based state | Scene+data binding | Multi-physics 3D |
| **Real-time capable** | No (offline) | Limited | Yes (event-driven) | Yes (data sync) | Yes (live rendering) |
| **3D visualization** | No | Built-in (2D/3D) | Via Azure Maps/Power BI | Built-in (Matterport) | Best-in-class (RTX) |
| **IoT integration** | Manual | Connectors available | Native (IoT Hub) | Native (IoT Core) | Via Connectors |
| **Scalability** | Single process | Desktop-limited | Cloud-native | Cloud-native | GPU-dependent |
| **Best for** | PoC, education, scripted analysis | Enterprise modeling, consulting | Azure-native IoT orgs | AWS-native IoT orgs | High-fidelity visual twins |
| **Open source** | Yes | No | No | No | Partial (Kit SDK) |

### Decision Flowchart

```
Need simulation?
├── Quick analysis / PoC ──────────────────→ SimPy + matplotlib
├── Enterprise modeling + presentations ───→ AnyLogic
├── Live IoT twin with Azure stack ────────→ Azure Digital Twins
├── Live IoT twin with AWS stack ──────────→ AWS IoT TwinMaker
├── Photorealistic 3D + multi-physics ─────→ NVIDIA Omniverse
└── Custom web-based 3D twin ──────────────→ FastAPI + Three.js + InfluxDB
```

---

## References

1. SimPy Documentation — https://simpy.readthedocs.io/
2. Azure Digital Twins — https://learn.microsoft.com/en-us/azure/digital-twins/
3. AWS IoT TwinMaker — https://docs.aws.amazon.com/iot-twinmaker/
4. NVIDIA Omniverse — https://developer.nvidia.com/omniverse
5. DeepXDE (PINNs) — https://deepxde.readthedocs.io/
6. Three.js / React Three Fiber — https://docs.pmnd.rs/react-three-fiber/
7. InfluxDB — https://docs.influxdata.com/influxdb/
8. Eclipse Mosquitto — https://mosquitto.org/
9. torchdiffeq (Neural ODEs) — https://github.com/rtqichen/torchdiffeq
10. OpenFOAM — https://www.openfoam.com/documentation/
