# Project Overview / 项目概览

## 项目愿景 / Project Vision

Web LLM Executor Arena 旨在成为**最全面、最权威的端侧大语言模型运行时性能评测平台**。通过客观的性能数据和详细的技术分析，帮助开发者选择最适合其应用场景的运行时解决方案。

Web LLM Executor Arena aims to be **the most comprehensive and authoritative performance evaluation platform for client-side large language model runtimes**. Through objective performance data and detailed technical analysis, it helps developers choose the most suitable runtime solution for their application scenarios.

## 核心价值 / Core Value

### 对开发者 / For Developers

1. **客观的性能数据**: 标准化测试环境，可重现的测试结果
2. **详细的技术文档**: 深入的运行时技术分析和最佳实践
3. **快速决策**: 快速了解不同运行时的优劣势
4. **持续更新**: 跟踪最新的运行时版本和性能变化

### 对社区 / For Community

1. **开放透明**: 所有代码、数据和方法论完全开源
2. **社区驱动**: 欢迎贡献测试结果和改进建议
3. **知识共享**: 促进端侧 AI 技术的普及和发展
4. **标准化**: 推动行业测试标准的建立

### 对运行时开发者 / For Runtime Developers

1. **性能基准**: 了解自己产品在生态中的位置
2. **问题反馈**: 发现性能瓶颈和改进机会
3. **用户洞察**: 了解用户关心的性能指标
4. **公平竞争**: 在同等条件下展示产品优势

## 项目范围 / Project Scope

### 包含内容 / Included

✅ **运行时性能测试**
- 模型加载速度
- 推理速度 (tokens/sec)
- 首次响应时间 (TTFT)
- 内存使用情况

✅ **技术支持评估**
- WASM SIMD 支持
- WebGPU 支持
- WebNN 支持
- 浏览器兼容性

✅ **多平台测试**
- Windows / macOS / Linux
- Chrome / Firefox / Safari / Edge
- 桌面 / 移动设备

✅ **可视化展示**
- 交互式性能图表
- 对比分析工具
- 历史趋势展示

### 不包含内容 / Excluded

❌ **模型质量评估**
- 不评估生成文本的质量
- 不进行模型准确性测试
- 专注于性能，不涉及功能

❌ **服务端方案**
- 仅关注浏览器端运行时
- 不测试服务器端推理
- 不涉及云端 API

❌ **商业评估**
- 不评估价格和许可
- 不提供商业建议
- 保持技术中立

## 技术架构概览 / Technical Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      用户界面层                               │
│                     User Interface                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Astro 静态网站 (Static Website)                      │   │
│  │  - 性能图表 / Performance Charts                      │   │
│  │  - 对比工具 / Comparison Tools                        │   │
│  │  - 文档展示 / Documentation                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ 读取数据 / Read Data
                              │
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                               │
│                     Data Storage                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  JSON 文件系统 (JSON File System)                     │   │
│  │  - results/raw/ - 原始测试数据                        │   │
│  │  - results/processed/ - 聚合数据                      │   │
│  │  - results/schema.json - 数据格式定义                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ 写入数据 / Write Data
                              │
┌─────────────────────────────────────────────────────────────┐
│                      测试执行层                               │
│                    Test Execution                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Playwright 自动化框架                                 │   │
│  │  - 启动浏览器                                         │   │
│  │  - 执行测试场景                                       │   │
│  │  - 收集性能指标                                       │   │
│  │  - 保存测试结果                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ 控制 / Control
                              │
┌─────────────────────────────────────────────────────────────┐
│                      运行时测试层                             │
│                    Runtime Testing                           │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐  │
│  │  @wllama     │  @mlc-ai     │ @huggingface │@mediapipe│  │
│  │  /wllama     │  /web-llm    │ /transformers│/tasks-   │  │
│  │              │              │              │ genai    │  │
│  │  WASM SIMD   │ WebGPU/WASM  │ Multi-backend│ WebGPU/  │  │
│  │              │              │              │ WASM     │  │
│  └──────────────┴──────────────┴──────────────┴──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 关键设计决策 / Key Design Decisions

### 1. 为什么选择 Playwright？

**决策**: 使用 Playwright 作为自动化测试框架

**原因**:
- ✅ 支持多浏览器（Chrome, Firefox, Safari）
- ✅ 现代化的 API 和 TypeScript 支持
- ✅ 强大的性能分析能力
- ✅ 活跃的社区和完善的文档
- ✅ 可以在 CI/CD 中自动运行

**替代方案**: Puppeteer (仅支持 Chrome/Chromium)

### 2. 为什么使用 JSON 文件存储？

