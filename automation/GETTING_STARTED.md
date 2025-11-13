# Getting Started with Automation Framework

This guide will help you set up and run the LLM runtime performance tests.

## Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- ~2GB free disk space (for models and dependencies)
- Modern browser (Chrome 113+, Firefox 89+, or Safari 16.4+)

## Quick Start

### 1. Install Dependencies

```bash
cd automation
pnpm install
```

### 2. Install Playwright Browsers

```bash
pnpm exec playwright install
```

This will download Chromium, Firefox, and WebKit browsers.

### 3. Run Demo Test

To verify the framework is working:

```bash
pnpm test:demo
```

This runs a simple mock test without downloading any models.

## Running Runtime Tests

### Wllama (@wllama/wllama)

**First time setup:**

```bash
cd test-pages/wllama
pnpm install
cd ../..
```

**Run tests:**

```bash
pnpm test:wllama
```

**Note**: The first run will download ~500MB model. This can take 2-5 minutes depending on your connection. The model is cached for subsequent runs.

### Development Mode

To work on test pages interactively:

```bash
# Terminal 1: Start the test page dev server
cd test-pages/wllama
pnpm dev

# Terminal 2: Open browser and navigate to http://localhost:3001
```

## Test Structure

Each runtime test follows this pattern:

1. **Initialize**: Load the test page and collect environment info
2. **Load Model**: Download and initialize the model
3. **Generate**: Run inference with test prompts
4. **Measure**: Collect performance metrics
5. **Save**: Store results to JSON file
6. **Cleanup**: Free resources

## Viewing Results

Test results are saved to `../results/raw/YYYY-MM/` in JSON format.

To view a result:

```bash
cat ../results/raw/2024-11/wllama_chromium_linux_*.json | jq .
```

## Configuration

### Models

Edit `config/models.config.ts` to change model URLs or add new models.

### Test Scenarios

Edit `config/test-scenarios.ts` to modify test prompts and parameters.

### Playwright Settings

Edit `config/playwright.config.ts` to adjust:
- Timeout values
- Browser configurations
- Test parallelization
- Screenshots/videos

## Tips

### Faster Testing

- Run tests for a single browser: `pnpm test -- --project=chromium`
- Run specific test: `pnpm test:wllama`
- Skip model download: Use cached models (automatic after first run)

### Debugging

- Run with browser UI: `pnpm test:headed`
- Debug mode: `pnpm test:debug`
- View Playwright trace: Check `test-results/` after a test

### CI/CD

Set environment variable `CI=true` to enable:
- Automatic retries (2x)
- Stricter timeouts
- No server reuse

## Troubleshooting

### "Module not found" Error

Make sure you installed dependencies in both locations:
```bash
pnpm install                    # Root automation
cd test-pages/wllama
pnpm install                    # Test page
```

### Model Download Timeout

Increase timeout in test file:
```typescript
test.setTimeout(900000); // 15 minutes
```

### SharedArrayBuffer Error (Wllama)

Ensure the dev server has CORS headers enabled. The vite.config.js includes the required headers.

### Out of Memory

- Close other applications
- Test one browser at a time: `--project=chromium`
- Use smaller models if available

## Next Steps

- Read `../docs/ACTION_GUIDE.md` for implementation roadmap
- See `../docs/ARCHITECTURE.md` for system design
- Check `../docs/DATA_SCHEMA.md` for result format

## Contributing

See `../CONTRIBUTING.md` for guidelines on:
- Adding new runtimes
- Creating test scenarios
- Submitting results
