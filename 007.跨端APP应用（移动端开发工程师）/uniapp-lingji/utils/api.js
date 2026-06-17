/**
 * 灵记 - API 请求封装
 * 使用 uni.request 替代 fetch，兼容 iOS / Android / 微信小程序
 */

// ===== 后端 API 基础地址 =====
// Android 模拟器中宿主机的 localhost 映射为 10.0.2.2
// iOS 模拟器中 localhost 可以直接使用
// 真机调试需要使用电脑的局域网 IP，可在下方 HOST_IP 配置

// #ifdef APP-PLUS
const HOST_IP = '192.168.0.199'; // 真机调试时改为你电脑的局域网 IP

function getAppBaseUrl() {
  try {
    const info = uni.getSystemInfoSync();
    // Android 模拟器特征检测
    if (info.platform === 'android') {
      const model = (info.model || '').toLowerCase();
      const brand = (info.brand || '').toLowerCase();
      const isEmulator = model.includes('sdk') ||
        model.includes('emulator') ||
        model.includes('vmos') ||
        brand === 'google' ||
        brand.includes('genymotion');
      if (isEmulator) {
        return 'http://10.0.2.2:8086/api';
      }
      // Android 真机 → 使用局域网 IP
      return `http://${HOST_IP}:8086/api`;
    }
    // iOS 模拟器 → localhost 可用；真机需局域网 IP
    // 简单判断：非模拟器就用 HOST_IP
    if (info.platform === 'ios' && (model || '').includes('Simulator')) {
      // iOS 模拟器新版本 model 不包含 "Simulator"，统一用 localhost
      return 'http://localhost:8086/api';
    }
  } catch (_) {}
  // 默认回退到 localhost（iOS 模拟器 / H5）
  return 'http://localhost:8086/api';
}

const API_BASE = getAppBaseUrl();
// #endif

// #ifdef MP-WEIXIN
const API_BASE = 'http://localhost:8086/api';
// #endif

// #ifdef H5
const API_BASE = 'http://localhost:8086/api';
// #endif

/**
 * 通用请求方法
 */
export function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: API_BASE + url,
      method: options.method || 'GET',
      data: options.data,
      header: options.headers || { 'Content-Type': 'application/json' },
      timeout: 15000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          const msg = (res.data && res.data.message) || `HTTP ${res.statusCode}`;
          reject(new Error(msg));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'));
      },
    });
  });
}

// ===== 认证接口 =====

export const authAPI = {
  login(username, password) {
    return request('/auth/login', { method: 'POST', data: { username, password } });
  },
  register(username, password) {
    return request('/auth/register', { method: 'POST', data: { username, password } });
  },
  changePassword(userId, oldPassword, newPassword) {
    return request('/auth/change-password', { method: 'POST', data: { userId, oldPassword, newPassword } });
  },
};

// ===== 数据同步接口 =====

export const dataAPI = {
  pull(userId) {
    return request(`/data?userId=${userId}`);
  },
  push(userId, data) {
    return request(`/data/sync?userId=${userId}`, { method: 'POST', data });
  },
};
