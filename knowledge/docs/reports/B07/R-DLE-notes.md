# Deep Learning Engineer Notes: Anomaly Detection & Monitoring (B07)
## By Neural Architect (R-DLE) — Date: 2026-03-31

### 1. Autoencoders for Anomaly Detection

**Core principle**: Train autoencoder to reconstruct normal data. Anomalies yield high reconstruction error because the model has never learned to represent them.

**Vanilla Autoencoder:**
- Architecture: Input -> Encoder (compress) -> Bottleneck (latent) -> Decoder (reconstruct) -> Output
- Loss: MSE or MAE between input and reconstruction
- Anomaly score = reconstruction error per sample
- Bottleneck size is critical: too large = memorizes everything (no anomaly detection); too small = poor reconstruction of normal data. Rule of thumb: 10-30% of input dimension.
- Use for: tabular data with moderate dimensionality (50-500 features)

**Variational Autoencoder (VAE):**
- Adds probabilistic latent space: encoder outputs mean + variance, sample via reparameterization trick
- Loss = reconstruction loss + KL divergence (regularization)
- Anomaly score options: reconstruction error, KL divergence, or combined ELBO
- Advantages over vanilla: smoother latent space, better generalization, provides uncertainty estimates
- Use for: when you need probabilistic anomaly scores or generative capabilities

**Denoising Autoencoder (DAE):**
- Corrupts input with noise (dropout, Gaussian, masking), trains to reconstruct clean input
- Forces model to learn robust features rather than identity mapping
- More resistant to overfitting than vanilla AE
- Corruption ratio: 10-30% of input features masked typically works well
- Use for: noisy real-world data where input quality varies

**Practical training recipe:**
```
- Optimizer: Adam, lr=1e-3 with ReduceLROnPlateau
- Batch size: 256-1024
- Epochs: 50-200 with early stopping (patience=10) on validation reconstruction error
- Train ONLY on verified normal data
- Validation set: 90% normal + 10% known anomalies (if available) to monitor separation
- Normalize inputs: StandardScaler or MinMaxScaler (store scaler parameters for serving)
```

### 2. GAN-Based Anomaly Detection

**AnoGAN (2017):**
- Train DCGAN on normal data only
- At inference: for each test sample, find the latent vector z that best reconstructs it via gradient descent in latent space
- Anomaly score = reconstruction error + discrimination loss
- Problem: inference is extremely slow (hundreds of gradient steps per sample)
- Not suitable for real-time applications

**f-AnoGAN (Fast AnoGAN, 2019):**
- Adds an encoder network (izi-architecture) that maps input to latent space directly
- Eliminates iterative optimization at inference — single forward pass
- Anomaly score = image reconstruction error + feature-level error from discriminator
- 50-100x faster than AnoGAN at inference
- Preferred over AnoGAN in all practical scenarios

**GANomaly (2018):**
- Encoder-Decoder-Encoder architecture
- Anomaly score based on difference between first and second encoding
- More stable training than standard GAN approaches
- Good for image-based anomaly detection (defect detection, medical imaging)

**GAN training challenges:**
- Mode collapse: generator produces limited variety. Mitigation: Wasserstein loss, spectral normalization.
- Training instability: use progressive training, learning rate scheduling.
- Evaluation difficulty: no clear convergence criterion. Monitor FID score and reconstruction quality on held-out normal data.

### 3. Transformer-Based Anomaly Detection

**Anomaly Transformer (ICLR 2022):**
- Key innovation: Anomaly-Attention mechanism that models association discrepancy
- Normal time points have strong associations with adjacent points (prior-association)
- Anomalous points have weaker local associations but may have misleading global associations
- Association discrepancy = KL divergence between prior-association and series-association
- State-of-the-art on multiple time-series benchmarks (SMD, MSL, SMAP, SWaT, PSM)

**TranAD (2022):**
- Transformer-based with adversarial training for time-series anomaly detection
- Uses attention-based sequence encoder with self-conditioning
- Two-phase training: standard reconstruction + adversarial amplification of anomalies
- Handles multivariate time series well

