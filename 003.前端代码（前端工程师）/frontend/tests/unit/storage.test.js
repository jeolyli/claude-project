/**
 * storage.js 单元测试
 *
 * 被测文件: js/storage.js
 * 覆盖: getUserData/saveUserData, isSessionValid, 登录锁定, 用户管理
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUsers, saveUser, findUserByUsername,
  getSession, saveSession, isSessionValid,
  getUserData, saveUserData,
  isLoginLocked, recordLoginFailure, resetLoginFailRecord,
} from '../../js/storage.js';

beforeEach(() => {
  const store = global._localStorageStore;
  Object.keys(store).forEach(k => delete store[k]);
});

describe('isSessionValid', () => {
  it('无 session 时返回 false', () => {
    expect(isSessionValid()).toBe(false);
  });

  it('有效 session (有效期内) 返回 true', () => {
    const session = {
      id: 'u_1', username: 'test', avatar: null,
      login_time: new Date(Date.now() - 3600000).toISOString(), // 1小时前
      expires_at: new Date(Date.now() + 3600000).toISOString(),  // 1小时后
    };
    global.localStorage.setItem('lingji_current_user', JSON.stringify(session));
    expect(isSessionValid()).toBe(true);
  });

  it('过期 session 返回 false', () => {
    const session = {
      id: 'u_1', username: 'test', avatar: null,
      login_time: new Date(Date.now() - 7200000).toISOString(),
      expires_at: new Date(Date.now() - 3600000).toISOString(), // 1小时前过期
    };
    global.localStorage.setItem('lingji_current_user', JSON.stringify(session));
    expect(isSessionValid()).toBe(false);
  });
});

describe('getUserData / saveUserData', () => {
  it('无数据时返回默认结构', () => {
    const data = getUserData('u_1');
    expect(data.transactions).toEqual([]);
    expect(data.categories).toEqual([]);
    expect(data.budget.total_budget).toBe(5000);
    expect(data.recurringBills).toEqual([]);
  });

  it('写入后读取一致性', () => {
    const input = {
      transactions: [{ id: 'tx_1', amount: 100, type: 'expense', category: '餐饮', date: '2026-06-16' }],
      categories: [{ id: 'cat_1', name: '餐饮', type: 'expense' }],
      budget: { total_budget: 5000, category_budgets: { cat_1: 2000 } },
      recurringBills: [],
    };
    saveUserData('u_1', input);
    const data = getUserData('u_1');
    expect(data.transactions).toHaveLength(1);
    expect(data.budget.total_budget).toBe(5000);
    expect(data.budget.category_budgets).toEqual({ cat_1: 2000 });
  });

  it('损坏 JSON 时返回默认值', () => {
    global.localStorage.setItem('lingji_data_u_1', '{broken');
    const data = getUserData('u_1');
    expect(data.transactions).toEqual([]);
  });
});

describe('登录失败锁定', () => {
  it('前4次失败未锁定', () => {
    for (let i = 0; i < 4; i++) {
      const result = recordLoginFailure();
      expect(result.locked).toBe(false);
    }
    expect(isLoginLocked()).toBe(false);
  });

  it('第5次失败后锁定', () => {
    for (let i = 0; i < 5; i++) recordLoginFailure();
    expect(isLoginLocked()).toBe(true);
  });

  it('reset 解除锁定', () => {
    for (let i = 0; i < 5; i++) recordLoginFailure();
    resetLoginFailRecord();
    expect(isLoginLocked()).toBe(false);
  });
});

describe('saveUser / findUserByUsername', () => {
  it('按用户名查找存在用户', () => {
    saveUser({ id: 'u_1', username: 'testuser', password_hash: 'hash', salt: 'salt' });
    expect(findUserByUsername('testuser')).toBeTruthy();
  });

  it('按用户名查找不存在用户返回 null', () => {
    expect(findUserByUsername('nobody')).toBeNull();
  });
});
