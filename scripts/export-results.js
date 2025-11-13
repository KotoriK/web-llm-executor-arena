#!/usr/bin/env node

/**
 * Export Results Script
 * Exports aggregated results to various formats (CSV, Markdown)
 * 
 * Usage:
 *   node scripts/export-results.js --format csv
 *   node scripts/export-results.js --format markdown
 *   node scripts/export-results.js --format all
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
    format: 'all',
    input: path.join(__dirname, '../results/processed'),
    output: path.join(__dirname, '../results/processed'),
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      options.format = args[i + 1];
      i++;
    } else if (args[i] === '--input' && args[i + 1]) {
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
 * Load aggregated data
 */
async function loadData(inputDir) {
  const comparisonPath = path.join(inputDir, 'comparison.json');
  const aggregatedPath = path.join(inputDir, 'aggregated.json');
  const summaryPath = path.join(inputDir, 'summary.json');
  
  const [comparison, aggregated, summary] = await Promise.all([
    fs.readFile(comparisonPath, 'utf-8').then(JSON.parse).catch(() => null),
    fs.readFile(aggregatedPath, 'utf-8').then(JSON.parse).catch(() => null),
    fs.readFile(summaryPath, 'utf-8').then(JSON.parse).catch(() => null),
  ]);
  
  return { comparison, aggregated, summary };
}

/**
 * Export to CSV format
 */
