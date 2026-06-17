/**
 * 灵记 - localStorage 存储工具
 *
 * 存储结构（遵循 PRD 4.4 节）：
 *   lingji_current_user    → { id, username, login_time, expires_at }
 *   lingji_users           → { [id]: { id, username, password_hash, salt, created_at, last_login_at, is_active } }
 *   lingji_data_{userId}   → { transactions, categories, budgets, recurringBills }
 */

// ===== 预设分类（已清空，用户自行创建） =====
export const PRESET_CATEGORIES = [];

// ===== 常量 =====
const KEYS = {
  currentUser: 'lingji_current_user',
  users: 'lingji_users',
};

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7天

function dataKey(userId) {
  return `lingji_data_${userId}`;
}

// ===== 用户管理 =====

export function getUsers() {
  try {
    const raw = localStorage.getItem(KEYS.users);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

export function saveUser(user) {
  const users = getUsers();
  users[user.id] = user;
  saveUsers(users);
}

export function findUserByUsername(username) {
  const users = getUsers();
  return Object.values(users).find((u) => u.username === username) ?? null;
}

// ===== 会话管理 =====

export function getSession() {
  try {
    const raw = localStorage.getItem(KEYS.currentUser);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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
  localStorage.setItem(KEYS.currentUser, JSON.stringify(session));
}

/** 更新用户头像（同步更新 users 记录 + current session） */
export function updateAvatar(userId, avatarBase64) {
  // 更新 users 记录
  const users = getUsers();
  if (users[userId]) {
    users[userId].avatar = avatarBase64;
    saveUsers(users);
  }
  // 更新当前 session
  const session = getSession();
  if (session && session.id === userId) {
    session.avatar = avatarBase64;
    localStorage.setItem(KEYS.currentUser, JSON.stringify(session));
  }
}

/** 获取用户头像 */
export function getAvatar(userId) {
  const users = getUsers();
  return users[userId]?.avatar || null;
}

export function clearSession() {
  localStorage.removeItem(KEYS.currentUser);
}

export function isSessionValid() {
  const session = getSession();
  if (!session) return false;
  return Date.now() < new Date(session.expires_at).getTime();
}

// ===== 数据隔离 =====

export function getUserData(userId) {
  try {
    const raw = localStorage.getItem(dataKey(userId));
    if (raw) {
      const data = JSON.parse(raw);
      // 确保 categories 至少是数组
      if (!data.categories || !Array.isArray(data.categories)) {
        data.categories = [];
      }
      // 标准化 budget（兼容旧数据）
      if (!data.budget || typeof data.budget.total_budget !== 'number') {
        data.budget = { total_budget: 5000, category_budgets: {} };
      }
      return data;
    }
  } catch {
    // 数据损坏，返回默认
  }
  return {
    transactions: [],
    categories: [],
    budget: { total_budget: 5000, category_budgets: {} },
    recurringBills: [],
  };
}

export function saveUserData(userId, data) {
  localStorage.setItem(dataKey(userId), JSON.stringify(data));
}

export function clearUserData(userId) {
  localStorage.removeItem(dataKey(userId));
}

// ===== 登录失败限制 =====

const LOGIN_FAIL_KEY = 'lingji_login_fail';
const MAX_FAIL_COUNT = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15分钟

function getLoginFailRecord() {
  try {
    const raw = localStorage.getItem(LOGIN_FAIL_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lockUntil: null };
  } catch {
    return { count: 0, lockUntil: null };
  }
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
    localStorage.setItem(LOGIN_FAIL_KEY, JSON.stringify(record));
    return { locked: true, remainingMinutes: 15 };
  }

  localStorage.setItem(LOGIN_FAIL_KEY, JSON.stringify(record));
  return { locked: false, remainingMinutes: 0 };
}

export function resetLoginFailRecord() {
  localStorage.removeItem(LOGIN_FAIL_KEY);
}

// ===== 后端 API 同步 =====

const API_BASE = 'http://localhost:8086/api';

/** 从后端拉取数据并写入 localStorage */
export async function pullDataFromBackend(userId) {
  try {
    const res = await fetch(`${API_BASE}/data?userId=${userId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const backendData = await res.json();
    localStorage.setItem(dataKey(userId), JSON.stringify(backendData));
    console.log('[sync] 已从后端拉取:', backendData.transactions?.length || 0, '条流水');
    return backendData;
  } catch (err) {
    console.warn('[sync] 拉取失败，降级本地:', err.message);
    return getUserData(userId);
  }
}

/** 将 localStorage 数据推送到后端 */
export async function pushDataToBackend(userId) {
  try {
    const data = getUserData(userId);
    await fetch(`${API_BASE}/data/sync?userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    });
    console.log('[sync] 已推送到后端');
  } catch (err) {
    console.warn('[sync] 推送失败:', err.message);
  }
}

// ===== 工具函数 =====

/** 获取分类信息 */
export function getCategoryByName(name) {
  return PRESET_CATEGORIES.find((c) => c.name === name) || null;
}

/** 生成 UUID（简化版） */
export function generateId() {
  return 'tx_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

/** 生成用户 ID */
export function generateUserId() {
  return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}
