# GPU Requirements — HR PolicyIQ

## This Repository (Prototype)

| Component | Model | Hardware | Notes |
|---|---|---|---|
| LLM | Llama 3.1 8B via Groq API | None (cloud) | Free tier available at console.groq.com |
| Embeddings | BGE-small-en-v1.5 | CPU, ~500MB RAM | 384-dim, fast, no GPU needed |
| Reranker | BGE-reranker-large | CPU, ~1.5GB RAM | Slow on first load; cached after |

**No GPU is required to run this prototype.** Groq handles LLM inference in the cloud.

## Production (Self-Hosted LLM)

If you want to replace Groq with an on-premise LLM (Llama 3.3 70B via vLLM):

| Component | Minimum Hardware | Recommended |
|---|---|---|
| LLM (70B) | 2× NVIDIA A100 80GB | 4× A100 80GB |
| Embeddings (BGE-M3) | 1× A10G 24GB | 1× A100 40GB |
| Reranker (BGE-large) | CPU or 1× T4 | 1× A10G |

## Cloud Options (India Region)

| Provider | Instance | GPUs | Cost (approx) |
|---|---|---|---|
| AWS | p4d.24xlarge | 8× A100 40GB | ~$32/hr |
| AWS | p3.8xlarge | 4× V100 | ~$12/hr |
| Azure | Standard_ND96asr_v4 | 8× A100 80GB | ~$35/hr |
| GCP | a2-highgpu-8g | 8× A100 | ~$30/hr |

## Switching from Groq to Self-Hosted

1. Deploy vLLM with the model of your choice
2. Update `LLM_MODEL` and add `VLLM_BASE_URL` in `.env`
3. Update `pipeline.py` to use the OpenAI-compatible vLLM endpoint

```env
LLM_MODEL=meta-llama/Llama-3.3-70B-Instruct
VLLM_BASE_URL=http://your-vllm-host:8000/v1
```
