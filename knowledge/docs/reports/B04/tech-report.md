# Tech Report: Natural Language Processing (B04)
## By Dr. Praxis (R-β) — Date: 2026-03-31

---

### 1. Implementation Summary

Natural Language Processing on the MAESTRO Knowledge Graph Platform primarily manifests across three workloads: semantic indexing of knowledge-graph nodes and edges, Vietnamese-language document ingestion via RAG, and classification/extraction pipelines that populate graph attributes. The dominant production pattern is a retrieval-augmented generation (RAG) stack with a Vietnamese-aware embedding layer, a vector database, and an LLM backend served either through a managed API or a self-hosted vLLM instance. Fine-tuning is reserved for high-value, domain-specific tasks — notably Vietnamese sentiment classification and entity extraction — where a fine-tuned PhoBERT encoder outperforms zero-shot prompting at one-tenth the inference cost. All pipelines are designed to degrade gracefully: if the self-hosted GPU fails, the system falls back to an OpenAI or Anthropic API endpoint with the same interface contract.

---

### 2. Tech Stack Decision Matrix

| Layer | Technology | Version | Alternatives | Why This One | Monthly Cost (est.) |
|---|---|---|---|---|---|
| **Tokenization** | underthesea (Vietnamese) + tiktoken (LLM) | underthesea 6.8.x, tiktoken 0.7.x | pyvi, VnCoreNLP, spaCy vi | underthesea has broadest Vietnamese word-seg accuracy; tiktoken is zero-dependency, fastest for GPT-family models | ~$0 (open-source) |
| **Embeddings** | `bkai-foundation-models/vietnamese-bi-encoder` or `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` | Latest HF release | PhoBERT (encoder-only), OpenAI text-embedding-3-small, Cohere embed-v3 | Vietnamese bi-encoder gives highest recall on Vi semantic search; multilingual mpnet as fallback for mixed-language docs | $0 self-hosted; ~$10–40 if API at 10M tokens/mo |
| **Vector DB** | Qdrant | 1.9.x | pgvector, Weaviate, Pinecone, Chroma | Rust performance, filtering on payload metadata, Docker-native, self-hostable, free tier; Pinecone locked-in pricing | $0 self-hosted; ~$70+/mo managed |
| **LLM Serving** | vLLM (self-hosted) + OpenAI API (fallback) | vLLM 0.5.x | Ollama, TGI (HuggingFace), llama.cpp, Triton | vLLM offers best throughput (PagedAttention), OpenAI-compatible endpoint, streaming; Ollama for dev-only (lower throughput) | $300–800/mo (1×A100 80GB spot) |
| **Fine-tuning** | PEFT + LoRA via HuggingFace Transformers + TRL | transformers 4.44+, peft 0.12+, trl 0.9+ | Full fine-tune, Axolotl, LLaMA-Factory | LoRA freezes base weights, fits on 1×A100 for 7B models or 1×RTX 3090 for PhoBERT; TRL adds SFT/DPO convenience | GPU rental: ~$50–150/training run |
| **Orchestration** | LangChain or LlamaIndex | langchain 0.3.x / llama-index 0.11.x | Haystack, custom, DSPy | LangChain for custom chains; LlamaIndex for document-centric indexing; both have Vietnamese community usage | $0 (open-source) |
| **Evaluation** | RAGAS (RAG eval) + promptfoo + custom metrics | ragas 0.1.x, promptfoo 0.71.x | DeepEval, TruLens, MLflow | RAGAS gives faithfulness/relevancy metrics without gold answers; promptfoo for regression on prompt changes | $0–$30/mo API calls for LLM-graded evals |
| **Monitoring** | LangSmith or Langfuse (self-hosted) | langsmith 0.1.x / langfuse 2.x | Helicone, Arize, custom logging | Langfuse is fully self-hostable (Docker), trace-level visibility, latency/cost dashboards; LangSmith if already on LangChain | $0 self-hosted; $39+/mo cloud |

---

### 3. Pipeline Architecture

#### 3a. RAG Pipeline (most common production pattern)

```
Documents (PDF/HTML/TXT)
         │
         ▼
┌─────────────────────┐
│  Document Loader    │  (LangChain loaders / custom parsers)
│  + underthesea      │  Vietnamese word segmentation
│  Tokenizer          │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Chunker            │  RecursiveCharacterTextSplitter
│  chunk_size=512     │  chunk_overlap=64
│  (token-aware)      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Embedding Model    │  vietnamese-bi-encoder or mpnet
│  (batch encode)     │  Output: float32 vectors dim=768
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Qdrant Index       │  Upsert with payload metadata
│  (offline phase)    │  (source, language, node_id, date)
└─────────────────────┘

── ONLINE QUERY PATH ──────────────────────────────────

User Query
    │
    ▼
┌─────────────────────┐
│  Query Rewriter     │  (optional) HyDE or LLM rewrite
│  (optional step)    │  improves recall for vague queries
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Query Encoder      │  same embedding model as indexing
│  (real-time)        │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Qdrant Retrieval   │  top-k=6 by cosine similarity
│  + payload filter   │  optional: filter by language/source
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Re-ranker          │  (optional) cross-encoder rerank
│  (optional step)    │  bge-reranker-v2-m3 or API-based
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Context Assembly   │  Merge chunks + source citations
│  + Prompt Builder   │  System prompt + retrieved context
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  LLM (vLLM /        │  Stream response token-by-token
│  OpenAI API)        │
└────────┬────────────┘
         │
         ▼
    Final Answer + Citations
```