**决策**: 使用 JSON 文件系统存储测试结果

**原因**:
- ✅ 简单直观，易于版本控制
- ✅ 不需要额外的数据库服务
- ✅ 易于导入导出和分享
- ✅ 适合开源项目协作
- ✅ 可以轻松迁移到数据库

**未来**: 当数据量增大时可以迁移到数据库

### 3. 为什么选择 Astro？

**决策**: 使用 Astro 构建静态网站

**原因**:
- ✅ 零 JavaScript 默认输出，极快的加载速度
- ✅ 支持多种前端框架（React, Vue, Svelte 等）
- ✅ 优秀的 SEO 支持
- ✅ 简单的数据加载机制
- ✅ 易于部署到 GitHub Pages

**替代方案**: Next.js, Gatsby, VitePress

### 4. 为什么使用 TailwindCSS？

**决策**: 使用 TailwindCSS 进行样式开发

**原因**:
- ✅ 快速开发，原子化 CSS
- ✅ 极小的最终 CSS 文件体积
- ✅ 一致的设计系统
- ✅ 优秀的响应式支持
- ✅ 与 Astro 集成良好

### 5. 测试模型的选择

**决策**: 使用 Qwen2.5-0.5B-Instruct 作为标准测试模型

**原因**:
- ✅ 小尺寸（500MB 左右），适合浏览器端
- ✅ 各运行时都有对应的量化版本
- ✅ 性能足够测试推理速度差异
- ✅ 开源且易于获取
- ✅ 支持指令遵循，便于标准化测试

**未来**: 可以添加更多模型尺寸的支持

## 数据流程 / Data Flow

### 测试执行流程 / Test Execution Flow

```
1. 启动 Playwright
   └─→ 选择浏览器和平台

2. 访问测试页面
   └─→ 加载运行时库

3. 初始化环境
   ├─→ 检测浏览器能力 (SIMD/WebGPU/WebNN)
   ├─→ 收集硬件信息
   └─→ 获取 GPU 信息（如果可用）

4. 加载模型
   ├─→ 记录开始时间
   ├─→ 下载/加载模型文件
   ├─→ 记录结束时间
   └─→ 计算 loadTime

5. 预热运行时
   └─→ 执行一次推理（不计入指标）

6. 执行测试场景
   ├─→ 记录开始时间
   ├─→ 发送 prompt
   ├─→ 记录首个 token 时间 (TTFT)
   ├─→ 记录所有 tokens
   ├─→ 记录结束时间
   └─→ 计算 tokens/sec

7. 监控内存
   ├─→ 记录峰值内存
   └─→ 检测内存泄漏

8. 保存结果
   ├─→ 组装测试结果 JSON
   ├─→ 验证数据格式
   └─→ 保存到 results/raw/

9. 清理资源
   ├─→ 释放模型
   ├─→ 清理缓存
   └─→ 关闭浏览器
```

### 数据处理流程 / Data Processing Flow

```
1. 收集原始数据
   └─→ results/raw/YYYY-MM/*.json

2. 验证数据
   ├─→ 检查 JSON Schema
   ├─→ 验证必需字段
   ├─→ 检查数据范围
   └─→ 记录验证错误

3. 聚合数据
   ├─→ 按运行时分组
   ├─→ 按平台分组
   ├─→ 计算统计指标
   └─→ 生成总览

4. 导出数据
   ├─→ 保存到 results/processed/
   └─→ 复制到 website/public/data/

5. 更新网站
   ├─→ Astro 读取数据
   ├─→ 生成静态页面
   └─→ 部署到 GitHub Pages
```

## 测试方法论 / Testing Methodology

### 性能测试原则 / Performance Testing Principles

1. **公平性 / Fairness**
   - 相同的模型和量化方式（尽可能）
   - 相同的测试场景和参数
   - 相同的硬件和浏览器环境
   - 记录完整的环境信息

2. **可重现性 / Reproducibility**
   - 固定的测试场景
   - 详细的配置文档
   - 开源的测试代码
   - 版本化的测试结果

3. **代表性 / Representativeness**
   - 真实的使用场景
   - 多样的测试环境
   - 不同的平台和浏览器
   - 覆盖主流配置

4. **准确性 / Accuracy**
   - 预热后测量
   - 多次运行取平均
   - 排除异常值
   - 记录置信区间

### 测试环境标准化 / Test Environment Standardization

为确保结果的可比性，我们定义了以下标准：

1. **浏览器设置**
   - 使用最新稳定版本
   - 禁用扩展和开发者工具
   - 关闭硬件加速（用于 WASM 测试）
   - 开启硬件加速（用于 WebGPU 测试）

