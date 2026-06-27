# ADR 001: vLLM over Ollama for Production

**Status**: Accepted  
**Date**: 2025-01

## Decision
Use vLLM for production LLM serving; Ollama for prototype/development only.

## Rationale
- vLLM provides 3-5x higher throughput via PagedAttention
- Ollama has no concurrent request batching
- vLLM supports OpenAI-compatible API (easy swap)
- Prototype uses Ollama for zero-GPU-cost local development

## Consequences
- Production requires 2x A100 80GB minimum
- Prototype gracefully falls back to returning raw retrieved context if Ollama unavailable