| Stage | Tool | Key Config | Latency |
|---|---|---|---|
| Document Loading | LangChain loaders / pdfplumber | batch processing | offline |
| Vietnamese Tokenization | underthesea word_tokenize | use_threads=True | ~5 ms/doc |
| Chunking | RecursiveCharacterTextSplitter | size=512, overlap=64 tokens | ~1 ms/chunk |
| Embedding (batch) | vietnamese-bi-encoder | batch_size=64, device=cuda | ~2 ms/chunk GPU |
| Qdrant Upsert | qdrant-client | batch_size=100 | offline |
| Query Encoding | same bi-encoder | single vector | ~8 ms |
| Retrieval | Qdrant search | top_k=6, score_threshold=0.4 | ~5–15 ms |
| Re-ranking | bge-reranker (optional) | top_n=3 from top_k=10 | ~30 ms |
| LLM Generation | vLLM / OpenAI | max_tokens=1024, stream=True | 200–800 ms |

---

#### 3b. Fine-tuning Pipeline (LoRA/QLoRA)

```
Raw Labeled Dataset (CSV/JSONL)
         │
         ▼
┌─────────────────────┐
│  Data Preprocessing │  underthesea tokenize
│  + Format Builder   │  Build instruction format or CLS format
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Train/Val Split    │  80/20 stratified split
│  + HF Dataset       │  datasets.Dataset object
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Base Model Load    │  PhoBERT (classification)
│  in 4-bit (QLoRA)   │  or Mistral/LLaMA (generative)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  LoRA Config        │  r=16, alpha=32, target=q_proj/v_proj
│  PEFT Wrap          │  dropout=0.1, task_type=SEQ_CLS/CAUSAL_LM
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  SFTTrainer / TRL   │  lr=2e-4, epochs=3, warmup=0.1
│  Training Loop      │  gradient_checkpointing=True
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Evaluation Loop    │  accuracy/F1 on val set each epoch
│  + Early Stopping   │  patience=2
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Merge LoRA Weights │  merge_and_unload() → full model
│  → Save / Push HF   │  or keep adapter for memory saving
└─────────────────────┘
```

| Stage | Tool/Config | Notes |
|---|---|---|
| Data preprocessing | pandas + underthesea | Normalize diacritics; handle informal Vietnamese |
| Tokenizer | PhoBERT AutoTokenizer | max_length=256 for classification; 2048 for generative |
| Quantization | bitsandbytes BitsAndBytesConfig | load_in_4bit=True, bnb_4bit_compute_dtype=bfloat16 |
| LoRA adapter | peft LoraConfig | r=16, lora_alpha=32, bias="none" |
| Training | TRL SFTTrainer | per_device_train_batch_size=8, gradient_accumulation=4 |
| Checkpointing | HuggingFace Trainer | save_strategy="epoch", load_best_model_at_end=True |
| Export | merge_and_unload or adapter-only | Adapter-only saves disk; merge needed for vLLM serving |

---

#### 3c. Real-time Classification Pipeline

```
Incoming Text (API request)
         │
         ▼
┌─────────────────────┐
│  Input Validation   │  max 512 tokens; reject empty input
│  + Sanitization     │  strip HTML, normalize Unicode
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Vietnamese         │  underthesea word_tokenize (fast mode)
│  Tokenization       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  PhoBERT Encoder    │  forward pass → [CLS] embedding
│  (fine-tuned)       │  pooled_output dim=768
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Classification     │  Linear head → softmax → label + score
│  Head               │  Threshold check (reject if score < 0.6)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Response Format    │  {label, score, latency_ms}
│  + Async Logging    │  write to monitoring queue (non-blocking)
└─────────────────────┘
```

| Stage | Latency Target | Tool |
|---|---|---|
| Input validation | < 1 ms | Python validators |
| Tokenization | < 5 ms | underthesea |
| Encoder forward pass | < 20 ms (GPU) / < 80 ms (CPU) | PyTorch + ONNX export optional |
| Classification head | < 1 ms | NumPy/PyTorch |
| Total P95 target | < 50 ms (GPU) | FastAPI async endpoint |

---