function exportToCSV(data) {
  if (!data.comparison) {
    throw new Error('No comparison data available');
  }
  
  const headers = [
    'Runtime',
    'Backend',
    'Quantization',
    'Test Count',
    'Avg Load Time (ms)',
    'Avg TTFT (ms)',
    'Avg Tokens/sec',
    'Avg Peak Memory (MB)',
  ];
  
  const rows = data.comparison.map(item => [
    item.runtime,
    item.backend,
    item.quantization,
    item.testCount,
    item.avgLoadTime?.toFixed(2) || 'N/A',
    item.avgTTFT?.toFixed(2) || 'N/A',
    item.avgTokensPerSecond?.toFixed(2) || 'N/A',
    item.avgPeakMemory?.toFixed(2) || 'N/A',
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csv;
}

/**
 * Export detailed stats to CSV
 */
function exportDetailedStatsToCSV(data) {
  if (!data.aggregated) {
    throw new Error('No aggregated data available');
  }
  
  const headers = [
    'Runtime',
    'Backend',
    'Model',
    'Quantization',
    'Test Count',
    'Load Time - Mean (ms)',
    'Load Time - Median (ms)',
    'Load Time - P90 (ms)',
    'TTFT - Mean (ms)',
    'TTFT - Median (ms)',
    'TTFT - P90 (ms)',
    'Tokens/sec - Mean',
    'Tokens/sec - Median',
    'Tokens/sec - P90',
  ];
  
  const rows = data.aggregated.map(item => [
    item.runtime,
    item.backend,
    item.model,
    item.quantization,
    item.testCount,
    item.performance.loadTime?.mean?.toFixed(2) || 'N/A',
    item.performance.loadTime?.median?.toFixed(2) || 'N/A',
    item.performance.loadTime?.p90?.toFixed(2) || 'N/A',
    item.performance.ttft?.mean?.toFixed(2) || 'N/A',
    item.performance.ttft?.median?.toFixed(2) || 'N/A',
    item.performance.ttft?.p90?.toFixed(2) || 'N/A',
    item.performance.tokensPerSecond?.mean?.toFixed(2) || 'N/A',
    item.performance.tokensPerSecond?.median?.toFixed(2) || 'N/A',
    item.performance.tokensPerSecond?.p90?.toFixed(2) || 'N/A',
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csv;
}

/**
 * Export to Markdown format
 */
function exportToMarkdown(data) {
  if (!data.comparison || !data.summary) {
    throw new Error('Missing comparison or summary data');
  }
  
  const lines = [];
  
  // Title
  lines.push('# Web LLM Executor Arena - Performance Results\n');
  lines.push(`Generated: ${new Date(data.summary.generatedAt).toLocaleString()}\n`);
  
  // Summary
  lines.push('## Summary\n');
  lines.push(`- **Total Results**: ${data.summary.totalResults}`);
  lines.push(`- **Runtimes Tested**: ${data.summary.runtimesTested}`);
  lines.push(`- **Date Range**: ${new Date(data.summary.dateRange.first).toLocaleDateString()} - ${new Date(data.summary.dateRange.last).toLocaleDateString()}\n`);
  
  // Top Performers
  lines.push('## 🏆 Top Performers\n');
  lines.push('| Metric | Runtime | Backend | Value |');
  lines.push('|--------|---------|---------|-------|');
  
  const top = data.summary.topPerformers;
  lines.push(`| Fastest Tokens/sec | ${top.fastestTokensPerSecond.runtime} | ${top.fastestTokensPerSecond.backend} | ${top.fastestTokensPerSecond.avgTokensPerSecond?.toFixed(2) || 'N/A'} t/s |`);
  lines.push(`| Fastest TTFT | ${top.fastestTTFT.runtime} | ${top.fastestTTFT.backend} | ${top.fastestTTFT.avgTTFT?.toFixed(2) || 'N/A'} ms |`);
  lines.push(`| Fastest Load | ${top.fastestLoad.runtime} | ${top.fastestLoad.backend} | ${(top.fastestLoad.avgLoadTime / 1000)?.toFixed(2) || 'N/A'} s |`);
  lines.push('');
  
  // Comparison Table
  lines.push('## Performance Comparison\n');
  lines.push('| Runtime | Backend | Quant | Tests | Load (s) | TTFT (ms) | Tokens/sec | Memory (MB) |');
  lines.push('|---------|---------|-------|-------|----------|-----------|------------|-------------|');
  
  for (const item of data.comparison) {
    const load = item.avgLoadTime ? (item.avgLoadTime / 1000).toFixed(2) : 'N/A';
    const ttft = item.avgTTFT?.toFixed(2) || 'N/A';
    const tps = item.avgTokensPerSecond?.toFixed(2) || 'N/A';
    const mem = item.avgPeakMemory?.toFixed(2) || 'N/A';
    
    lines.push(`| ${item.runtime} | ${item.backend} | ${item.quantization} | ${item.testCount} | ${load} | ${ttft} | ${tps} | ${mem} |`);
  }
  lines.push('');
  
  // Detailed Statistics (if available)
  if (data.aggregated) {
    lines.push('## Detailed Statistics\n');
    
    for (const agg of data.aggregated) {
      lines.push(`### ${agg.runtime} (${agg.backend}, ${agg.quantization})\n`);
      lines.push(`**Model**: ${agg.model}  `);
      lines.push(`**Tests**: ${agg.testCount}  `);
      lines.push(`**Environments**: ${agg.environments.platforms.join(', ')}\n`);
      
      lines.push('#### Performance Metrics\n');
      
      // Load Time
      if (agg.performance.loadTime) {
        const lt = agg.performance.loadTime;
        lines.push('**Load Time (ms)**');
        lines.push('| Metric | Value |');
        lines.push('|--------|-------|');
        lines.push(`| Mean | ${lt.mean?.toFixed(2)} |`);
        lines.push(`| Median | ${lt.median?.toFixed(2)} |`);
        lines.push(`| Min | ${lt.min?.toFixed(2)} |`);
        lines.push(`| Max | ${lt.max?.toFixed(2)} |`);
        lines.push(`| Std Dev | ${lt.stdDev?.toFixed(2)} |`);
        lines.push('');
      }
      
      // Tokens per second
      if (agg.performance.tokensPerSecond) {
        const tps = agg.performance.tokensPerSecond;
        lines.push('**Tokens per Second**');
        lines.push('| Metric | Value |');
        lines.push('|--------|-------|');
        lines.push(`| Mean | ${tps.mean?.toFixed(2)} |`);
        lines.push(`| Median | ${tps.median?.toFixed(2)} |`);
        lines.push(`| P90 | ${tps.p90?.toFixed(2)} |`);
        lines.push(`| P95 | ${tps.p95?.toFixed(2)} |`);
        lines.push('');
      }
    }
  }
  
  // Footer
  lines.push('---\n');
  lines.push('*Generated by Web LLM Executor Arena*');
  
  return lines.join('\n');
}

/**
 * Main export function
 */
async function main() {
  const options = parseArgs();
  
  console.log('📤 Result Export Script');
  console.log('='.repeat(50));
  console.log(`Format: ${options.format}`);
  console.log(`Input:  ${options.input}`);
  console.log(`Output: ${options.output}\n`);
  
  // Load data
  console.log('📥 Loading data...');
  const data = await loadData(options.input);
  
  if (!data.comparison && !data.aggregated) {
    console.log('❌ No data to export. Run aggregation first!');
    console.log('   Try: node scripts/aggregate-results.js');
    return;
  }
  
  console.log('✅ Data loaded\n');
  
  // Ensure output directory exists
  await fs.mkdir(options.output, { recursive: true });
  
  const formats = options.format === 'all' ? ['csv', 'markdown'] : [options.format];
  
  for (const format of formats) {
    console.log(`📝 Exporting to ${format.toUpperCase()}...`);
    
    try {
      if (format === 'csv') {
        // Export comparison CSV
        const csv = exportToCSV(data);
        const csvPath = path.join(options.output, 'comparison.csv');
        await fs.writeFile(csvPath, csv, 'utf-8');
        console.log(`✅ Saved: ${csvPath}`);
        
        // Export detailed stats CSV
        if (data.aggregated) {
          const detailedCsv = exportDetailedStatsToCSV(data);
          const detailedPath = path.join(options.output, 'detailed-stats.csv');
          await fs.writeFile(detailedPath, detailedCsv, 'utf-8');
          console.log(`✅ Saved: ${detailedPath}`);
        }
      } else if (format === 'markdown' || format === 'md') {
        const markdown = exportToMarkdown(data);
        const mdPath = path.join(options.output, 'RESULTS.md');
        await fs.writeFile(mdPath, markdown, 'utf-8');
        console.log(`✅ Saved: ${mdPath}`);
      } else {
        console.log(`⚠️  Unknown format: ${format}`);
      }
    } catch (error) {
      console.error(`❌ Failed to export ${format}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Export complete!');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
