import { pipeline, env } from '@huggingface/transformers';
import { checkWasmSIMD, createLogger, createStatusUpdater } from '../shared/utils.js';

const log = createLogger('log');
const setStatus = createStatusUpdater('status');

/**
 * Transformers.js Test API Implementation
 */
class TransformersTestAPI {
  constructor() {
    this.pipeline = null;
    this.modelLoaded = false;
    this.metrics = {
      loadTime: 0,
      ttft: 0,
      tokensPerSecond: 0,
      peakMemory: 0,
    };
    this.runtimeInfo = {
      name: 'transformers',
      version: '3.0.2',
      backend: 'wasm',
    };
  }

  async initialize(config = {}) {
    try {
      log('Initializing Transformers.js...');
      
      // Configure environment
      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      
      // Check for WebGPU support
      const webgpuSupported = 'gpu' in navigator;
      
      // Check for WebNN support
      const webnnSupported = 'ml' in navigator;
      
      // Check WASM SIMD support
      const simdSupported = await checkWasmSIMD();
      
      // Determine backend
      if (webgpuSupported && config.backend !== 'wasm') {
        this.runtimeInfo.backend = 'webgpu';
        log('Using WebGPU backend');
      } else if (webnnSupported && config.backend === 'webnn') {
        this.runtimeInfo.backend = 'webnn';
        log('Using WebNN backend (experimental)');
      } else {
        this.runtimeInfo.backend = simdSupported ? 'wasm-simd' : 'wasm';
        log(`Using WASM backend (SIMD: ${simdSupported ? 'Yes' : 'No'})`);
      }
      
      // Update runtime info display
      document.getElementById('backend').textContent = this.runtimeInfo.backend;
      document.getElementById('wasm-simd').textContent = simdSupported ? 'Yes' : 'No';
      document.getElementById('webgpu').textContent = webgpuSupported ? 'Yes' : 'No';
      document.getElementById('webnn').textContent = webnnSupported ? 'Yes (experimental)' : 'No';
      
      log('Transformers.js initialized successfully', 'info');
      
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
      
      // Create text generation pipeline
      this.pipeline = await pipeline('text-generation', modelId, {
        progress_callback: (progress) => {
          if (progress.status === 'downloading') {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            log(`Downloading: ${progress.file} - ${percent}%`);
            setStatus(`Loading model: ${percent}%`, 'loading');
          } else if (progress.status === 'ready') {
            log(`Model file ready: ${progress.file}`);
          }
        },
      });
      
      this.metrics.loadTime = performance.now() - startTime;
      this.modelLoaded = true;
      
      log(`Model loaded in ${this.metrics.loadTime.toFixed(2)}ms`, 'info');
      setStatus('Model loaded successfully', 'ready');
      
      return true;
    } catch (error) {
      log(`Model loading error: ${error.message}`, 'error');
      setStatus('Failed to load model', 'error');
      throw error;
    }
  }

  async generate(prompt, options = {}) {
    if (!this.modelLoaded || !this.pipeline) {
      throw new Error('Model not loaded');
    }

    try {
      log(`Generating response for prompt: "${prompt}"`);
      setStatus('Generating...', 'generating');
      
      const maxTokens = options.maxTokens || 50;
      const startTime = performance.now();
      let firstTokenTime = null;
      let tokenCount = 0;
      let generatedText = '';
      
      // Generate text
      const result = await this.pipeline(prompt, {
        max_new_tokens: maxTokens,
        temperature: options.temperature || 0.7,
        do_sample: true,
        callback_function: (output) => {
          if (!firstTokenTime) {
            firstTokenTime = performance.now();
            this.metrics.ttft = firstTokenTime - startTime;
          }
          tokenCount++;
          // Update UI with partial output
          const text = output[0].generated_text || '';
          generatedText = text;
          document.getElementById('output').textContent = text;
        },
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      generatedText = result[0].generated_text;
      
      // Calculate metrics
      if (!firstTokenTime) {
        firstTokenTime = endTime;
        this.metrics.ttft = totalTime;
      }
      
      const generationTime = endTime - firstTokenTime;
      this.metrics.tokensPerSecond = tokenCount / (generationTime / 1000);
      
      // Update metrics display
      document.getElementById('load-time').textContent = `${this.metrics.loadTime.toFixed(2)}ms`;
      document.getElementById('ttft').textContent = `${this.metrics.ttft.toFixed(2)}ms`;
      document.getElementById('tokens-per-sec').textContent = this.metrics.tokensPerSecond.toFixed(2);
      document.getElementById('total-tokens').textContent = tokenCount;
      
      log(`Generation complete: ${tokenCount} tokens in ${totalTime.toFixed(2)}ms`, 'info');
      log(`TTFT: ${this.metrics.ttft.toFixed(2)}ms, Tokens/sec: ${this.metrics.tokensPerSecond.toFixed(2)}`);
      setStatus('Generation complete', 'ready');
      
      return generatedText;
    } catch (error) {
      log(`Generation error: ${error.message}`, 'error');
      setStatus('Generation failed', 'error');
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
      
      if (this.pipeline) {
        // Dispose of the pipeline
        this.pipeline.dispose?.();
        this.pipeline = null;
      }
      
      this.modelLoaded = false;
      log('Cleanup complete');
      
      return true;
    } catch (error) {
      log(`Cleanup error: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Create and expose API
const testAPI = new TransformersTestAPI();
window.testAPI = testAPI;

// Auto-initialize when page loads
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await testAPI.initialize();
    log('Ready for testing');
  } catch (error) {
    log(`Failed to initialize: ${error.message}`, 'error');
  }
});