#### 3d. Batch NLP Processing Pipeline

```
Input: Folder of Documents / DB Query Result
         │
         ▼
┌─────────────────────┐
│  Job Queue          │  Redis Queue / Celery task
│  (async dispatch)   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Parallel Workers   │  N workers (N = GPU count or CPU cores)
│  (multiprocessing)  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐    ┌──────────────────────┐
│  NLP Worker:        │    │  NLP Worker:         │
│  - Load doc         │    │  - Load doc          │
│  - Tokenize (Vi)    │    │  - Tokenize (Vi)     │
│  - Embed chunks     │    │  - Extract entities  │
│  - Upsert Qdrant    │    │  - Classify topics   │
└────────┬────────────┘    └──────────┬───────────┘
         └──────────┬─────────────────┘
                    ▼
         ┌─────────────────────┐
         │  Results Aggregator │  Merge outputs
         │  + Error Handler    │  Dead-letter queue for failures
         └────────┬────────────┘
                  ▼
         ┌─────────────────────┐
         │  Knowledge Graph    │  Write node attributes
         │  Writer             │  + edge metadata
         └─────────────────────┘
```

| Stage | Tool | Throughput Target |
|---|---|---|
| Job queue | Celery + Redis | 10,000 docs/hour |
| Parallel workers | Python multiprocessing / Ray | 4–8 workers |
| Embedding batch | vietnamese-bi-encoder batch_size=128 | ~500 chunks/sec (GPU) |
| Qdrant batch upsert | qdrant-client batch upload | 2,000 vectors/sec |
| KG write | Neo4j bolt driver / custom DB | 500 nodes/sec |

---

### 4. Key Code Patterns

#### 4a. PhoBERT Fine-tuning for Vietnamese Text Classification

```python
# LoRA fine-tuning PhoBERT for Vietnamese sentiment/classification
# Requirements: transformers>=4.44, peft>=0.12, trl>=0.9, bitsandbytes>=0.43
# Dataset format: {"text": "...", "label": 0}  (0=neg, 1=neu, 2=pos)

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    DataCollatorWithPadding,
)
from peft import LoraConfig, get_peft_model, TaskType
from datasets import load_dataset, Dataset
import evaluate
import numpy as np
import pandas as pd

# ── 1. Config ──────────────────────────────────────────────────────────────
MODEL_NAME = "vinai/phobert-base-v2"
NUM_LABELS = 3       # negative / neutral / positive
MAX_LENGTH = 256
BATCH_SIZE = 16
EPOCHS = 3
LR = 2e-4
OUTPUT_DIR = "./phobert-vi-sentiment-lora"

LORA_CONFIG = LoraConfig(
    task_type=TaskType.SEQ_CLS,
    r=16,
    lora_alpha=32,
    lora_dropout=0.1,
    target_modules=["query", "value"],   # PhoBERT attention projections
    bias="none",
)

# ── 2. Tokenizer ────────────────────────────────────────────────────────────
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def preprocess(examples):
    # underthesea word segmentation before PhoBERT tokenization
    from underthesea import word_tokenize
    segmented = [" ".join(word_tokenize(t)) for t in examples["text"]]
    tokens = tokenizer(
        segmented,
        truncation=True,
        max_length=MAX_LENGTH,
        padding=False,   # handled by DataCollator
    )
    tokens["labels"] = examples["label"]
    return tokens

# ── 3. Dataset ──────────────────────────────────────────────────────────────
raw_df = pd.read_csv("vi_sentiment.csv")   # columns: text, label
hf_dataset = Dataset.from_pandas(raw_df).train_test_split(test_size=0.2, seed=42)
tokenized = hf_dataset.map(preprocess, batched=True, remove_columns=["text"])

# ── 4. Model + LoRA ─────────────────────────────────────────────────────────
base_model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME, num_labels=NUM_LABELS
)
model = get_peft_model(base_model, LORA_CONFIG)
model.print_trainable_parameters()
# Expected: trainable params: ~590K / all params: 135M  (~0.44%)

# ── 5. Metrics ──────────────────────────────────────────────────────────────
f1_metric = evaluate.load("f1")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return f1_metric.compute(predictions=preds, references=labels, average="macro")

# ── 6. Training ─────────────────────────────────────────────────────────────
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=BATCH_SIZE,
    learning_rate=LR,
    warmup_ratio=0.1,
    weight_decay=0.01,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    fp16=True,
    logging_steps=50,
    report_to="none",   # swap to "wandb" for tracking
)

from transformers import Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized["train"],
    eval_dataset=tokenized["test"],
    tokenizer=tokenizer,
    data_collator=DataCollatorWithPadding(tokenizer),
    compute_metrics=compute_metrics,
)

trainer.train()

# ── 7. Save adapter + merge ─────────────────────────────────────────────────
model.save_pretrained(OUTPUT_DIR + "/adapter")
merged = model.merge_and_unload()
merged.save_pretrained(OUTPUT_DIR + "/merged")
tokenizer.save_pretrained(OUTPUT_DIR + "/merged")
print("Done. Model saved to", OUTPUT_DIR + "/merged")
```

