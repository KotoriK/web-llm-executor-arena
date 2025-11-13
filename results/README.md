# Test Results

本目录存储测试结果数据。

This directory stores test result data.

## 目录结构 / Directory Structure

```
results/
├── raw/                    # 原始测试结果 (JSON files)
│   └── YYYY-MM/           # 按月份组织
│       ├── wllama_*.json
│       ├── webllm_*.json
│       ├── transformers_*.json
│       └── mediapipe_*.json
├── processed/             # 处理后的聚合数据
│   ├── summary.json       # 总览统计
│   ├── by-runtime.json    # 按运行时分组
│   └── by-platform.json   # 按平台分组
├── schema.json            # JSON Schema 定义
└── README.md             # 本文件
```

## 数据格式 / Data Format

详见 [DATA_SCHEMA.md](../docs/DATA_SCHEMA.md)

## 添加测试结果 / Adding Test Results

### 自动添加 / Automated

运行测试框架会自动生成并保存结果：

```bash
pnpm test
```

### 手动添加 / Manual

如果您在本地运行测试并想贡献结果：

1. 确保结果符合 schema 定义
2. 使用正确的文件命名格式：`{runtime}_{browser}_{platform}_{timestamp}.json`
3. 将文件放入 `raw/YYYY-MM/` 目录
4. 创建 Pull Request

## 数据处理 / Data Processing

处理原始数据并生成聚合结果：

```bash
pnpm run process-results
```

此命令会：
1. 验证所有原始数据
2. 生成聚合统计
3. 更新 processed/ 目录中的文件
4. 复制数据到网站目录

## 数据查询示例 / Query Examples

### 查找特定运行时的所有结果

```bash
find raw/ -name "wllama_*.json"
```

### 统计测试数量

```bash
find raw/ -name "*.json" | wc -l
```

### 查看最新结果

```bash
ls -t raw/*/*.json | head -1 | xargs cat | jq '.'
```

## 注意事项 / Notes

- 结果文件应该是只读的，不要修改已有文件
- 所有时间戳使用 UTC 时区
- 文件大小限制：每个文件 < 1MB
- 敏感信息（如用户名、路径）应该在保存前移除

## 数据保留策略 / Data Retention

- **原始数据**: 保留所有历史数据
- **聚合数据**: 定期更新（每周）
- **网站数据**: 只包含最近6个月的数据（性能考虑）
