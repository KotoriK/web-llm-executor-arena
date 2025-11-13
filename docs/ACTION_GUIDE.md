# Action Guide / 行动指南

本文档提供具体的实施步骤，帮助开发者完成项目的各个阶段。

This document provides specific implementation steps to help developers complete each phase of the project.

## 项目实施路线图 / Project Implementation Roadmap

### 阶段 0: 项目初始化 ✅ (已完成 / Completed)

- [x] 创建仓库结构
- [x] 编写项目文档
- [x] 定义数据格式和 schema
- [x] 完善运行时技术支持调查

### 阶段 1: 测试框架搭建 (估计时间: 1-2 周)

#### 1.1 设置 Playwright 项目

**目标**: 创建基础的自动化测试框架

**步骤**:

```bash
# 1. 初始化 automation 项目
cd automation
pnpm init

# 2. 安装 Playwright
pnpm add -D @playwright/test @types/node typescript

# 3. 初始化 TypeScript
pnpm exec tsc --init

# 4. 创建 Playwright 配置
# 编辑 config/playwright.config.ts
```

**配置文件示例**:

```typescript
// automation/config/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 串行执行避免资源竞争
  timeout: 300000, // 5分钟
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'pnpm serve',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**验收标准**:
- [ ] Playwright 配置正确
- [ ] 可以运行基础测试
- [ ] 浏览器自动化工作正常

#### 1.2 创建测试辅助工具

**目标**: 创建可复用的测试工具函数

**文件**: 
- `automation/fixtures/browser-info.ts`
- `automation/fixtures/performance-monitor.ts`
- `automation/fixtures/model-tester.ts`

**示例代码**:

```typescript
// automation/fixtures/browser-info.ts
import { Page } from '@playwright/test';

export async function collectBrowserInfo(page: Page) {
  return await page.evaluate(() => {
    return {
      platform: {
        os: navigator.platform,
        userAgent: navigator.userAgent,
      },
      hardware: {
        cores: navigator.hardwareConcurrency,
        memory: (navigator as any).deviceMemory,
      },
      capabilities: {
        wasmSIMD: checkWasmSIMD(),
        webGPU: !!navigator.gpu,
        webNN: 'ml' in navigator,
      },
    };
  });
}

function checkWasmSIMD() {
  try {
    return WebAssembly.validate(new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3,
      2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
    ]));
  } catch {
    return false;
  }
}
```

```typescript
// automation/fixtures/performance-monitor.ts
export class PerformanceMonitor {
  private startTime: number = 0;
  private metrics: Map<string, number[]> = new Map();

  start(label: string) {
    this.startTime = performance.now();
  }

  end(label: string) {
    const duration = performance.now() - this.startTime;
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
    return duration;
  }

  getMetrics() {
    const result: Record<string, any> = {};
    this.metrics.forEach((values, label) => {
      result[label] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };
    });
    return result;
  }
}
```

**验收标准**:
- [ ] 工具函数可正常导入和使用
- [ ] 能够收集所需的环境信息
- [ ] 性能监控功能正常

#### 1.3 创建配置文件

**目标**: 集中管理测试配置

**文件**:
- `automation/config/models.config.ts`
- `automation/config/test-scenarios.ts`

**示例**:

```typescript
// automation/config/models.config.ts
export const models = {
  wllama: {
    q8: {
      url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q8_0.gguf',
      size: 524288000,
      quantization: 'q8_0',
    },
  },
  webllm: {
    q0f32: {
      modelId: 'Qwen2.5-0.5B-Instruct-q0f32-MLC',
      quantization: 'q0f32',
    },
  },
  transformers: {
    fp32: {
      modelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
      quantization: 'fp32',
    },
    uint8: {
      modelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
      file: 'model_uint8.onnx',
      quantization: 'uint8',
    },
  },
  mediapipe: {
    fp32: {
      url: 'https://huggingface.co/litert-community/Qwen2.5-0.5B-Instruct/resolve/main/Qwen2.5-0.5B-Instruct_seq128_f32_ekv1280.tflite',
      quantization: 'fp32',
    },
    int8: {
      url: 'https://huggingface.co/litert-community/Qwen2.5-0.5B-Instruct/resolve/main/Qwen2.5-0.5B-Instruct_seq128_q8_ekv1280.tflite',
      quantization: 'int8',
    },
  },
};
```

```typescript
// automation/config/test-scenarios.ts
export const scenarios = {
  basic: {
    name: 'Basic Performance',
    prompt: 'Hello, how are you?',
    maxTokens: 50,
    temperature: 0.7,
  },
  continuous: {
    name: 'Continuous Inference',
    prompts: [
      'What is the capital of France?',
      'Explain quantum computing.',
      'Write a short poem.',
    ],
    iterations: 10,
    maxTokens: 100,
  },
  longGeneration: {
    name: 'Long Text Generation',
    prompt: 'Write a detailed essay about artificial intelligence.',
    maxTokens: 500,
    temperature: 0.8,
  },
};
```

### 阶段 2: 实现测试页面 (估计时间: 2-3 周)

每个运行时需要单独实现。建议按照以下顺序：

1. **@wllama/wllama** (最简单，WASM only)
2. **@mlc-ai/web-llm** (WebGPU 支持)
3. **@huggingface/transformers** (多后端支持)
4. **@mediapipe/tasks-genai** (TFLite)

#### 2.1 实现 @wllama/wllama 测试页面

**目录**: `automation/test-pages/wllama/`

**步骤**:

1. 创建项目结构
```bash
mkdir -p automation/test-pages/wllama
cd automation/test-pages/wllama
pnpm init
```

2. 安装依赖
```bash
pnpm add @wllama/wllama
```

3. 创建 `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wllama Test</title>
</head>
<body>
  <div id="status">Initializing...</div>
  <script type="module" src="./test.js"></script>