---

#### 4b. RAG System with Vietnamese Documents

```python
# LangChain RAG with underthesea tokenizer + Qdrant vector store
# Requirements: langchain>=0.3, langchain-community, qdrant-client, sentence-transformers
# underthesea>=6.8

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Qdrant
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.embeddings import HuggingFaceEmbeddings
from underthesea import word_tokenize
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import re

# ── Config ──────────────────────────────────────────────────────────────────
QDRANT_URL = "http://localhost:6333"
COLLECTION_NAME = "maestro_vi_docs"
EMBED_MODEL = "bkai-foundation-models/vietnamese-bi-encoder"
CHUNK_SIZE = 512
CHUNK_OVERLAP = 64

# ── Vietnamese-aware text splitter ──────────────────────────────────────────
class VietnameseSplitter(RecursiveCharacterTextSplitter):
    """Word-segment Vietnamese text before splitting to avoid mid-word cuts."""
    def split_text(self, text: str) -> list[str]:
        segmented = " ".join(word_tokenize(text))
        return super().split_text(segmented)

splitter = VietnameseSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    separators=["\n\n", "\n", ".", " ", ""],
)

# ── Embedding model ─────────────────────────────────────────────────────────
embedding_model = HuggingFaceEmbeddings(
    model_name=EMBED_MODEL,
    model_kwargs={"device": "cuda"},
    encode_kwargs={"normalize_embeddings": True, "batch_size": 64},
)

# ── Index documents ─────────────────────────────────────────────────────────
def index_documents(docs_dir: str):
    loader = DirectoryLoader(docs_dir, glob="**/*.pdf", loader_cls=PyPDFLoader)
    raw_docs = loader.load()
    chunks = splitter.split_documents(raw_docs)
    print(f"Indexed {len(raw_docs)} docs → {len(chunks)} chunks")

    client = QdrantClient(url=QDRANT_URL)
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=768, distance=Distance.COSINE),
    )
    vectorstore = Qdrant(
        client=client,
        collection_name=COLLECTION_NAME,
        embeddings=embedding_model,
    )
    vectorstore.add_documents(chunks)
    return vectorstore

# ── Build RAG chain ─────────────────────────────────────────────────────────
def build_rag_chain(vectorstore):
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 6, "score_threshold": 0.40},
    )

    prompt = ChatPromptTemplate.from_template("""Bạn là trợ lý AI chuyên về kiến thức chuyên ngành.
Chỉ trả lời dựa trên ngữ cảnh được cung cấp. Nếu không có thông tin, hãy nói rõ.

Ngữ cảnh:
{context}

Câu hỏi: {question}

Trả lời:""")

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, streaming=True)

    def format_docs(docs):
        return "\n\n---\n\n".join(
            f"[Nguồn: {d.metadata.get('source','?')}]\n{d.page_content}" for d in docs
        )

    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
    )
    return chain

# ── Usage ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    vs = index_documents("./data/vi_docs")
    chain = build_rag_chain(vs)
    for chunk in chain.stream("Các yếu tố ảnh hưởng đến chất lượng dịch vụ khách hàng là gì?"):
        print(chunk.content, end="", flush=True)
```

---

#### 4c. LLM Serving with vLLM (OpenAI-compatible)

