/**
 * 灵记 - 账单页逻辑
 * 搜索 + 筛选（时间/类型/分类）+ 时间分组 + 列表渲染
 */

import { initPage, renderTabBar } from './app.js';
import { getUserData } from './storage.js';

let currentUser = null;

// 筛选状态
let filters = {
  time: 'all',     // all | today | week | month | 3months
  type: 'all',     // all | expense | income
  category: 'all', // all | category_name
  dateStart: null, // 'YYYY-MM-DD' 自定义开始
  dateEnd: null,   // 'YYYY-MM-DD' 自定义结束
};

document.addEventListener('DOMContentLoaded', () => {
  currentUser = initPage();
  if (!currentUser) return;

  // 渲染 TabBar
  const tabBar = document.getElementById('tabBar');
  if (tabBar) renderTabBar('bills', tabBar);

  // 渲染分类筛选 pills
  renderCategoryFilters();

  // 加载数据
  renderBillList();

  // 搜索绑定
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', renderBillList);
  }

  // 筛选绑定
  bindFilterPills('timeFilter', 'time');
  bindFilterPills('typeFilter', 'type');
  bindFilterPills('categoryFilter', 'category');

  // 日期范围输入
  const dateStart = document.getElementById('dateStart');
  const dateEnd = document.getElementById('dateEnd');
  if (dateStart && dateEnd) {
    dateStart.addEventListener('change', () => {
      filters.dateStart = dateStart.value || null;
      renderBillList();
    });
    dateEnd.addEventListener('change', () => {
      filters.dateEnd = dateEnd.value || null;
      renderBillList();
    });
  }
});

function renderCategoryFilters() {
  const container = document.getElementById('categoryFilter');
  if (!container || !currentUser) return;

  const data = getUserData(currentUser.id);
  const categories = (data.categories || []).filter((c) => c.is_active !== false);

  container.innerHTML = `
    <button class="bills-pill bills-pill--active" data-category="all">全部</button>
    ${categories.map((cat) => `
      <button class="bills-pill" data-category="${cat.name}">${cat.icon || '📦'} ${cat.name}</button>
    `).join('')}
  `;

  // 重新绑定
  container.querySelectorAll('.bills-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.bills-pill').forEach((p) => p.classList.remove('bills-pill--active'));
      pill.classList.add('bills-pill--active');
      filters.category = pill.dataset.category;
      renderBillList();
    });
  });
}

function bindFilterPills(containerId, filterKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('.bills-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.bills-pill').forEach((p) => p.classList.remove('bills-pill--active'));
      pill.classList.add('bills-pill--active');

      const value = pill.dataset[filterKey];
      filters[filterKey] = value;

      // 自定义时间范围：显示/隐藏日期输入行
      if (filterKey === 'time') {
        const dateRow = document.getElementById('dateRangeRow');
        if (dateRow) {
          dateRow.style.display = 'none';
        }
        filters.dateStart = null;
        filters.dateEnd = null;
      }

      renderBillList();
    });
  });
}

// ===== 日期工具 =====
function getDateRange(filterTime) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // 自定义日期范围优先
  if (filters.dateStart || filters.dateEnd) {
    return {
      start: filters.dateStart || '2000-01-01',
      end: filters.dateEnd || today,
    };
  }

  switch (filterTime) {
    case 'today':
      return { start: today, end: today };
    case 'week': {
      const dayOfWeek = now.getDay() || 7;
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek + 1);
      return { start: start.toISOString().slice(0, 10), end: today };
    }
    case 'month':
      return { start: now.toISOString().slice(0, 8) + '01', end: today };
    case '3months': {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      return { start: start.toISOString().slice(0, 10), end: today };
    }
    case '6months': {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 6);
      return { start: start.toISOString().slice(0, 10), end: today };
    }
    case 'year':
      return { start: now.getFullYear() + '-01-01', end: today };
    default:
      return { start: null, end: null };
  }
}

