/**
 * data.js Pinia Store 单元测试
 *
 * 覆盖范围:
 * - addTransaction: 新增交易 → transactions 数组 + 数据保存
 * - updateBudget: 更新预算 → category_budgets 键值正确
 * - softDeleteCategory: 软删除 → is_active=false
 * - monthlyExpense/monthlyIncome: 计算正确性
 * - todayTransactions: 过滤今日数据
 * - generateCSV: CSV 格式 (BOM + header)
 * - exportJSON: 备份格式 (version + timestamp)
 *
 * 被测文件: store/data.js
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDataStore } from '../../store/data.js';

beforeEach(() => {
  setActivePinia(createPinia());
  // 清空 mock storage
  const s = global._uniStorage;
  Object.keys(s).forEach(k => delete s[k]);
});

function createTestTx(overrides = {}) {
  return {
    id: 'tx_test1',
    user_id: 'u_1',
    type: 'expense',
    amount: 100,
    category: '餐饮',
    categoryIcon: '🍽️',
    date: new Date().toISOString().slice(0, 10),
    note: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('useDataStore', () => {
  describe('addTransaction', () => {
    it('新增交易后 transactions 长度+1', () => {
      const store = useDataStore();
      expect(store.transactions).toHaveLength(0);
      store.addTransaction('u_1', createTestTx());
      expect(store.transactions).toHaveLength(1);
    });

    it('金额正确存储', () => {
      const store = useDataStore();
      store.addTransaction('u_1', createTestTx({ amount: 123.45 }));
      expect(store.transactions[0].amount).toBe(123.45);
    });

    it('新交易插入到数组头部 (unshift)', () => {
      const store = useDataStore();
      store.addTransaction('u_1', createTestTx({ id: 'tx_1', amount: 100 }));
      store.addTransaction('u_1', createTestTx({ id: 'tx_2', amount: 200 }));
      expect(store.transactions[0].id).toBe('tx_2');
      expect(store.transactions[1].id).toBe('tx_1');
    });
  });

  describe('updateBudget', () => {
    it('更新总预算和分类预算', () => {
      const store = useDataStore();
      store.updateBudget('u_1', 8000, { cat_1: 2000, cat_2: 3000 });
      expect(store.budget.total_budget).toBe(8000);
      expect(store.budget.category_budgets).toEqual({ cat_1: 2000, cat_2: 3000 });
    });

    it('更新后 budget 含 updated_at', () => {
      const store = useDataStore();
      store.updateBudget('u_1', 5000, {});
      expect(store.budget.updated_at).toBeDefined();
    });
  });

  describe('softDeleteCategory', () => {
    it('分类软删除后 is_active=false', () => {
      const store = useDataStore();
      store.categories = [
        { id: 'cat_1', name: '测试分类', type: 'expense', is_active: true },
      ];
      store.softDeleteCategory('u_1', 'cat_1');
      expect(store.categories[0].is_active).toBe(false);
    });
  });

  describe('computed getters', () => {
    it('monthlyExpense 只统计本月支出', () => {
      const store = useDataStore();
      const today = new Date().toISOString().slice(0, 10);
      store.transactions = [
        { ...createTestTx({ amount: 100, type: 'expense', date: today }) },
        { ...createTestTx({ amount: 200, type: 'income', date: today }) },
        { ...createTestTx({ amount: 50, type: 'expense', date: '2020-01-01' }) },
      ];
      expect(store.monthlyExpense).toBe(100);
      expect(store.monthlyIncome).toBe(200);
    });

    it('todayTransactions 只返回今天记录', () => {
      const store = useDataStore();
      const today = new Date().toISOString().slice(0, 10);
      store.transactions = [
        { ...createTestTx({ date: today }) },
        { ...createTestTx({ date: '2020-01-01' }) },
      ];
      expect(store.todayTransactions).toHaveLength(1);
    });

    it('recentTransactions(2) 返回最近2条', () => {
      const store = useDataStore();
      store.transactions = [
        { ...createTestTx({ id: 'tx_1', date: '2026-06-15' }) },
        { ...createTestTx({ id: 'tx_2', date: '2026-06-16' }) },
        { ...createTestTx({ id: 'tx_3', date: '2026-06-14' }) },
      ];
      const recent = store.recentTransactions(2);
      expect(recent).toHaveLength(2);
      expect(recent[0].id).toBe('tx_2'); // 最新日期
    });
  });

  describe('generateCSV', () => {
    it('CSV 含 BOM 和表头', () => {
      const store = useDataStore();
      store.transactions = [createTestTx({ amount: 100, type: 'expense', category: '餐饮', note: '午餐' })];
      const csv = store.generateCSV();
      expect(csv.startsWith('﻿')).toBe(true);
      expect(csv).toContain('日期,类型,分类,金额,备注');
    });
  });

  describe('exportJSON', () => {
    it('备份含 version 和 exported_at', () => {
      const store = useDataStore();
      const json = store.exportJSON();
      expect(json.version).toBe('1.0.0');
      expect(json.exported_at).toBeDefined();
      expect(json.transactions).toBeDefined();
      expect(json.categories).toBeDefined();
      expect(json.budget).toBeDefined();
    });
  });
});