```python
# vLLM server launch + async client pattern with streaming
# Server: vllm serve Viet-Mistral/Vistral-7B-Chat --tensor-parallel-size 1 --port 8000

import asyncio
import httpx
import json
from openai import AsyncOpenAI  # vLLM is OpenAI API-compatible

# ── vLLM server start (run as subprocess or via Docker) ──────────────────────
# docker run --gpus all -p 8000:8000 vllm/vllm-openai:latest \
#     --model Viet-Mistral/Vistral-7B-Chat \
#     --dtype bfloat16 \
#     --max-model-len 4096 \
#     --served-model-name vistral-7b

# ── Async streaming client ───────────────────────────────────────────────────
client = AsyncOpenAI(
    base_url="http://localhost:8000/v1",
    api_key="dummy-key",   # vLLM does not require real key by default
)

async def chat_stream(messages: list[dict], model: str = "vistral-7b") -> str:
    """Stream a response from vLLM, yield tokens as they arrive."""
    full_response = ""
    stream = await client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.3,
        max_tokens=1024,
        stream=True,
        extra_body={
            "repetition_penalty": 1.1,   # reduces Vietnamese repetition artifacts
            "stop": ["</s>", "[INST]"],
        },
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            full_response += delta
            print(delta, end="", flush=True)
    return full_response

# ── Batch inference (no streaming) ──────────────────────────────────────────
async def batch_classify(texts: list[str], system_prompt: str) -> list[str]:
    """Run multiple classifications concurrently against vLLM."""
    async def single(text: str) -> str:
        response = await client.chat.completions.create(
            model="vistral-7b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            temperature=0,
            max_tokens=32,
        )
        return response.choices[0].message.content.strip()

    results = await asyncio.gather(*[single(t) for t in texts])
    return results

# ── Fallback wrapper: vLLM → OpenAI API ─────────────────────────────────────
async def resilient_chat(messages, primary_model="vistral-7b", timeout_sec=5.0):
    try:
        async with asyncio.timeout(timeout_sec):
            return await chat_stream(messages, model=primary_model)
    except (asyncio.TimeoutError, httpx.ConnectError) as e:
        print(f"\n[Fallback] vLLM unavailable ({e}), switching to OpenAI API...")
        fallback = AsyncOpenAI()   # reads OPENAI_API_KEY from env
        r = await fallback.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
            max_tokens=1024,
        )
        return r.choices[0].message.content

# ── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    messages = [
        {"role": "system", "content": "Bạn là chuyên gia phân tích dữ liệu doanh nghiệp."},
        {"role": "user", "content": "Tóm tắt 3 xu hướng chính của thị trường bán lẻ Việt Nam năm 2025."},
    ]
    asyncio.run(resilient_chat(messages))
```

---

#### 4d. Semantic Search with Sentence Transformers

```python
# Encode + index + search pattern for Vietnamese semantic search
# sentence-transformers + Qdrant for production; numpy for dev/testing

from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
)
from underthesea import word_tokenize
import numpy as np
import uuid

# ── Model load ───────────────────────────────────────────────────────────────
MODEL_NAME = "bkai-foundation-models/vietnamese-bi-encoder"
model = SentenceTransformer(MODEL_NAME, device="cuda")
VECTOR_DIM = model.get_sentence_embedding_dimension()   # 768

# ── Qdrant setup ─────────────────────────────────────────────────────────────
client = QdrantClient("localhost", port=6333)
COLLECTION = "vi_semantic_search"

def ensure_collection():
    if COLLECTION not in [c.name for c in client.get_collections().collections]:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE),
        )

# ── Vietnamese preprocessing ─────────────────────────────────────────────────
def preprocess_vi(text: str) -> str:
    """Word-segment Vietnamese text for better semantic representation."""
    return " ".join(word_tokenize(text))

# ── Index documents ──────────────────────────────────────────────────────────
def index_docs(docs: list[dict]):
    """docs: [{"text": "...", "category": "...", "source": "..."}]"""
    ensure_collection()
    texts = [preprocess_vi(d["text"]) for d in docs]
    vectors = model.encode(texts, batch_size=64, normalize_embeddings=True, show_progress_bar=True)

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vec.tolist(),
            payload={k: v for k, v in doc.items() if k != "text"} | {"text": doc["text"]},
        )
        for vec, doc in zip(vectors, docs)
    ]
    client.upsert(collection_name=COLLECTION, points=points)
    print(f"Indexed {len(points)} documents.")

# ── Search ────────────────────────────────────────────────────────────────────
def search(
    query: str,
    top_k: int = 5,
    category_filter: str | None = None,
    score_threshold: float = 0.40,
) -> list[dict]:
    query_vec = model.encode(preprocess_vi(query), normalize_embeddings=True).tolist()

    search_filter = None
    if category_filter:
        search_filter = Filter(
            must=[FieldCondition(key="category", match=MatchValue(value=category_filter))]
        )

    results = client.search(
        collection_name=COLLECTION,
        query_vector=query_vec,
        limit=top_k,
        score_threshold=score_threshold,
        query_filter=search_filter,
        with_payload=True,
    )

    return [
        {"score": round(r.score, 4), "text": r.payload["text"], "meta": r.payload}
        for r in results
    ]

# ── Demo ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    sample_docs = [
        {"text": "Chính phủ ban hành chính sách hỗ trợ doanh nghiệp vừa và nhỏ", "category": "policy"},
        {"text": "Lạm phát tăng ảnh hưởng đến chi tiêu của người tiêu dùng", "category": "economy"},
        {"text": "Công nghệ AI đang thay đổi ngành tài chính ngân hàng tại Việt Nam", "category": "tech"},
    ]
    index_docs(sample_docs)

    hits = search("tác động của trí tuệ nhân tạo đến ngân hàng", top_k=3)
    for h in hits:
        print(f"Score: {h['score']:.4f} | {h['text'][:80]}")
```

---

### 5. Production Considerations

