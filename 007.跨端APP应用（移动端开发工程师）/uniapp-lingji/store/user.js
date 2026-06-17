/**
 * 灵记 - 用户 Store
 * 会话管理、登录/注册、头像、登录失败限制
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getSession, saveSession, clearSession, isSessionValid,
  getUsers, saveUser, findUserByUsername, updateAvatar,
  getStorage, setStorage, removeStorage,
  isLoginLocked, recordLoginFailure, resetLoginFailRecord,
  SESSION_TTL_MS,
} from '../utils/storage.js';
import { authAPI, dataAPI } from '../utils/api.js';
import { generateUserId } from '../utils/id.js';

export const useUserStore = defineStore('user', () => {
  // ===== State =====
  const session = ref(getSession());
  const loginLoading = ref(false);

  // ===== Getters =====
  const isLoggedIn = computed(() => {
    if (!session.value) return false;
    return Date.now() < new Date(session.value.expires_at).getTime();
  });

  const currentUserId = computed(() => session.value?.id || null);
  const avatarUrl = computed(() => session.value?.avatar || null);
  const username = computed(() => session.value?.username || '');

  // ===== Actions =====

  /** 检查并恢复会话 */
  function checkSession() {
    const valid = isSessionValid();
    if (valid) {
      session.value = getSession();
    } else {
      session.value = null;
    }
    return valid;
  }

  /** 登录 */
  async function login(username, password) {
    if (isLoginLocked()) {
      throw new Error('登录尝试次数过多，请15分钟后再试');
    }

    loginLoading.value = true;
    try {
      const res = await authAPI.login(username, password);

      if (!res.success) {
        const failResult = recordLoginFailure();
        if (failResult.locked) {
          throw new Error(`登录尝试次数过多，请${failResult.remainingMinutes}分钟后再试`);
        }
        throw new Error(res.error || res.message || '登录失败');
      }

      resetLoginFailRecord();

      // 构建会话
      const now = new Date().toISOString();
      const sess = {
        id: res.user.id,
        username: res.user.username,
        avatar: res.user.avatar || null,
        login_time: now,
        expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
      };
      saveSession(sess);
      session.value = sess;

      // 同步写入 users 记录（向后兼容）
      const users = getUsers();
      users[res.user.id] = {
        id: res.user.id,
        username: res.user.username,
        avatar: res.user.avatar || null,
        password_hash: '',
        salt: '',
        created_at: now,
        last_login_at: now,
        is_active: true,
      };
      setStorage('lingji_users', users);

      // 初始化本地数据（如果不存在）
      const dataKey = `lingji_data_${res.user.id}`;
      if (!getStorage(dataKey)) {
        setStorage(dataKey, {
          transactions: [],
          categories: [],
          budget: { total_budget: 5000, category_budgets: {} },
          recurringBills: [],
        });
      }

      return res;
    } finally {
      loginLoading.value = false;
    }
  }

  /** 注册 */
  async function register(username, password) {
    loginLoading.value = true;
    try {
      const res = await authAPI.register(username, password);

      if (!res.success) {
        throw new Error(res.error || res.message || '注册失败');
      }

      // 构建会话
      const now = new Date().toISOString();
      const sess = {
        id: res.user.id,
        username: res.user.username,
        avatar: res.user.avatar || null,
        login_time: now,
        expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
      };
      saveSession(sess);
      session.value = sess;

      // 同步写入 users 记录
      const users = getUsers();
      users[res.user.id] = {
        id: res.user.id,
        username: res.user.username,
        avatar: res.user.avatar || null,
        password_hash: '',
        salt: '',
        created_at: now,
        last_login_at: now,
        is_active: true,
      };
      setStorage('lingji_users', users);

      // 初始化本地数据
      setStorage(`lingji_data_${res.user.id}`, {
        transactions: [],
        categories: [],
        budget: { total_budget: 5000, category_budgets: {} },
        recurringBills: [],
      });

      return res;
    } finally {
      loginLoading.value = false;
    }
  }

  /** 退出登录 */
  function logout() {
    clearSession();
    session.value = null;
  }

  /** 切换账号 */
  function switchAccount() {
    clearSession();
    session.value = null;
    uni.reLaunch({ url: '/pages/auth/login' });
  }

  /** 更新头像 */
  function setAvatar(userId, avatarBase64) {
    updateAvatar(userId, avatarBase64);
    if (session.value) {
      session.value.avatar = avatarBase64;
    }
  }

  /** 修改密码（本地存储，用于隐私设置页） */
  async function changePassword(userId, newPasswordHash, newSalt) {
    const users = getUsers();
    if (users[userId]) {
      users[userId].password_hash = newPasswordHash;
      users[userId].salt = newSalt;
      setStorage('lingji_users', users);
    }
  }

  return {
    // state
    session,
    loginLoading,
    // getters
    isLoggedIn,
    currentUserId,
    avatarUrl,
    username,
    // actions
    checkSession,
    login,
    register,
    logout,
    switchAccount,
    setAvatar,
    changePassword,
    isLoginLocked,
  };
});
