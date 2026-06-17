/**
 * 灵记 - 分类管理逻辑
 * 支出/收入分类的增删改查 + Emoji 选择
 */

import { initPage, renderTabBar, showToast } from './app.js';
import { getUserData, saveUserData, generateId, pushDataToBackend } from './storage.js';

let currentUser = null;
let currentType = 'expense'; // 'expense' | 'income'
let categories = [];

// 预设 emoji 库
const EMOJI_LIBRARY = [
  // 餐饮
  '🍽️', '🍕', '🍔', '🍜', '🍰', '☕', '🍺', '🥗', '🍱', '🍞', '🥘', '🍿',
  // 交通
  '🚌', '🚗', '✈️', '🚲', '🚇', '🛵', '🚕', '🚄', '⛽', '🅿️',
  // 购物
  '🛒', '👗', '👟', '💄', '📱', '💻', '🎁', '🛍️', '🧴',
  // 居住
  '🏠', '💡', '🔧', '🛏️', '🚿', '🔑', '🏡', '🧹',
  // 娱乐
  '🎮', '🎬', '🎵', '🏀', '⚽', '🎤', '🎪', '🧸', '🎯', '✈️',
  // 医疗
  '💊', '🏥', '🩺', '💉', '🦷', '👁️', '🧘',
  // 教育
  '📚', '✏️', '🎓', '💡', '📝', '🖥️', '📖',
  // 收入
  '💰', '💵', '🏦', '📈', '💼', '🔨', '🖌️', '🎨', '📊', '🤝',
  // 其他
  '📦', '💝', '🎉', '🐱', '🌱', '⭐', '❤️', '🔥',
];

// 预设颜色库
const COLOR_LIBRARY = [
  '#FFAB91', '#FFB3C6', '#FF85A2', '#FF7B89', '#E5738A',
  '#9EB7D4', '#64B5F6', '#42A5F5', '#5C6BC0', '#7E57C2',
  '#A8D8CA', '#4DB6AC', '#81C784', '#66BB6A', '#AED581',
  '#F0D5BE', '#FFCC80', '#FFB74D', '#F9E4B7', '#FFF176',
  '#C5A3D9', '#CE93D8', '#BA68C8', '#D4C5CB', '#BCAAA4',
];

document.addEventListener('DOMContentLoaded', () => {
  currentUser = initPage();
  if (!currentUser) return;

  // TabBar
  const tabBar = document.getElementById('tabBar');
  if (tabBar) renderTabBar('profile', tabBar);

  // 加载分类数据
  loadCategories();

  // 类型切换
  document.querySelectorAll('.cat-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      currentType = tab.dataset.type;
      document.querySelectorAll('.cat-tab').forEach((t) => t.classList.remove('cat-tab--active'));
      tab.classList.add('cat-tab--active');
      renderCategoryList();
    });
  });

  // 添加按钮
  document.getElementById('addCategoryBtn')?.addEventListener('click', () => openForm(null));
});

function loadCategories() {
  const data = getUserData(currentUser.id);
  categories = data.categories || [];
  renderCategoryList();
}

function saveCategories() {
  const data = getUserData(currentUser.id);
  data.categories = categories;
  saveUserData(currentUser.id, data);

  // 异步推送到后端
  pushDataToBackend(currentUser.id);
}

function getFilteredCategories() {
  return categories.filter((c) => c.is_active !== false && (c.type === currentType || c.type === 'both'));
}

function renderCategoryList() {
  const list = document.getElementById('categoryList');
  const filtered = getFilteredCategories();

  if (filtered.length === 0) {
    list.innerHTML = `<div class="cat-empty">还没有${currentType === 'expense' ? '支出' : '收入'}分类，点击下方按钮添加吧～</div>`;
    return;
  }

  list.innerHTML = filtered
    .map(
      (cat) => `
    <div class="cat-item">
      <div class="cat-item-icon" style="background-color: ${cat.color}20; color: ${cat.color};">
        ${cat.icon || '📦'}
      </div>
      <div class="cat-item-info">
        <div class="cat-item-name">${cat.name}</div>
        <div class="cat-item-meta">${cat.is_preset ? '系统预设' : '自定义'} · ${currentType === 'expense' ? '支出' : '收入'}</div>
      </div>
      <div class="cat-item-actions">
        <button class="cat-action-btn cat-action-btn--edit" data-id="${cat.id}" title="编辑">
          <span class="material-symbols-outlined" style="font-size:18px;">edit</span>
        </button>
        <button class="cat-action-btn cat-action-btn--delete" data-id="${cat.id}" title="删除">
          <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
        </button>
      </div>
    </div>`
    )
    .join('');

  // 绑定编辑/删除事件
  list.querySelectorAll('.cat-action-btn--edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = categories.find((c) => c.id === btn.dataset.id);
      if (cat) openForm(cat);
    });
  });

  list.querySelectorAll('.cat-action-btn--delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = categories.find((c) => c.id === btn.dataset.id);
      if (cat) confirmDelete(cat);
    });
  });
}

// ===== 表单弹窗 =====
let editingCategory = null;
let selectedEmoji = '📦';
let selectedColor = '#FFAB91';
let formResolve = null;

