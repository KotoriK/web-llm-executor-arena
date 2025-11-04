import * as webllm from '@mlc-ai/web-llm';

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
 * Web-LLM Test API Implementation
 */
class WebLLMTestAPI {
  constructor() {
    this.engine = null;
    this.modelLoaded = false;
    this.metrics = {
      loadTime: 0,
      ttft: 0,
      tokensPerSecond: 0,
      peakMemory: 0,
    };
    this.runtimeInfo = {
      name: 'web-llm',
      version: '0.2.46',
      backend: 'unknown',
    };
    this.currentModelId = null;
  }

  async initialize(config = {}) {
    try {
      log('Initializing Web-LLM...');
      
      // Check WebGPU support
      const hasWebGPU = !!navigator.gpu;
      log(`WebGPU support: ${hasWebGPU ? 'Yes' : 'No'}`, hasWebGPU ? 'success' : 'warn');
      
      if (hasWebGPU) {
        try {
          const adapter = await navigator.gpu.requestAdapter();
          if (adapter) {
            const info = adapter.info || adapter;
            log(`GPU: ${info.vendor || 'Unknown'} ${info.device || info.architecture || ''}`, 'info');
            this.runtimeInfo.backend = 'webgpu';
          }
        } catch (e) {
          log(`Could not get GPU info: ${e.message}`, 'warn');
        }
      }
      
      if (!hasWebGPU) {
        log('Falling back to WASM backend', 'warn');
        this.runtimeInfo.backend = 'wasm';
      }
      
      // Create engine with progress callback
      this.engine = await webllm.CreateMLCEngine(
        config.modelId || 'Qwen2.5-0.5B-Instruct-q0f32-MLC',
        {
          initProgressCallback: (progress) => {
            if (progress.progress) {
              const percent = Math.round(progress.progress * 100);
              log(`${progress.text || 'Loading'}: ${percent}%`);
              setStatus(`${progress.text || 'Loading'}: ${percent}%`, 'loading');
            } else {
              log(progress.text || 'Processing...');
            }
          },
        }
      );
      
      log('Web-LLM engine created successfully', 'success');
      return true;
    } catch (error) {
      log(`Initialization error: ${error.message}`, 'error');
      throw error;
    }
  }

  async loadModel(modelId) {
    try {
      log(`Loading model: ${modelId}`);
      setStatus('Loading model...', 'loading');
      
      const startTime = performance.now();
      this.currentModelId = modelId;
      
      // Model is loaded during engine creation in Web-LLM
      // If engine exists, we need to reload with new model
      if (this.engine && this.currentModelId !== modelId) {
        log('Reloading engine with new model...');
        this.engine = await webllm.CreateMLCEngine(modelId, {
          initProgressCallback: (progress) => {
            if (progress.progress) {
              const percent = Math.round(progress.progress * 100);
              setStatus(`Loading: ${percent}%`, 'loading');
            }
          },
        });
      }
      
      this.metrics.loadTime = performance.now() - startTime;
      this.modelLoaded = true;
      
      log(`Model loaded in ${(this.metrics.loadTime / 1000).toFixed(2)}s`, 'success');
      setStatus('Model loaded successfully', 'ready');
      
      return true;
    } catch (error) {
      log(`Model loading error: ${error.message}`, 'error');
      setStatus(`Error: ${error.message}`, 'error');
      throw error;
    }
  }

  async generate(prompt, options = {}) {
    if (!this.engine) {
      throw new Error('Engine not initialized');
    }

    try {
      log(`Generating response for: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
      setStatus('Generating...', 'loading');
      
      const startTime = performance.now();
      let firstTokenTime = 0;
      let tokenCount = 0;
      let response = '';
      
      // Generate with streaming
      const completion = await this.engine.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 50,
        temperature: options.temperature || 0.7,
        stream: true,
      });
      
      for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          tokenCount++;
          response += delta;
          
          if (tokenCount === 1) {
            firstTokenTime = performance.now();
            this.metrics.ttft = firstTokenTime - startTime;
            log(`First token generated in ${this.metrics.ttft.toFixed(2)}ms`);
          }
        }
      }
      
      const totalTime = performance.now() - startTime;
      this.metrics.tokensPerSecond = tokenCount / (totalTime / 1000);
      
      // Track memory if available
      if (performance.memory) {
        this.metrics.peakMemory = performance.memory.usedJSHeapSize / (1024 * 1024);
      }
      
      log(`Generated ${tokenCount} tokens in ${totalTime.toFixed(2)}ms`, 'success');
      log(`Speed: ${this.metrics.tokensPerSecond.toFixed(2)} tokens/sec`, 'info');
      setStatus('Generation complete', 'ready');
      
      return response;
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
      // Web-LLM doesn't have explicit cleanup in current API
      // Engine will be garbage collected
      this.modelLoaded = false;
      log('Cleanup complete');
    } catch (error) {
      log(`Cleanup error: ${error.message}`, 'error');
    }
  }
}

// Initialize and expose API
(async () => {
  try {
    log('Starting Web-LLM test page...', 'info');
    
    // Check WebGPU support before initializing
    const hasWebGPU = !!navigator.gpu;
    const webgpuStatusEl = document.getElementById('webgpu-status');
    
    if (hasWebGPU) {
      webgpuStatusEl.innerHTML = 'Supported <span class="badge success">✓</span>';
      
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          const info = adapter.info || adapter;
          const gpuInfoEl = document.getElementById('gpu-info');
          gpuInfoEl.textContent = `${info.vendor || 'Unknown'} ${info.device || info.architecture || 'GPU'}`;
        }
      } catch (e) {
        log(`GPU adapter error: ${e.message}`, 'warn');
      }
    } else {
      webgpuStatusEl.innerHTML = 'Not supported <span class="badge warning">⚠</span>';
      document.getElementById('gpu-info').textContent = 'N/A (WASM fallback)';
      log('WebGPU not available, will use WASM backend', 'warn');
    }
    
    const api = new WebLLMTestAPI();
    
    // Note: We don't initialize here because it would download the model
    // Tests will call initialize() with the model they want to test
    window.testAPI = api;
    
    // Update UI
    const infoEl = document.getElementById('info');
    infoEl.style.display = 'block';
    
    document.getElementById('runtime-name').textContent = api.runtimeInfo.name;
    document.getElementById('runtime-version').textContent = api.runtimeInfo.version;
    document.getElementById('runtime-backend').textContent = hasWebGPU ? 'WebGPU (preferred)' : 'WASM (fallback)';
    
    setStatus('Ready for testing (call initialize with model)', 'ready');
    log('Test page ready', 'success');
  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    setStatus(`Fatal error: ${error.message}`, 'error');
  }
})();