2. **系统要求**
   - 最小 8GB RAM
   - 现代 CPU（支持 AVX2）
   - 稳定的网络连接（首次加载模型）

3. **测试参数**
   - temperature: 0.7
   - maxTokens: 50-500 (取决于场景)
   - repetition_penalty: 1.0

## 质量保证 / Quality Assurance

### 代码质量 / Code Quality

- ✅ TypeScript 类型检查
- ✅ ESLint 代码规范
- ✅ Prettier 代码格式化
- ✅ 单元测试（关键函数）
- ✅ 集成测试（E2E）

### 数据质量 / Data Quality

- ✅ JSON Schema 验证
- ✅ 数据范围检查
- ✅ 异常值检测
- ✅ 完整性验证
- ✅ 版本化存储

### 文档质量 / Documentation Quality

- ✅ 清晰的架构文档
- ✅ 详细的 API 文档
- ✅ 完整的使用指南
- ✅ 中英文双语支持
- ✅ 示例代码

## 风险与挑战 / Risks and Challenges

### 技术风险 / Technical Risks

1. **浏览器兼容性**
   - 风险: 不同浏览器的行为差异
   - 缓解: 详细记录环境，分别展示结果

2. **性能变化**
   - 风险: 运行时版本更新导致性能变化
   - 缓解: 版本化测试，保留历史数据

3. **资源限制**
   - 风险: 浏览器内存和 GPU 资源限制
   - 缓解: 使用小模型，监控资源使用

### 运营风险 / Operational Risks

1. **数据存储**
   - 风险: 测试结果累积导致仓库过大
   - 缓解: 定期归档，使用 Git LFS

2. **CI/CD 成本**
   - 风险: GitHub Actions 分钟数限制
   - 缓解: 优化测试频率，使用自托管 runner

3. **社区参与**
   - 风险: 缺乏社区贡献
   - 缓解: 降低参与门槛，激励机制

## 成功指标 / Success Metrics

### 短期目标 (3个月) / Short-term Goals

- [ ] 完成所有四个运行时的基础测试
- [ ] 收集至少 100 个测试结果
- [ ] 网站上线并可访问
- [ ] 完善文档和使用指南
- [ ] 获得第一批社区反馈

### 中期目标 (6个月) / Mid-term Goals

- [ ] 支持 10+ 种浏览器/平台组合
- [ ] 累积 500+ 测试结果
- [ ] 实现自动化 CI/CD 测试
- [ ] 添加历史趋势分析
- [ ] 获得 100+ GitHub stars

### 长期目标 (1年) / Long-term Goals

- [ ] 成为行业标准参考
- [ ] 支持更多运行时和模型
- [ ] 建立活跃的贡献者社区
- [ ] 发布性能优化最佳实践
- [ ] 影响运行时的发展方向

## 未来展望 / Future Outlook

### 计划功能 / Planned Features

1. **更多运行时支持**
   - ONNX Runtime Web 的其他后端
   - TensorFlow.js
   - 其他新兴运行时

2. **更多模型尺寸**
   - 1B, 3B, 7B 参数模型
   - 不同架构（Llama, Mistral, Phi 等）

3. **高级分析**
   - 性能回归检测
   - A/B 测试比较
   - 成本效益分析

4. **社区功能**
   - 用户提交测试结果
   - 讨论和反馈系统
   - 集成 CI/CD badge

5. **移动端支持**
   - Android Chrome
   - iOS Safari
   - 移动端优化建议

### 技术演进 / Technical Evolution

1. **数据库迁移**
   - 从 JSON 文件迁移到 SQLite/PostgreSQL
   - 支持更复杂的查询和分析

2. **API 服务**
   - 提供 REST API 访问数据
   - 支持第三方集成

3. **实时测试**
   - 在线测试页面
   - 用户浏览器中运行测试

## 贡献者指南 / Contributor Guide

详见 [CONTRIBUTING.md](../CONTRIBUTING.md)

## 行动指南 / Action Guide

详见 [ACTION_GUIDE.md](./ACTION_GUIDE.md)

## 技术文档 / Technical Documentation

- [Architecture](./ARCHITECTURE.md) - 架构设计
- [Runtime Support](./RUNTIME_SUPPORT.md) - 运行时支持矩阵
- [Data Schema](./DATA_SCHEMA.md) - 数据格式定义

---

**最后更新 / Last Updated**: 2024-11

**版本 / Version**: 1.0.0

**维护者 / Maintainer**: [@KotoriK](https://github.com/KotoriK)
