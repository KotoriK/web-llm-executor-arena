# Architecture Documentation

本文档描述 Web LLM Executor Arena 的架构设计和实现细节。

This document describes the architecture design and implementation details of Web LLM Executor Arena.

## 系统架构 / System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web LLM Executor Arena                    │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Automation     │      │     Results      │      │     Website      │
│   Framework      │─────▶│     Storage      │─────▶│   (Showcase)     │
│   (Playwright)   │      │   (JSON Files)   │      │ (Astro/Tailwind) │
└──────────────────┘      └──────────────────┘      └──────────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│              Runtime Test Pages (HTML/JS)                    │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  @wllama     │  @mlc-ai     │ @huggingface │  @mediapipe    │
│  /wllama     │  /web-llm    │ /transformers│  /tasks-genai  │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

## 组件详解 / Component Details

### 1. Automation Framework (自动化测试框架)

**技术**: Playwright

**职责**:
- 启动浏览器并访问测试页面
- 收集系统和浏览器信息
- 监控性能指标
- 执行测试场景
- 保存测试结果

**目录结构**:
```
automation/
├── tests/
│   ├── wllama.test.ts          # @wllama/wllama 测试
│   ├── webllm.test.ts          # @mlc-ai/web-llm 测试
│   ├── transformers.test.ts    # @huggingface/transformers 测试
│   └── mediapipe.test.ts       # @mediapipe/tasks-genai 测试
├── fixtures/
│   ├── browser-info.ts         # 浏览器信息收集
│   ├── performance-monitor.ts  # 性能监控工具
│   └── model-tester.ts         # 模型测试辅助函数
├── config/
│   ├── playwright.config.ts    # Playwright 配置
│   ├── models.config.ts        # 模型配置
│   └── test-scenarios.ts       # 测试场景定义
└── package.json
```

**关键功能**:

1. **环境信息收集**
```typescript
interface EnvironmentInfo {
  platform: string;           // OS platform
  browser: {
    name: string;            // browser name
    version: string;         // browser version
    userAgent: string;       // full user agent
  };
  hardware: {
    cores: number;           // navigator.hardwareConcurrency
    memory?: number;         // device memory (if available)
  };
  capabilities: {
    wasmSIMD: boolean;       // WASM SIMD support
    webGPU: boolean;         // WebGPU support
    webNN: boolean;          // WebNN support
  };
  gpu?: GPUInfo;             // GPU information (if WebGPU available)
}
```

2. **性能指标收集**
```typescript
interface PerformanceMetrics {
  loadTime: number;          // Model load time (ms)
  ttft: number;              // Time to first token (ms)
  tokensPerSecond: number;   // Inference speed
  peakMemory: number;        // Peak memory usage (MB)
  avgLatency: number;        // Average token latency (ms)
}
```

### 2. Runtime Test Pages (运行时测试页面)

**技术**: HTML + JavaScript (ES Modules)

**职责**:
- 加载和初始化各运行时
- 执行推理任务
- 暴露性能指标 API
- 与自动化框架通信

**页面结构**:
```
automation/test-pages/
├── wllama/
│   ├── index.html
│   ├── test.js
│   └── package.json
├── webllm/
│   ├── index.html
│   ├── test.js
│   └── package.json
├── transformers/
│   ├── index.html
│   ├── test.js
│   └── package.json
├── mediapipe/
│   ├── index.html
│   ├── test.js
│   └── package.json
└── shared/
    ├── utils.js            # 共享工具函数
    └── metrics.js          # 指标收集工具
```

**测试页面接口**:
```typescript
// 每个测试页面必须实现的全局接口
interface TestPageAPI {
  // 初始化运行时
  initialize(config: RuntimeConfig): Promise<void>;
  
  // 加载模型
  loadModel(modelUrl: string): Promise<void>;
  
  // 执行推理
  generate(prompt: string, options: GenerateOptions): Promise<string>;
  
  // 获取性能指标
  getMetrics(): Promise<PerformanceMetrics>;
  
  // 获取运行时信息
  getRuntimeInfo(): RuntimeInfo;
  
  // 清理资源
  cleanup(): Promise<void>;
}
```

### 3. Results Storage (结果存储)

**技术**: JSON 文件系统

**职责**:
- 存储原始测试结果
- 提供结构化数据格式
- 支持历史数据查询
- 生成聚合统计

**目录结构**:
```
results/
├── raw/                        # 原始测试结果
│   ├── 2024-11/
│   │   ├── wllama_chrome_windows_20241104_120000.json
│   │   ├── webllm_chrome_macos_20241104_120530.json
│   │   └── ...
│   └── schema.json            # 结果数据 JSON Schema
├── processed/                  # 处理后的数据
│   ├── summary.json           # 总览统计
│   ├── by-runtime.json        # 按运行时分组
│   └── by-platform.json       # 按平台分组
└── README.md                  # 数据说明文档
```

**数据格式**:
```typescript
interface TestResult {
  meta: {
    testId: string;            // 唯一测试ID
    timestamp: string;         // ISO 8601 timestamp
    version: string;           // Schema version
  };
  environment: EnvironmentInfo;
  runtime: {
    name: string;              // Runtime name
    version: string;           // Runtime version
    backend: string;           // Backend used (wasm/webgpu/webnn)
  };
  model: {
    name: string;              // Model name
    quantization: string;      // Quantization method
    size: number;              // File size in bytes
    parameters: string;        // Model parameters (e.g., "0.5B")
  };
  performance: PerformanceMetrics;
  outputs?: {                  // Optional output samples
    prompt: string;
    response: string;
    tokenCount: number;
  }[];
  errors?: string[];           // Any errors encountered
}
```

