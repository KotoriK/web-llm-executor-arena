# @huggingface/transformers Test Page

This test page evaluates the performance of [@huggingface/transformers](https://huggingface.co/docs/transformers.js) (Transformers.js) running Qwen2.5-0.5B-Instruct with ONNX Runtime.

## Features

- **Multi-Backend Support**: Automatically detects and uses the best available backend:
  - WASM (baseline) - Works on all browsers
  - WASM+SIMD - Faster on modern browsers
  - WebGPU - Significantly faster when available
  - WebNN - Experimental, hardware-accelerated inference
- **Model Variants**: Supports both fp32 and uint8 quantized models
- **Performance Monitoring**: Tracks load time, TTFT, tokens/sec
- **Streaming Generation**: Real-time token generation display

## Setup

### Install Dependencies

```bash
cd automation/test-pages/transformers
pnpm install
```

### Development Mode

```bash
pnpm dev
```

Opens at `http://localhost:3003`

## Usage

The page auto-initializes when loaded. The API is accessible via `window.testAPI`:

```javascript
// Load model (fp32 or uint8)
await testAPI.loadModel('onnx-community/Qwen2.5-0.5B-Instruct');

// Generate text
const response = await testAPI.generate('Hello, how are you?', {
  maxTokens: 50,
  temperature: 0.7
});

// Get metrics
const metrics = testAPI.getMetrics();
console.log('Tokens/sec:', metrics.tokensPerSecond);
```

## Models

This test page uses Qwen2.5-0.5B-Instruct from Hugging Face in ONNX format:

| Quantization | Model ID | File | Size |
|--------------|----------|------|------|
| fp32 | onnx-community/Qwen2.5-0.5B-Instruct | model.onnx | ~500MB |
| uint8 | onnx-community/Qwen2.5-0.5B-Instruct | model_uint8.onnx | ~150MB |

## Backend Selection

Transformers.js automatically selects the best available backend:

1. **WebGPU** (if available) - Best performance on modern GPUs
2. **WebNN** (if explicitly requested) - Experimental NPU support
3. **WASM+SIMD** (fallback) - Good performance on all modern browsers
4. **WASM** (baseline) - Works everywhere

## Browser Compatibility

| Browser | WASM | WASM+SIMD | WebGPU | WebNN |
|---------|------|-----------|--------|-------|
| Chrome 113+ | ✅ | ✅ | ✅ | ⚠️ |
| Firefox 89+ | ✅ | ✅ | ❌ | ❌ |
| Safari 16.4+ | ✅ | ✅ | ❌ | ❌ |
| Edge 113+ | ✅ | ✅ | ✅ | ⚠️ |

## Performance

Expected performance with Qwen2.5-0.5B-Instruct:

| Backend | Load Time | TTFT | Tokens/sec |
|---------|-----------|------|------------|
| WASM | 30-90s | 200-800ms | 8-15 |
| WASM+SIMD | 30-90s | 150-600ms | 12-20 |
| WebGPU | 1-2 min | 100-400ms | 20-50 |

*Performance varies by hardware and browser*

## Troubleshooting

### Model Download Issues

Models are downloaded from Hugging Face CDN. First run may take time depending on connection speed.

### WebGPU Not Available

WebGPU is currently only supported in Chrome/Edge 113+. The runtime will automatically fall back to WASM.

### Out of Memory

If you encounter OOM errors:
1. Try the uint8 quantized model instead of fp32
2. Close other tabs to free up memory
3. Reduce `maxTokens` in generation options

## Testing

This page is tested with Playwright:

```bash
cd automation
pnpm test:transformers
```

## API Interface

This test page implements the `TestPageAPI` interface defined in `../shared/test-api.d.ts`:

```typescript
interface TestPageAPI {
  initialize(config?: RuntimeConfig): Promise<boolean>;
  loadModel(modelId: string): Promise<boolean>;
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  getMetrics(): PerformanceMetrics;
  getRuntimeInfo(): RuntimeInfo;
  cleanup(): Promise<void>;
}
```

## References

- [Transformers.js Documentation](https://huggingface.co/docs/transformers.js)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [Qwen2.5 Models](https://huggingface.co/Qwen)
