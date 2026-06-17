/**
 * 灵记 - 首页逻辑
 * 预算看板 + 快捷记账 + 今日概览 + 最近记录
 */

import { initPage, renderTabBar, showToast } from './app.js';
import { getUserData, saveUserData, getCategoryByName, generateId, pushDataToBackend } from './storage.js';

// ===== 状态 =====
let currentUser = null;
let selectedCategory = '餐饮';
let recordType = 'expense';
let allCategories = [];

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  currentUser = initPage();
  if (!currentUser) return;

  // 渲染 TabBar
  const tabBar = document.getElementById('tabBar');
  if (tabBar) renderTabBar('home', tabBar);

  // 加载数据
  loadData();

  // 绑定事件
  bindEvents();
});

function loadData() {
  const data = getUserData(currentUser.id);
  allCategories = data.categories || [];
  renderBudget(data);
  renderTodayOverview(data);
  renderRecentRecords(data);
  renderCategoryChips();
}

/** 动态渲染分类 chips */
function renderCategoryChips() {
  const container = document.getElementById('categoryScroll');
  if (!container) return;

  const filtered = allCategories.filter(
    (c) => c.is_active !== false && (c.type === recordType || c.type === 'both')
  );

  if (filtered.length === 0) {
    container.innerHTML = '<span style="font-size:13px;color:var(--color-neutral-400);padding:8px;">暂无分类，去"我的-分类管理"添加吧</span>';
    return;
  }

  container.innerHTML = filtered
    .map(
      (cat) => `
    <button class="category-chip ${cat.name === selectedCategory ? 'category-chip--active' : ''}" data-category="${cat.name}">
      <span class="category-icon">${cat.icon || '📦'}</span>
      <span class="category-name">${cat.name}</span>
    </button>`
    )
    .join('');

  // 重新绑定事件
  container.querySelectorAll('.category-chip').forEach((chip) => {
    chip.addEventListener('click', function () {
      selectedCategory = this.dataset.category;
      container.querySelectorAll('.category-chip').forEach((c) => c.classList.remove('category-chip--active'));
      this.classList.add('category-chip--active');
    });
  });
}

// ===== 预算看板 =====
function renderBudget(data) {
  const budget = data.budget || {};
  const monthlyBudget = budget.total_budget || 5000;
  const categoryBudgets = budget.category_budgets || {};
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthTx = data.transactions.filter((t) => t.date.startsWith(thisMonth));
  const totalExpense = monthTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = monthTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const remaining = monthlyBudget - totalExpense;
  const percent = monthlyBudget > 0 ? Math.min((totalExpense / monthlyBudget) * 100, 100) : 0;

  let statusLabel, statusColor, statusClass;
  if (percent <= 60) {
    statusLabel = '预算健康，保持节奏';
    statusColor = 'var(--color-accent-mint)';
    statusClass = 'budget-status--healthy';
  } else if (percent <= 85) {
    statusLabel = '注意控制，接近预算线';
    statusColor = 'var(--color-accent-peach)';
    statusClass = 'budget-status--warning';
  } else if (percent <= 100) {
    statusLabel = '预算紧张，谨慎消费';
    statusColor = '#FFB347';
    statusClass = 'budget-status--danger';
  } else {
    statusLabel = '已超预算！需要关注';
    statusColor = 'var(--color-accent-coral)';
    statusClass = 'budget-status--over';
  }

  document.getElementById('budgetExpense').textContent = `¥${totalExpense.toFixed(2)}`;
  document.getElementById('budgetRemaining').textContent = `¥${remaining.toFixed(2)}`;
  document.getElementById('budgetIncome').textContent = `¥${totalIncome.toFixed(2)}`;
  document.getElementById('budgetStatus').textContent = statusLabel;
  document.getElementById('budgetStatus').className = `budget-status-tag ${statusClass}`;

  const fill = document.getElementById('budgetFill');
  fill.style.width = `${percent}%`;
  fill.style.backgroundColor = statusColor;

  document.getElementById('budgetPercent').textContent = `${percent.toFixed(0)}%`;
  document.getElementById('budgetTotal').textContent = `本月预算 ¥${monthlyBudget.toLocaleString()}`;
}

// ===== 快捷记账 =====
let isSubmitting = false;

