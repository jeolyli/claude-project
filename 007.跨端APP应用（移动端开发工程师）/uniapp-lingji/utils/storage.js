/**
 * 灵记 - uni-app 存储工具
 * 使用 uni.setStorageSync / uni.getStorageSync 替代 localStorage
 * 存储键名与原项目保持一致
 */

// ===== 常量 =====
const KEYS = {
  currentUser: 'lingji_current_user',
  users: 'lingji_users',
  loginFail: 'lingji_login_fail',
};

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7天
const MAX_FAIL_COUNT = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15分钟

function dataKey(userId) {
  return `lingji_data_${userId}`;
}

// ===== 通用读写 =====

export function getStorage(key, fallback = null) {
  try {
    const value = uni.getStorageSync(key);
    return value !== '' && value !== undefined ? value : fallback;
  } catch {
    return fallback;
  }
}

export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value);
  } catch (e) {
    console.warn('[storage] write failed:', key, e);
  }
}

export function removeStorage(key) {
  try {
    uni.removeStorageSync(key);
  } catch {
    // ignore
  }
}

// ===== 用户管理 =====

export function getUsers() {
  try {
    return getStorage(KEYS.users, {});
  } catch {
    return {};
  }
}

export function saveUser(user) {
  const users = getUsers();
  users[user.id] = user;
  setStorage(KEYS.users, users);
}

export function findUserByUsername(username) {
  const users = getUsers();
  return Object.values(users).find((u) => u.username === username) || null;
}

// ===== 会话管理 =====

export function getSession() {
  return getStorage(KEYS.currentUser, null);
}

export function saveSession(user) {
  const now = new Date().toISOString();
  const session = {
    id: user.id,
    username: user.username,
    avatar: user.avatar || null,
    login_time: now,
    expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
  setStorage(KEYS.currentUser, session);
}

export function updateAvatar(userId, avatarBase64) {
  const users = getUsers();
  if (users[userId]) {
    users[userId].avatar = avatarBase64;
    setStorage(KEYS.users, users);
  }
  const session = getSession();
  if (session && session.id === userId) {
    session.avatar = avatarBase64;
    setStorage(KEYS.currentUser, session);
  }
}

export function getAvatar(userId) {
  const users = getUsers();
  return users[userId]?.avatar || null;
}

export function clearSession() {
  removeStorage(KEYS.currentUser);
}

export function isSessionValid() {
  const session = getSession();
  if (!session) return false;
  return Date.now() < new Date(session.expires_at).getTime();
}

// ===== 数据隔离 =====

export function getUserData(userId) {
  const raw = getStorage(dataKey(userId), null);
  if (raw) {
    if (!raw.categories || !Array.isArray(raw.categories)) {
      raw.categories = [];
    }
    if (!raw.budget || typeof raw.budget.total_budget !== 'number') {
      raw.budget = { total_budget: 5000, category_budgets: {} };
    }
    return raw;
  }
  return {
    transactions: [],
    categories: [],
    budget: { total_budget: 5000, category_budgets: {} },
    recurringBills: [],
  };
}

export function saveUserData(userId, data) {
  setStorage(dataKey(userId), data);
}

export function clearUserData(userId) {
  removeStorage(dataKey(userId));
}

// ===== 登录失败限制 =====

function getLoginFailRecord() {
  return getStorage(KEYS.loginFail, { count: 0, lockUntil: null });
}

export function isLoginLocked() {
  const record = getLoginFailRecord();
  if (record.lockUntil && Date.now() < new Date(record.lockUntil).getTime()) {
    return true;
  }
  if (record.lockUntil && Date.now() >= new Date(record.lockUntil).getTime()) {
    resetLoginFailRecord();
  }
  return false;
}

export function recordLoginFailure() {
  const record = getLoginFailRecord();
  if (record.lockUntil && Date.now() < new Date(record.lockUntil).getTime()) {
    const remainingMs = new Date(record.lockUntil).getTime() - Date.now();
    return { locked: true, remainingMinutes: Math.ceil(remainingMs / 60000) };
  }
  record.count += 1;
  if (record.count >= MAX_FAIL_COUNT) {
    record.lockUntil = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
    setStorage(KEYS.loginFail, record);
    return { locked: true, remainingMinutes: 15 };
  }
  setStorage(KEYS.loginFail, record);
  return { locked: false, remainingMinutes: 0 };
}

export function resetLoginFailRecord() {
  removeStorage(KEYS.loginFail);
}