| Aspect | Requirement | Approach | Estimated Cost Impact |
|---|---|---|---|
| **Latency** | P95 < 200 ms for classification; P95 < 2s for RAG generation | ONNX export for PhoBERT encoder (3–5× speedup on CPU); vLLM PagedAttention for generation; Qdrant in-memory collection for hot indices | Reduces GPU compute hours ~30% |
| **Throughput** | 50–200 requests/sec classification; 5–20 req/sec RAG | Async FastAPI + batching (max_batch=32, timeout_ms=20); vLLM continuous batching handles ~2,000 tokens/sec on A100 | Horizontal scaling adds ~$300/mo per A100 node |
| **Context Window Management** | Documents up to 50 pages; queries up to 1,000 tokens | Hierarchical chunking: sentence → paragraph → section; sliding window with 15% overlap; map-reduce summarization for >128k token docs | No extra cost if chunked correctly |
| **Model Versioning** | Hot-swap models without downtime | Each model version served under separate vLLM instance; traffic split via Nginx upstream; version tag in API response header | ~$0 ops overhead if using Docker Compose |
| **A/B Prompt Testing** | Compare prompt variants on live traffic | LangSmith experiment sets or promptfoo CI matrix; log prompt_version_id with every trace; statistical significance after 200 samples | ~$20/mo LangSmith starter |
| **Fallback Strategy** | 99.5% availability SLA | vLLM down → OpenAI API fallback via resilient_chat() wrapper; embedding model down → BM25 sparse fallback in Qdrant; circuit breaker with 5s timeout | Fallback to OpenAI adds ~$0.002/request |
| **Hallucination Control** | Faithfulness > 0.85 on RAGAS | Add source citation requirement in system prompt; post-generation RAGAS faithfulness check; reject response if score < 0.6 | ~$0.001/request for LLM-graded check |

---

### 6. Framework Comparison

| Framework | Best For | Vietnamese Support | Ecosystem | Self-hostable | Verdict |
|---|---|---|---|---|---|
| **HuggingFace Transformers** | Fine-tuning, encoder models, research | Excellent (PhoBERT, PhoGPT, VinAI models all on HF Hub) | Largest (500K+ models) | Yes (fully) | Primary choice for fine-tuning and embedding |
| **LangChain** | Custom multi-step chains, tool-use agents, RAG orchestration | Good (underthesea integration, community Vietnamese examples) | Large, fast-moving, some instability | Yes | Good for custom RAG; API churn is risk |
| **LlamaIndex** | Document-centric RAG, knowledge graph indexing, structured extraction | Good (same HF embeddings work; Vietnamese chunker compatible) | Medium, more stable than LangChain | Yes | Better fit for document store architectures |
| **vLLM** | High-throughput LLM serving, OpenAI-compatible API, production inference | Good (serves any HF model; Vistral/PhoGPT compatible) | Growing; production-battle-tested at scale | Yes (Docker) | Best GPU serving engine; required for production |
| **Ollama** | Local dev, CPU inference, rapid prototyping | Moderate (GGUF models only; Vietnamese GGUF exists but limited) | Large hobbyist community | Yes | Development only; not production throughput |
| **OpenAI API** | GPT-4o class reasoning, complex instruction-following | Good (multilingual, handles Vietnamese well with correct prompting) | De facto standard; stable | No (vendor) | Excellent quality; use as fallback or premium tier |
| **Anthropic API (Claude)** | Long document analysis, structured extraction, safety-critical | Good (Claude handles Vietnamese naturally; 200k context window) | Growing; well-documented | No (vendor) | Best for long-context tasks; higher price than OpenAI |

---

### 7. Effort Estimation

| Use Case | Duration | Team | Estimated Cost | Notes |
|---|---|---|---|---|
| **Vietnamese Sentiment Classifier** (PhoBERT + LoRA, 3-class) | 1–2 weeks | 1 ML engineer | $200–500 total (GPU rental + data annotation seed) | Requires ~2,000 labeled examples minimum; fast iteration with LoRA |
| **RAG Chatbot for Vietnamese Documents** | 3–5 weeks | 2 engineers (1 ML + 1 backend) | $500–1,500 setup + $200–400/mo ops | Includes embedding pipeline, Qdrant setup, prompt tuning, eval loop |
| **LLM Fine-tune on Domain Data** (7B model, SFT + LoRA) | 4–8 weeks | 2 ML engineers | $1,000–3,000 one-time (data prep + 3–5 training runs on A100) | Data quality is the bottleneck; 10K–50K instruction pairs needed |
| **Full NLP Platform** (multi-task: classification + NER + RAG + serving) | 3–5 months | 4–6 (ML, backend, DevOps, QA) | $15,000–40,000 build + $1,000–3,000/mo ops | Includes monitoring, A/B framework, fallback logic, CI/CD for models |

---

### 8. Recommended Starter Stacks for Vietnamese Teams

#### Minimal (no GPU, API-only)
**Ideal for:** early prototypes, <1,000 requests/day, budget < $100/mo

