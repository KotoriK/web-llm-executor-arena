import { test, expect } from '@playwright/test';
import { collectBrowserInfo } from '../fixtures/browser-info.js';
import { models } from '../config/models.config.js';
import { scenarios } from '../config/test-scenarios.js';
import { saveTestResult, generateUUID } from '../fixtures/result-saver.js';

/**
 * @wllama/wllama runtime performance tests
 * Tests the llama.cpp WASM backend with SIMD support
 */
test.describe('Wllama Runtime Tests', () => {
  // Increase timeout for model loading
  test.setTimeout(600000); // 10 minutes

  test('should run basic performance test with q8 model', async ({ page, browserName }) => {
    console.log(`\n=== Testing Wllama with ${browserName} ===\n`);
    
    // Navigate to test page
    console.log('Loading test page...');
    await page.goto('/wllama', { waitUntil: 'networkidle' });
    
    // Wait for initialization
    await page.waitForSelector('.status.ready', { timeout: 30000 });
    console.log('✓ Page initialized');
    
    // Collect environment information
    console.log('\nCollecting environment info...');
    const envInfo = await collectBrowserInfo(page, browserName);
    console.log(`Platform: ${envInfo.platform.os} ${envInfo.platform.arch}`);
    console.log(`Browser: ${envInfo.browser.name} ${envInfo.browser.version}`);
    console.log(`CPU Cores: ${envInfo.hardware.cores}`);
    console.log(`WASM SIMD: ${envInfo.capabilities.wasmSIMD ? 'Yes' : 'No'}`);
    console.log(`WebGPU: ${envInfo.capabilities.webGPU ? 'Yes' : 'No'}`);
    
    // Get runtime info
    const runtimeInfo = await page.evaluate(() => {
      return (window as any).testAPI.getRuntimeInfo();
    });
    console.log(`\nRuntime: ${runtimeInfo.name} v${runtimeInfo.version}`);
    console.log(`Backend: ${runtimeInfo.backend}`);
    
    // Load model
    const modelConfig = models.wllama.q8;
    console.log(`\nLoading model: ${modelConfig.url}`);
    console.log('This may take several minutes...');
    
    await page.evaluate((url) => {
      return (window as any).testAPI.loadModel(url);
    }, modelConfig.url);
    console.log('✓ Model loaded');
    
    // Execute inference with basic scenario
    const scenario = scenarios.basic;
    console.log(`\n=== Running Test Scenario: ${scenario.name} ===`);
    console.log(`Prompt: "${scenario.prompt}"`);
    console.log(`Max Tokens: ${scenario.maxTokens}`);
    console.log(`Temperature: ${scenario.temperature}`);
    
    const output = await page.evaluate((scenarioData) => {
      return (window as any).testAPI.generate(scenarioData.prompt, {
        maxTokens: scenarioData.maxTokens,
        temperature: scenarioData.temperature,
      });
    }, scenario);
    
    console.log(`\nGenerated output:\n"${output}"\n`);
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      return (window as any).testAPI.getMetrics();
    });
    
    console.log('=== Performance Metrics ===');
    console.log(`Load Time: ${metrics.loadTime.toFixed(2)} ms`);
    console.log(`TTFT: ${metrics.ttft.toFixed(2)} ms`);
    console.log(`Tokens/Second: ${metrics.tokensPerSecond.toFixed(2)}`);
    if (metrics.peakMemory) {
      console.log(`Peak Memory: ${metrics.peakMemory.toFixed(2)} MB`);
    }
    
    // Assertions
    expect(metrics.loadTime).toBeGreaterThan(0);
    expect(metrics.ttft).toBeGreaterThan(0);
    expect(metrics.tokensPerSecond).toBeGreaterThan(0);
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
        name: 'Qwen2.5-0.5B-Instruct',
        quantization: modelConfig.quantization,
        size: modelConfig.size,
        parameters: '0.5B',
        url: modelConfig.url,
      },
      performance: {
        loadTime: metrics.loadTime,
        ttft: metrics.ttft,
        tokensPerSecond: metrics.tokensPerSecond,
        peakMemory: metrics.peakMemory,
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
    
    console.log('\nSaving test result...');
    const filepath = await saveTestResult(testResult);
    console.log(`✓ Result saved to: ${filepath}`);
    
    // Cleanup
    console.log('\nCleaning up...');
    await page.evaluate(() => {
      return (window as any).testAPI.cleanup();
    });
    console.log('✓ Test completed successfully!\n');
  });

  test('should handle multiple generations', async ({ page, browserName }) => {
    test.setTimeout(600000);
    
    console.log(`\n=== Testing Multiple Generations with ${browserName} ===\n`);
    
    await page.goto('/wllama', { waitUntil: 'networkidle' });
    await page.waitForSelector('.status.ready', { timeout: 30000 });
    
    // Load model
    const modelConfig = models.wllama.q8;
    console.log('Loading model...');
    await page.evaluate((url) => {
      return (window as any).testAPI.loadModel(url);
    }, modelConfig.url);
    console.log('✓ Model loaded');
    
    // Run multiple generations
    const prompts = [
      'Count to 5.',
      'What is 2+2?',
      'Say hello.',
    ];
    
    console.log(`\nRunning ${prompts.length} generations...`);
    const outputs = [];
    
    for (let i = 0; i < prompts.length; i++) {
      console.log(`\n${i + 1}. "${prompts[i]}"`);
      const output = await page.evaluate((prompt) => {
        return (window as any).testAPI.generate(prompt, {
          maxTokens: 20,
          temperature: 0.7,
        });
      }, prompts[i]);
      
      console.log(`   → "${output}"`);
      outputs.push(output);
      expect(output).toBeTruthy();
    }
    
    // Get final metrics
    const metrics = await page.evaluate(() => {
      return (window as any).testAPI.getMetrics();
    });
    
    console.log(`\nFinal metrics:`);
    console.log(`Tokens/Second: ${metrics.tokensPerSecond.toFixed(2)}`);
    
    await page.evaluate(() => {
      return (window as any).testAPI.cleanup();
    });
    
    console.log('✓ Multiple generations test completed\n');
  });
});