### 4. Website (展示网站)

**技术**: Astro + TailwindCSS + Chart.js

**职责**:
- 展示测试结果
- 提供交互式图表
- 支持数据筛选和比较
- 响应式设计

**目录结构**:
```
website/
├── src/
│   ├── pages/
│   │   ├── index.astro        # 主页
│   │   ├── compare.astro      # 对比页面
│   │   ├── runtime/
│   │   │   ├── [runtime].astro # 运行时详情页
│   │   └── about.astro        # 关于页面
│   ├── components/
│   │   ├── PerformanceChart.astro
│   │   ├── RuntimeCard.astro
│   │   ├── FilterPanel.astro
│   │   └── DataTable.astro
│   ├── layouts/
│   │   └── Layout.astro       # 基础布局
│   ├── utils/
│   │   ├── data-loader.ts     # 数据加载工具
│   │   └── formatters.ts      # 数据格式化
│   └── styles/
│       └── global.css
├── public/
│   ├── data/                  # 从 results/ 复制的数据
│   └── assets/
├── astro.config.mjs
├── tailwind.config.cjs
└── package.json
```

**页面功能**:

1. **主页 (index.astro)**
   - 最新测试结果概览
   - 各运行时性能对比图表
   - 推荐运行时建议

2. **对比页面 (compare.astro)**
   - 多维度对比（运行时、平台、浏览器）
   - 交互式筛选
   - 导出数据功能

3. **运行时详情页 ([runtime].astro)**
   - 特定运行时的详细信息
   - 历史性能趋势
   - 最佳配置建议

## 数据流 / Data Flow

```
┌──────────────┐
│  Run Tests   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  Playwright navigates    │
│  to test pages           │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Test page initializes   │
│  runtime and model       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Execute test scenarios  │
│  and collect metrics     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Save results to JSON    │
│  in results/raw/         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Process and aggregate   │
│  data in results/        │
│  processed/              │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Copy to website/public/ │
│  data/                   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Website loads and       │
│  displays data           │
└──────────────────────────┘
```

## 测试场景 / Test Scenarios

### 场景 1: 基础性能测试
- 加载模型
- 单次推理（固定prompt）
- 记录所有性能指标

### 场景 2: 连续推理测试
- 加载模型
- 连续10次推理
- 计算平均性能

### 场景 3: 长文本生成测试
- 加载模型
- 生成500+ tokens
- 测试内存稳定性

### 场景 4: 并发测试（可选）
- 同时运行多个推理任务
- 测试资源竞争情况

## 配置管理 / Configuration Management

### 测试配置
```typescript
// automation/config/test-scenarios.ts
export const scenarios = {
  basic: {
    prompt: "Hello, how are you?",
    maxTokens: 50,
    temperature: 0.7,
  },
  continuous: {
    prompts: [/* array of prompts */],
    iterations: 10,
  },
  longGeneration: {
    prompt: "Write a detailed essay about...",
    maxTokens: 500,
  },
};
```

### 模型配置
```typescript
// automation/config/models.config.ts
export const models = {
  wllama: {
    q8: {
      url: "https://huggingface.co/...",
      size: 1024 * 1024 * 500, // 500MB
    },
  },
  webllm: {
    q0f32: {
      url: "https://huggingface.co/...",
    },
  },
  // ...
};
```

## CI/CD 集成 / CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Performance Tests

on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  workflow_dispatch:

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        browser: [chromium, firefox, webkit]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test
      - uses: actions/upload-artifact@v3
        with:
          name: results
          path: results/raw/
```

## 安全考虑 / Security Considerations

1. **模型来源验证**: 仅从官方源下载模型
2. **CSP 配置**: 适当的内容安全策略
3. **CORS 设置**: 正确配置跨域资源共享
4. **资源限制**: 防止内存溢出和资源耗尽
5. **数据隐私**: 不收集用户个人信息

## 性能优化 / Performance Optimization

1. **模型缓存**: 使用浏览器缓存避免重复下载
2. **延迟加载**: 按需加载运行时库
3. **Worker 线程**: 使用 Web Workers 避免阻塞主线程
4. **资源预加载**: 预加载关键资源

## 扩展性 / Extensibility

### 添加新运行时
1. 在 `automation/test-pages/` 创建新目录
2. 实现 `TestPageAPI` 接口
3. 在 `automation/tests/` 添加测试用例
4. 更新 `docs/RUNTIME_SUPPORT.md`

### 添加新测试场景
1. 在 `automation/config/test-scenarios.ts` 定义场景
2. 在测试用例中引用场景
3. 更新文档

### 添加新性能指标
1. 在测试页面中收集指标
2. 更新 `PerformanceMetrics` 接口
3. 在网站中展示新指标

## 故障排查 / Troubleshooting

### 常见问题

1. **模型加载失败**
   - 检查网络连接
   - 验证模型URL
   - 检查CORS配置

2. **性能指标异常**
   - 验证浏览器支持
   - 检查GPU驱动
   - 查看控制台错误

3. **测试超时**
   - 增加Playwright超时设置
   - 检查系统资源
   - 使用更小的模型测试

## 参考资料 / References

- [Playwright Documentation](https://playwright.dev)
- [Astro Documentation](https://docs.astro.build)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