```
Text preprocessing:   underthesea (word segmentation, POS, basic NER)
Embeddings:           OpenAI text-embedding-3-small ($0.02/1M tokens)
                      OR sentence-transformers/paraphrase-multilingual on CPU
Vector store:         pgvector (Postgres extension, free, self-hosted)
                      OR Qdrant free tier (1GB)
LLM:                  Claude Haiku 3.5 or GPT-4o-mini for chat
                      Anthropic API for long documents (200k context)
Orchestration:        LlamaIndex (simple) or direct API calls
Monitoring:           Langfuse self-hosted (free Docker)
Monthly cost:         ~$30–80 (API calls + VPS for Postgres)
```

#### Mid-tier (1x A100 80GB)
**Ideal for:** production apps, <50K requests/day, budget ~$800/mo

```
Tokenization:         underthesea + tiktoken
Embeddings:           bkai-foundation-models/vietnamese-bi-encoder (self-hosted)
                      sentence-transformers on GPU, batch_size=128
Vector store:         Qdrant self-hosted (Docker, 10GB+ index)
LLM serving:          vLLM serving Vistral-7B-Chat or Mistral-7B-Instruct-v0.3
                      (OpenAI-compatible endpoint, ~1,800 tokens/sec throughput)
Fine-tuning:          PhoBERT + LoRA for classification tasks
                      QLoRA for 7B generative models
Orchestration:        LangChain LCEL or LlamaIndex
Monitoring:           Langfuse self-hosted + Prometheus/Grafana for GPU metrics
Fallback:             OpenAI API on vLLM timeout (circuit breaker)
Monthly cost:         ~$600–900 (1×A100 spot + VPS infra)
```

#### Enterprise (multi-GPU)
**Ideal for:** high-traffic platform, >200K requests/day, multi-team, SLA required

```
Tokenization:         underthesea cluster workers + custom BPE for domain vocab
Embeddings:           Custom fine-tuned Vietnamese bi-encoder on domain corpus
                      ColBERT v2 for high-recall retrieval
Vector store:         Qdrant cluster (3-node replicated) OR Weaviate cluster
LLM serving:          vLLM multi-GPU (tensor parallel) on 2–4×A100
                      OR fine-tuned LLaMA-3-70B-Vietnamese on Triton Inference Server
Fine-tuning:          Full SFT + DPO pipeline on domain data (10K–100K samples)
                      Automated retraining triggered by performance regression
Orchestration:        LlamaIndex + custom agent framework
Evaluation:           RAGAS + automated regression suite + human eval 2%/week
Monitoring:           Langfuse + Grafana + PagerDuty alerts on latency P99
Fallback:             Active-active across 2 vLLM clusters; Claude API emergency tier
Monthly cost:         ~$5,000–15,000 (multi-GPU infra + ops + eval API costs)
```

---

### 9. Known Limitations & Workarounds

**Vietnamese Tokenization Edge Cases**

underthesea word_tokenize uses a CRF-based model trained on VLSP datasets. It fails on: (1) informal internet Vietnamese with dropped diacritics ("khong biet" instead of "không biết"); (2) mixed Vietnamese-English code-switching ("team meeting vào lúc 3h"); (3) domain-specific compound nouns not in training data ("transformer encoder", "knowledge graph"). Workaround: normalize diacritics before tokenization when input is informal; maintain a custom domain vocabulary whitelist that bypasses the segmenter for known technical terms; for code-switching, apply language detection per-sentence and route to the appropriate tokenizer.

**Long Document Chunking**

Naive fixed-size chunking breaks semantic coherence: a chunk starting mid-sentence produces poor embeddings. The standard workaround is to chunk on sentence or paragraph boundaries with a 15–20% overlap, but this increases index size by ~17% and can cause duplicate retrieval. For documents with explicit structure (sections, headings), use structure-aware chunking: extract heading hierarchy and keep each section together up to the token limit, then sub-chunk with semantic overlap. For documents exceeding 50 pages, apply a two-stage retrieval: first retrieve relevant sections by section-level embeddings, then retrieve specific passages within those sections.

**Embedding Model Multilingual Drift**

Multilingual models (mpnet-multilingual, mE5) trained primarily on English and European languages often exhibit "English centroid drift": Vietnamese queries and English documents may cluster closer together in embedding space than semantically unrelated Vietnamese pairs, because Vietnamese text is mapped through English-proximal representations. This reduces recall on monolingual Vietnamese search. Workaround: use a Vietnamese-specific bi-encoder (bkai-foundation-models/vietnamese-bi-encoder) for Vietnamese document stores; reserve multilingual models only for cross-lingual retrieval tasks. Validate with Vietnamese-specific retrieval benchmarks before deploying.

**Hallucination in RAG**