</body>
</html>
```

4. 创建 `test.js`
```javascript
import { Wllama } from '@wllama/wllama';

class WllamaTestAPI {
  constructor() {
    this.wllama = null;
    this.metrics = {
      loadTime: 0,
      ttft: 0,
      tokensPerSecond: 0,
    };
  }

  async initialize(config) {
    this.wllama = new Wllama(config);
    await this.wllama.loadModelFromUrl(
      config.modelUrl,
      {
        progressCallback: (progress) => {
          console.log('Loading:', progress);
        }
      }
    );
  }

  async loadModel(modelUrl) {
    const startTime = performance.now();
    // Model already loaded in initialize
    this.metrics.loadTime = performance.now() - startTime;
  }

  async generate(prompt, options) {
    const startTime = performance.now();
    let firstTokenTime = 0;
    let tokenCount = 0;
    
    const response = await this.wllama.createCompletion(prompt, {
      nPredict: options.maxTokens || 50,
      temp: options.temperature || 0.7,
      onNewToken: (token) => {
        tokenCount++;
        if (tokenCount === 1) {
          firstTokenTime = performance.now();
          this.metrics.ttft = firstTokenTime - startTime;
        }
      },
    });
    
    const totalTime = performance.now() - startTime;
    this.metrics.tokensPerSecond = tokenCount / (totalTime / 1000);
    
    return response;
  }

  getMetrics() {
    return this.metrics;
  }

  getRuntimeInfo() {
    return {
      name: 'wllama',
      version: '1.0.0', // Get from package
      backend: 'wasm-simd',
    };
  }

  async cleanup() {
    if (this.wllama) {
      await this.wllama.exit();
    }
  }
}

// 暴露全局 API
window.testAPI = new WllamaTestAPI();
document.getElementById('status').textContent = 'Ready';
```

5. 创建测试用例 `automation/tests/wllama.test.ts`

```typescript
import { test, expect } from '@playwright/test';
import { collectBrowserInfo } from '../fixtures/browser-info';
import { models } from '../config/models.config';
import { scenarios } from '../config/test-scenarios';
import { saveTestResult } from '../fixtures/result-saver';

