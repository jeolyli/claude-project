/**
 * 测试环境初始化脚本
 * 在每个测试文件执行前运行，模拟浏览器 localStorage 和 Web Crypto API
 */
import { vi } from 'vitest';

// 模拟 localStorage
const store = {};
global.localStorage = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, value) => { store[key] = String(value); }),
  removeItem: vi.fn((key) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
};
global._localStorageStore = store; // 暴露给测试用于验证

// 模拟 Web Crypto API (SHA-256 + getRandomValues)
// 使用 defineProperty 避免 read-only global 错误
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn(async (_algorithm, data) => {
        // 模拟 SHA-256: 返回32字节ArrayBuffer (→ 64 hex chars)
        const view = new Uint8Array(data);
        // 从输入派生32字节确定性hash
        const hash = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          hash[i] = view[i % view.length] ^ (i * 7 + 13) % 256;
        }
        return hash.buffer;
      }),
    },
    getRandomValues: vi.fn((array) => {
      // 用 Math.random 模拟随机值填充
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
  },
  writable: true,
  configurable: true,
});

// 模拟 fetch (用于 storage.js 的 pushDataToBackend/pullDataFromBackend)
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
  })
);

// 模拟 DOM
global.document = {
  querySelector: vi.fn(() => null),
  querySelectorAll: vi.fn(() => []),
  createElement: vi.fn(() => ({
    textContent: '',
    className: '',
    appendChild: vi.fn(),
    style: {},
    classList: { add: vi.fn(), remove: vi.fn() },
    addEventListener: vi.fn(),
    setAttribute: vi.fn(),
  })),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  addEventListener: vi.fn(),
};

// 模拟 window.location
delete global.window;
global.window = {
  location: {
    href: '',
    pathname: '/pages/home.html',
    replace: vi.fn(),
  },
  document: global.document,
};

// 模拟 console 避免测试输出污染
global.console = {
  ...console,
  warn: vi.fn(),
  log: vi.fn(),
};
