# Phase 2: Data Processing Scripts

This directory contains scripts for validating, aggregating, and exporting test results.

## Scripts

### 1. validate-results.js

Validates test result JSON files against the schema.

```bash
# Validate all results in default directory
node scripts/validate-results.js

# Validate specific file
node scripts/validate-results.js results/raw/test-result.json

# Validate specific directory
node scripts/validate-results.js results/raw/
```

**Features:**
- JSON Schema validation with detailed error reporting
- Recursive directory scanning
- Success/failure statistics
- Exit code 1 if any validation fails (CI-friendly)

### 2. aggregate-results.js

Aggregates multiple test results into summary statistics.

```bash
# Aggregate with default paths
node scripts/aggregate-results.js

# Specify custom input/output
node scripts/aggregate-results.js --input results/raw --output results/processed
```

**Features:**
- Groups results by runtime and model
- Calculates statistical metrics (mean, median, percentiles, std dev)
- Generates comparison data
- Identifies top performers
- Outputs:
  - `aggregated.json` - Detailed statistics per runtime/model
  - `comparison.json` - Simplified comparison table
  - `summary.json` - High-level summary with top performers

**Generated Statistics:**
- Load time: min, max, mean, median, P50/P90/P95/P99, std dev
- TTFT: min, max, mean, median, P50/P90/P95/P99, std dev
- Tokens/sec: min, max, mean, median, P50/P90/P95/P99, std dev
- Peak memory: min, max, mean, median, P50/P90/P95/P99, std dev

### 3. export-results.js

Exports aggregated results to various formats.

```bash
# Export to all formats
node scripts/export-results.js --format all

# Export to CSV only
node scripts/export-results.js --format csv

# Export to Markdown only
node scripts/export-results.js --format markdown

# Custom paths
node scripts/export-results.js --format all --input results/processed --output results/processed
```

**Output Files:**

**CSV Format:**
- `comparison.csv` - Quick comparison table
- `detailed-stats.csv` - Full statistics with percentiles

**Markdown Format:**
- `RESULTS.md` - Comprehensive report with:
  - Summary statistics
  - Top performers table
  - Full comparison table
  - Detailed per-runtime statistics

## Workflow

Typical workflow for processing test results:

```bash
# 1. Run tests (generates results in results/raw/)
cd automation
pnpm test

# 2. Validate results
node scripts/validate-results.js

# 3. Aggregate results
node scripts/aggregate-results.js

# 4. Export to formats
node scripts/export-results.js --format all
```

## CI/CD Integration

These scripts are designed for CI/CD workflows:

```yaml
# Example GitHub Actions workflow
- name: Validate Results
  run: node scripts/validate-results.js
  
- name: Aggregate Results
  run: node scripts/aggregate-results.js
  
- name: Export Results
  run: node scripts/export-results.js --format all
  
- name: Upload Artifacts
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: results/processed/
```

## Dependencies

These scripts use:
- `ajv` - JSON Schema validation
- `ajv-formats` - Schema format validation (date-time, uri, etc.)

Install with:
```bash
pnpm add -D ajv ajv-formats
```

## Data Flow

```
Test Execution → results/raw/*.json
       ↓
    Validation (validate-results.js)
       ↓
   Aggregation (aggregate-results.js)
       ↓
results/processed/aggregated.json
results/processed/comparison.json
results/processed/summary.json
       ↓
    Export (export-results.js)
       ↓
results/processed/comparison.csv
results/processed/detailed-stats.csv
results/processed/RESULTS.md
```

## Example Output

### Summary (summary.json)
```json
{
  "generatedAt": "2025-11-12T10:00:00.000Z",
  "totalResults": 48,
  "runtimesTested": 4,
  "topPerformers": {
    "fastestTokensPerSecond": {
      "runtime": "web-llm",
      "backend": "webgpu",
      "avgTokensPerSecond": 85.3
    }
  }
}
```

### Comparison (comparison.json)
```json
[
  {
    "runtime": "web-llm",
    "backend": "webgpu",
    "quantization": "q0f32",
    "testCount": 12,
    "avgLoadTime": 180000,
    "avgTTFT": 150,
    "avgTokensPerSecond": 85.3,
    "avgPeakMemory": 2048
  }
]
```

## Error Handling

All scripts include comprehensive error handling:
- Graceful failures for missing files
- Detailed error messages
- Appropriate exit codes for CI/CD
- Warning messages for non-critical issues

## Future Enhancements

Planned improvements:
- [ ] Performance regression detection
- [ ] Trend analysis over time
- [ ] Automated alerts for performance degradation
- [ ] Interactive HTML reports
- [ ] Database storage for historical data
