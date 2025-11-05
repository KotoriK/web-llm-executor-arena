# Shared Test Page Resources

This directory contains shared resources used by all runtime test pages.

## Files

### `template.html`
Base HTML template for all test pages. Contains placeholders that are replaced during generation:
- `{{TITLE}}` - Page title
- `{{HEADING}}` - Main heading (h1)
- `{{DESCRIPTION}}` - Description paragraph
- `{{EXTRA_INFO}}` - Additional runtime-specific info fields

### `generate-html.js`
Script to generate HTML files from the template for each runtime.

**Usage:**
```bash
# From project root
pnpm generate:html

# Or directly
node automation/test-pages/shared/generate-html.js
```

### `styles.css`
Shared CSS styles used by all test pages. Includes:
- Base layout styles
- Status indicators (.status.ready, .status.loading, .status.error)
- Info box styling (.info-box)
- Console log styling (.log, .log-entry)
- Badge styles (.badge)

### `utils.js`
Shared JavaScript utilities:
- `checkWasmSIMD()` - Detect WASM SIMD support
- `createLogger(elementId)` - Logger factory for console output
- `createStatusUpdater(elementId)` - Status updater factory

### `test-api.d.ts`
TypeScript interface definitions for the unified test API that all runtimes must implement.

## Adding a New Runtime

1. Add runtime configuration to `generate-html.js`:
```javascript
const runtimeConfigs = {
  myruntime: {
    TITLE: 'My Runtime Test Page',
    HEADING: '@org/my-runtime Test Page',
    DESCRIPTION: 'Testing with my runtime backend',
    EXTRA_INFO: `      <dt>Custom Field:</dt>
      <dd id="custom-field">-</dd>`,
  },
};
```

2. Create test implementation at `automation/test-pages/myruntime/test.js`:
```javascript
import { createLogger, createStatusUpdater, checkWasmSIMD } from '../shared/utils.js';

const log = createLogger('log');
const setStatus = createStatusUpdater('status');

class MyRuntimeTestAPI {
  // Implement TestPageAPI interface
}

// Initialize and expose
window.testAPI = new MyRuntimeTestAPI();
```

3. Generate HTML:
```bash
pnpm generate:html
```

4. The generated `myruntime/index.html` will use the shared template with your custom values.

## Benefits of Template System

✅ **Single Source of Truth**: All HTML pages derive from one template
✅ **Consistency**: Same structure and styling across all runtimes
✅ **Easy Updates**: Modify template once, regenerate all pages
✅ **DRY Principle**: No duplicated HTML markup
✅ **Type Safety**: TypeScript definitions ensure API consistency

## Regenerating HTML

If you modify `template.html`, regenerate all HTML files:
```bash
pnpm generate:html
```

This will update all runtime test pages (`demo/`, `wllama/`, `webllm/`, etc.).
