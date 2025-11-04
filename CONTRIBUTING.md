# Contributing to Web LLM Executor Arena

感谢您对 Web LLM Executor Arena 的关注！我们欢迎各种形式的贡献。

Thank you for your interest in Web LLM Executor Arena! We welcome all forms of contributions.

## 贡献方式 / Ways to Contribute

- 🐛 报告问题 / Report bugs
- 💡 提出新功能建议 / Suggest new features
- 📝 改进文档 / Improve documentation
- 🧪 添加测试用例 / Add test cases
- 🔧 提交代码修复 / Submit code fixes
- 🎨 改进网站界面 / Improve website UI
- 📊 分享测试结果 / Share test results

## 开发环境设置 / Development Setup

### 前置要求 / Prerequisites

- Node.js 18 或更高版本
- pnpm 8+ (推荐) 或 npm
- Git

### 克隆仓库 / Clone Repository

```bash
git clone https://github.com/KotoriK/web-llm-executor-arena.git
cd web-llm-executor-arena
```

### 安装依赖 / Install Dependencies

```bash
pnpm install
```

### 安装 Playwright 浏览器 / Install Playwright Browsers

```bash
pnpm exec playwright install
```

## 项目结构 / Project Structure

```
web-llm-executor-arena/
├── automation/          # 测试自动化脚本
├── docs/               # 项目文档
├── results/            # 测试结果数据
├── scripts/            # 工具脚本
└── website/            # 展示网站
```

详细架构请参考 [ARCHITECTURE.md](./docs/ARCHITECTURE.md)。

## 开发工作流 / Development Workflow

### 1. 创建功能分支 / Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# 或 / or
git checkout -b fix/your-bug-fix
```

### 2. 进行更改 / Make Changes

按照以下指南进行更改：

- **代码风格**: 遵循现有代码风格
- **提交信息**: 使用清晰、描述性的提交信息
- **文档**: 更新相关文档
- **测试**: 添加或更新测试用例

### 3. 测试更改 / Test Changes

```bash
# 运行测试
pnpm test

# 检查代码风格
pnpm lint

# 构建网站
cd website && pnpm build
```

### 4. 提交更改 / Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
# 或 / or
git commit -m "fix: resolve bug"
```

#### 提交信息约定 / Commit Message Convention

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 错误修复
- `docs:` 文档更新
- `style:` 代码格式调整（不影响功能）
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建或辅助工具变动

示例：
```
feat: add WebNN support detection
fix: resolve memory leak in model loader
docs: update installation instructions
```

### 5. 推送并创建 Pull Request / Push and Create PR

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

## Pull Request 指南 / Pull Request Guidelines

### PR 标题 / PR Title

使用清晰、描述性的标题，遵循提交信息约定。

### PR 描述 / PR Description

请包含以下内容：

1. **变更摘要** / Summary of changes
2. **变更原因** / Reason for changes
3. **测试情况** / Testing performed
4. **相关 Issue** / Related issues (if any)

模板：

```markdown
## 变更摘要 / Summary
简要描述此 PR 的变更内容。

## 变更原因 / Motivation
为什么需要这些变更？解决了什么问题？

## 测试 / Testing
- [ ] 本地测试通过
- [ ] 添加了新的测试用例
- [ ] 文档已更新

## 相关 Issue / Related Issues
Closes #123
```

### 代码审查 / Code Review

- 至少需要一位维护者的审核
- 解决所有审核意见
- 保持 PR 专注于单一功能或修复
- 及时回应审核反馈

## 特定贡献指南 / Specific Contribution Guidelines

### 添加新运行时支持 / Adding New Runtime Support

1. **研究运行时**
   - 了解其 API 和使用方式
   - 确定支持的加速技术
   - 寻找合适的测试模型

2. **创建测试页面**
   ```bash
   mkdir -p automation/test-pages/new-runtime
   cd automation/test-pages/new-runtime
   # 创建 index.html, test.js, package.json
   ```

3. **实现 TestPageAPI**
   ```typescript
   // 实现所需的接口方法
   interface TestPageAPI {
     initialize(config: RuntimeConfig): Promise<void>;
     loadModel(modelUrl: string): Promise<void>;
     generate(prompt: string, options: GenerateOptions): Promise<string>;
     getMetrics(): Promise<PerformanceMetrics>;
     getRuntimeInfo(): RuntimeInfo;
     cleanup(): Promise<void>;
   }
   ```

4. **编写测试用例**
   ```bash
   # 在 automation/tests/ 创建测试文件
   touch automation/tests/new-runtime.test.ts
   ```

5. **更新文档**
   - 在 `README.md` 中添加运行时信息
   - 在 `docs/RUNTIME_SUPPORT.md` 中详细说明支持情况
   - 更新 `docs/ARCHITECTURE.md` 如有必要

6. **提交 PR**
   - 包含所有必要的文件
   - 提供测试结果截图
   - 说明运行时的特点和优势

