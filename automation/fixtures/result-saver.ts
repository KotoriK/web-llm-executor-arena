import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test result structure matching the schema
 */
export interface TestResult {
  meta: {
    testId: string;
    timestamp: string;
    version: string;
  };
  environment: any;
  runtime: {
    name: string;
    version: string;
    backend: string;
    configuration?: any;
  };
  model: {
    name: string;
    quantization: string;
    size?: number;
    parameters?: string;
    url?: string;
  };
  performance: {
    loadTime: number;
    ttft: number;
    tokensPerSecond: number;
    peakMemory?: number;
    avgLatency?: number;
    throughput?: {
      p50: number;
      p90: number;
      p99: number;
    };
  };
  testScenario?: {
    name?: string;
    prompt?: string;
    maxTokens?: number;
    temperature?: number;
  };
  outputs?: Array<{
    prompt: string;
    response: string;
    tokenCount: number;
    duration?: number;
  }>;
  errors?: string[];
}

/**
 * Generate a simple UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Save test result to JSON file
 */
export async function saveTestResult(result: TestResult): Promise<string> {
  // Create results directory structure
  const now = new Date(result.meta.timestamp);
  const yearMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const resultsDir = path.join(__dirname, '../../results/raw', yearMonth);
  
  await fs.mkdir(resultsDir, { recursive: true });

  // Generate filename: {runtime}_{browser}_{platform}_{timestamp}.json
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const platform = result.environment.platform.os.toLowerCase();
  const browser = result.environment.browser.name.toLowerCase();
  const runtime = result.runtime.name;
  
  const filename = `${runtime}_${browser}_${platform}_${timestamp}.json`;
  const filepath = path.join(resultsDir, filename);

  // Write file
  await fs.writeFile(filepath, JSON.stringify(result, null, 2), 'utf-8');
  
  console.log(`Test result saved to: ${filepath}`);
  return filepath;
}

/**
 * Load test results from a file
 */
export async function loadTestResult(filepath: string): Promise<TestResult> {
  const content = await fs.readFile(filepath, 'utf-8');
  return JSON.parse(content);
}

/**
 * List all test results
 */
export async function listTestResults(runtimeFilter?: string): Promise<string[]> {
  const rawDir = path.join(__dirname, '../../results/raw');
  
  try {
    await fs.access(rawDir);
  } catch {
    return [];
  }

  const results: string[] = [];
  const yearMonths = await fs.readdir(rawDir);
  
  for (const yearMonth of yearMonths) {
    const yearMonthDir = path.join(rawDir, yearMonth);
    const stat = await fs.stat(yearMonthDir);
    if (!stat.isDirectory()) continue;
    
    const files = await fs.readdir(yearMonthDir);
    const filtered = files
      .filter(f => f.endsWith('.json'))
      .filter(f => !runtimeFilter || f.startsWith(runtimeFilter));
    
    results.push(...filtered.map(f => path.join(yearMonthDir, f)));
  }
  
  return results.sort().reverse(); // Most recent first
}
