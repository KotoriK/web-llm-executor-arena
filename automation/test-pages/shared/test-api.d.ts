/**
 * Unified Test API interface for all runtime test pages
 * Each runtime implementation must conform to this interface
 */

export interface RuntimeConfig {
  modelId?: string;
  modelUrl?: string;
  [key: string]: any;
}

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  [key: string]: any;
}

export interface PerformanceMetrics {
  loadTime: number;
  ttft: number;
  tokensPerSecond: number;
  peakMemory?: number;
  avgLatency?: number;
}

export interface RuntimeInfo {
  name: string;
  version: string;
  backend: string;
  [key: string]: any;
}

/**
 * Unified Test API that all runtime test pages must implement
 */
export interface TestPageAPI {
  /**
   * Initialize the runtime with optional configuration
   */
  initialize(config?: RuntimeConfig): Promise<boolean>;

  /**
   * Load a model (URL or ID depending on runtime)
   */
  loadModel(modelUrlOrId: string): Promise<boolean>;

  /**
   * Generate text from a prompt
   */
  generate(prompt: string, options?: GenerateOptions): Promise<string>;

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics;

  /**
   * Get runtime information
   */
  getRuntimeInfo(): RuntimeInfo;

  /**
   * Cleanup resources
   */
  cleanup(): Promise<void>;
}

declare global {
  interface Window {
    testAPI: TestPageAPI;
  }
}
