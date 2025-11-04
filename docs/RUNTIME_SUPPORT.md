# Runtime Technology Support Matrix

本文档详细说明各运行时对 WASM SIMD、WebGPU 和 WebNN 的支持情况。

This document details each runtime's support for WASM SIMD, WebGPU, and WebNN.

## 支持矩阵 / Support Matrix

| 运行时 / Runtime | WASM SIMD | WebGPU | WebNN | 主要后端 / Primary Backend |
|-----------------|-----------|--------|-------|---------------------------|
| @wllama/wllama | ✅ 支持 | ❌ 不支持 | ❌ 不支持 | WASM (llama.cpp) |
| @mlc-ai/web-llm | ✅ 支持 | ✅ 支持 | ❌ 不支持 | WebGPU (preferred), WASM |
| @huggingface/transformers | ✅ 支持 | ✅ 支持 | ✅ 实验性支持 | ONNX Runtime (WebGPU, WASM, WebNN) |
| @mediapipe/tasks-genai | ⚠️ 有限支持 | ✅ 支持 | ❌ 不支持 | WebGPU, WASM (TFLite) |

## 详细说明 / Detailed Information

### @wllama/wllama

**项目主页**: https://github.com/ngxson/wllama

**技术栈**: llama.cpp 编译为 WebAssembly

#### WASM SIMD ✅
- **支持状态**: 完全支持
- **默认启用**: 是
- **性能提升**: 2-4x 相比非 SIMD 版本
- **浏览器要求**: Chrome 91+, Firefox 89+, Safari 16.4+
- **注意事项**: 需要服务器正确设置 CORS 和 COOP/COEP 头以使用 SharedArrayBuffer

#### WebGPU ❌
- **支持状态**: 不支持
- **原因**: 基于 llama.cpp，目前主要面向 CPU 执行

#### WebNN ❌
- **支持状态**: 不支持
- **未来计划**: 未知

#### 最佳实践
- 在支持 SIMD 的现代浏览器上使用
- 确保服务器配置正确以支持 SharedArrayBuffer
- 适合 CPU 密集型推理场景

---

### @mlc-ai/web-llm

**项目主页**: https://github.com/mlc-ai/web-llm

**技术栈**: Apache TVM 编译器，支持 WebGPU 和 WASM

#### WASM SIMD ✅
- **支持状态**: 完全支持（作为后备方案）
- **默认启用**: 在 WebGPU 不可用时自动启用
- **性能提升**: 2-3x 相比非 SIMD 版本
- **浏览器要求**: Chrome 91+, Firefox 89+
- **注意事项**: 性能显著低于 WebGPU 模式

#### WebGPU ✅
- **支持状态**: 完全支持（推荐模式）
- **默认启用**: 是（如果可用）
- **性能提升**: 10-50x 相比 WASM SIMD
- **浏览器要求**: 
  - Chrome/Edge 113+
  - 其他浏览器逐步支持中
- **GPU 要求**: 支持 Vulkan 1.2+ 或 Metal 2+
- **注意事项**: 
  - 需要用户明确授权 GPU 访问
  - 内存使用较高
  - 依赖浏览器和驱动的 WebGPU 实现质量

#### WebNN ❌
- **支持状态**: 不支持
- **未来计划**: 可能在未来版本中添加

#### 最佳实践
- 优先使用 WebGPU 以获得最佳性能
- 提供 WASM 后备以支持更广泛的设备
- 监控 GPU 内存使用情况
- 为用户提供后端选择选项

---

### @huggingface/transformers

**项目主页**: https://huggingface.co/docs/transformers.js/index

**技术栈**: ONNX Runtime Web

#### WASM SIMD ✅
- **支持状态**: 完全支持
- **默认启用**: 是（在 WASM 后端下）
- **性能提升**: 2-4x 相比非 SIMD 版本
- **浏览器要求**: Chrome 91+, Firefox 89+, Safari 16.4+
- **注意事项**: ONNX Runtime 自动检测和启用 SIMD

#### WebGPU ✅
- **支持状态**: 完全支持
- **默认启用**: 否（需要显式指定）
- **性能提升**: 5-20x 相比 WASM
- **浏览器要求**: Chrome/Edge 113+
- **注意事项**:
  - 需要在模型配置中指定 `device: 'webgpu'`
  - 某些算子可能尚未完全支持
  - 模型需要兼容 WebGPU 后端

#### WebNN ⚠️
- **支持状态**: 实验性支持（通过 ONNX Runtime Web）
- **默认启用**: 否（需要显式启用）
- **浏览器要求**: Chrome 121+ (需要启用实验性特性)
- **平台支持**:
  - **Windows**: 支持 DirectML（使用 GPU/NPU）
  - **Android**: 支持 NNAPI（使用 NPU）
  - **macOS/iOS**: 未来可能支持 Core ML
