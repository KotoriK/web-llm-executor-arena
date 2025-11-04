# Automation Testing Framework

浏览器自动化测试框架，用于测试各个 LLM 运行时的性能。

Browser automation testing framework for testing LLM runtime performance.

## 目录结构 / Directory Structure

```
automation/
├── tests/              # Playwright 测试用例
│   ├── demo.test.ts   # Demo test (framework verification)
│   ├── wllama.test.ts (TODO)
│   ├── webllm.test.ts (TODO)
│   ├── transformers.test.ts (TODO)
│   └── mediapipe.test.ts (TODO)
├── fixtures/           # 测试固件和辅助函数
│   ├── browser-info.ts        # Browser capability detection
│   ├── performance-monitor.ts # Performance tracking
│   └── result-saver.ts        # Test result persistence
├── config/             # 测试配置
│   ├── playwright.config.ts   # Playwright configuration
│   ├── models.config.ts       # Model URLs and configs
│   └── test-scenarios.ts      # Test scenarios
├── test-pages/         # 各运行时的测试页面
│   ├── demo/          # Demo implementation
│   ├── wllama/ (TODO)
│   ├── webllm/ (TODO)
│   ├── transformers/ (TODO)
│   └── mediapipe/ (TODO)
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # 本文件
```

## 设置 / Setup

### 安装依赖

```bash
cd automation
pnpm install
```

### 安装浏览器

```bash
pnpm exec playwright install
```

## 运行测试 / Run Tests

### 运行所有测试

```bash
pnpm test
```

### 运行特定运行时的测试

```bash
# 测试 @wllama/wllama
pnpm test:wllama

# 测试 @mlc-ai/web-llm
pnpm test:webllm

# 测试 @huggingface/transformers
pnpm test:transformers

# 测试 @mediapipe/tasks-genai
pnpm test:mediapipe
```

### 运行特定浏览器的测试

```bash
# Chrome/Chromium
pnpm test -- --project=chromium

# Firefox
pnpm test -- --project=firefox

# WebKit (Safari)
pnpm test -- --project=webkit
```

### 调试模式

```bash
# 显示浏览器界面
pnpm test -- --headed

# 调试特定测试
pnpm test -- --debug tests/wllama.test.ts
```

## 测试页面 / Test Pages

每个运行时都有独立的测试页面，实现了统一的 `TestPageAPI` 接口。

### TestPageAPI 接口

```typescript
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

### 开发测试页面

1. 在 `test-pages/` 下创建新目录
2. 创建 `index.html`、`test.js` 和 `package.json`
3. 实现 `TestPageAPI` 接口
4. 在 `tests/` 中创建对应的测试文件

示例结构：

```
test-pages/example-runtime/
├── index.html          # 测试页面
├── test.js            # 运行时实现
├── package.json       # 依赖配置
└── README.md          # 说明文档
```

## 测试场景 / Test Scenarios

测试场景在 `config/test-scenarios.ts` 中定义：

### 基础性能测试
- 模型加载时间
- 首次推理时间 (TTFT)
- 平均推理速度
- 内存使用情况

### 连续推理测试
- 多次连续推理
- 平均性能计算
- 性能稳定性评估

### 长文本生成测试
- 生成 500+ tokens
- 内存稳定性测试
- 长时间运行性能

## 配置 / Configuration

### Playwright 配置

编辑 `config/playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  timeout: 300000, // 5分钟超时
  workers: 1,      // 串行执行避免资源冲突
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### 模型配置

编辑 `config/models.config.ts`:

```typescript
export const models = {
  wllama: {
    q8: {
      url: 'https://huggingface.co/...',
      size: 524288000, // 500MB
      quantization: 'q8_0',
    },
  },
  // ... 其他运行时配置
};
```

### 测试场景配置

编辑 `config/test-scenarios.ts`:

```typescript
export const scenarios = {
  basic: {
    prompt: 'Hello, how are you?',
    maxTokens: 50,
    temperature: 0.7,
  },
  // ... 其他场景
};
```

## 收集的指标 / Collected Metrics

### 环境信息
- 操作系统和版本
- 浏览器类型和版本
- 硬件信息（CPU 核心数、内存）
- 加速技术支持（SIMD、WebGPU、WebNN）

### 性能指标
- `loadTime`: 模型加载时间（毫秒）
- `ttft`: 首次 token 生成时间（毫秒）
- `tokensPerSecond`: 平均推理速度
- `peakMemory`: 峰值内存使用（MB）
- `avgLatency`: 平均 token 延迟（毫秒）

### 输出样本
- 输入 prompt
- 生成的响应
- Token 数量
- 生成耗时

## 结果保存 / Result Storage

测试结果自动保存到 `../results/raw/YYYY-MM/` 目录：

```
results/raw/2024-11/
├── wllama_chrome_windows_20241104_120000.json
├── webllm_chrome_macos_20241104_120530.json
└── ...
```

文件命名格式：`{runtime}_{browser}_{platform}_{timestamp}.json`

## 最佳实践 / Best Practices

1. **资源管理**
   - 测试后清理资源
   - 避免内存泄漏
   - 正确处理异步操作

2. **错误处理**
   - 捕获并记录所有错误
   - 提供详细的错误信息
   - 失败后清理资源

3. **性能测试**
   - 预热运行时再测量
   - 多次测量取平均值
   - 排除初始化时间

4. **跨平台兼容性**
   - 测试多个浏览器
   - 考虑移动端场景
   - 处理平台差异

## 故障排查 / Troubleshooting

### 测试超时

增加超时时间：

```typescript
test('load model', async ({ page }) => {
  test.setTimeout(600000); // 10分钟
  // ...
});
```

### 浏览器崩溃

检查内存使用，使用更小的模型或减少并发。

### 模型下载失败

检查网络连接和 CORS 配置。

### 性能异常

验证浏览器支持的特性（SIMD、WebGPU 等）。

## 扩展 / Extending

### 添加新运行时

1. 创建测试页面：`test-pages/new-runtime/`
2. 实现 `TestPageAPI` 接口
3. 创建测试文件：`tests/new-runtime.test.ts`
4. 更新配置：`config/models.config.ts`
5. 添加 npm 脚本到根目录 `package.json`

### 添加新测试场景

1. 在 `config/test-scenarios.ts` 添加场景定义
2. 在测试文件中引用新场景
3. 更新文档

### 自定义指标

1. 在测试页面中收集新指标
2. 更新 `PerformanceMetrics` 类型定义
3. 在测试用例中记录新指标
4. 更新数据 schema

## 参考资料 / References

- [Playwright Documentation](https://playwright.dev)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [WebAssembly SIMD](https://github.com/WebAssembly/simd)
- [WebGPU](https://www.w3.org/TR/webgpu/)
- [WebNN](https://www.w3.org/TR/webnn/)
