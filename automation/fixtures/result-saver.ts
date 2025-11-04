import * as fs from 'fs';
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
  
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Generate filename: {runtime}_{browser}_{platform}_{timestamp}.json
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const platform = result.environment.platform.os.toLowerCase();
  const browser = result.environment.browser.name.toLowerCase();
  const runtime = result.runtime.name;
  
  const filename = `${runtime}_${browser}_${platform}_${timestamp}.json`;
  const filepath = path.join(resultsDir, filename);

  // Write file
  fs.writeFileSync(filepath, JSON.stringify(result, null, 2), 'utf-8');
  
  console.log(`Test result saved to: ${filepath}`);
  return filepath;
}

/**
 * Load test results from a file
 */
export function loadTestResult(filepath: string): TestResult {
  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content);
}

/**
 * List all test results
 */
export function listTestResults(runtimeFilter?: string): string[] {
  const rawDir = path.join(__dirname, '../../results/raw');
  
  if (!fs.existsSync(rawDir)) {
    return [];
  }

  const results: string[] = [];
  const yearMonths = fs.readdirSync(rawDir);
  
  for (const yearMonth of yearMonths) {
    const yearMonthDir = path.join(rawDir, yearMonth);
    if (!fs.statSync(yearMonthDir).isDirectory()) continue;
    
    const files = fs.readdirSync(yearMonthDir)
      .filter(f => f.endsWith('.json'))
      .filter(f => !runtimeFilter || f.startsWith(runtimeFilter));
    
    results.push(...files.map(f => path.join(yearMonthDir, f)));
  }
  
  return results.sort().reverse(); // Most recent first
}