- **注意事项**:
  - API 仍在演进中
  - 需要浏览器标志启用: `chrome://flags/#enable-webnn`
  - 算子覆盖有限
  - 驱动支持差异较大

#### 最佳实践
- 根据目标设备选择合适的后端：
  - 桌面 + 现代 GPU → WebGPU
  - 移动设备 + NPU → WebNN (实验性)
  - 通用兼容性 → WASM SIMD
- 实现后端自动选择和降级策略
- 测试不同后端的模型兼容性

---

### @mediapipe/tasks-genai

**项目主页**: https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/web_js

**技术栈**: TensorFlow Lite / LiteRT

#### WASM SIMD ⚠️
- **支持状态**: 有限支持（内部使用）
- **默认启用**: 是（在 CPU 后端下）
- **性能提升**: 自动优化，具体提升取决于实现
- **注意事项**: 
  - SIMD 作为 TFLite WASM 后端的一部分
  - 用户无需显式配置
  - 性能低于 WebGPU 模式

#### WebGPU ✅
- **支持状态**: 完全支持（通过 TFLite GPU delegate）
- **默认启用**: 是（如果可用）
- **性能提升**: 10-30x 相比 CPU
- **浏览器要求**: Chrome/Edge 113+
- **注意事项**:
  - 自动检测和启用 GPU 加速
  - 对特定模型架构优化良好
  - 内存占用较高

#### WebNN ❌
- **支持状态**: 不支持
- **未来计划**: Google 可能会通过 LiteRT 集成 WebNN，但暂无明确时间表

#### 最佳实践
- 依赖 MediaPipe 的自动后端选择
- 针对 LiteRT 格式优化模型
- 在移动设备上测试性能表现
- 监控内存使用，特别是在资源受限设备上

---

## 浏览器支持总结 / Browser Support Summary

### WASM SIMD
- **Chrome/Edge**: 91+ ✅
- **Firefox**: 89+ ✅
- **Safari**: 16.4+ ✅
- **Opera**: 77+ ✅

### WebGPU
- **Chrome/Edge**: 113+ ✅
- **Firefox**: 开发中 🚧
- **Safari**: 开发中 🚧
- **Opera**: 99+ ✅

### WebNN
- **Chrome/Edge**: 121+ (需要实验性标志) 🧪
- **Firefox**: 未计划 ❌
- **Safari**: 未计划 ❌

---

## 性能建议 / Performance Recommendations

### 桌面环境 / Desktop
1. **首选**: WebGPU (@mlc-ai/web-llm 或 @huggingface/transformers)
2. **后备**: WASM SIMD (所有运行时)

### 移动环境 / Mobile
1. **首选**: WebGPU (@mediapipe/tasks-genai 或 @mlc-ai/web-llm)
2. **实验性**: WebNN (@huggingface/transformers) - 仅在支持的设备
3. **后备**: WASM SIMD (@wllama/wllama)

### 兼容性优先 / Compatibility First
1. **首选**: WASM SIMD (@wllama/wllama)
2. **增强**: 动态检测 WebGPU 并在可用时使用

---

## 测试方法 / Testing Methodology

### 特性检测代码示例 / Feature Detection Examples

```javascript
// 检测 WASM SIMD 支持
async function checkWasmSIMD() {
  try {
    return WebAssembly.validate(new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3,
      2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
    ]));
  } catch (e) {
    return false;
  }
}

// 检测 WebGPU 支持
async function checkWebGPU() {
  return !!navigator.gpu;
}

// 检测 WebNN 支持
async function checkWebNN() {
  return 'ml' in navigator && 'createContext' in navigator.ml;
}

// 获取 GPU 信息（WebGPU）
async function getGPUInfo() {
  if (!navigator.gpu) return null;
  
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return null;
  
  return {
    vendor: adapter.info?.vendor,
    architecture: adapter.info?.architecture,
    device: adapter.info?.device,
    description: adapter.info?.description,
  };
}
```

---

## 更新日志 / Changelog

- **2024-11**: 初始版本，基于各运行时最新版本的文档和测试

---

## 参考资料 / References

1. [WebAssembly SIMD Specification](https://github.com/WebAssembly/simd)
2. [WebGPU Specification](https://www.w3.org/TR/webgpu/)
3. [WebNN Specification](https://www.w3.org/TR/webnn/)
4. [Can I Use - WebAssembly SIMD](https://caniuse.com/wasm-simd)
5. [Can I Use - WebGPU](https://caniuse.com/webgpu)
6. [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
7. [TensorFlow Lite Web](https://www.tensorflow.org/lite/guide/inference#load_and_run_a_model_in_javascript)
