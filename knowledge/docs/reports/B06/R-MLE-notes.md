# ML Engineering Notes: B06 Optimization
## By R-MLE — Date: 2026-03-31

---

### 1. ML + Optimization Intersection

The boundary between machine learning and mathematical optimization has become increasingly porous. At the core, most ML training procedures are themselves optimization problems — minimizing a loss function over parameter space via gradient descent. But the more interesting intersection lies in using ML to *solve* or *accelerate* classical optimization problems.

**Learning to Optimize (L2O)** replaces hand-designed solver heuristics with learned policies. Instead of manually tuning branch-and-bound strategies for mixed-integer programs, an ML model learns which variable to branch on, which cuts to add, or when to terminate. Google's work on ML for MIP solvers showed that graph neural networks trained on historical solver traces can reduce solve times by 20-50% on distribution-similar instances.

**Surrogate Models** approximate expensive objective functions (e.g., CFD simulation, supply chain simulation) with cheap-to-evaluate ML models — typically Gaussian Processes or neural networks. The optimizer then queries the surrogate instead of the true function, enabling optimization of black-box systems where gradients are unavailable.

**AutoML as Optimization** frames hyperparameter tuning, architecture search, and feature selection as optimization problems. Neural Architecture Search (NAS) uses reinforcement learning or evolutionary algorithms to search the architecture space. This is optimization applied to ML itself — a recursive loop.

### 2. Neural Combinatorial Optimization

Attention-based neural solvers have made significant progress on classic combinatorial problems. The Attention Model (Kool et al., 2019) uses a transformer encoder-decoder to construct TSP solutions autoregressively. POMO (Policy Optimization with Multiple Optima) improves upon this by exploiting solution symmetry — starting construction from every node and keeping the best, which provides a stronger training signal for REINFORCE.

**When neural solvers win:** On medium-scale instances (up to ~1000 nodes) where fast inference is needed and near-optimal solutions are acceptable. They excel when problem distributions are stable and many similar instances must be solved repeatedly — amortized learning pays off. Real-time routing applications benefit because inference is a single forward pass (milliseconds) versus minutes for exact solvers.

**When they lose:** On large-scale instances (10,000+ nodes), classical solvers like LKH-3 and Concorde still dominate. Neural solvers also struggle with hard constraints — they tend to produce infeasible solutions when complex side constraints exist. For one-off problems with unusual structure, the neural model has no distribution to exploit.

**Reinforcement learning for VRP variants** is particularly active. Heterogeneous fleet, time windows, pickup-and-delivery — each variant requires careful reward shaping and environment design. The gap between neural and classical approaches is closing but remains 2-5% on standard benchmarks for TSP and 5-15% for constrained VRP variants.

### 3. Bayesian Optimization for Hyperparameter Tuning

Bayesian Optimization (BO) is the gold standard for expensive black-box optimization with fewer than ~50 dimensions. It maintains a probabilistic surrogate model — typically a Gaussian Process (GP) — of the objective function and uses an acquisition function to decide where to evaluate next.

**Acquisition functions** balance exploration and exploitation. Expected Improvement (EI) targets points likely to improve over the current best. Upper Confidence Bound (UCB) adds an exploration bonus proportional to posterior uncertainty. Probability of Improvement (PI) is the simplest but tends to exploit too aggressively.

**Practical implementation with Optuna:** Optuna uses Tree-structured Parzen Estimator (TPE) by default, which is more scalable than GP-based BO for high-dimensional spaces. Key patterns: define objective function, use `trial.suggest_*` API, enable pruning with `MedianPruner` for early stopping of bad trials. For distributed tuning, Optuna's storage backend (MySQL/PostgreSQL) allows parallel workers.

**Ray Tune** integrates with Optuna, HyperOpt, and other search algorithms while providing distributed execution. Its ASHA scheduler (Asynchronous Successive Halving) aggressively prunes underperforming trials, providing 10-100x speedup over grid search. For production ML pipelines, Ray Tune + Optuna is a battle-tested combination.

### 4. Predict-then-Optimize Pipeline

The dominant paradigm in applied optimization: first predict uncertain parameters (demand, travel times, prices), then feed predictions into an optimization model. This two-stage approach is simple and modular but suboptimal — prediction errors may not matter equally across all decisions.