test.describe('Wllama Tests', () => {
  test('should run basic performance test', async ({ page, browserName }) => {
    // 访问测试页面
    await page.goto('/wllama');
    await page.waitForSelector('#status:has-text("Ready")');
    
    // 收集环境信息
    const envInfo = await collectBrowserInfo(page);
    
    // 初始化运行时
    await page.evaluate((config) => {
      return window.testAPI.initialize(config);
    }, {
      modelUrl: models.wllama.q8.url,
    });
    
    // 加载模型
    await page.evaluate(() => {
      return window.testAPI.loadModel();
    });
    
    // 执行推理
    const scenario = scenarios.basic;
    const output = await page.evaluate((scenario) => {
      return window.testAPI.generate(scenario.prompt, {
        maxTokens: scenario.maxTokens,
        temperature: scenario.temperature,
      });
    }, scenario);
    
    // 获取性能指标
    const metrics = await page.evaluate(() => {
      return window.testAPI.getMetrics();
    });
    
    // 获取运行时信息
    const runtimeInfo = await page.evaluate(() => {
      return window.testAPI.getRuntimeInfo();
    });
    
    // 保存结果
    await saveTestResult({
      meta: {
        testId: generateUUID(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
      environment: envInfo,
      runtime: runtimeInfo,
      model: {
        name: 'Qwen2.5-0.5B-Instruct',
        quantization: 'q8_0',
        size: models.wllama.q8.size,
      },
      performance: metrics,
      testScenario: scenario,
      outputs: [{
        prompt: scenario.prompt,
        response: output,
        tokenCount: output.split(' ').length,
      }],
    });
    
    // 验证
    expect(metrics.loadTime).toBeGreaterThan(0);
    expect(metrics.ttft).toBeGreaterThan(0);
    expect(metrics.tokensPerSecond).toBeGreaterThan(0);
    
    // 清理
    await page.evaluate(() => window.testAPI.cleanup());
  });
});
```

**验收标准**:
- [ ] 测试页面可以访问
- [ ] 可以加载模型
- [ ] 可以执行推理
- [ ] 性能指标收集正确
- [ ] 测试用例通过

#### 2.2 - 2.4 实现其他运行时

按照类似的模式实现其他三个运行时：
- @mlc-ai/web-llm
- @huggingface/transformers
- @mediapipe/tasks-genai

每个运行时的具体实现细节不同，但都应遵循相同的 `TestPageAPI` 接口。

### 阶段 3: 数据处理 (估计时间: 1 周)

#### 3.1 创建结果验证脚本

**文件**: `scripts/validate-results.ts`

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';
import schema from '../results/schema.json';

const ajv = new Ajv();
addFormats(ajv);

export function validateResult(filePath: string) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const validate = ajv.compile(schema);
  const valid = validate(data);
  
  if (!valid) {
    console.error(`Validation failed for ${filePath}`);
    console.error(validate.errors);
    return false;
  }
  
  return true;
}

// 验证所有结果文件
const resultsDir = path.join(__dirname, '../results/raw');
// ... 遍历并验证所有文件
```

#### 3.2 创建数据聚合脚本

**文件**: `scripts/aggregate-results.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';

export function aggregateResults() {
  // 读取所有原始结果
  const results = loadAllResults();
  
  // 生成总览统计
  const summary = generateSummary(results);
  fs.writeFileSync(
    'results/processed/summary.json',
    JSON.stringify(summary, null, 2)
  );
  
  // 按运行时分组
  const byRuntime = groupByRuntime(results);
  fs.writeFileSync(
    'results/processed/by-runtime.json',
    JSON.stringify(byRuntime, null, 2)
  );
  
  // 按平台分组
  const byPlatform = groupByPlatform(results);
  fs.writeFileSync(
    'results/processed/by-platform.json',
    JSON.stringify(byPlatform, null, 2)
  );
}
```

### 阶段 4: 网站开发 (估计时间: 2-3 周)

#### 4.1 初始化 Astro 项目

```bash
cd website
pnpm create astro@latest .

# 选择:
# - Empty project
# - Yes to TypeScript
# - Strict
# - Yes to install dependencies

# 添加 TailwindCSS
pnpm astro add tailwind

# 添加其他依赖
pnpm add chart.js date-fns
```

#### 4.2 创建布局和组件

**文件结构**:
```
website/src/
├── layouts/
│   └── Layout.astro
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── RuntimeCard.astro
│   ├── PerformanceChart.astro
│   ├── ComparisonTable.astro
│   └── FilterPanel.astro
├── pages/
│   ├── index.astro
│   ├── compare.astro
│   ├── about.astro
│   └── runtime/
│       └── [runtime].astro
└── utils/
    ├── data-loader.ts
    └── formatters.ts
```

#### 4.3 实现页面

按照 UI/UX 需求实现各个页面。重点关注：
- 响应式设计
- 性能优化
- 数据可视化
- 用户交互

### 阶段 5: CI/CD 设置 (估计时间: 3-5 天)

#### 5.1 创建 GitHub Actions 工作流

**文件**: `.github/workflows/test.yml`

```yaml
name: Performance Tests

on:
  schedule:
    - cron: '0 0 * * *'  # 每天运行
  workflow_dispatch:     # 手动触发
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        browser: [chromium, firefox]
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
        
      - name: Run tests
        run: pnpm test -- --project=${{ matrix.browser }}
        
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: results-${{ matrix.os }}-${{ matrix.browser }}
          path: results/raw/
```

#### 5.2 创建网站部署工作流

**文件**: `.github/workflows/deploy.yml`

```yaml
name: Deploy Website

on:
  push:
    branches: [main]
    paths:
      - 'website/**'
      - 'results/processed/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - uses: pnpm/action-setup@v2
        
      - name: Install and build
        run: |
          cd website
          pnpm install
          pnpm build
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./website/dist
```

## 开发优先级 / Development Priorities

### 高优先级 (Must Have)
1. ✅ 项目结构和文档
2. 🔄 基础测试框架 (Playwright)
3. 🔄 至少一个运行时的完整实现 (@wllama/wllama)
4. 🔄 数据收集和存储
5. 🔄 基础网站展示

### 中优先级 (Should Have)
1. 所有四个运行时的实现
2. 完整的性能指标收集
3. 数据验证和聚合
4. CI/CD 自动化
5. 交互式数据可视化

### 低优先级 (Nice to Have)
1. 用户提交的测试结果
2. 历史趋势分析
3. 更多模型支持
4. 移动端优化
5. API 接口

## 技术栈选择建议 / Technology Stack Recommendations

### 已确定 / Confirmed
- **测试框架**: Playwright ✅
- **网站框架**: Astro ✅
- **样式**: TailwindCSS ✅
- **数据格式**: JSON ✅

### 建议添加 / Recommended Additions
- **图表库**: Chart.js 或 Recharts
- **数据验证**: Ajv (JSON Schema validator)
- **日期处理**: date-fns
- **HTTP 服务器**: http-server 或 sirv-cli (用于本地测试)

## 团队协作建议 / Team Collaboration Tips

### 分工建议

如果是团队协作，可以这样分工：

1. **前端开发者**: 负责网站开发 (website/)
2. **测试工程师**: 负责测试框架和用例 (automation/)
3. **运行时专家**: 每人负责一个运行时的实现
4. **DevOps**: 负责 CI/CD 设置
5. **文档维护**: 负责文档更新和社区管理

### Git 工作流

1. 主分支 `main` 保持稳定
2. 功能开发使用 feature 分支
3. PR 需要至少一个审核
4. 使用 Conventional Commits

### 代码审查要点

- 是否符合 TypeScript 类型定义
- 性能指标收集是否完整
- 错误处理是否完善
- 文档是否更新
- 测试是否通过

## 常见问题 / FAQ

### Q: 为什么选择 Playwright 而不是 Puppeteer？
A: Playwright 支持多浏览器（Chrome, Firefox, Safari），API 更现代，文档更完善。

### Q: 为什么使用 JSON 文件而不是数据库？
A: JSON 文件更简单，易于版本控制，适合开源项目。未来可以迁移到数据库。

### Q: 如何处理大模型文件？
A: 模型文件不存储在仓库中，使用 URL 引用。测试时下载到浏览器缓存。

### Q: 如何确保测试结果的准确性？
A: 多次运行取平均值，排除初始化开销，记录完整的环境信息。

### Q: 项目的许可证是什么？
A: MIT License，允许商业使用和修改。

## 获取帮助 / Getting Help

- 📖 查看 [文档](../README.md)
- 🐛 提交 [Issue](https://github.com/KotoriK/web-llm-executor-arena/issues)
- 💬 参与 [Discussions](https://github.com/KotoriK/web-llm-executor-arena/discussions)
- 📧 联系维护者

## 下一步 / Next Steps

1. 阅读完整的 [ARCHITECTURE.md](./ARCHITECTURE.md)
2. 查看 [RUNTIME_SUPPORT.md](./RUNTIME_SUPPORT.md) 了解技术细节
3. 阅读 [CONTRIBUTING.md](../CONTRIBUTING.md) 了解贡献流程
4. 开始实施阶段 1 的任务
5. 在遇到问题时查看 FAQ 或提 Issue

---

祝开发顺利！Good luck with the development!
