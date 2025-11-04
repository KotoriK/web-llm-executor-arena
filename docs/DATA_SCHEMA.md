# Data Schema Documentation

本文档定义测试结果的数据格式和结构。

This document defines the data format and structure for test results.

## 测试结果数据格式 / Test Result Data Format

### JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TestResult",
  "type": "object",
  "required": ["meta", "environment", "runtime", "model", "performance"],
  "properties": {
    "meta": {
      "type": "object",
      "required": ["testId", "timestamp", "version"],
      "properties": {
        "testId": {
          "type": "string",
          "description": "Unique identifier for this test run",
          "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"
        },
        "timestamp": {
          "type": "string",
          "format": "date-time",
          "description": "ISO 8601 timestamp"
        },
        "version": {
          "type": "string",
          "description": "Schema version",
          "pattern": "^\\d+\\.\\d+\\.\\d+$"
        }
      }
    },
    "environment": {
      "type": "object",
      "required": ["platform", "browser", "hardware", "capabilities"],
      "properties": {
        "platform": {
          "type": "object",
          "required": ["os", "arch"],
          "properties": {
            "os": {
              "type": "string",
              "enum": ["Windows", "macOS", "Linux", "Android", "iOS"]
            },
            "version": {
              "type": "string"
            },
            "arch": {
              "type": "string",
              "enum": ["x64", "arm64", "x86"]
            }
          }
        },
        "browser": {
          "type": "object",
          "required": ["name", "version"],
          "properties": {
            "name": {
              "type": "string",
              "enum": ["Chrome", "Firefox", "Safari", "Edge", "Opera"]
            },
            "version": {
              "type": "string"
            },
            "userAgent": {
              "type": "string"
            }
          }
        },
        "hardware": {
          "type": "object",
          "required": ["cores"],
          "properties": {
            "cores": {
              "type": "integer",
              "minimum": 1
            },
            "memory": {
              "type": "number",
              "description": "Device memory in GB"
            }
          }
        },
        "capabilities": {
          "type": "object",
          "required": ["wasmSIMD", "webGPU", "webNN"],
          "properties": {
            "wasmSIMD": {
              "type": "boolean"
            },
            "webGPU": {
              "type": "boolean"
            },
            "webNN": {
              "type": "boolean"
            }
          }
        },
        "gpu": {
          "type": "object",
          "properties": {
            "vendor": {
              "type": "string"
            },
            "renderer": {
              "type": "string"
            },
            "driver": {
              "type": "string"
            },
            "memory": {
              "type": "number",
              "description": "GPU memory in MB"
            }
          }
        }
      }
    },
    "runtime": {
      "type": "object",
      "required": ["name", "version", "backend"],
      "properties": {
        "name": {
          "type": "string",
          "enum": ["wllama", "web-llm", "transformers", "mediapipe"]
        },
        "version": {
          "type": "string"
        },
        "backend": {
          "type": "string",
          "enum": ["wasm", "wasm-simd", "webgpu", "webnn"]
        },
        "configuration": {
          "type": "object",
          "description": "Runtime-specific configuration"
        }
      }
    },
    "model": {
      "type": "object",
      "required": ["name", "quantization", "size"],
      "properties": {
        "name": {
          "type": "string"
        },
        "quantization": {
          "type": "string",
          "enum": ["q0f32", "q4_0", "q8_0", "uint8", "fp32", "int8"]
        },
        "size": {
          "type": "number",
          "description": "Model file size in bytes"
        },
        "parameters": {
          "type": "string",
          "description": "Model parameter count (e.g., '0.5B', '7B')"
        },
        "url": {
          "type": "string",
          "format": "uri"
        }
      }
    },
    "performance": {
      "type": "object",
      "required": ["loadTime", "ttft", "tokensPerSecond"],
      "properties": {
        "loadTime": {
          "type": "number",
          "description": "Model load time in milliseconds",
          "minimum": 0
        },
        "ttft": {
          "type": "number",
          "description": "Time to first token in milliseconds",
          "minimum": 0
        },
        "tokensPerSecond": {
          "type": "number",
          "description": "Average inference speed",
          "minimum": 0
        },
        "peakMemory": {
          "type": "number",
          "description": "Peak memory usage in MB",
          "minimum": 0
        },
        "avgLatency": {
          "type": "number",
          "description": "Average token latency in milliseconds",
          "minimum": 0
        },
        "throughput": {
          "type": "object",
          "properties": {
            "p50": {
              "type": "number",
              "description": "50th percentile tokens/second"
            },
            "p90": {
              "type": "number",
              "description": "90th percentile tokens/second"
            },
            "p99": {
              "type": "number",
              "description": "99th percentile tokens/second"
            }
          }
        }
      }
    },
    "testScenario": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "prompt": {
          "type": "string"
        },
        "maxTokens": {
          "type": "integer"
        },
        "temperature": {
          "type": "number"
        }
      }
    },
    "outputs": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "prompt": {
            "type": "string"
          },
          "response": {
            "type": "string"
          },
          "tokenCount": {
            "type": "integer"
          },
          "duration": {
            "type": "number",
            "description": "Generation duration in milliseconds"
          }
        }
      }
    },
    "errors": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
