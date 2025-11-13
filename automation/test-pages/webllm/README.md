# Web-LLM Test Page

Test page for [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) - High-performance browser LLM inference with WebGPU and WASM.

## Features

- WebGPU acceleration (10-50x faster than WASM)
- Automatic fallback to WASM when WebGPU unavailable
- GPU information detection
- Progress tracking during model download and compilation
- Streaming text generation
- Performance metrics collection

## Model

Uses **Qwen2.5-0.5B-Instruct-q0f32-MLC**
- Format: MLC (TVM compiled)
- Quantization: Q0F32 (full precision)
- Backend: WebGPU (preferred) or WASM (fallback)
- Size: ~1GB (includes model + cache)

## Setup

```bash
cd automation/test-pages/webllm
pnpm install
```

## Development

```bash
pnpm dev
```

Opens at http://localhost:3002

**Note**: The server is configured with CORS headers required for SharedArrayBuffer support.

## Run Tests

From the automation directory:

```bash
cd ../..
pnpm test tests/webllm.test.ts
```

**Note**: First run downloads and compiles the model (5-10 minutes).

## API

The page exposes `window.testAPI` with:

```typescript
interface TestAPI {
  initialize(config: { modelId: string }): Promise<boolean>;
  loadModel(modelId: string): Promise<boolean>;
  generate(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string>;
  getMetrics(): PerformanceMetrics;
  getRuntimeInfo(): RuntimeInfo;
  cleanup(): Promise<void>;
}
```

## Browser Requirements

### WebGPU Mode (Recommended)
- **Chrome/Edge**: 113+ ✅
- **Opera**: 99+ ✅
- **Firefox**: In development 🚧
- **Safari**: In development 🚧

### WASM Fallback
- Chrome 91+ (SIMD)
- Firefox 89+ (SIMD)
- Safari 16.4+ (SIMD)

## Performance Expectations

### WebGPU (GPU)
- Load/Compile: 2-5 minutes (first run)
- TTFT: 50-200ms
- Tokens/sec: 40-100 (varies by GPU)

### WASM (CPU)
- Load: 1-2 minutes
- TTFT: 500-2000ms
- Tokens/sec: 5-15

## Notes

- WebGPU provides 10-50x better performance than WASM
- First run compiles the model for your GPU (cached afterwards)
- Model compilation is GPU-specific (different GPUs need separate compilations)
- Requires significant GPU memory (~2GB for compilation)
- SharedArrayBuffer required for multi-threading

## Troubleshooting

### "GPU adapter unavailable"
- Check if browser supports WebGPU
- Try updating GPU drivers
- Test will automatically fall back to WASM

### Out of GPU Memory
- Close other GPU-intensive applications
- Try a different browser
- Use WASM fallback

### Slow compilation
- First compilation takes 2-5 minutes
- Subsequent runs use cached compilation
- Clear browser cache if compilation seems stuck
