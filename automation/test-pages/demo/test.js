import { createLogger, createStatusUpdater } from '../shared/utils.js';

const log = createLogger('log');
const setStatus = createStatusUpdater('status');

/**
 * Demo Test API Implementation
 * Mock implementation for framework verification
 */
class DemoTestAPI {
  constructor() {
    this.initialized = false;
    this.metrics = {
      loadTime: 0,
      ttft: 0,
      tokensPerSecond: 0,
    };
    this.runtimeInfo = {
      name: 'demo',
      version: '1.0.0',
      backend: 'mock',
    };
  }

  async initialize(config) {
    log('Initializing with config: ' + JSON.stringify(config));
    await this.simulateDelay(500);
    this.initialized = true;
    return true;
  }

  async loadModel(modelUrl) {
    log('Loading model: ' + modelUrl);
    const startTime = performance.now();
    await this.simulateDelay(1000); // Simulate model loading
    this.metrics.loadTime = performance.now() - startTime;
    return true;
  }

  async generate(prompt, options = {}) {
    if (!this.initialized) {
      throw new Error('Runtime not initialized');
    }

    log('Generating with prompt: ' + prompt);
    const startTime = performance.now();
    
    // Simulate TTFT
    await this.simulateDelay(100);
    const firstTokenTime = performance.now();
    this.metrics.ttft = firstTokenTime - startTime;

    // Simulate token generation
    const tokens = options.maxTokens || 50;
    await this.simulateDelay(tokens * 10); // 10ms per token
    
    const totalTime = performance.now() - startTime;
    this.metrics.tokensPerSecond = tokens / (totalTime / 1000);

    return `This is a demo response to: "${prompt}". Generated ${tokens} tokens.`;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getRuntimeInfo() {
    return { ...this.runtimeInfo };
  }

  async cleanup() {
    log('Cleaning up...');
    this.initialized = false;
    await this.simulateDelay(100);
  }

  // Helper method
  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize and expose API
(async () => {
  try {
    log('Starting demo test page...', 'info');
    
    const api = new DemoTestAPI();
    await api.initialize({});
    
    // Expose to window for Playwright tests
    window.testAPI = api;
    
    // Update UI
    const infoEl = document.getElementById('info');
    infoEl.style.display = 'block';
    
    const runtimeInfo = api.getRuntimeInfo();
    document.getElementById('runtime-name').textContent = runtimeInfo.name;
    document.getElementById('runtime-version').textContent = runtimeInfo.version;
    document.getElementById('runtime-backend').textContent = runtimeInfo.backend;
    
    setStatus('Ready for testing', 'ready');
    log('Test page ready', 'success');
  } catch (error) {
    log('Fatal error: ' + error.message, 'error');
    setStatus('Fatal error: ' + error.message, 'error');
  }
})();
