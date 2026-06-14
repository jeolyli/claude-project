/**
 * 灵记 - 预算设置逻辑
 */

import { initPage, renderHeaderUser, showToast } from './app.js';
import { getUserData, saveUserData } from './storage.js';

let currentUser = null;
let categories = [];
let currentBudget = { total_budget: 5000, category_budgets: {} };

document.addEventListener('DOMContentLoaded', () => {
  currentUser = initPage();
  if (!currentUser) return;

  renderHeaderUser('#headerRight');

  // 加载数据
  const data = getUserData(currentUser.id);
  categories = (data.categories || []).filter((c) => c.is_active !== false);
  currentBudget = data.budget || { total_budget: 5000, category_budgets: {} };

  // 渲染
  renderTotalBudget();
  renderCategoryBudgets();

  // 总预算输入
  const totalInput = document.getElementById('totalBudgetInput');
  if (totalInput) {
    totalInput.addEventListener('input', updateCategorySum);
  }

  // 分类预算输入
  document.querySelectorAll('.budget-cat-input').forEach((input) => {
    input.addEventListener('input', updateCategorySum);
  });

  // 保存按钮
  document.getElementById('saveBudgetBtn')?.addEventListener('click', saveBudget);

  // 清除默认（点击全选）
  document.getElementById('clearDefaultBtn')?.addEventListener('click', () => {
    document.querySelectorAll('.budget-cat-input').forEach((input) => {
      input.value = '';
    });
    updateCategorySum();
  });
});

function renderTotalBudget() {
  const input = document.getElementById('totalBudgetInput');
  if (input) {
    input.value = currentBudget.total_budget || 5000;
  }
  updateCategorySum();
}

function renderCategoryBudgets() {
  const container = document.getElementById('categoryBudgetList');
  if (!container) return;

  const expenseCats = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  if (expenseCats.length === 0) {
    container.innerHTML = '<p style="font-size:13px;color:var(--color-neutral-400);text-align:center;padding:12px;">暂无支出分类，请先到分类管理添加</p>';
    return;
  }

  const catBudgets = currentBudget.category_budgets || {};

  container.innerHTML = expenseCats
    .map(
      (cat) => `
    <div class="budget-cat-item">
      <div class="budget-cat-icon" style="background-color: ${cat.color}20; color: ${cat.color};">
        ${cat.icon || '📦'}
      </div>
      <span class="budget-cat-name">${cat.name}</span>
      <div class="budget-cat-input-wrapper">
        <span class="budget-cat-currency">¥</span>
        <input type="number" class="budget-cat-input" data-cat-id="${cat.id}" placeholder="0" value="${catBudgets[cat.id] || ''}" min="0" step="1">
      </div>
    </div>`
    )
    .join('');

  // 绑定事件
  container.querySelectorAll('.budget-cat-input').forEach((input) => {
    input.addEventListener('input', updateCategorySum);
  });
}

function updateCategorySum() {
  let sum = 0;
  document.querySelectorAll('.budget-cat-input').forEach((input) => {
    const val = parseFloat(input.value) || 0;
    sum += val;
  });
  const sumEl = document.getElementById('categorySum');
  const diffEl = document.getElementById('budgetDiff');
  const diffHint = document.getElementById('budgetDiffHint');

  if (sumEl) sumEl.textContent = `¥${sum.toLocaleString()}`;

  const total = parseFloat(document.getElementById('totalBudgetInput')?.value) || 0;
  const diff = total - sum;

  if (diffEl && diffHint) {
    if (total === 0) {
      diffEl.textContent = '—';
      diffHint.textContent = '请先设置总预算';
    } else if (diff >= 0) {
      diffEl.textContent = `¥${diff.toLocaleString()}`;
      diffEl.style.color = 'var(--color-accent-mint)';
      diffHint.textContent = '未分配余额';
    } else {
      diffEl.textContent = `-¥${Math.abs(diff).toLocaleString()}`;
      diffEl.style.color = 'var(--color-accent-coral)';
      diffHint.textContent = '超出总预算，请调整';
    }
  }
}

function saveBudget() {
  const totalInput = document.getElementById('totalBudgetInput');
  const total = parseFloat(totalInput?.value) || 0;

  if (total <= 0) {
    showToast('请设置有效的总预算金额', 'error');
    return;
  }

  if (total > 99999999) {
    showToast('预算金额超出限制', 'error');
    return;
  }

  const categoryBudgets = {};
  document.querySelectorAll('.budget-cat-input').forEach((input) => {
    const val = parseFloat(input.value) || 0;
    if (val > 0) {
      categoryBudgets[input.dataset.catId] = val;
    }
  });

  const data = getUserData(currentUser.id);
  data.budget = {
    total_budget: total,
    category_budgets: categoryBudgets,
    updated_at: new Date().toISOString(),
  };
  saveUserData(currentUser.id, data);

  showToast('✅ 预算已保存');
  setTimeout(() => {
    window.location.href = 'home.html';
  }, 800);
}
