/**
 * Vitest 配置 — uni-app 跨端应用测试
 * 覆盖: Pinia Stores 单元测试 + Vue 组件测试
 * 报告输出: 008.项目测试/测试报告/uniapp-report.html
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.js', 'tests/component/**/*.test.js'],
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      include: ['store/**/*.js', 'utils/**/*.js', 'components/**/*.vue'],
      exclude: ['components/StatsChart.vue'],
      reportsDirectory: '../../008. 项目测试（测试工程师）/ 测试报告/coverage/uniapp',
      reporter: ['text', 'html', 'lcov'],
    },
    reporters: ['default', 'html'],
    outputFile: {
      html: '../../008. 项目测试（测试工程师）/ 测试报告/uniapp-report.html',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@dcloudio/uni-app': path.resolve(__dirname, 'tests/mocks/uni-app.js'),
    },
  },
});