### 改进网站 / Improving Website

1. **设置开发环境**
   ```bash
   cd website
   pnpm dev
   ```

2. **进行更改**
   - 组件位于 `src/components/`
   - 页面位于 `src/pages/`
   - 样式使用 TailwindCSS

3. **测试响应式设计**
   - 在不同屏幕尺寸下测试
   - 检查移动端体验

4. **构建验证**
   ```bash
   pnpm build
   pnpm preview
   ```

### 提交测试结果 / Submitting Test Results

如果您在自己的设备上运行了测试，可以提交结果：

1. **运行测试**
   ```bash
   pnpm test
   ```

2. **提交结果**
   - 结果文件位于 `results/raw/`
   - 创建 PR 添加您的测试结果
   - 在 PR 描述中包含设备信息

3. **结果要求**
   - 完整的环境信息
   - 准确的性能指标
   - 可重现的测试条件

### 改进文档 / Improving Documentation

文档位于：
- `README.md` - 项目概览
- `docs/ARCHITECTURE.md` - 架构设计
- `docs/RUNTIME_SUPPORT.md` - 运行时支持矩阵
- `CONTRIBUTING.md` - 贡献指南

改进建议：
- 修正错别字和语法错误
- 添加更多示例
- 改进说明清晰度
- 添加中英文双语支持
- 补充缺失的信息

## 代码风格 / Code Style

### TypeScript/JavaScript

- 使用 TypeScript 编写新代码
- 遵循 ESLint 配置
- 使用 Prettier 格式化代码
- 使用有意义的变量和函数名
- 添加适当的注释

```typescript
// 好的示例 / Good example
async function loadModelWithCache(modelUrl: string): Promise<Model> {
  // 首先检查缓存 / Check cache first
  const cached = await getFromCache(modelUrl);
  if (cached) return cached;
  
  // 下载并缓存模型 / Download and cache model
  const model = await downloadModel(modelUrl);
  await saveToCache(modelUrl, model);
  return model;
}

// 避免 / Avoid
async function lm(u: string): Promise<any> {
  const c = await gfc(u);
  if (c) return c;
  const m = await dm(u);
  await stc(u, m);
  return m;
}
```

### HTML/CSS

- 使用语义化 HTML
- 遵循 BEM 命名约定（如适用）
- 优先使用 TailwindCSS 类
- 保持可访问性（a11y）

### Markdown

- 使用清晰的标题层次
- 添加代码块语言标识
- 包含中英文双语（如适用）
- 使用列表和表格组织信息

## 测试 / Testing

### 编写测试

- 每个运行时至少一个测试文件
- 测试覆盖关键功能
- 使用描述性的测试名称
- 测试应该是独立的和可重现的

```typescript
// automation/tests/example.test.ts
import { test, expect } from '@playwright/test';

test.describe('Example Runtime Tests', () => {
  test('should load model successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/example');
    
    // 等待初始化完成
    await page.waitForSelector('#initialized');
    
    // 检查模型加载
    const loaded = await page.evaluate(() => {
      return window.testAPI.getStatus();
    });
    
    expect(loaded).toBe('ready');
  });
  
  test('should generate text', async ({ page }) => {
    await page.goto('http://localhost:3000/example');
    await page.waitForSelector('#initialized');
    
    const result = await page.evaluate(async () => {
      return await window.testAPI.generate('Hello', { maxTokens: 10 });
    });
    
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });
});
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test tests/example.test.ts

# 调试模式
pnpm test --debug

# 显示浏览器界面
pnpm test --headed
```

## 问题报告 / Issue Reporting

### 报告 Bug

使用 Bug 报告模板，包含：

1. **环境信息**
   - OS 和版本
   - 浏览器和版本
   - Node.js 版本
   - 项目版本

2. **重现步骤**
   - 详细的步骤
   - 预期行为
   - 实际行为

3. **额外信息**
   - 错误信息
   - 控制台日志
   - 截图（如适用）

### 功能请求

使用功能请求模板，包含：

1. **问题描述**
   - 当前的限制或痛点

2. **建议的解决方案**
   - 您期望的功能

3. **替代方案**
   - 考虑过的其他方法

4. **额外上下文**
   - 使用场景
   - 相关资源

## 社区准则 / Community Guidelines

- 🤝 友善和尊重
- 💬 建设性的反馈
- 🎯 保持主题相关
- 📚 分享知识和经验
- 🌍 包容不同背景和经验水平

## 获取帮助 / Getting Help

- 📖 查看文档：[docs/](./docs/)
- 🐛 搜索现有 Issues
- 💬 创建新 Issue 提问
- 📧 联系维护者

## 许可证 / License

通过贡献代码，您同意您的贡献将在 MIT 许可证下授权。

By contributing, you agree that your contributions will be licensed under the MIT License.

---

再次感谢您的贡献！🎉

Thank you for your contributions! 🎉
