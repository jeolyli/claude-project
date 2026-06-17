/**
 * Jest 配置 — Express 后端测试
 * 覆盖: 单元测试 + API 集成测试
 * 报告输出: 008.项目测试/测试报告/backend-express-report.html
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'server.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    'db/**/*.js',
  ],
  coverageDirectory: '../../008. 项目测试（测试工程师）/ 测试报告/coverage/backend-express',
  coverageReporters: ['text', 'html', 'lcov'],
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'LingJi Express Backend Test Report',
      outputPath: '../../008. 项目测试（测试工程师）/ 测试报告/backend-express-report.html',
      includeFailureMsg: true,
    }],
  ],
};
