/**
 * Shared utilities for test pages
 */

/**
 * Check WASM SIMD support
 */
export async function checkWasmSIMD() {
  try {
    return WebAssembly.validate(new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3,
      2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
    ]));
  } catch {
    return false;
  }
}

/**
 * Logging utility for test pages
 */
export function createLogger(logElementId = 'log') {
  return function log(message, type = 'info') {
    const logEl = document.getElementById(logElementId);
    if (logEl) {
      const entry = document.createElement('div');
      entry.className = `log-entry ${type}`;
      entry.textContent = `[${new Date().toISOString().substr(11, 12)}] ${message}`;
      logEl.appendChild(entry);
      logEl.scrollTop = logEl.scrollHeight;
    }
    console.log(message);
  };
}

/**
 * Status update utility for test pages
 */
export function createStatusUpdater(statusElementId = 'status') {
  return function setStatus(message, type = 'loading') {
    const statusEl = document.getElementById(statusElementId);
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `status ${type}`;
    }
  };
}
