/**
 * uni-app API Mock
 * 模拟 uni-app 全局 API，使测试能在 Node.js 环境中运行
 *
 * 被 mock 的 API: uni.request, uni.setStorageSync, uni.getStorageSync,
 *   uni.removeStorageSync, uni.showToast, uni.navigateTo, uni.switchTab,
 *   uni.reLaunch, uni.redirectTo, uni.navigateBack, uni.getSystemInfoSync,
 *   uni.chooseImage, uni.compressImage, uni.getFileSystemManager
 */
import { vi } from 'vitest';

const storage = {};

const uni = {
  // 存储
  setStorageSync: vi.fn((key, value) => { storage[key] = value; }),
  getStorageSync: vi.fn((key) => storage[key] ?? ''),
  removeStorageSync: vi.fn((key) => { delete storage[key]; }),

  // 网络
  request: vi.fn((opts) => {
    if (opts.success) opts.success({ statusCode: 200, data: { success: true } });
  }),

  // UI
  showToast: vi.fn(),
  showModal: vi.fn(),

  // 导航
  navigateTo: vi.fn(),
  switchTab: vi.fn(),
  reLaunch: vi.fn(),
  redirectTo: vi.fn(),
  navigateBack: vi.fn(),

  // 系统
  getSystemInfoSync: vi.fn(() => ({
    platform: 'android',
    model: 'sdk_gphone64_arm64',
    brand: 'google',
    windowWidth: 360,
    pixelRatio: 2,
  })),

  // 文件
  chooseImage: vi.fn(),
  compressImage: vi.fn(),
  getFileSystemManager: vi.fn(() => ({
    readFile: vi.fn(),
    writeFile: vi.fn(),
  })),

  // Canvas (for StatsChart)
  createCanvasContext: vi.fn(() => ({
    setFillStyle: vi.fn(),
    setStrokeStyle: vi.fn(),
    setFontSize: vi.fn(),
    setTextAlign: vi.fn(),
    setTextBaseline: vi.fn(),
    setLineWidth: vi.fn(),
    setLineCap: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    draw: vi.fn(),
    clearRect: vi.fn(),
  })),

  // 条件编译标识 (mock 为 APP-PLUS)
  // #ifdef APP-PLUS
  _platform: 'app-plus',
  // #endif

  // Plus (APP runtime)
  plus: {
    io: {
      PRIVATE_DOC: 1,
      requestFileSystem: vi.fn(),
    },
    android: {
      importClass: vi.fn(),
    },
  },
};

// 挂载为全局变量 (uni-app 在运行时的全局 uni 对象)
global.uni = uni;
global._uniStorage = storage;

// 模拟 @dcloudio/uni-app 的 onShow 等生命周期函数
export function onShow(callback) { callback(); }
export function onHide(callback) { callback(); }
export function onLoad(callback) { callback(); }
export function onReady(callback) { callback(); }
export function onUnload() {}

// #ifdef 条件编译 mock (测试时默认全部启用)
// #ifndef 什么都不做

export default uni;
