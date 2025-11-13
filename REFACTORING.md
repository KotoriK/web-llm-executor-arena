# Refactoring Notes

This document describes the refactoring changes made to improve code organization and maintainability.

## Changes Made

### 1. Migrated to fs/promises
- **File**: `automation/fixtures/result-saver.ts`
- **Change**: Replaced synchronous `fs` calls with async `fs/promises`
- **Benefit**: Better performance, non-blocking I/O

### 2. Shared Test Page Template System
- **New Files**:
  - `automation/test-pages/shared/template.html` - Base HTML template with placeholders
  - `automation/test-pages/shared/generate-html.js` - Script to generate HTML from template
  - `automation/test-pages/shared/utils.js` - Common utilities (WASM SIMD check, logging, status updates)
  - `automation/test-pages/shared/styles.css` - Shared CSS for all test pages
  - `automation/test-pages/shared/test-api.d.ts` - TypeScript interface definitions
- **Benefit**: 
  - Single source of truth for HTML structure
  - DRY principle, consistent UI/UX across all test pages
  - Easy to add new runtimes - just configure and regenerate

### 3. Unified Test API
- **File**: `automation/test-pages/shared/test-api.d.ts`
- **Change**: Defined `TestPageAPI` interface that all runtime implementations must follow
- **Benefit**: Type safety, predictable API surface, easier to add new runtimes

### 4. Unified Test Runner
- **File**: `automation/tests/runtime.test.ts`
- **Change**: Single test suite that works with any runtime implementing `TestPageAPI`
- **Benefit**: Less code duplication, consistent testing approach

### 5. pnpm Workspaces
- **Files**:
  - `pnpm-workspace.yaml` - Workspace configuration
  - `package.json` (root) - Root package with workspace scripts
- **Benefit**: 
  - Centralized dependency management
  - Shared `node_modules`
  - Easier monorepo management
  - Faster installs

### 6. Removed .gitkeep Files
- **Removed**: `automation/fixtures/.gitkeep`, `automation/tests/.gitkeep`, `automation/config/.gitkeep`
- **Reason**: Directories now contain actual files

### 7. Model Pre-caching Script
- **File**: `scripts/cache-models.js`
- **Purpose**: Download and cache models before running tests
- **Usage**: `pnpm cache:models` or `node scripts/cache-models.js`
- **Benefit**: Avoid download time during test runs

## Migration Guide

### For Test Page Developers

#### Before (Old Approach)
```javascript
// Duplicated in every test page
function log(message, type = 'info') {
  const logEl = document.getElementById('log');
  // ... implementation
}

async function checkWasmSIMD() {
  // ... WASM SIMD check
}
```

#### After (New Approach)
```javascript
import { createLogger, checkWasmSIMD } from '../shared/utils.js';

const log = createLogger('log');
```

### For HTML Templates

#### Before
```html
<!-- Each runtime has its own complete HTML file -->
<head>
  <title>Test Page</title>
  <style>
    /* Hundreds of lines of duplicated CSS */
  </style>
</head>
<body>
  <!-- Duplicated structure for each runtime -->
</body>
```

#### After
```html
<!-- Single template file: automation/test-pages/shared/template.html -->
<head>
  <title>{{TITLE}}</title>
  <link rel="stylesheet" href="../shared/styles.css">
</head>
<body>
  <h1>{{HEADING}}</h1>
  <!-- Shared structure with placeholders -->
</body>
```

Generate HTML for all runtimes:
```bash
pnpm generate:html
```

### For Test Writers

#### Before (Runtime-Specific Tests)
```typescript
// wllama.test.ts
test('wllama test', async ({ page }) => {
  // Wllama-specific logic
});

// webllm.test.ts  
test('webllm test', async ({ page }) => {
  // Web-LLM-specific logic (mostly duplicate)
});
```

#### After (Unified Tests)
```typescript
// runtime.test.ts
const runtimes = [
  { name: 'wllama', path: '/wllama', ... },
  { name: 'webllm', path: '/webllm', ... },
];

for (const runtime of runtimes) {
  test(`${runtime.name} test`, async ({ page }) => {
    // Shared logic that works for all runtimes
  });
}
```

## Package Structure

### Root Workspace
```
web-llm-executor-arena/
├── pnpm-workspace.yaml
├── package.json (root, defines workspace scripts)
├── automation/
│   └── package.json (workspace member)
├── automation/test-pages/wllama/
│   └── package.json (workspace member)
├── automation/test-pages/webllm/
│   └── package.json (workspace member)
└── website/
    └── package.json (workspace member, future)
```

### Install Commands
```bash
# Install all workspace dependencies
pnpm install

# Install in specific workspace
pnpm --filter automation install

# Run script in specific workspace
pnpm --filter automation test
```

## Backward Compatibility

### Old Test Scripts Still Work
- `pnpm test:wllama` - Still runs wllama-specific tests
- `pnpm test:webllm` - Still runs webllm-specific tests

### New Test Scripts
- `pnpm test` - Runs unified test suite (recommended)
- `pnpm test:unified` - Alias for unified test suite
- `pnpm test:all` - Runs all tests including legacy ones

## Future Improvements

1. **Template System**: Create HTML template generator for new runtimes
2. **Shared Package**: Move shared utilities to `@arena/shared` package
3. **Type Checking**: Add TypeScript checking for test pages
4. **Auto-generation**: Generate test boilerplate from runtime config
5. **CI Templates**: Reusable GitHub Actions workflows

## Breaking Changes

None. All existing functionality is preserved. New features are additive.

## Related Pull Requests

- Initial implementation: #[PR number]
- Review feedback addressed: #[PR number]
