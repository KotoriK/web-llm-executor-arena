# Web LLM Executor Arena

一个用于评估和比较多个端侧大语言模型（LLM）运行时性能的测试框架和展示平台。

[English](#english) | [中文](#chinese)

## 中文

### 项目概述

本项目旨在提供对多个端侧LLM运行时的性能测试，并维护一个展示站点，以帮助开发人员选择合适的端侧运行时。通过自动化测试和详细的性能指标收集，为开发者提供客观的性能数据参考。

### 仓库结构

```
web-llm-executor-arena/
├── automation/              # 浏览器自动化测试脚本
│   ├── tests/              # Playwright 测试用例
│   ├── fixtures/           # 测试固件和辅助函数
│   └── config/             # 测试配置文件
├── results/                # 历史测试结果数据
│   ├── raw/               # 原始测试数据（JSON）
│   └── processed/         # 处理后的数据
├── website/               # Astro + TailwindCSS 展示站点
│   ├── src/              # 源代码
│   │   ├── pages/        # 页面
│   │   ├── components/   # 组件
│   │   └── layouts/      # 布局
│   └── public/           # 静态资源
├── docs/                 # 项目文档
└── scripts/              # 工具脚本
```

### 测试的运行时

| 运行时 | 版本 | 仓库链接 |
|--------|------|----------|
| @wllama/wllama | Latest | https://github.com/ngxson/wllama |
| @mlc-ai/web-llm | Latest | https://github.com/mlc-ai/web-llm |
| @huggingface/transformers | Latest | https://huggingface.co/docs/transformers.js/index |
| @mediapipe/tasks-genai | Latest | https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/web_js |

### 测试模型

所有运行时使用 **Qwen2.5-0.5B-Instruct** 模型的不同量化版本以确保公平比较。

| 运行时 | q0f32 模型 | q8 模型 |
|--------|-----------|---------|
| @wllama/wllama | - | [qwen2.5-0.5b-instruct-q8_0.gguf](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/blob/main/qwen2.5-0.5b-instruct-q8_0.gguf) |
| @mlc-ai/web-llm | [Qwen2.5-0.5B-Instruct-q0f32-MLC](https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q0f32-MLC) | - |
| @huggingface/transformers | [model.onnx](https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct/blob/main/onnx/model.onnx) | [model_uint8.onnx](https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct/blob/main/onnx/model_uint8.onnx) |
| @mediapipe/tasks-genai | [Qwen2.5-0.5B-Instruct_seq128_f32_ekv1280.tflite](https://huggingface.co/litert-community/Qwen2.5-0.5B-Instruct/blob/main/Qwen2.5-0.5B-Instruct_seq128_f32_ekv1280.tflite) | [Qwen2.5-0.5B-Instruct_seq128_q8_ekv1280.tflite](https://huggingface.co/litert-community/Qwen2.5-0.5B-Instruct/blob/main/Qwen2.5-0.5B-Instruct_seq128_q8_ekv1280.tflite) |

### 测试记录的信息

#### 环境信息
- **平台**: Windows, macOS, Linux
- **浏览器**: 类型（Chrome, Firefox, Safari, Edge）和版本
- **硬件并发性**: `navigator.hardwareConcurrency`
- **内存**: 可用内存信息

#### 加速技术支持
- **WASM SIMD**: 是否启用
- **WebGPU**: 是否启用，GPU 型号、驱动版本、内存
- **WebNN**: 是否启用，NPU/GPU 信息

#### 模型信息
- 模型名称
- 量化方式（q0f32, q8, etc.）
- 文件大小（MB）
- 参数量

#### 运行时信息
- 运行时名称和版本
- SIMD 支持和启用状态
- WebGPU 支持和启用状态
- WebNN 支持和启用状态

#### 性能指标
- **加载时间**: 模型加载耗时（ms）
- **首次推理时间** (TTFT): Time to First Token（ms）
- **推理速度**: Tokens per second
- **内存使用**: 峰值内存占用（MB）
- **准确性**: 输出质量评估（可选）

### 运行时技术支持矩阵

详见 [RUNTIME_SUPPORT.md](./docs/RUNTIME_SUPPORT.md)

### 快速开始

#### 先决条件

- Node.js 18+
- pnpm（推荐）或 npm

#### 安装

```bash
# 克隆仓库
git clone https://github.com/KotoriK/web-llm-executor-arena.git
cd web-llm-executor-arena

# 安装依赖
pnpm install

# 安装 Playwright 浏览器
pnpm exec playwright install
```

#### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定运行时的测试
pnpm test:wllama
pnpm test:webllm
pnpm test:transformers
pnpm test:mediapipe
```

#### 启动网站

```bash
cd website
pnpm dev
```

访问 http://localhost:4321 查看结果展示。

### 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

### 路线图

- [x] 项目初始化和文档完善
- [ ] 设置自动化测试框架（Playwright）
- [ ] 实现各运行时的测试用例
- [ ] 创建结果数据存储结构
- [ ] 开发展示网站（Astro + TailwindCSS）
- [ ] 设置 CI/CD 自动化测试
- [ ] 添加更多模型支持
- [ ] 实现性能趋势分析
- [ ] 添加用户提交的测试结果

### 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## English

### Project Overview

This project aims to provide performance testing for multiple client-side LLM runtimes and maintain a showcase website to help developers choose the right client-side runtime. Through automated testing and detailed performance metrics collection, it provides objective performance data for developers.

### Repository Structure

```
web-llm-executor-arena/
├── automation/              # Browser automation test scripts
│   ├── tests/              # Playwright test cases
│   ├── fixtures/           # Test fixtures and helpers
│   └── config/             # Test configuration
├── results/                # Historical test results
│   ├── raw/               # Raw test data (JSON)
│   └── processed/         # Processed data
├── website/               # Astro + TailwindCSS showcase site
│   ├── src/              # Source code
│   │   ├── pages/        # Pages
│   │   ├── components/   # Components
│   │   └── layouts/      # Layouts
│   └── public/           # Static assets
├── docs/                 # Project documentation
└── scripts/              # Utility scripts
```

### Tested Runtimes

| Runtime | Version | Repository |
|---------|---------|------------|
| @wllama/wllama | Latest | https://github.com/ngxson/wllama |
| @mlc-ai/web-llm | Latest | https://github.com/mlc-ai/web-llm |
| @huggingface/transformers | Latest | https://huggingface.co/docs/transformers.js/index |
| @mediapipe/tasks-genai | Latest | https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/web_js |

### Test Models

All runtimes use different quantized versions of the **Qwen2.5-0.5B-Instruct** model to ensure fair comparison.

### Recorded Test Information

#### Environment Information
- **Platform**: Windows, macOS, Linux
- **Browser**: Type and version
- **Hardware Concurrency**: `navigator.hardwareConcurrency`
- **Memory**: Available memory information

#### Acceleration Technology Support
- **WASM SIMD**: Enabled status
- **WebGPU**: Enabled status, GPU model, driver version, memory
- **WebNN**: Enabled status, NPU/GPU information

#### Model Information
- Model name
- Quantization method
- File size (MB)
- Parameter count

#### Runtime Information
- Runtime name and version
- SIMD support and status
- WebGPU support and status
- WebNN support and status

#### Performance Metrics
- **Load Time**: Model loading time (ms)
- **TTFT**: Time to First Token (ms)
- **Inference Speed**: Tokens per second
- **Memory Usage**: Peak memory usage (MB)
- **Accuracy**: Output quality assessment (optional)

### Runtime Technology Support Matrix

See [RUNTIME_SUPPORT.md](./docs/RUNTIME_SUPPORT.md)

### Quick Start

#### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

#### Installation

```bash
# Clone repository
git clone https://github.com/KotoriK/web-llm-executor-arena.git
cd web-llm-executor-arena

# Install dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install
```

#### Run Tests

```bash
# Run all tests
pnpm test

# Run tests for specific runtime
pnpm test:wllama
pnpm test:webllm
pnpm test:transformers
pnpm test:mediapipe
```

#### Start Website

```bash
cd website
pnpm dev
```

Visit http://localhost:4321 to view the results showcase.

### Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Roadmap

- [x] Project initialization and documentation
- [ ] Set up automation testing framework (Playwright)
- [ ] Implement test cases for each runtime
- [ ] Create result data storage structure
- [ ] Develop showcase website (Astro + TailwindCSS)
- [ ] Set up CI/CD automated testing
- [ ] Add more model support
- [ ] Implement performance trend analysis
- [ ] Add user-submitted test results

### License

MIT License - See [LICENSE](./LICENSE) file for details