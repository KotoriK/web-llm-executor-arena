import { test, expect } from '@playwright/test';
import { collectBrowserInfo } from '../fixtures/browser-info.js';
import { models } from '../config/models.config.js';
import { scenarios } from '../config/test-scenarios.js';
import { saveTestResult, generateUUID } from '../fixtures/result-saver.js';

/**
 * Unified runtime test suite
 * This test can be run against any runtime that implements the TestPageAPI interface
 */

interface RuntimeTestConfig {
  name: string;
  path: string;
  modelKey: string;
  quantization: string;
}

const runtimeConfigs: RuntimeTestConfig[] = [
  {
    name: 'wllama',
    path: '/wllama',
    modelKey: 'q8',
    quantization: 'q8_0',
  },
  {
    name: 'webllm',
    path: '/webllm',
    modelKey: 'q0f32',
    quantization: 'q0f32',
  },
  {
    name: 'transformers',
    path: '/transformers',
    modelKey: 'fp32',
    quantization: 'fp32',
  },
  {
    name: 'mediapipe',
    path: '/mediapipe',
    modelKey: 'int8',
    quantization: 'int8',
  },
];

for (const runtime of runtimeConfigs) {
  test.describe(`${runtime.name} Runtime Tests`, () => {
    test.setTimeout(900000); // 15 minutes

    test(`should run basic performance test`, async ({ page, browserName }) => {
      console.log(`\n=== Testing ${runtime.name} with ${browserName} ===\n`);
      
      // Navigate to test page
      console.log('Loading test page...');
      await page.goto(runtime.path, { waitUntil: 'networkidle' });
      
      // Wait for initialization
      await page.waitForSelector('.status.ready', { timeout: 30000 });
      console.log('✓ Page initialized');
      
      // Collect environment information
      console.log('\nCollecting environment info...');
      const envInfo = await collectBrowserInfo(page, browserName);
      console.log(`Platform: ${envInfo.platform.os} ${envInfo.platform.arch}`);
      console.log(`Browser: ${envInfo.browser.name} ${envInfo.browser.version}`);
      console.log(`CPU Cores: ${envInfo.hardware.cores}`);
      console.log(`WebGPU: ${envInfo.capabilities.webGPU ? 'Yes' : 'No'}`);
      
      // Get model config
      const modelConfig = models[runtime.name][runtime.modelKey];
      
      // Initialize/Load model
      console.log(`\nLoading model for ${runtime.name}...`);
      if (runtime.name === 'webllm') {
        // Web-LLM initializes with model
        await page.evaluate((modelId) => {
          return (window as any).testAPI.initialize({ modelId });
        }, modelConfig.modelId);
      } else {
        // Other runtimes load model separately
        await page.evaluate((url) => {
          return (window as any).testAPI.loadModel(url);
        }, modelConfig.url || modelConfig.modelId);
      }
      console.log('✓ Model loaded');
      
      // Get runtime info
      const runtimeInfo = await page.evaluate(() => {
        return (window as any).testAPI.getRuntimeInfo();
      });
      console.log(`\nRuntime: ${runtimeInfo.name} v${runtimeInfo.version}`);
      console.log(`Backend: ${runtimeInfo.backend}`);
      
      // Execute inference with basic scenario
      const scenario = scenarios.basic;
      console.log(`\n=== Running Test Scenario: ${scenario.name} ===`);
      console.log(`Prompt: "${scenario.prompt}"`);
      
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
      console.log(`Load Time: ${(metrics.loadTime / 1000).toFixed(2)} s`);
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
          quantization: runtime.quantization,
          size: modelConfig.size,
          parameters: '0.5B',
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
  });
}