Even with retrieved context, LLMs hallucinate by: (1) mixing information from different retrieved chunks; (2) filling gaps in retrieved context with parametric memory; (3) generating plausible-sounding but unverifiable Vietnamese business data. Mitigations: require the LLM to cite the specific retrieved chunk number for every factual claim (enforced via structured output schema); add a post-generation faithfulness check using RAGAS or a cross-encoder NLI model; set a conservative system prompt that explicitly instructs "Nếu không có trong tài liệu, nói 'không có thông tin'" ("If not in the documents, say 'no information'"); implement a retrieval confidence threshold — refuse to generate if max retrieval score is below 0.35.

**Context Window Token Budget Exhaustion**

Vietnamese text is verbose relative to its information density when word-segmented. A 512-token chunk in Vietnamese carries approximately 30–35% less information than an equivalent English chunk because Vietnamese syllables are shorter morphemes. This means RAG prompts with 6 retrieved chunks can exhaust a 4,096-token context window after adding the system prompt and user query. Workaround: use a token-counting step before prompt assembly and dynamically reduce the number of chunks if budget is tight; prefer models with 8k+ context windows for RAG in production; apply extractive summarization on chunks before injecting into prompt if token budget is critical.

---

### 10. Vietnam-Specific Technical Notes

**underthesea vs pyvi Tokenizer Comparison**

| Aspect | underthesea | pyvi |
|---|---|---|
| Algorithm | CRF (Conditional Random Field) | Rule-based + dictionary |
| Accuracy (VLSP benchmark) | ~97% F1 on news domain | ~94% F1 on news domain |
| Speed | ~500 sentences/sec (single core) | ~2,000 sentences/sec (faster) |
| Informal text | Moderate (struggles with diacriticless text) | Weak (dictionary-dependent) |
| Maintenance | Active (VinAI ecosystem) | Less active, smaller community |
| Installation | pip install underthesea (requires Java for some features) | pip install pyvi (pure Python) |
| Recommendation | Default choice for accuracy-sensitive NLP pipelines | Use only if speed is critical and accuracy is secondary |

For production pipelines, underthesea is the correct default. pyvi is acceptable for pre-processing large corpora where approximate tokenization is sufficient and throughput is the bottleneck.

**PhoBERT vs mBERT vs XLM-R for Vietnamese**

| Model | Architecture | Vietnamese Pretraining | NER F1 (VLSP) | Sentiment Acc | Inference Speed | Recommendation |
|---|---|---|---|---|---|---|
| **PhoBERT-base-v2** | RoBERTa-base | 20GB Vietnamese text (dedicated) | ~93% | ~93% | Fast (135M params) | Best for Vietnamese-only NLP tasks |
| **PhoBERT-large** | RoBERTa-large | same corpus, larger model | ~94.5% | ~94% | Slow (370M params) | Only if accuracy is critical and GPU available |
| **XLM-R-base** | RoBERTa multilingual | 2.5TB multilingual (Vi included) | ~91% | ~90% | Same as PhoBERT-base | Use for cross-lingual tasks or mixed Vi/EN corpora |
| **mBERT** | BERT multilingual | Wikipedia multilingual | ~88% | ~87% | Same | Avoid; strictly inferior to XLM-R on Vietnamese |
| **Qwen2.5-7B** | LLaMA-style decoder | 18T tokens multilingual | N/A (generative) | ~92% zero-shot | Slow (7B params) | Use for generative tasks; overkill for classification |

For MAESTRO's classification and extraction needs, **PhoBERT-base-v2** is the correct encoder choice for Vietnamese-primary workloads. XLM-R becomes necessary when documents contain Vietnamese-English code-switching.

**llama.cpp CPU Inference for Budget Teams**

Teams without GPU access can run capable Vietnamese LLMs on CPU using llama.cpp with GGUF-quantized models. Vistral-7B-Chat is available in GGUF format and runs at approximately 3–6 tokens/sec on a modern 8-core CPU (Intel Xeon / AMD EPYC) with Q4_K_M quantization — sufficient for non-latency-sensitive batch processing and internal tooling.

Key configuration for Vietnamese CPU inference:
- Use `Q4_K_M` quantization: best balance of quality and speed (perplexity increase ~0.2 over FP16)
- Set `n_ctx=2048` (not 4096): halves memory usage; sufficient for most RAG prompts
- Use `n_threads` = physical_cores (not hyperthreads): NUMA-sensitive, avoid over-threading
- Enable `mmap=True`: memory-mapped model loading, reduces RAM footprint
- Disable GPU layers (`n_gpu_layers=0`) explicitly to avoid partial GPU offload errors

Expected performance on a $50/mo VPS (4 vCPU, 16GB RAM): ~2–4 tokens/sec for Vistral-7B Q4_K_M; adequate for batch summarization pipelines processing 100–500 documents per day. For interactive chat, use the API-only stack instead.

---

*End of Tech Report B04 — Dr. Praxis (R-β) — 2026-03-31*