```

### TypeScript 接口定义 / TypeScript Interface Definitions

```typescript
// meta.ts
export interface TestMeta {
  testId: string;           // UUID v4
  timestamp: string;        // ISO 8601
  version: string;          // Schema version (e.g., "1.0.0")
}

// environment.ts
export interface Platform {
  os: 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS';
  version?: string;
  arch: 'x64' | 'arm64' | 'x86';
}

export interface Browser {
  name: 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera';
  version: string;
  userAgent?: string;
}

export interface Hardware {
  cores: number;            // navigator.hardwareConcurrency
  memory?: number;          // Device memory in GB
}

export interface Capabilities {
  wasmSIMD: boolean;
  webGPU: boolean;
  webNN: boolean;
}

export interface GPUInfo {
  vendor?: string;          // GPU vendor
  renderer?: string;        // GPU renderer
  driver?: string;          // Driver version
  memory?: number;          // GPU memory in MB
}

export interface Environment {
  platform: Platform;
  browser: Browser;
  hardware: Hardware;
  capabilities: Capabilities;
  gpu?: GPUInfo;
}

// runtime.ts
export type RuntimeName = 'wllama' | 'web-llm' | 'transformers' | 'mediapipe';
export type Backend = 'wasm' | 'wasm-simd' | 'webgpu' | 'webnn';

export interface Runtime {
  name: RuntimeName;
  version: string;
  backend: Backend;
  configuration?: Record<string, any>;
}

// model.ts
export type Quantization = 'q0f32' | 'q4_0' | 'q8_0' | 'uint8' | 'fp32' | 'int8';

export interface Model {
  name: string;
  quantization: Quantization;
  size: number;             // File size in bytes
  parameters?: string;      // e.g., "0.5B", "7B"
  url?: string;
}

// performance.ts
export interface Throughput {
  p50: number;              // 50th percentile
  p90: number;              // 90th percentile
  p99: number;              // 99th percentile
}

export interface Performance {
  loadTime: number;         // ms
  ttft: number;             // Time to first token (ms)
  tokensPerSecond: number;  // Average tokens/sec
  peakMemory?: number;      // Peak memory usage (MB)
  avgLatency?: number;      // Average token latency (ms)
  throughput?: Throughput;
}

// test-scenario.ts
export interface TestScenario {
  name?: string;
  prompt?: string;
  maxTokens?: number;
  temperature?: number;
}

// output.ts
export interface Output {
  prompt: string;
  response: string;
  tokenCount: number;
  duration?: number;        // Generation duration (ms)
}