function bindEvents() {
  // 类型切换
  document.querySelectorAll('.type-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      recordType = btn.dataset.type;
      document.querySelectorAll('.type-btn').forEach((b) => {
        b.classList.remove('type-btn--active', 'type-btn--expense', 'type-btn--income');
      });
      btn.classList.add('type-btn--active', `type-btn--${recordType}`);
      // 切换类型时更新分类 chips
      selectedCategory = '';
      renderCategoryChips();
      // 选中第一个分类
      const firstChip = document.querySelector('#categoryScroll .category-chip');
      if (firstChip) {
        selectedCategory = firstChip.dataset.category;
        firstChip.classList.add('category-chip--active');
      }
    });
  });

  // 保存按钮
  const saveBtn = document.getElementById('saveRecordBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveRecord);
  }

  // 金额输入框回车保存
  const amountInput = document.getElementById('recordAmount');
  if (amountInput) {
    amountInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSaveRecord();
    });
  }

  // FAB 点击 → 聚焦金额输入
  const fab = document.getElementById('recordFab');
  if (fab) {
    fab.addEventListener('click', () => {
      const input = document.getElementById('recordAmount');
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
      }
    });
  }
}

function handleSaveRecord() {
  if (isSubmitting) return;

  const amountStr = document.getElementById('recordAmount')?.value;
  const noteStr = document.getElementById('recordNote')?.value || '';

  if (!amountStr || parseFloat(amountStr) <= 0) {
    showToast('请输入有效金额', 'error');
    return;
  }

  const amount = parseFloat(parseFloat(amountStr).toFixed(2));
  if (amount > 99999999.99) {
    showToast('金额超出限制', 'error');
    return;
  }

  isSubmitting = true;
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const cat = getCategoryByName(selectedCategory);

  const newTx = {
    id: generateId(),
    user_id: currentUser.id,
    type: recordType,
    amount,
    category: selectedCategory,
    categoryIcon: cat?.icon || '📦',
    date: today,
    note: noteStr.trim() || undefined,
    created_at: now,
    updated_at: now,
  };

  const data = getUserData(currentUser.id);
  data.transactions.unshift(newTx);
  saveUserData(currentUser.id, data);

  // 异步推送到后端（静默，不阻塞 UI）
  pushDataToBackend(currentUser.id);

  // 重置表单
  document.getElementById('recordAmount').value = '';
  document.getElementById('recordNote').value = '';

  // 刷新 UI
  loadData();

  // 飘出爱心
  spawnHeart();

  showToast('✨ 记录成功！');
  isSubmitting = false;
}

function spawnHeart() {
  const hearts = ['❤️', '⭐', '🌸'];
  const heart = hearts[Math.floor(Math.random() * hearts.length)];
  const el = document.createElement('span');
  el.textContent = heart;
  el.style.cssText = `
    position: fixed;
    left: 50%;
    bottom: 120px;
    font-size: 24px;
    pointer-events: none;
    z-index: 999;
    animation: float-up 1.5s ease-out forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

// ===== 今日概览 =====
function renderTodayOverview(data) {
  const today = new Date().toISOString().slice(0, 10);
  const todayTx = data.transactions.filter((t) => t.date === today);
  const expense = todayTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const income = todayTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  document.getElementById('todayExpense').textContent = `¥${expense.toFixed(2)}`;
  document.getElementById('todayIncome').textContent = `¥${income.toFixed(2)}`;
}

// ===== 最近记录 =====
function renderRecentRecords(data) {
  const container = document.getElementById('recentList');
  const emptyState = document.getElementById('recentEmpty');
  if (!container) return;

  const recent = [...data.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (recent.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = recent.map((tx) => `
    <div class="transaction-item">
      <div class="transaction-icon" data-category="${tx.category}">${tx.categoryIcon}</div>
      <div class="transaction-info">
        <div class="transaction-top">
          <span class="transaction-category">${tx.category}</span>
          <span class="transaction-amount ${tx.type === 'expense' ? 'amount-expense' : 'amount-income'}">
            ${tx.type === 'expense' ? '-' : '+'}¥${tx.amount.toFixed(2)}
          </span>
        </div>
        <div class="transaction-bottom">
          <span class="transaction-note">${tx.note || '无备注'}</span>
          <span class="transaction-date">${tx.date}</span>
        </div>
      </div>
    </div>
  `).join('');
}

