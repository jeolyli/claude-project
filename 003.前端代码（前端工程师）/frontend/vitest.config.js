/**
 * Vitest 配置 — 前端 Vanilla JS 测试
 * 覆盖: JS 模块单元测试 (storage.js, crypto.js, budget.js 等)
 * 报告输出: 008.项目测试/测试报告/frontend-vanilla-report.html
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // jsdom 模拟浏览器环境 (localStorage, DOM, Web Crypto API)
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.js'],
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      include: ['js/**/*.js'],
      exclude: ['js/vendor/**', 'js/icons.js'],
      reportsDirectory: '../../008. 项目测试（测试工程师）/ 测试报告/coverage/frontend-vanilla',
      reporter: ['text', 'html', 'lcov'],
    },
    reporters: [
      'default',
      'html',
    ],
    outputFile: {
      html: '../../008. 项目测试（测试工程师）/ 测试报告/frontend-vanilla-report.html',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