function openForm(category) {
  editingCategory = category;
  selectedEmoji = category?.icon || '📦';
  selectedColor = category?.color || '#FFAB91';

  const overlay = document.createElement('div');
  overlay.className = 'cat-form-overlay';
  overlay.id = 'formOverlay';

  overlay.innerHTML = `
    <div class="cat-form-dialog" id="formDialog">
      <h3 class="cat-form-title">${category ? '编辑分类' : '新增' + (currentType === 'expense' ? '支出' : '收入') + '分类'}</h3>

      <div class="cat-form-field">
        <label class="cat-form-label">分类名称</label>
        <input type="text" class="cat-form-input" id="catNameInput" placeholder="例如：工资、外卖、房租..." maxlength="10" value="${category?.name || ''}" autofocus>
      </div>

      <div class="cat-form-field">
        <label class="cat-form-label">选择图标</label>
        <div class="cat-emoji-current">
          <div class="cat-emoji-preview" id="emojiPreview">${selectedEmoji}</div>
          <span class="cat-emoji-name" id="emojiName">当前选中</span>
        </div>
        <div class="emoji-grid" id="emojiGrid">
          ${EMOJI_LIBRARY.map((emoji) => `
            <button class="emoji-cell ${emoji === selectedEmoji ? 'emoji-cell--selected' : ''}" data-emoji="${emoji}">${emoji}</button>
          `).join('')}
        </div>
      </div>

      <div class="cat-form-field">
        <label class="cat-form-label">选择颜色</label>
        <div class="color-grid" id="colorGrid">
          ${COLOR_LIBRARY.map((color) => `
            <button class="color-dot ${color === selectedColor ? 'color-dot--selected' : ''}" data-color="${color}" style="background-color: ${color};"></button>
          `).join('')}
        </div>
      </div>

      <div class="cat-form-actions">
        <button class="cat-form-btn cat-form-btn--cancel" id="cancelFormBtn">取消</button>
        <button class="cat-form-btn cat-form-btn--save" id="saveFormBtn">保存</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // 点击遮罩关闭
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeForm();
  });

  // 取消按钮
  document.getElementById('cancelFormBtn').addEventListener('click', closeForm);

  // Emoji 选择
  document.getElementById('emojiGrid').addEventListener('click', function (e) {
    const cell = e.target.closest('.emoji-cell');
    if (!cell) return;
    selectedEmoji = cell.dataset.emoji;
    document.getElementById('emojiPreview').textContent = selectedEmoji;
    this.querySelectorAll('.emoji-cell').forEach((c) => c.classList.remove('emoji-cell--selected'));
    cell.classList.add('emoji-cell--selected');
  });

  // 颜色选择
  document.getElementById('colorGrid').addEventListener('click', function (e) {
    const dot = e.target.closest('.color-dot');
    if (!dot) return;
    selectedColor = dot.dataset.color;
    this.querySelectorAll('.color-dot').forEach((d) => d.classList.remove('color-dot--selected'));
    dot.classList.add('color-dot--selected');
  });

  // 保存按钮
  document.getElementById('saveFormBtn').addEventListener('click', handleSave);

  // 回车保存
  document.getElementById('catNameInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSave();
  });
}

function closeForm() {
  const overlay = document.getElementById('formOverlay');
  if (overlay) overlay.remove();
  editingCategory = null;
}

function handleSave() {
  const nameInput = document.getElementById('catNameInput');
  const name = nameInput?.value.trim();

  if (!name) {
    showToast('请输入分类名称', 'error');
    return;
  }

  if (name.length > 10) {
    showToast('分类名称最多10个字', 'error');
    return;
  }

  // 检查重名
  const duplicate = categories.find(
    (c) => c.name === name && c.type === currentType && (!editingCategory || c.id !== editingCategory.id)
  );
  if (duplicate) {
    showToast('该分类名称已存在', 'error');
    return;
  }

  if (editingCategory) {
    // 编辑
    editingCategory.name = name;
    editingCategory.icon = selectedEmoji;
    editingCategory.color = selectedColor;
    editingCategory.type = currentType;
  } else {
    // 新增
    const newCat = {
      id: generateId(),
      name,
      icon: selectedEmoji,
      color: selectedColor,
      type: currentType,
      sort_order: categories.length + 1,
      is_preset: false,
      is_active: true,
      user_id: currentUser.id,
    };
    categories.push(newCat);
  }

  saveCategories();
  closeForm();
  renderCategoryList();
  showToast(editingCategory ? '✅ 分类已更新' : '✨ 分类已添加');
  editingCategory = null;
}

// ===== 删除确认 =====
function confirmDelete(category) {

  // 至少保留1个分类（宽松限制）
  const filtered = getFilteredCategories();
  if (filtered.length <= 1) {
    showToast(`至少保留一个${currentType === 'expense' ? '支出' : '收入'}分类`, 'error');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'cat-delete-overlay';
  overlay.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-icon">${category.icon}</div>
      <h3 class="modal-title">删除"${category.name}"？</h3>
      <p class="modal-desc">删除后该分类的历史记录不会受影响，但新记录将无法选择此分类。</p>
      <div class="modal-actions">
        <button class="modal-btn modal-btn--cancel" id="cancelDelete">取消</button>
        <button class="modal-btn modal-btn--confirm" id="confirmDelete">确定删除</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.remove();
  });

  document.getElementById('cancelDelete').addEventListener('click', () => overlay.remove());

  document.getElementById('confirmDelete').addEventListener('click', () => {
    // 软删除：标记为 inactive
    category.is_active = false;
    saveCategories();
    renderCategoryList();
    overlay.remove();
    showToast('分类已删除');
  });
}
