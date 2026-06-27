# GPU Requirements

## Prototype (this repo)
- **LLM**: Ollama + Llama 3.1 8B — runs on CPU (slow) or any GPU with 8GB+ VRAM
- **Embeddings**: BGE-M3 — runs on CPU, ~4GB RAM

## Production
- **LLM**: vLLM + Llama 3.3 70B — requires 2x NVIDIA A100 80GB
- **Embeddings**: BGE-M3 served via vLLM — 1x A10G or better

## Cloud Options (India)
- AWS: p4d.24xlarge (8x A100)
- Azure: Standard_ND96asr_v4
- GCP: a2-highgpu-8g