function renderBillList() {
  const data = getUserData(currentUser.id);
  const searchQuery = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const container = document.getElementById('billListContainer');
  const resultInfo = document.getElementById('resultInfo');

  if (!container) return;

  // 按日期倒序
  let transactions = [...data.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 1. 时间筛选
  const dateRange = getDateRange(filters.time);
  if (dateRange.start) {
    transactions = transactions.filter(
      (t) => t.date >= dateRange.start && t.date <= dateRange.end
    );
  }

  // 2. 类型筛选
  if (filters.type !== 'all') {
    transactions = transactions.filter((t) => t.type === filters.type);
  }

  // 3. 分类筛选
  if (filters.category !== 'all') {
    transactions = transactions.filter((t) => t.category === filters.category);
  }

  // 4. 搜索过滤
  if (searchQuery) {
    transactions = transactions.filter(
      (t) =>
        t.category.toLowerCase().includes(searchQuery) ||
        (t.note && t.note.toLowerCase().includes(searchQuery)) ||
        t.amount.toString().includes(searchQuery)
    );
  }

  // 结果统计
  if (resultInfo) {
    const hasActiveFilter = filters.time !== 'all' || filters.type !== 'all' || filters.category !== 'all' || searchQuery || filters.dateStart || filters.dateEnd;
    if (hasActiveFilter) {
      resultInfo.style.display = 'block';
      document.getElementById('resultCount').textContent = transactions.length;
    } else {
      resultInfo.style.display = 'none';
    }
  }

  // 空状态
  if (transactions.length === 0) {
    const hasActiveFilter = filters.time !== 'all' || filters.type !== 'all' || filters.category !== 'all' || searchQuery || filters.dateStart || filters.dateEnd;
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-mascot">🔍</span>
        <h3 class="empty-state-title">${hasActiveFilter ? '没有找到匹配的记录' : '还没有账单哦'}</h3>
        <p class="empty-state-desc">
          ${hasActiveFilter
            ? '换个筛选条件试试吧～'
            : '<a href="home.html" style="color: var(--color-primary-400); font-weight: 500;">去首页记第一笔吧～</a>'
          }
        </p>
      </div>
    `;
    return;
  }

  // 时间分组（宽范围启用分组，精确范围平铺列表）
  const groupTimeRanges = ['all', '3months', '6months', 'year'];
  if (groupTimeRanges.includes(filters.time)) {
    const groups = groupByTime(transactions);
    container.innerHTML = Object.entries(groups)
      .map(([label, items]) => renderBillGroup(label, items))
      .join('');
  } else {
    // 直接列出来，不用分组
    container.innerHTML = renderFlatList(transactions);
  }
}

function renderBillGroup(label, items) {
  return `
    <div class="bills-group">
      <h3 class="bills-group-label">${label}</h3>
      <div class="bills-list">
        ${items.map(renderBillItem).join('')}
      </div>
    </div>`;
}

function renderFlatList(items) {
  return `
    <div class="bills-list">
      ${items.map(renderBillItem).join('')}
    </div>`;
}

function renderBillItem(tx) {
  return `
    <div class="bills-item">
      <div class="bills-item-icon" data-category="${tx.category}">${tx.categoryIcon}</div>
      <div class="bills-item-info">
        <div class="bills-item-top">
          <span class="bills-item-category">${tx.category}</span>
          <span class="bills-item-amount ${tx.type === 'expense' ? 'bills-amount-expense' : 'bills-amount-income'}">
            <span class="material-symbols-outlined" style="font-size:12px;">${tx.type === 'expense' ? 'trending_down' : 'trending_up'}</span>
            ${tx.type === 'expense' ? '-' : '+'}¥${tx.amount.toFixed(2)}
          </span>
        </div>
        <div class="bills-item-bottom">
          <span class="bills-item-note">${tx.note || '无备注'}</span>
          <span class="bills-item-date">${tx.date}</span>
        </div>
      </div>
    </div>`;
}

function groupByTime(transactions) {
  const groups = {};
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  const weekAgoDate = new Date(now);
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);
  const weekAgo = weekAgoDate.toISOString().slice(0, 10);

  const thisMonth = now.toISOString().slice(0, 7);

  for (const tx of transactions) {
    let label;
    if (tx.date === today) {
      label = '今天';
    } else if (tx.date === yesterday) {
      label = '昨天';
    } else if (tx.date >= weekAgo) {
      label = '本周';
    } else if (tx.date.startsWith(thisMonth)) {
      label = '本月';
    } else {
      label = '更早';
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  }
  return groups;
}
