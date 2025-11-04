import { Page } from '@playwright/test';

/**
 * Browser and environment information
 */
export interface BrowserInfo {
  platform: {
    os: string;
    version?: string;
    arch: string;
  };
  browser: {
    name: string;
    version: string;
    userAgent: string;
  };
  hardware: {
    cores: number;
    memory?: number;
  };
  capabilities: {
    wasmSIMD: boolean;
    webGPU: boolean;
    webNN: boolean;
  };
  gpu?: {
    vendor?: string;
    renderer?: string;
    driver?: string;
    memory?: number;
  };
}

/**
 * Collect browser and environment information
 */
export async function collectBrowserInfo(page: Page, browserName: string): Promise<BrowserInfo> {
  const info = await page.evaluate(() => {
    // Check WASM SIMD support
    function checkWasmSIMD(): boolean {
      try {
        return WebAssembly.validate(new Uint8Array([
          0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3,
          2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
        ]));
      } catch {
        return false;
      }
    }

    return {
      platform: {
        os: navigator.platform,
        userAgent: navigator.userAgent,
      },
      hardware: {
        cores: navigator.hardwareConcurrency,
        memory: (navigator as any).deviceMemory,
      },
      capabilities: {
        wasmSIMD: checkWasmSIMD(),
        webGPU: !!navigator.gpu,
        webNN: 'ml' in navigator && 'createContext' in (navigator as any).ml,
      },
    };
  });

  // Get GPU info if WebGPU is available
  let gpuInfo = undefined;
  if (info.capabilities.webGPU) {
    try {
      gpuInfo = await page.evaluate(async () => {
        if (!navigator.gpu) return undefined;
        
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) return undefined;
        
        const adapterInfo = adapter.info || (adapter as any);
        return {
          vendor: adapterInfo.vendor || 'unknown',
          renderer: adapterInfo.architecture || adapterInfo.device || 'unknown',
          driver: adapterInfo.description || 'unknown',
        };
      });
    } catch (error) {
      console.warn('Failed to get GPU info:', error);
    }
  }

  // Parse platform info
  const userAgent = info.platform.userAgent;
  let os = 'Unknown';
  let version = undefined;
  let arch = 'unknown';

  if (userAgent.includes('Windows')) {
    os = 'Windows';
    const match = userAgent.match(/Windows NT ([\d.]+)/);
    version = match ? match[1] : undefined;
    arch = userAgent.includes('WOW64') || userAgent.includes('Win64') ? 'x64' : 'x86';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
    const match = userAgent.match(/Mac OS X ([\d_]+)/);
    version = match ? match[1].replace(/_/g, '.') : undefined;
    arch = userAgent.includes('ARM') || userAgent.includes('Apple') ? 'arm64' : 'x64';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
    arch = userAgent.includes('x86_64') ? 'x64' : userAgent.includes('aarch64') ? 'arm64' : 'x86';
  }

  // Get browser version
  let browserVersion = 'unknown';
  if (browserName === 'chromium') {
    const match = userAgent.match(/Chrome\/([\d.]+)/);
    browserVersion = match ? match[1] : 'unknown';
  } else if (browserName === 'firefox') {
    const match = userAgent.match(/Firefox\/([\d.]+)/);
    browserVersion = match ? match[1] : 'unknown';
  } else if (browserName === 'webkit') {
    const match = userAgent.match(/Version\/([\d.]+)/);
    browserVersion = match ? match[1] : 'unknown';
  }

  return {
    platform: {
      os,
      version,
      arch,
    },
    browser: {
      name: browserName === 'webkit' ? 'Safari' : browserName.charAt(0).toUpperCase() + browserName.slice(1),
      version: browserVersion,
      userAgent,
    },
    hardware: info.hardware,
    capabilities: info.capabilities,
    gpu: gpuInfo,
  };
}
