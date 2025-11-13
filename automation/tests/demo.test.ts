import { test, expect } from '@playwright/test';
import { collectBrowserInfo } from '../fixtures/browser-info.js';
import { scenarios } from '../config/test-scenarios.js';
import { saveTestResult, generateUUID } from '../fixtures/result-saver.js';

/**
 * Demo test to verify the testing framework works correctly
 */
test.describe('Demo Runtime Tests', () => {
  test('should run basic performance test', async ({ page, browserName }) => {
    console.log(`Testing with browser: ${browserName}`);
    
    // Navigate to test page
    await page.goto('/demo');
    
    // Wait for initialization
    await page.waitForSelector('.status.ready', { timeout: 10000 });
    
    // Collect environment information
    console.log('Collecting browser info...');
    const envInfo = await collectBrowserInfo(page, browserName);
    console.log('Environment:', JSON.stringify(envInfo, null, 2));
    
    // Initialize runtime
    console.log('Initializing runtime...');
    await page.evaluate(() => {
      return (window as any).testAPI.initialize({});
    });
    
    // Load model
    console.log('Loading model...');
    await page.evaluate(() => {
      return (window as any).testAPI.loadModel('demo-model');
    });
    
    // Execute inference with basic scenario
    const scenario = scenarios.basic;
    console.log('Running inference with prompt:', scenario.prompt);
    
    const output = await page.evaluate((scenarioData) => {
      return (window as any).testAPI.generate(scenarioData.prompt, {
        maxTokens: scenarioData.maxTokens,
        temperature: scenarioData.temperature,
      });
    }, scenario);
    
    console.log('Generated output:', output);
    
    // Get performance metrics
    console.log('Collecting metrics...');
    const metrics = await page.evaluate(() => {
      return (window as any).testAPI.getMetrics();
    });
    
    console.log('Performance metrics:', JSON.stringify(metrics, null, 2));
    
    // Get runtime info
    const runtimeInfo = await page.evaluate(() => {
      return (window as any).testAPI.getRuntimeInfo();
    });
    
    console.log('Runtime info:', JSON.stringify(runtimeInfo, null, 2));
    
    // Verify metrics
    expect(metrics.loadTime).toBeGreaterThan(0);
    expect(metrics.ttft).toBeGreaterThan(0);
    expect(metrics.tokensPerSecond).toBeGreaterThan(0);
    
    // Verify output
    expect(output).toBeTruthy();
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
    
    // Save test result
    const testResult = {
      meta: {
        testId: generateUUID(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
      environment: envInfo,
      runtime: {
        name: runtimeInfo.name,
        version: runtimeInfo.version,
        backend: runtimeInfo.backend,
      },
      model: {
        name: 'Demo Model',
        quantization: 'none',
        parameters: '0.5B',
      },
      performance: {
        loadTime: metrics.loadTime,
        ttft: metrics.ttft,
        tokensPerSecond: metrics.tokensPerSecond,
      },
      testScenario: {
        name: scenario.name,
        prompt: scenario.prompt,
        maxTokens: scenario.maxTokens,
        temperature: scenario.temperature,
      },
      outputs: [
        {
          prompt: scenario.prompt,
          response: output,
          tokenCount: scenario.maxTokens,
        },
      ],
    };
    
    console.log('Saving test result...');
    const filepath = await saveTestResult(testResult);
    console.log('Test result saved to:', filepath);
    
    // Cleanup
    console.log('Cleaning up...');
    await page.evaluate(() => {
      return (window as any).testAPI.cleanup();
    });
    
    console.log('Test completed successfully!');
  });

  test('should handle errors gracefully', async ({ page, browserName }) => {
    await page.goto('/demo');
    await page.waitForSelector('.status.ready', { timeout: 10000 });
    
    // Try to generate without loading model (demo should still work)
    const output = await page.evaluate(() => {
      return (window as any).testAPI.generate('Test prompt', { maxTokens: 10 });
    });
    
    expect(output).toBeTruthy();
  });
});
