import { Wllama } from '@wllama/wllama';

// Logging utility
function log(message, type = 'info') {
  const logEl = document.getElementById('log');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${new Date().toISOString().substr(11, 12)}] ${message}`;
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
  console.log(message);
}

// Status update utility
function setStatus(message, type = 'loading') {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

/**
 * Wllama Test API Implementation
 */
class WllamaTestAPI {
  constructor() {
    this.wllama = null;
    this.modelLoaded = false;
    this.metrics = {
      loadTime: 0,
      ttft: 0,
      tokensPerSecond: 0,
      peakMemory: 0,
    };
    this.runtimeInfo = {
      name: 'wllama',
      version: '1.8.0',
      backend: 'wasm-simd',
    };
  }

  async initialize(config = {}) {
    try {
      log('Initializing Wllama...');
      
      // Create Wllama instance
      this.wllama = new Wllama({
        // Use jsdelivr CDN for WASM files
        pathConfig: {
          'single-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@1.8.0/esm/single-thread/wllama.wasm',
          'multi-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@1.8.0/esm/multi-thread/wllama.wasm',
          'multi-thread/wllama.worker.mjs': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@1.8.0/esm/multi-thread/wllama.worker.mjs',
        }
      });

      // Check WASM SIMD support
      const simdSupported = await this.checkWasmSIMD();
      this.runtimeInfo.backend = simdSupported ? 'wasm-simd' : 'wasm';
      
      log(`WASM SIMD support: ${simdSupported ? 'Yes' : 'No'}`);
      log('Wllama initialized successfully', 'info');
      
      return true;
    } catch (error) {
      log(`Initialization error: ${error.message}`, 'error');
      throw error;
    }
  }

  async loadModel(modelUrl) {
    try {
      log(`Loading model from: ${modelUrl}`);
      setStatus('Loading model...', 'loading');
      
      const startTime = performance.now();
      
      // Load model with progress callback
      await this.wllama.loadModelFromUrl(modelUrl, {
        progressCallback: ({ loaded, total }) => {
          const percent = Math.round((loaded / total) * 100);
          if (percent % 10 === 0) { // Log every 10%
            log(`Download progress: ${percent}%`);
          }
          setStatus(`Loading model: ${percent}%`, 'loading');
        },
      });
      
      this.metrics.loadTime = performance.now() - startTime;
      this.modelLoaded = true;
      
      log(`Model loaded in ${this.metrics.loadTime.toFixed(2)}ms`, 'info');
      setStatus('Model loaded successfully', 'ready');
      
      return true;
    } catch (error) {
      log(`Model loading error: ${error.message}`, 'error');
      setStatus(`Error: ${error.message}`, 'error');
      throw error;
    }
  }

  async generate(prompt, options = {}) {
    if (!this.modelLoaded) {
      throw new Error('Model not loaded');
    }

    try {
      log(`Generating response for: "${prompt}"`);
      setStatus('Generating...', 'loading');
      
      const startTime = performance.now();
      let firstTokenTime = 0;
      let tokenCount = 0;
      let response = '';
      
      // Generate text with streaming
      const result = await this.wllama.createCompletion(prompt, {
        nPredict: options.maxTokens || 50,
        temp: options.temperature || 0.7,
        onNewToken: (token, piece, currentText) => {
          tokenCount++;
          response = currentText;
          
          if (tokenCount === 1) {
            firstTokenTime = performance.now();
            this.metrics.ttft = firstTokenTime - startTime;
            log(`First token generated in ${this.metrics.ttft.toFixed(2)}ms`);
          }
        },
      });
      
      const totalTime = performance.now() - startTime;
      this.metrics.tokensPerSecond = tokenCount / (totalTime / 1000);
      
      // Track memory if available
      if (performance.memory) {
        this.metrics.peakMemory = performance.memory.usedJSHeapSize / (1024 * 1024);
      }
      
      log(`Generated ${tokenCount} tokens in ${totalTime.toFixed(2)}ms`, 'info');
      log(`Speed: ${this.metrics.tokensPerSecond.toFixed(2)} tokens/sec`, 'info');
      setStatus('Generation complete', 'ready');
      
      return response || result;
    } catch (error) {
      log(`Generation error: ${error.message}`, 'error');
      setStatus(`Error: ${error.message}`, 'error');
      throw error;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getRuntimeInfo() {
    return { ...this.runtimeInfo };
  }

  async cleanup() {
    try {
      log('Cleaning up resources...');
      if (this.wllama) {
        await this.wllama.exit();
      }
      this.modelLoaded = false;
      log('Cleanup complete');
    } catch (error) {
      log(`Cleanup error: ${error.message}`, 'error');
    }
  }

  // Helper: Check WASM SIMD support
  async checkWasmSIMD() {
    try {
      return WebAssembly.validate(new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3,
        2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
      ]));
    } catch {
      return false;
    }
  }
}

// Initialize and expose API
(async () => {
  try {
    log('Starting Wllama test page...');
    
    const api = new WllamaTestAPI();
    await api.initialize();
    
    // Expose to window for Playwright tests
    window.testAPI = api;
    
    // Update UI
    const infoEl = document.getElementById('info');
    infoEl.style.display = 'block';
    
    const runtimeInfo = api.getRuntimeInfo();
    document.getElementById('runtime-name').textContent = runtimeInfo.name;
    document.getElementById('runtime-version').textContent = runtimeInfo.version;
    document.getElementById('runtime-backend').textContent = runtimeInfo.backend;
    document.getElementById('wasm-simd').textContent = 
      runtimeInfo.backend === 'wasm-simd' ? 'Supported' : 'Not supported';
    
    setStatus('Ready for testing', 'ready');
    log('Test page ready', 'info');
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    setStatus(`Fatal error: ${error.message}`, 'error');
  }
})();
