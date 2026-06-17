/**
 * 灵记 - 数据 Store
 * 交易记录、分类、预算的 CRUD + 后端同步
 * 原始数据模型对应 storage.js 的 getUserData() 返回结构
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getUserData, saveUserData, clearUserData, getCategoriesData } from '../utils/storage.js';
import { dataAPI } from '../utils/api.js';
import { generateId } from '../utils/id.js';

export const useDataStore = defineStore('data', () => {
  // ===== State =====
  const transactions = ref([]);
  const categories = ref([]);
  const budget = ref({ total_budget: 5000, category_budgets: {} });
  const isLoaded = ref(false);
  const syncing = ref(false);

  // ===== Getters =====

  const activeCategories = computed(() =>
    categories.value.filter((c) => c.is_active !== false),
  );

  const expenseCategories = computed(() =>
    activeCategories.value.filter((c) => c.type === 'expense' || c.type === 'both'),
  );

  const incomeCategories = computed(() =>
    activeCategories.value.filter((c) => c.type === 'income' || c.type === 'both'),
  );

  /** 本月支出总额 */
  const monthlyExpense = computed(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return transactions.value
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
      })
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  });

  /** 本月收入总额 */
  const monthlyIncome = computed(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return transactions.value
      .filter((t) => {
        if (t.type !== 'income') return false;
        const d = new Date(t.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
      })
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  });

  /** 今日交易 */
  const todayTransactions = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return transactions.value.filter((t) => t.date === today);
  });

  /** 今日支出 */
  const todayExpense = computed(() =>
    todayTransactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
  );

  /** 今日收入 */
  const todayIncome = computed(() =>
    todayTransactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
  );

  /** 最近 N 条交易 */
  function recentTransactions(n = 3) {
    return [...transactions.value]
      .sort((a, b) => new Date(b.date) - new Date(a.date) || b.created_at?.localeCompare(a.created_at || ''))
      .slice(0, n);
  }

  // ===== Actions =====

  /** 从本地存储加载数据 */
  function loadData(userId) {
    if (!userId) return;
    const data = getUserData(userId);
    transactions.value = data.transactions || [];
    categories.value = data.categories || [];
    budget.value = data.budget || { total_budget: 5000, category_budgets: {} };
    isLoaded.value = true;
  }

  /** 保存数据到本地存储 */
  function saveData(userId) {
    if (!userId) return;
    saveUserData(userId, {
      transactions: transactions.value,
      categories: categories.value,
      budget: budget.value,
      recurringBills: [],
    });
  }

  /** 新增交易记录 */
  function addTransaction(userId, tx) {
    const record = {
      id: tx.id || generateId(),
      user_id: tx.user_id || `u_${userId}`,
      type: tx.type || 'expense',
      amount: tx.amount,
      category: tx.category || '其他',
      categoryIcon: tx.categoryIcon || '📦',
      date: tx.date || new Date().toISOString().slice(0, 10),
      note: tx.note || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      categoryId: tx.categoryId || null,
    };
    transactions.value.unshift(record);
    saveData(userId);
    return record;
  }

  /** 删除交易记录 */
  function deleteTransaction(userId, txId) {
    const idx = transactions.value.findIndex((t) => t.id === txId);
    if (idx !== -1) {
      transactions.value.splice(idx, 1);
      saveData(userId);
      return true;
    }
    return false;
  }

  /** 更新预算 */
  function updateBudget(userId, total, categoryBudgets) {
    budget.value = {
      total_budget: total,
      category_budgets: categoryBudgets || {},
      updated_at: new Date().toISOString(),
    };
    saveData(userId);
  }

  /** 添加分类 */
  function addCategory(userId, cat) {
    const newCat = {
      id: 'cat_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      name: cat.name,
      icon: cat.icon || '📦',
      color: cat.color || '#FFAB91',
      type: cat.type || 'expense',
      sort_order: categories.value.length + 1,
      is_preset: false,
      is_active: true,
    };
    categories.value.push(newCat);
    saveData(userId);
    return newCat;
  }

  /** 更新分类 */
  function updateCategory(userId, catId, changes) {
    const cat = categories.value.find((c) => c.id === catId);
    if (cat) {
      Object.assign(cat, changes);
      saveData(userId);
      return true;
    }
    return false;
  }

  /** 软删除分类 */
  function softDeleteCategory(userId, catId) {
    return updateCategory(userId, catId, { is_active: false });
  }

  /** 清除所有交易 */
  function clearTransactions(userId) {
    transactions.value = [];
    saveData(userId);
  }

  // ===== 后端同步 =====

  /** 从后端拉取数据 */
  async function pullFromBackend(userId) {
    if (!userId) return null;
    syncing.value = true;
    try {
      const data = await dataAPI.pull(userId);
      if (data) {
        transactions.value = data.transactions || [];
        categories.value = data.categories || [];
        budget.value = data.budget || { total_budget: 5000, category_budgets: {} };
        saveData(userId);
      }
      return data;
    } catch (e) {
      console.warn('[sync] 拉取失败:', e.message);
      return null;
    } finally {
      syncing.value = false;
    }
  }

  /** 推送数据到后端 */
  async function pushToBackend(userId) {
    if (!userId) return;
    syncing.value = true;
    try {
      await dataAPI.push(userId, {
        transactions: transactions.value,
        categories: categories.value,
        budget: budget.value,
        recurringBills: [],
      });
      console.log('[sync] 已推送到后端');
    } catch (e) {
      console.warn('[sync] 推送失败:', e.message);
    } finally {
      syncing.value = false;
    }
  }

  /** 从备份恢复 */
  function restoreFromBackup(userId, backupData) {
    if (backupData.transactions) transactions.value = backupData.transactions;
    if (backupData.categories) categories.value = backupData.categories;
    if (backupData.budget) budget.value = backupData.budget;
    saveData(userId);
  }

  /** 导出 JSON 备份 */
  function exportJSON() {
    return {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      transactions: transactions.value,
      categories: categories.value,
      budget: budget.value,
    };
  }

  /** 生成 CSV 字符串（带 BOM） */
  function generateCSV() {
    const BOM = '﻿';
    const header = '日期,类型,分类,金额,备注\n';
    const rows = transactions.value
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((t) => {
        const type = t.type === 'income' ? '收入' : '支出';
        const cat = t.category || '';
        const amount = (parseFloat(t.amount) || 0).toFixed(2);
        const note = (t.note || '').replace(/"/g, '""');
        return `${t.date},${type},"${cat}",${amount},"${note}"`;
      })
      .join('\n');
    return BOM + header + rows;
  }

  return {
    // state
    transactions,
    categories,
    budget,
    isLoaded,
    syncing,
    // getters
    activeCategories,
    expenseCategories,
    incomeCategories,
    monthlyExpense,
    monthlyIncome,
    todayTransactions,
    todayExpense,
    todayIncome,
    recentTransactions,
    // actions
    loadData,
    saveData,
    addTransaction,
    deleteTransaction,
    updateBudget,
    addCategory,
    updateCategory,
    softDeleteCategory,
    clearTransactions,
    pullFromBackend,
    pushToBackend,
    restoreFromBackup,
    exportJSON,
    generateCSV,
  };
});