// test-result.ts
export interface TestResult {
  meta: TestMeta;
  environment: Environment;
  runtime: Runtime;
  model: Model;
  performance: Performance;
  testScenario?: TestScenario;
  outputs?: Output[];
  errors?: string[];
}
```

## 文件命名约定 / File Naming Convention

测试结果文件应遵循以下命名模式：

```
{runtime}_{browser}_{platform}_{timestamp}.json
```

示例 / Examples:
- `wllama_chrome_windows_20241104_120000.json`
- `webllm_firefox_macos_20241104_130530.json`
- `transformers_edge_linux_20241104_141245.json`
- `mediapipe_safari_ios_20241104_152000.json`

时间戳格式：`YYYYMMdd_HHmmss` (UTC)

## 数据验证 / Data Validation

### 必需字段检查 / Required Field Validation

所有测试结果必须包含以下必需字段：
- `meta.testId`
- `meta.timestamp`
- `meta.version`
- `environment.platform`
- `environment.browser`
- `environment.hardware.cores`
- `environment.capabilities`
- `runtime.name`
- `runtime.version`
- `runtime.backend`
- `model.name`
- `model.quantization`
- `model.size`
- `performance.loadTime`
- `performance.ttft`
- `performance.tokensPerSecond`

### 数据范围检查 / Value Range Validation

- `performance.loadTime` >= 0
- `performance.ttft` >= 0
- `performance.tokensPerSecond` >= 0
- `performance.peakMemory` >= 0 (if present)
- `hardware.cores` >= 1
- `model.size` > 0

### 枚举值检查 / Enum Validation

确保枚举字段使用预定义的值：
- `platform.os`: Windows, macOS, Linux, Android, iOS
- `browser.name`: Chrome, Firefox, Safari, Edge, Opera
- `runtime.name`: wllama, web-llm, transformers, mediapipe
- `runtime.backend`: wasm, wasm-simd, webgpu, webnn
- `model.quantization`: q0f32, q4_0, q8_0, uint8, fp32, int8

## 聚合数据格式 / Aggregated Data Format

### 总览统计 / Summary Statistics

```typescript
interface Summary {
  totalTests: number;
  lastUpdated: string;
  runtimes: {
    [runtime: string]: {
      testCount: number;
      avgPerformance: {
        loadTime: number;
        ttft: number;
        tokensPerSecond: number;
      };
    };
  };
  platforms: {
    [platform: string]: {
      testCount: number;
      browsers: string[];
    };
  };
}
```

### 按运行时分组 / Grouped by Runtime

```typescript
interface RuntimeResults {
  runtime: string;
  results: TestResult[];
  statistics: {
    avgLoadTime: number;
    avgTTFT: number;
    avgTokensPerSecond: number;
    minTokensPerSecond: number;
    maxTokensPerSecond: number;
  };
}
```

### 按平台分组 / Grouped by Platform

```typescript
interface PlatformResults {
  platform: string;
  results: TestResult[];
  browsers: {
    [browser: string]: {
      count: number;
      avgPerformance: Performance;
    };
  };
}
```

## 数据处理流程 / Data Processing Pipeline

1. **收集原始数据** / Collect Raw Data
   - Playwright 测试生成原始 JSON 文件
   - 保存到 `results/raw/YYYY-MM/`

2. **验证数据** / Validate Data
   - 检查必需字段
   - 验证数据类型和范围
   - 记录验证错误

3. **聚合数据** / Aggregate Data
   - 生成总览统计
   - 按运行时分组
   - 按平台分组
   - 计算统计指标

4. **导出数据** / Export Data
   - 保存聚合结果到 `results/processed/`
   - 复制到网站 `website/public/data/`

## 示例数据 / Example Data

### 完整测试结果示例 / Complete Test Result Example

```json
{
  "meta": {
    "testId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "timestamp": "2024-11-04T12:00:00.000Z",
    "version": "1.0.0"
  },
  "environment": {
    "platform": {
      "os": "Windows",
      "version": "11",
      "arch": "x64"
    },
    "browser": {
      "name": "Chrome",
      "version": "119.0.6045.105",
      "userAgent": "Mozilla/5.0..."
    },
    "hardware": {
      "cores": 16,
      "memory": 32
    },
    "capabilities": {
      "wasmSIMD": true,
      "webGPU": true,
      "webNN": false
    },
    "gpu": {
      "vendor": "NVIDIA",
      "renderer": "NVIDIA GeForce RTX 4090",
      "driver": "536.23",
      "memory": 24576
    }
  },
  "runtime": {
    "name": "web-llm",
    "version": "0.2.30",
    "backend": "webgpu",
    "configuration": {
      "maxStorageBufferBindingSize": 1073741824
    }
  },
  "model": {
    "name": "Qwen2.5-0.5B-Instruct",
    "quantization": "q0f32",
    "size": 1073741824,
    "parameters": "0.5B",
    "url": "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q0f32-MLC"
  },
  "performance": {
    "loadTime": 2345.67,
    "ttft": 123.45,
    "tokensPerSecond": 89.12,
    "peakMemory": 1536.5,
    "avgLatency": 11.23,
    "throughput": {
      "p50": 88.5,
      "p90": 91.2,
      "p99": 93.8
    }
  },
  "testScenario": {
    "name": "basic",
    "prompt": "Hello, how are you?",
    "maxTokens": 50,
    "temperature": 0.7
  },
  "outputs": [
    {
      "prompt": "Hello, how are you?",
      "response": "I'm doing well, thank you for asking!",
      "tokenCount": 10,
      "duration": 112.35
    }
  ],
  "errors": []
}
```

## 工具函数 / Utility Functions

### 数据验证工具 / Validation Utilities

```typescript
// scripts/validate-result.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../results/schema.json';

const ajv = new Ajv();
addFormats(ajv);

export function validateTestResult(data: unknown): {
  valid: boolean;
  errors?: string[];
} {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  
  if (!valid) {
    return {
      valid: false,
      errors: validate.errors?.map(e => `${e.instancePath} ${e.message}`)
    };
  }
  
  return { valid: true };
}
```

### 数据聚合工具 / Aggregation Utilities

```typescript
// scripts/aggregate-results.ts
export function aggregateByRuntime(results: TestResult[]): RuntimeResults[] {
  const grouped = results.reduce((acc, result) => {
    const runtime = result.runtime.name;
    if (!acc[runtime]) {
      acc[runtime] = [];
    }
    acc[runtime].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);
  
  return Object.entries(grouped).map(([runtime, results]) => ({
    runtime,
    results,
    statistics: calculateStatistics(results)
  }));
}

function calculateStatistics(results: TestResult[]) {
  const performances = results.map(r => r.performance);
  return {
    avgLoadTime: average(performances.map(p => p.loadTime)),
    avgTTFT: average(performances.map(p => p.ttft)),
    avgTokensPerSecond: average(performances.map(p => p.tokensPerSecond)),
    minTokensPerSecond: Math.min(...performances.map(p => p.tokensPerSecond)),
    maxTokensPerSecond: Math.max(...performances.map(p => p.tokensPerSecond))
  };
}

function average(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}
```

## 版本历史 / Version History

- **v1.0.0** (2024-11): 初始版本

---

**注意**: 此 schema 可能会随着项目的发展而演进。重大变更将更新版本号。

**Note**: This schema may evolve as the project develops. Major changes will update the version number.