**Two-stage approach:** Train a forecasting model (XGBoost, LSTM, etc.) to predict demand. Feed point forecasts into a deterministic optimization model (e.g., inventory replenishment MIP). The problem: minimizing forecast MSE does not minimize decision cost. A 10% overestimate on a low-margin product matters less than a 5% underestimate on a high-margin one.

**End-to-end (decision-focused) learning:** Train the prediction model to minimize downstream decision cost, not prediction error. This requires differentiating through the optimization layer. SPO+ (Elmachtoub & Grigas) provides a convex surrogate loss for linear programs. For MIP, differentiable approximations or implicit differentiation through KKT conditions enable gradient flow. Libraries like `cvxpylayers` and `PyEPO` support this.

**Practical tradeoff:** End-to-end is theoretically superior but harder to debug, less modular, and requires more engineering. Two-stage remains dominant in industry due to simplicity and the ability to improve forecasting and optimization independently.

### 5. Training RL Agents for Optimization

Reinforcement learning frames optimization as sequential decision-making. An agent constructs a solution step by step, receiving rewards based on solution quality.

**Reward design** is critical. For scheduling, reward can be negative makespan or negative tardiness. For routing, negative total distance. Sparse rewards (only at episode end) are harder to learn from; intermediate rewards (e.g., reward per delivery completed) accelerate training but may cause suboptimal greedy behavior.

**Curriculum learning** starts with small, easy instances and gradually increases problem size and constraint complexity. This is essential for combinatorial problems — training directly on 100-node TSP from scratch is far slower than progressive training from 20 to 50 to 100 nodes.

**Environment design** must faithfully represent the real problem. Simulation fidelity matters — if the training environment ignores traffic variability or stochastic service times, the learned policy will be brittle in deployment. The sim-to-real gap is a major challenge; domain randomization (varying parameters during training) helps build robust policies.

### 6. Feature Engineering for Optimization Models

When ML assists optimization, the feature representation of the problem instance is crucial.

**Encoding constraints as features:** Binary features indicating which constraints are active, continuous features for constraint slack values, and embedding vectors for constraint types. For scheduling, features include job processing times, due dates, machine availability, and precedence graph structure.

**Graph representations** are natural for routing and network optimization. Nodes represent locations or jobs; edges represent connections or precedence. Graph Neural Networks (GNNs) can process these representations, learning permutation-invariant features that generalize across instance sizes. Edge features encode distances, time windows, and capacity demands.

**Problem-specific embeddings:** For facility location, features include demand density maps, distance histograms, and capacity ratios. For portfolio optimization, features are return distributions, correlation matrices, and risk factor exposures. Domain knowledge drives effective feature engineering more than generic approaches.

### 7. Evaluation Methodology

**Optimality gap** is the primary metric: (solution_value - optimal_value) / optimal_value. For problems where the optimum is unknown, compare against the best known solution or a strong lower/upper bound from LP relaxation.

**Runtime benchmarks** must be fair: same hardware, same time limits, same instance sets. Neural solvers should include both training time (amortized over instances) and inference time. Report solution quality at multiple time budgets to construct tradeoff curves — a solver that finds a 2% gap solution in 1 second may be preferable to one that finds 0.5% gap in 10 minutes, depending on the application.

**Statistical rigor:** Report mean, median, and worst-case performance across multiple instances and random seeds. Use paired statistical tests when comparing solvers on the same instance set.

### 8. Hardware Considerations

**LP/MIP solvers (Gurobi, CPLEX, OR-Tools):** Primarily CPU-bound. Benefit from high clock speed and many cores for parallel branch-and-bound. Memory can be a bottleneck for large models with millions of variables. Commercial solvers (Gurobi, CPLEX) are highly optimized for modern CPU architectures.

**Neural optimization solvers:** GPU-accelerated for both training and inference. Batch inference on GPU enables solving thousands of small instances simultaneously — a major advantage for applications like real-time pricing where many independent problems arrive per second.

**Hybrid approaches** use GPU for the neural component (e.g., generating initial solutions or predicting branching decisions) and CPU for the classical solver component. This requires careful pipeline design to avoid data transfer bottlenecks between CPU and GPU memory.

**Cloud deployment:** For bursty optimization workloads (e.g., daily route planning), cloud instances with on-demand GPU/CPU allocation are cost-effective. Gurobi and CPLEX offer cloud-native licensing. Kubernetes-based solver pools can autoscale based on problem queue depth.
