# @mediapipe/tasks-genai Test Page

This test page evaluates the performance of [@mediapipe/tasks-genai](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/web_js) (MediaPipe LLM Inference) running Qwen2.5-0.5B-Instruct with TensorFlow Lite backend.

## Features

- **TensorFlow Lite Backend**: Optimized for edge devices
- **WebGPU Acceleration**: Hardware-accelerated inference when available
- **Model Variants**: Supports both fp32 and int8 quantized models
- **Performance Monitoring**: Tracks load time, TTFT, tokens/sec
- **Streaming Generation**: Real-time token generation display

## Setup

### Install Dependencies

```bash
cd automation/test-pages/mediapipe
pnpm install
```

### Development Mode

```bash
pnpm dev
```

Opens at `http://localhost:3004`

## Usage

The page auto-initializes when loaded. The API is accessible via `window.testAPI`:

```javascript
// Load model (fp32 or int8)
await testAPI.loadModel('https://huggingface.co/litert-community/Qwen2.5-0.5B-Instruct/resolve/main/Qwen2.5-0.5B-Instruct_seq128_f32_ekv1280.tflite');

// Generate text
const response = await testAPI.generate('Hello, how are you?', {
  maxTokens: 50,
  temperature: 0.8
});

// Get metrics
const metrics = testAPI.getMetrics();
console.log('Tokens/sec:', metrics.tokensPerSecond);
```

## Models

This test page uses Qwen2.5-0.5B-Instruct from Hugging Face in TFLite format:

| Quantization | URL | Size |
|--------------|-----|------|
| fp32 | [Qwen2.5-0.5B-Instruct_seq128_f32_ekv1280.tflite](https://huggingface.co/litert-community/Qwen2.5-0.5B-Instruct/blob/main/Qwen2.5-0.5B-Instruct_seq128_f32_ekv1280.tflite) | ~500MB |
| int8 | [Qwen2.5-0.5B-Instruct_seq128_q8_ekv1280.tflite](https://huggingface.co/litert-community/Qwen2.5-0.5B-Instruct/blob/main/Qwen2.5-0.5B-Instruct_seq128_q8_ekv1280.tflite) | ~150MB |

## Backend Selection

MediaPipe GenAI uses TensorFlow Lite with optional WebGPU acceleration:

1. **TFLite + WebGPU** (if available) - Hardware-accelerated on compatible GPUs
2. **TFLite + SIMD** - CPU-optimized on modern browsers
3. **TFLite** (baseline) - Works everywhere

## Browser Compatibility

| Browser | TFLite | TFLite+SIMD | TFLite+WebGPU |
|---------|--------|-------------|---------------|
| Chrome 113+ | ✅ | ✅ | ✅ |
| Firefox 89+ | ✅ | ✅ | ❌ |
| Safari 16.4+ | ✅ | ✅ | ❌ |
| Edge 113+ | ✅ | ✅ | ✅ |

## Performance

Expected performance with Qwen2.5-0.5B-Instruct:

| Backend | Load Time | TTFT | Tokens/sec |
|---------|-----------|------|------------|
| TFLite (CPU) | 1-3 min | 200-1000ms | 5-12 |
| TFLite (SIMD) | 1-3 min | 150-800ms | 8-18 |
| TFLite (WebGPU) | 1-3 min | 100-500ms | 15-40 |

*Performance varies by hardware and browser*

## Troubleshooting

### Model Download Issues

Models are downloaded from Hugging Face CDN. First run may take time depending on connection speed.

### WebGPU Not Available

WebGPU acceleration is currently only supported in Chrome/Edge 113+. The runtime will automatically fall back to CPU execution.

### Out of Memory

If you encounter OOM errors:
1. Try the int8 quantized model instead of fp32
2. Close other tabs to free up memory
3. Reduce `maxTokens` in generation options

### CORS Errors

Make sure the dev server is running with proper CORS headers. The vite.config.js should include:
```javascript
headers: {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}
```

## Testing

This page is tested with Playwright:

```bash
cd automation
pnpm test:mediapipe
```

## API Interface

This test page implements the `TestPageAPI` interface defined in `../shared/test-api.d.ts`:

```typescript
interface TestPageAPI {
  initialize(config?: RuntimeConfig): Promise<boolean>;
  loadModel(modelUrl: string): Promise<boolean>;
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  getMetrics(): PerformanceMetrics;
  getRuntimeInfo(): RuntimeInfo;
  cleanup(): Promise<void>;
}
```

## References

- [MediaPipe LLM Inference](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/web_js)
- [TensorFlow Lite](https://www.tensorflow.org/lite)
- [LiteRT Models](https://huggingface.co/litert-community)
- [Qwen2.5 Models](https://huggingface.co/Qwen)
