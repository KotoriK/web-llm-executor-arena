import { test, expect } from '@playwright/test';
import { BrowserInfoFixture } from '../fixtures/browser-info';
import { PerformanceMonitorFixture } from '../fixtures/performance-monitor';
import { ResultSaverFixture } from '../fixtures/result-saver';

const RUNTIME_NAME = 'transformers';
const TEST_PAGE_URL = 'http://localhost:3003';
const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';

test.describe('@huggingface/transformers Tests', () => {
  test.setTimeout(600000); // 10 minutes for model download

  test('Basic performance test', async ({ page }) => {
    const browserInfo = new BrowserInfoFixture(page);
    const perfMonitor = new PerformanceMonitorFixture(page);
    const resultSaver = new ResultSaverFixture();

    // Navigate to test page
    await page.goto(TEST_PAGE_URL);
    await page.waitForLoadState('networkidle');

    // Wait for initialization
    await page.waitForFunction(() => window.testAPI !== undefined, { timeout: 10000 });

    // Get environment information
    const environment = await browserInfo.getEnvironmentInfo();
    console.log('Environment:', JSON.stringify(environment, null, 2));

    // Load model
    console.log(`Loading model: ${MODEL_ID}`);
    const loadStart = Date.now();
    
    const loadSuccess = await page.evaluate(async (modelId) => {
      return await window.testAPI.loadModel(modelId);
    }, MODEL_ID);
    
    expect(loadSuccess).toBe(true);
    const loadTime = Date.now() - loadStart;
    console.log(`Model loaded in ${loadTime}ms`);

    // Generate text
    const prompt = 'What is the capital of France?';
    console.log(`Generating response for: "${prompt}"`);
    
    const genStart = Date.now();
    const response = await page.evaluate(async (p) => {
      return await window.testAPI.generate(p, { maxTokens: 30 });
    }, prompt);
    
    const genTime = Date.now() - genStart;
    console.log(`Generated ${response.length} chars in ${genTime}ms`);
    console.log(`Response: ${response}`);

    // Get metrics
    const metrics = await page.evaluate(() => window.testAPI.getMetrics());
    const runtimeInfo = await page.evaluate(() => window.testAPI.getRuntimeInfo());
    
    console.log('Metrics:', metrics);
    console.log('Runtime Info:', runtimeInfo);

    // Validate metrics
    expect(metrics.loadTime).toBeGreaterThan(0);
    expect(metrics.ttft).toBeGreaterThan(0);
    expect(metrics.tokensPerSecond).toBeGreaterThan(0);

    // Save results
    const testResult = {
      meta: {
        testId: `${RUNTIME_NAME}-basic-${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
      environment,
      runtime: {
        name: RUNTIME_NAME,
        version: runtimeInfo.version,
        backend: runtimeInfo.backend,
      },
      model: {
        name: 'Qwen2.5-0.5B-Instruct',
        quantization: 'fp32',
        size: 500 * 1024 * 1024, // ~500MB
      },
      performance: metrics,
    };

    await resultSaver.saveResult(testResult);
    console.log('Test result saved');
  });

  test('Multiple generations test', async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => window.testAPI !== undefined, { timeout: 10000 });

    // Load model
    console.log(`Loading model: ${MODEL_ID}`);
    const loadSuccess = await page.evaluate(async (modelId) => {
      return await window.testAPI.loadModel(modelId);
    }, MODEL_ID);
    
    expect(loadSuccess).toBe(true);

    // Generate multiple times
    const prompts = [
      'Hello, how are you?',
      'What is 2+2?',
      'Tell me a short joke.',
    ];

    for (const prompt of prompts) {
      console.log(`\nGenerating for: "${prompt}"`);
      
      const response = await page.evaluate(async (p) => {
        return await window.testAPI.generate(p, { maxTokens: 20 });
      }, prompt);
      
      console.log(`Response: ${response}`);
      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(0);
    }

    // Get final metrics
    const metrics = await page.evaluate(() => window.testAPI.getMetrics());
    console.log('\nFinal metrics:', metrics);
    
    expect(metrics.tokensPerSecond).toBeGreaterThan(0);
  });
});
