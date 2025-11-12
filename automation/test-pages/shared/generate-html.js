#!/usr/bin/env node

/**
 * Generate HTML files from template for each runtime
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.join(__dirname, 'template.html');

const runtimeConfigs = {
  demo: {
    TITLE: 'Demo Runtime Test',
    HEADING: 'Demo Runtime Test Page',
    DESCRIPTION: 'Framework verification with mock implementation',
    EXTRA_INFO: '',
  },
  wllama: {
    TITLE: 'Wllama Test Page',
    HEADING: '@wllama/wllama Test Page',
    DESCRIPTION: 'Testing Qwen2.5-0.5B-Instruct with llama.cpp WASM backend',
    EXTRA_INFO: `      <dt>WASM SIMD:</dt>
      <dd id="wasm-simd">-</dd>`,
  },
  webllm: {
    TITLE: 'Web-LLM Test Page',
    HEADING: '@mlc-ai/web-llm Test Page',
    DESCRIPTION: 'Testing Qwen2.5-0.5B-Instruct with TVM WebGPU/WASM backend',
    EXTRA_INFO: `      <dt>WebGPU:</dt>
      <dd id="webgpu-status">-</dd>
      <dt>GPU Info:</dt>
      <dd id="gpu-info">-</dd>`,
  },
  transformers: {
    TITLE: 'Transformers.js Test Page',
    HEADING: '@huggingface/transformers Test Page',
    DESCRIPTION: 'Testing Qwen2.5-0.5B-Instruct with ONNX Runtime (WASM/WebGPU/WebNN)',
    EXTRA_INFO: `      <dt>Backend:</dt>
      <dd id="backend">-</dd>
      <dt>WASM SIMD:</dt>
      <dd id="wasm-simd">-</dd>
      <dt>WebGPU:</dt>
      <dd id="webgpu">-</dd>
      <dt>WebNN:</dt>
      <dd id="webnn">-</dd>`,
  },
};

async function generateHTML() {
  console.log('Generating HTML files from template...\n');
  
  const template = await fs.readFile(templatePath, 'utf-8');
  
  for (const [runtime, config] of Object.entries(runtimeConfigs)) {
    let html = template;
    
    // Replace placeholders
    for (const [key, value] of Object.entries(config)) {
      html = html.replace(`{{${key}}}`, value);
    }
    
    const outputPath = path.join(__dirname, '..', runtime, 'index.html');
    await fs.writeFile(outputPath, html, 'utf-8');
    
    console.log(`✓ Generated ${runtime}/index.html`);
  }
  
  console.log('\n✓ All HTML files generated successfully');
}

generateHTML().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
