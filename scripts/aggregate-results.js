#!/usr/bin/env node

/**
 * Result Aggregation Script
 * Aggregates multiple test results into summary statistics
 * 
 * Usage:
 *   node scripts/aggregate-results.js
 *   node scripts/aggregate-results.js --input results/raw --output results/processed
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: path.join(__dirname, '../results/raw'),
    output: path.join(__dirname, '../results/processed'),
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      options.input = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[i + 1];
      i++;
    }
  }
  
  return options;
}

/**
 * Find all JSON files in a directory
 */
async function findJsonFiles(dirPath) {
  const files = [];
  
  async function walk(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
      return;
    }
  }
  
  await walk(dirPath);
  return files;
}

/**
 * Load all test results
 */
async function loadResults(files) {
  const results = [];
  
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const data = JSON.parse(content);
      results.push(data);
    } catch (error) {
      console.warn(`⚠️  Failed to load ${path.basename(file)}: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Calculate statistics for an array of numbers
 */
function calculateStats(numbers) {
  if (numbers.length === 0) return null;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / numbers.length;
  
  // Calculate variance and standard deviation
  const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    count: numbers.length,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    mean: mean,
    median: sorted[Math.floor(sorted.length / 2)],
    stdDev: stdDev,
    p50: sorted[Math.floor(sorted.length * 0.50)],
    p90: sorted[Math.floor(sorted.length * 0.90)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
  };
}

/**
 * Group results by runtime and model
 */
function groupResults(results) {
  const grouped = {};
  
  for (const result of results) {
    const key = `${result.runtime.name}_${result.model.quantization}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        runtime: result.runtime.name,
        backend: result.runtime.backend,
        model: result.model.name,
        quantization: result.model.quantization,
        results: []
      };
    }
    
    grouped[key].results.push(result);
  }
  
  return Object.values(grouped);
}

/**
 * Aggregate performance metrics
 */
function aggregateGroup(group) {
  const loadTimes = [];
  const ttfts = [];
  const tokensPerSecond = [];
  const peakMemories = [];
  
  for (const result of group.results) {
    loadTimes.push(result.performance.loadTime);
    ttfts.push(result.performance.ttft);
    tokensPerSecond.push(result.performance.tokensPerSecond);
    if (result.performance.peakMemory) {
      peakMemories.push(result.performance.peakMemory);
    }
  }
  
  return {
    runtime: group.runtime,
    backend: group.backend,
    model: group.model,
    quantization: group.quantization,
    testCount: group.results.length,
    performance: {
      loadTime: calculateStats(loadTimes),
      ttft: calculateStats(ttfts),
      tokensPerSecond: calculateStats(tokensPerSecond),
      peakMemory: peakMemories.length > 0 ? calculateStats(peakMemories) : null,
    },
    environments: extractEnvironmentInfo(group.results),
    firstTest: group.results[0].meta.timestamp,
    lastTest: group.results[group.results.length - 1].meta.timestamp,
  };
}

/**
 * Extract unique environment information
 */
function extractEnvironmentInfo(results) {
  const browsers = new Set();
  const platforms = new Set();
  const backends = new Set();
  
  for (const result of results) {
    browsers.add(`${result.environment.browser.name} ${result.environment.browser.version}`);
    platforms.add(`${result.environment.platform.os} ${result.environment.platform.arch}`);
    backends.add(result.runtime.backend);
  }
  
  return {
    browsers: Array.from(browsers),
    platforms: Array.from(platforms),
    backends: Array.from(backends),
  };
}

/**
 * Generate runtime comparison
 */
function generateComparison(aggregated) {
  return aggregated.map(agg => ({
    runtime: agg.runtime,
    backend: agg.backend,
    quantization: agg.quantization,
    testCount: agg.testCount,
    avgLoadTime: agg.performance.loadTime?.mean,
    avgTTFT: agg.performance.ttft?.mean,
    avgTokensPerSecond: agg.performance.tokensPerSecond?.mean,
    avgPeakMemory: agg.performance.peakMemory?.mean,
  })).sort((a, b) => (b.avgTokensPerSecond || 0) - (a.avgTokensPerSecond || 0));
}

/**
 * Main aggregation function
 */
async function main() {
  const options = parseArgs();
  
  console.log('📊 Result Aggregation Script');
  console.log('='.repeat(50));
  console.log(`Input:  ${options.input}`);
  console.log(`Output: ${options.output}\n`);
  
  // Find all result files
  console.log('🔍 Finding result files...');
  const files = await findJsonFiles(options.input);
  console.log(`Found ${files.length} result files\n`);
  
  if (files.length === 0) {
    console.log('⚠️  No result files found. Run some tests first!');
    return;
  }
  
  // Load all results
  console.log('📥 Loading results...');
  const results = await loadResults(files);
  console.log(`Loaded ${results.length} valid results\n`);
  
  if (results.length === 0) {
    console.log('❌ No valid results to aggregate');
    return;
  }
  
  // Group and aggregate
  console.log('📊 Aggregating results...');
  const grouped = groupResults(results);
  const aggregated = grouped.map(aggregateGroup);
  const comparison = generateComparison(aggregated);
  
  // Ensure output directory exists
  await fs.mkdir(options.output, { recursive: true });
  
  // Save aggregated data
  const aggregatedPath = path.join(options.output, 'aggregated.json');
  await fs.writeFile(
    aggregatedPath,
    JSON.stringify(aggregated, null, 2),
    'utf-8'
  );
  console.log(`✅ Saved: ${aggregatedPath}`);
  
  // Save comparison data
  const comparisonPath = path.join(options.output, 'comparison.json');
  await fs.writeFile(
    comparisonPath,
    JSON.stringify(comparison, null, 2),
    'utf-8'
  );
  console.log(`✅ Saved: ${comparisonPath}`);
  
  // Save summary
  const summary = {
    generatedAt: new Date().toISOString(),
    totalResults: results.length,
    runtimesTested: aggregated.length,
    dateRange: {
      first: results[0].meta.timestamp,
      last: results[results.length - 1].meta.timestamp,
    },
    topPerformers: {
      fastestTokensPerSecond: comparison[0],
      fastestTTFT: [...comparison].sort((a, b) => (a.avgTTFT || Infinity) - (b.avgTTFT || Infinity))[0],
      fastestLoad: [...comparison].sort((a, b) => (a.avgLoadTime || Infinity) - (b.avgLoadTime || Infinity))[0],
    }
  };
  
  const summaryPath = path.join(options.output, 'summary.json');
  await fs.writeFile(
    summaryPath,
    JSON.stringify(summary, null, 2),
    'utf-8'
  );
  console.log(`✅ Saved: ${summaryPath}`);
  
  // Display summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Aggregation Summary');
  console.log('='.repeat(50));
  console.log(`Total results:     ${results.length}`);
  console.log(`Runtimes tested:   ${aggregated.length}`);
  console.log(`\n🏆 Top Performers:`);
  console.log(`Fastest tokens/sec: ${summary.topPerformers.fastestTokensPerSecond.runtime} (${summary.topPerformers.fastestTokensPerSecond.avgTokensPerSecond?.toFixed(2)} t/s)`);
  console.log(`Fastest TTFT:       ${summary.topPerformers.fastestTTFT.runtime} (${summary.topPerformers.fastestTTFT.avgTTFT?.toFixed(2)} ms)`);
  console.log(`Fastest load:       ${summary.topPerformers.fastestLoad.runtime} (${(summary.topPerformers.fastestLoad.avgLoadTime / 1000)?.toFixed(2)} s)`);
  
  console.log('\n✅ Aggregation complete!');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
