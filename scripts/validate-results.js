#!/usr/bin/env node

/**
 * Result Validation Script
 * Validates test result JSON files against the schema
 * 
 * Usage:
 *   node scripts/validate-results.js [file-or-directory]
 *   node scripts/validate-results.js results/raw/test-result.json
 *   node scripts/validate-results.js results/raw/
 */

import { promises as fs } from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Load JSON schema
 */
async function loadSchema() {
  const schemaPath = path.join(__dirname, '../results/schema.json');
  const schemaContent = await fs.readFile(schemaPath, 'utf-8');
  return JSON.parse(schemaContent);
}

/**
 * Validate a single result file
 */
async function validateFile(filePath, schema) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    const validate = ajv.compile(schema);
    const valid = validate(data);
    
    return {
      file: path.basename(filePath),
      path: filePath,
      valid,
      errors: validate.errors || [],
      data: valid ? data : null
    };
  } catch (error) {
    return {
      file: path.basename(filePath),
      path: filePath,
      valid: false,
      errors: [{ message: error.message }],
      data: null
    };
  }
}

/**
 * Find all JSON files in a directory
 */
async function findJsonFiles(dirPath) {
  const files = [];
  
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  }
  
  await walk(dirPath);
  return files;
}

/**
 * Main validation function
 */
async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || path.join(__dirname, '../results/raw');
  
  console.log('🔍 Loading schema...');
  const schema = await loadSchema();
  console.log('✅ Schema loaded\n');
  
  // Determine if target is file or directory
  const stats = await fs.stat(target);
  let files = [];
  
  if (stats.isFile()) {
    files = [target];
  } else if (stats.isDirectory()) {
    console.log(`📂 Scanning directory: ${target}`);
    files = await findJsonFiles(target);
    console.log(`Found ${files.length} JSON files\n`);
  }
  
  if (files.length === 0) {
    console.log('⚠️  No JSON files found');
    return;
  }
  
  // Validate all files
  console.log('🔍 Validating files...\n');
  const results = await Promise.all(
    files.map(file => validateFile(file, schema))
  );
  
  // Display results
  let validCount = 0;
  let invalidCount = 0;
  
  for (const result of results) {
    if (result.valid) {
      validCount++;
      console.log(`✅ ${result.file}`);
    } else {
      invalidCount++;
      console.log(`❌ ${result.file}`);
      console.log('   Errors:');
      result.errors.forEach(err => {
        const path = err.instancePath || '/';
        console.log(`   - ${path}: ${err.message}`);
      });
      console.log('');
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Validation Summary');
  console.log('='.repeat(50));
  console.log(`Total files:   ${results.length}`);
  console.log(`Valid:         ${validCount} ✅`);
  console.log(`Invalid:       ${invalidCount} ❌`);
  console.log(`Success rate:  ${((validCount / results.length) * 100).toFixed(1)}%`);
  
  // Exit with error if any files are invalid
  if (invalidCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
