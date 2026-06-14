/**
 * 灵记 - 全局应用逻辑
 * Auth 守卫、TabBar 导航、Toast 通知
 */

import { isSessionValid, getSession, clearSession } from './storage.js';

// ===== TabBar 配置 =====
const TABS = [
  { name: '首页', icon: 'home', path: 'home.html', page: 'home' },
  { name: '账单', icon: 'receipt_long', path: 'bills.html', page: 'bills' },
  { name: '', icon: 'add_circle', path: null, page: null, isCenter: true },
  { name: '统计', icon: 'leaderboard', path: 'stats.html', page: 'stats' },
  { name: '我的', icon: 'person', path: 'profile.html', page: 'profile' },
];

/**
 * 初始化页面：检查登录状态
 * @returns {object|null} 当前用户 session，未登录返回 null
 */
export function initPage() {
  if (!isSessionValid()) {
    // 未登录，跳转到登录页
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html' && currentPage !== 'register.html' && currentPage !== 'index.html' && currentPage !== '') {
      window.location.href = 'login.html';
    }
    return null;
  }
  return getSession();
}

/**
 * 渲染底部 TabBar
 * @param {string} activePage - 当前页面标识（'home', 'bills', 'stats', 'profile'）
 * @param {HTMLElement} container - TabBar 容器元素
 */
export function renderTabBar(activePage, container) {
  if (!container) return;

  container.innerHTML = TABS.map((tab) => {
    if (tab.isCenter) {
      return `
        <a href="home.html" class="tab-item tab-item--center">
          <span class="tab-fab">+</span>
        </a>
      `;
    }
    const isActive = tab.page === activePage;
    return `
      <a href="${tab.path}" class="tab-item ${isActive ? 'tab-item--active' : ''}">
        <span class="tab-icon material-symbols-outlined" style="font-variation-settings: 'FILL' ${isActive ? '1' : '0'};">
          ${tab.icon}
        </span>
        <span class="tab-label">${tab.name}</span>
      </a>
    `;
  }).join('');
}

/**
 * 显示 Toast 消息
 * @param {string} message - 消息内容
 * @param {'success'|'error'} type - 消息类型
 * @param {number} duration - 显示时长（毫秒）
 */
export function showToast(message, type = 'success', duration = 2000) {
  // 移除已有 toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast${type === 'error' ? ' toast--error' : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * 渲染头部用户信息（头像 + 用户名）
 * @param {string} containerSelector - 头部右侧容器选择器，默认 '.header-right'
 */
export function renderHeaderUser(containerSelector = '.header-right') {
  const session = getSession();
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const avatar = session?.avatar || '';
  const username = session?.username || '用户';

  container.innerHTML = `
    <div class="header-user-info">
      ${avatar
        ? `<div class="header-avatar"><img src="${avatar}" alt="头像"></div>`
        : `<div class="header-avatar">🐰</div>`
      }
      <span class="header-username">${username}</span>
    </div>
  `;
}

/**
 * 退出登录
 */
export function handleLogout() {
  clearSession();
  window.location.href = 'login.html';
}

/**
 * 跳转页面
 */
export function navigateTo(page) {
  window.location.href = page;
}
