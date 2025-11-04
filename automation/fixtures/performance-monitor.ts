/**
 * Performance monitoring utilities for tracking metrics
 */

export interface PerformanceMetrics {
  loadTime: number;
  ttft: number;
  tokensPerSecond: number;
  peakMemory?: number;
  avgLatency?: number;
  throughput?: {
    p50: number;
    p90: number;
    p99: number;
  };
}

export class PerformanceMonitor {
  private startTime: number = 0;
  private metrics: Map<string, number[]> = new Map();
  private memorySnapshots: number[] = [];

  /**
   * Start timing for a specific label
   */
  start(label: string = 'default'): void {
    this.startTime = performance.now();
  }

  /**
   * End timing and record duration
   */
  end(label: string = 'default'): number {
    const duration = performance.now() - this.startTime;
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
    return duration;
  }

  /**
   * Record memory snapshot
   */
  recordMemory(memoryMB: number): void {
    this.memorySnapshots.push(memoryMB);
  }

  /**
   * Calculate percentile from array of numbers
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get average from array of numbers
   */
  private getAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get aggregated metrics
   */
  getMetrics(label: string = 'default'): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return null;

    return {
      avg: this.getAverage(values),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  /**
   * Get peak memory usage
   */
  getPeakMemory(): number {
    if (this.memorySnapshots.length === 0) return 0;
    return Math.max(...this.memorySnapshots);
  }

  /**
   * Calculate throughput percentiles
   */
  getThroughputPercentiles(tokenCounts: number[]): { p50: number; p90: number; p99: number } {
    return {
      p50: this.calculatePercentile(tokenCounts, 50),
      p90: this.calculatePercentile(tokenCounts, 90),
      p99: this.calculatePercentile(tokenCounts, 99),
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.memorySnapshots = [];
    this.startTime = 0;
  }
}

/**
 * In-browser performance monitor that can be injected into test pages
 */
export const browserPerformanceMonitor = `
class BrowserPerformanceMonitor {
  constructor() {
    this.startTime = 0;
    this.firstTokenTime = 0;
    this.tokenCount = 0;
    this.tokenTimes = [];
  }

  startLoad() {
    this.startTime = performance.now();
  }

  endLoad() {
    return performance.now() - this.startTime;
  }

  startGeneration() {
    this.startTime = performance.now();
    this.tokenCount = 0;
    this.tokenTimes = [];
    this.firstTokenTime = 0;
  }

  recordToken() {
    this.tokenCount++;
    const now = performance.now();
    if (this.tokenCount === 1) {
      this.firstTokenTime = now;
    }
    this.tokenTimes.push(now);
  }

  endGeneration() {
    const endTime = performance.now();
    const totalTime = endTime - this.startTime;
    const ttft = this.firstTokenTime - this.startTime;
    const tokensPerSecond = this.tokenCount / (totalTime / 1000);
    const avgLatency = this.tokenCount > 0 ? totalTime / this.tokenCount : 0;

    return {
      totalTime,
      ttft,
      tokensPerSecond,
      avgLatency,
      tokenCount: this.tokenCount,
    };
  }

  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize / (1024 * 1024), // MB
        total: performance.memory.totalJSHeapSize / (1024 * 1024),
        limit: performance.memory.jsHeapSizeLimit / (1024 * 1024),
      };
    }
    return null;
  }
}

window.perfMonitor = new BrowserPerformanceMonitor();
`;
