import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';
import { checkWasmSIMD, createLogger, createStatusUpdater } from '../shared/utils.js';

const log = createLogger('log');
const setStatus = createStatusUpdater('status');

/**
 * MediaPipe Tasks GenAI Test API Implementation
 */
class MediaPipeTestAPI {
  constructor() {
    this.llmInference = null;
    this.modelLoaded = false;
    this.metrics = {
      loadTime: 0,
      ttft: 0,
      tokensPerSecond: 0,
      peakMemory: 0,
    };
    this.runtimeInfo = {
      name: 'mediapipe',
      version: '0.10.17',
      backend: 'tflite',
    };
  }

  async initialize(config = {}) {
    try {
      log('Initializing MediaPipe Tasks GenAI...');
      
      // Initialize the Wasm module
      const genaiFileset = await FilesetResolver.forGenAiTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm'
      );
      
      // Check for WebGPU support
      const webgpuSupported = 'gpu' in navigator;
      
      // Check WASM SIMD support
      const simdSupported = await checkWasmSIMD();
      
      // Determine backend
      if (webgpuSupported && config.backend === 'webgpu') {
        this.runtimeInfo.backend = 'tflite-webgpu';
        log('Using TFLite with WebGPU acceleration');
      } else {
        this.runtimeInfo.backend = simdSupported ? 'tflite-simd' : 'tflite';
        log(`Using TFLite backend (SIMD: ${simdSupported ? 'Yes' : 'No'})`);
      }
      
      // Update runtime info display
      document.getElementById('backend').textContent = this.runtimeInfo.backend;
      document.getElementById('wasm-simd').textContent = simdSupported ? 'Yes' : 'No';
      document.getElementById('webgpu').textContent = webgpuSupported ? 'Yes' : 'No';
      
      log('MediaPipe initialized successfully', 'info');
      
      this.genaiFileset = genaiFileset;
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
      
      // Download model file
      log('Downloading model...');
      const response = await fetch(modelUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.statusText}`);
      }
      
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const total = parseInt(contentLength, 10);
        const reader = response.body.getReader();
        let loaded = 0;
        const chunks = [];
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          chunks.push(value);
          loaded += value.length;
          
          const percent = Math.round((loaded / total) * 100);
          if (percent % 10 === 0) {
            log(`Download progress: ${percent}%`);
          }
          setStatus(`Loading model: ${percent}%`, 'loading');
        }
        
        // Combine chunks
        const blob = new Blob(chunks);
        const arrayBuffer = await blob.arrayBuffer();
        const modelAsset = new Uint8Array(arrayBuffer);
        
        // Create LLM inference instance
        this.llmInference = await LlmInference.createFromOptions(this.genaiFileset, {
          baseOptions: {
            modelAssetBuffer: modelAsset,
          },
          maxTokens: 512,
          topK: 40,
          temperature: 0.8,
          randomSeed: 0,
        });
      } else {
        // Fallback: load directly without progress
        log('Downloading model (size unknown)...');
        const arrayBuffer = await response.arrayBuffer();
        const modelAsset = new Uint8Array(arrayBuffer);
        
        this.llmInference = await LlmInference.createFromOptions(this.genaiFileset, {
          baseOptions: {
            modelAssetBuffer: modelAsset,
          },
          maxTokens: 512,
          topK: 40,
          temperature: 0.8,
          randomSeed: 0,
        });
      }
      
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
    if (!this.modelLoaded || !this.llmInference) {
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
      
      // Generate text with streaming
      const outputElem = document.getElementById('output');
      
      // Use the streaming API
      this.llmInference.generateResponse(prompt, (partialResult, done) => {
        if (!firstTokenTime) {
          firstTokenTime = performance.now();
          this.metrics.ttft = firstTokenTime - startTime;
        }
        
        generatedText = partialResult;
        tokenCount = partialResult.split(/\s+/).length; // Approximate token count
        
        // Update UI
        if (outputElem) {
          outputElem.textContent = partialResult;
        }
        
        if (done) {
          const endTime = performance.now();
          const totalTime = endTime - startTime;
          const generationTime = endTime - (firstTokenTime || startTime);
          
          // Calculate metrics
          this.metrics.tokensPerSecond = tokenCount / (generationTime / 1000);
          
          // Update metrics display
          document.getElementById('load-time').textContent = `${this.metrics.loadTime.toFixed(2)}ms`;
          document.getElementById('ttft').textContent = `${this.metrics.ttft.toFixed(2)}ms`;
          document.getElementById('tokens-per-sec').textContent = this.metrics.tokensPerSecond.toFixed(2);
          document.getElementById('total-tokens').textContent = tokenCount;
          
          log(`Generation complete: ${tokenCount} tokens in ${totalTime.toFixed(2)}ms`, 'info');
          log(`TTFT: ${this.metrics.ttft.toFixed(2)}ms, Tokens/sec: ${this.metrics.tokensPerSecond.toFixed(2)}`);
          setStatus('Generation complete', 'ready');
        }
      });
      
      // Wait for generation to complete
      await new Promise((resolve) => {
        const checkDone = setInterval(() => {
          if (generatedText.length > 0) {
            clearInterval(checkDone);
            resolve();
          }
        }, 100);
        
        // Timeout after 60 seconds
        setTimeout(() => {
          clearInterval(checkDone);
          resolve();
        }, 60000);
      });
      
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
      
      if (this.llmInference) {
        this.llmInference.close();
        this.llmInference = null;
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
const testAPI = new MediaPipeTestAPI();
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
