# Wllama Test Page

Test page for [@wllama/wllama](https://github.com/ngxson/wllama) - a high-performance WASM port of llama.cpp.

## Features

- WASM SIMD support detection
- Progress tracking during model download
- Performance metrics collection
- Streaming text generation
- Memory usage monitoring

## Model

Uses **Qwen2.5-0.5B-Instruct-q8_0.gguf** (~500MB)
- Format: GGUF
- Quantization: Q8_0
- Backend: llama.cpp via WASM

## Setup

```bash
cd automation/test-pages/wllama
pnpm install
```

## Development

```bash
pnpm dev
```

Opens at http://localhost:3001

**Note**: The server is configured with CORS headers required for SharedArrayBuffer support.

## Run Tests

From the automation directory:

```bash
cd ../..
pnpm test tests/wllama.test.ts
```

## API

The page exposes `window.testAPI` with:

```typescript
interface TestAPI {
  initialize(config?: object): Promise<boolean>;
  loadModel(modelUrl: string): Promise<boolean>;
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

- Chrome 91+ (WASM SIMD)
- Firefox 89+ (WASM SIMD)
- Safari 16.4+ (WASM SIMD)

## Notes

- First load downloads ~500MB model (cached afterwards)
- Model loading can take 2-5 minutes depending on connection
- WASM SIMD provides 2-4x performance improvement
- SharedArrayBuffer required for multi-threading
