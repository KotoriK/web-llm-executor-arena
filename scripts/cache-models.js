#!/usr/bin/env node

/**
 * Pre-cache models for all runtimes
 * This script downloads and caches models to avoid download time during tests
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Model configurations
const models = {
  wllama: {
    name: 'qwen2.5-0.5b-instruct-q8_0.gguf',
    url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q8_0.gguf',
    size: 524288000, // ~500MB
  },
  // Note: web-llm and transformers download models automatically to browser cache
  // mediapipe models are also downloaded automatically
};

const cacheDir = path.join(__dirname, '../.model-cache');

/**
 * Download a file with progress
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    
    console.log(`Downloading: ${path.basename(destPath)}`);
    console.log(`URL: ${url}`);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloaded = 0;
      let lastPercent = 0;
      
      response.on('data', (chunk) => {
        downloaded += chunk.length;
        const percent = Math.floor((downloaded / totalSize) * 100);
        if (percent !== lastPercent && percent % 10 === 0) {
          console.log(`Progress: ${percent}% (${(downloaded / 1024 / 1024).toFixed(1)}MB / ${(totalSize / 1024 / 1024).toFixed(1)}MB)`);
          lastPercent = percent;
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('✓ Download complete\n');
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

/**
 * Main function
 */
async function main() {
  console.log('=== Model Pre-caching Script ===\n');
  
  // Create cache directory
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log(`Created cache directory: ${cacheDir}\n`);
  }
  
  // Download each model
  for (const [runtime, config] of Object.entries(models)) {
    console.log(`[${runtime.toUpperCase()}]`);
    
    const destPath = path.join(cacheDir, config.name);
    
    // Check if already cached
    if (fs.existsSync(destPath)) {
      const stats = fs.statSync(destPath);
      if (stats.size === config.size) {
        console.log(`✓ Already cached: ${config.name}`);
        console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(1)}MB\n`);
        continue;
      } else {
        console.log(`⚠ Incomplete file found, re-downloading...`);
        fs.unlinkSync(destPath);
      }
    }
    
    try {
      await downloadFile(config.url, destPath);
    } catch (error) {
      console.error(`✗ Failed to download ${config.name}: ${error.message}\n`);
      process.exit(1);
    }
  }
  
  console.log('=== All models cached successfully ===\n');
  console.log('Note: web-llm, transformers, and mediapipe models are cached');
  console.log('automatically by the browser during first test run.\n');
  console.log(`Cache location: ${cacheDir}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