**Practical considerations for Transformers:**
- Sequence length matters: longer context captures more complex temporal patterns but increases compute quadratically. Use 64-256 for most time-series applications.
- Positional encoding: sinusoidal for fixed-length, learned for variable-length sequences
- Multi-head attention: 4-8 heads is typical. More heads help capture diverse temporal patterns.
- Computational cost: significantly higher than autoencoder approaches. Justify the cost with benchmarks on your data.

### 4. Graph Neural Networks for Anomaly Detection

**Use cases where GNNs excel:**
- Network intrusion detection (communication graph)
- Fraud rings (transaction graph)
- Social network spam/bot detection
- Supply chain anomalies

**Approaches:**
- **Graph Autoencoder (GAE)**: Encode graph structure into node embeddings, reconstruct adjacency matrix. High reconstruction error = anomalous edges/nodes.
- **GraphSAGE + anomaly head**: Learn node embeddings via neighborhood aggregation, classify nodes as normal/anomalous.
- **Temporal Graph Networks**: For evolving graphs (e.g., transaction networks). Capture temporal evolution of node neighborhoods.

**Practical framework:**
- Use PyTorch Geometric (PyG) or DGL
- Node features: entity attributes + aggregated behavioral features
- Edge features: transaction amount, frequency, timestamps
- 2-3 GNN layers (deeper risks oversmoothing)
- Anomaly score: deviation of node embedding from cluster centroid, or reconstruction error

### 5. Training Strategies with Limited Labels

**Self-supervised pretraining:**
- Pretrain on unlabeled data with pretext tasks (reconstruction, contrastive learning, masked prediction)
- Fine-tune on small labeled set
- SimCLR-style contrastive learning: normal data augmentations create positive pairs; anomalies naturally form negative pairs

**Contrastive learning for anomaly detection:**
- Train encoder where normal samples cluster tightly, anomalies are far from cluster
- Neutral AD (NeurIPS 2021): learns compact representation of normal data without labels
- Use: NT-Xent loss or SupCon loss (if some labels exist)

**Data augmentation for anomalies:**
- SMOTE in latent space of a pretrained autoencoder
- Mixup between known anomalies to generate synthetic anomaly variants
- Domain-specific augmentations: for time-series, inject synthetic spikes, level shifts, trend changes

**Few-shot anomaly detection:**
- Meta-learning: train on anomaly detection tasks from related domains
- Prototypical networks: learn prototype of normal class from few examples
- Practical minimum: 5-10 anomaly examples per type can significantly boost a semi-supervised model

**Curriculum learning:**
- Start training with obvious anomalies (high-confidence labels)
- Gradually introduce harder, borderline cases
- Reduces label noise impact in early training

### 6. Model Architecture Comparison

| Method | Latency (inference) | Training Data | Best For | Complexity |
|--------|-------------------|---------------|----------|------------|
| Vanilla AE | <5ms | Normal only | Tabular, moderate dim | Low |
| VAE | <5ms | Normal only | Probabilistic scoring | Medium |
| f-AnoGAN | <10ms | Normal only | Image anomalies | High |
| Anomaly Transformer | 10-50ms | Normal only | Time-series | High |
| GNN | 10-100ms | Graph data | Network/relational | High |
| Contrastive | <5ms | Normal + few anomalies | Any modality | Medium |

### Recommendations for B07

1. **Default to Autoencoder** (vanilla or VAE) for tabular/sensor data. They are simple, fast, well-understood, and competitive with complex methods on most benchmarks.
2. **Use Anomaly Transformer** only when temporal patterns are critical and compute budget allows. Benchmark against simple LSTM-AE first.
3. **GNNs for relational anomalies only** — fraud rings, network attacks. Do not use GNNs for independent entity anomaly detection.
4. **Avoid AnoGAN** — use f-AnoGAN or GANomaly instead. The iterative inference of AnoGAN is impractical.
5. **Invest in contrastive pretraining** when labeled data is scarce. It provides the best label-efficiency of any deep learning approach.
6. **Always benchmark deep learning against Isolation Forest + XGBoost**. Deep learning wins on complex temporal/spatial/graph data but often loses on tabular data.
