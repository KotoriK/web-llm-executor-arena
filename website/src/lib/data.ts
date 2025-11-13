import { readFile } from 'fs/promises';
import { join } from 'path';

export interface RuntimeStats {
  runtime: string;
  model: string;
  quantization: string;
  backend: string;
  count: number;
  loadTime: {
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  ttft: {
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  tokensPerSecond: {
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

export interface ComparisonData {
  runtime: string;
  model: string;
  quantization: string;
  backend: string;
  loadTime: number;
  ttft: number;
  tokensPerSecond: number;
}

export interface SummaryData {
  totalResults: number;
  runtimesTested: number;
  topPerformers: {
    fastestTokensPerSec: {
      runtime: string;
      value: number;
    };
    fastestTTFT: {
      runtime: string;
      value: number;
    };
    fastestLoad: {
      runtime: string;
      value: number;
    };
  };
}

/**
 * Load aggregated results from JSON file
 */
export async function loadAggregatedResults(): Promise<RuntimeStats[]> {
  try {
    const resultsPath = join(process.cwd(), '..', 'results', 'processed', 'aggregated.json');
    const data = await readFile(resultsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading aggregated results:', error);
    // Return sample data for development
    return getSampleData();
  }
}

/**
 * Load comparison data from JSON file
 */
export async function loadComparisonData(): Promise<ComparisonData[]> {
  try {
    const comparisonPath = join(process.cwd(), '..', 'results', 'processed', 'comparison.json');
    const data = await readFile(comparisonPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading comparison data:', error);
    return getSampleComparisonData();
  }
}

/**
 * Load summary data from JSON file
 */
export async function loadSummaryData(): Promise<SummaryData> {
  try {
    const summaryPath = join(process.cwd(), '..', 'results', 'processed', 'summary.json');
    const data = await readFile(summaryPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading summary data:', error);
    return getSampleSummaryData();
  }
}

/**
 * Sample data for development/testing
 */
function getSampleData(): RuntimeStats[] {
  return [
    {
      runtime: 'wllama',
      model: 'Qwen2.5-0.5B-Instruct',
      quantization: 'q8',
      backend: 'WASM SIMD',
      count: 10,
      loadTime: { mean: 120000, median: 118000, min: 95000, max: 145000, stdDev: 12000, p50: 118000, p90: 135000, p95: 140000, p99: 145000 },
      ttft: { mean: 350, median: 320, min: 180, max: 580, stdDev: 95, p50: 320, p90: 480, p95: 520, p99: 580 },
      tokensPerSecond: { mean: 15.2, median: 15.5, min: 12.0, max: 18.5, stdDev: 1.8, p50: 15.5, p90: 17.8, p95: 18.2, p99: 18.5 },
    },
    {
      runtime: 'web-llm',
      model: 'Qwen2.5-0.5B-Instruct',
      quantization: 'q0f32',
      backend: 'WebGPU',
      count: 10,
      loadTime: { mean: 180000, median: 175000, min: 140000, max: 220000, stdDev: 20000, p50: 175000, p90: 210000, p95: 215000, p99: 220000 },
      ttft: { mean: 120, median: 110, min: 80, max: 190, stdDev: 28, p50: 110, p90: 165, p95: 180, p99: 190 },
      tokensPerSecond: { mean: 65.8, median: 67.0, min: 48.0, max: 82.0, stdDev: 8.5, p50: 67.0, p90: 78.0, p95: 80.0, p99: 82.0 },
    },
    {
      runtime: 'transformers',
      model: 'Qwen2.5-0.5B-Instruct',
      quantization: 'fp32',
      backend: 'WASM',
      count: 10,
      loadTime: { mean: 60000, median: 58000, min: 45000, max: 75000, stdDev: 7500, p50: 58000, p90: 70000, p95: 72000, p99: 75000 },
      ttft: { mean: 480, median: 460, min: 320, max: 680, stdDev: 85, p50: 460, p90: 620, p95: 650, p99: 680 },
      tokensPerSecond: { mean: 12.5, median: 12.8, min: 9.0, max: 15.0, stdDev: 1.5, p50: 12.8, p90: 14.5, p95: 14.8, p99: 15.0 },
    },
    {
      runtime: 'mediapipe',
      model: 'Qwen2.5-0.5B-Instruct',
      quantization: 'int8',
      backend: 'TFLite+WebGPU',
      count: 10,
      loadTime: { mean: 150000, median: 145000, min: 120000, max: 180000, stdDev: 15000, p50: 145000, p90: 170000, p95: 175000, p99: 180000 },
      ttft: { mean: 280, median: 260, min: 180, max: 420, stdDev: 62, p50: 260, p90: 380, p95: 400, p99: 420 },
      tokensPerSecond: { mean: 28.5, median: 29.0, min: 18.0, max: 38.0, stdDev: 5.2, p50: 29.0, p90: 35.0, p95: 36.5, p99: 38.0 },
    },
  ];
}

function getSampleComparisonData(): ComparisonData[] {
  return [
    { runtime: 'wllama', model: 'Qwen2.5-0.5B-Instruct', quantization: 'q8', backend: 'WASM SIMD', loadTime: 120, ttft: 350, tokensPerSecond: 15.2 },
    { runtime: 'web-llm', model: 'Qwen2.5-0.5B-Instruct', quantization: 'q0f32', backend: 'WebGPU', loadTime: 180, ttft: 120, tokensPerSecond: 65.8 },
    { runtime: 'transformers', model: 'Qwen2.5-0.5B-Instruct', quantization: 'fp32', backend: 'WASM', loadTime: 60, ttft: 480, tokensPerSecond: 12.5 },
    { runtime: 'mediapipe', model: 'Qwen2.5-0.5B-Instruct', quantization: 'int8', backend: 'TFLite+WebGPU', loadTime: 150, ttft: 280, tokensPerSecond: 28.5 },
  ];
}

function getSampleSummaryData(): SummaryData {
  return {
    totalResults: 40,
    runtimesTested: 4,
    topPerformers: {
      fastestTokensPerSec: {
        runtime: 'web-llm (WebGPU)',
        value: 65.8,
      },
      fastestTTFT: {
        runtime: 'web-llm (WebGPU)',
        value: 120,
      },
      fastestLoad: {
        runtime: 'transformers (WASM)',
        value: 60,
      },
    },
  };
}
