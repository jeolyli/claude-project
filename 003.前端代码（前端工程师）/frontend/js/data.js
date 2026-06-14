/**
 * 灵记 - 数据管理逻辑
 * CSV导出 / JSON备份 / 恢复 / 清除
 */

import { initPage, renderHeaderUser, showToast } from './app.js';
import { getUserData, saveUserData, clearUserData, PRESET_CATEGORIES } from './storage.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  currentUser = initPage();
  if (!currentUser) return;

  renderHeaderUser('#headerRight');
  renderStats();

  // 导出 CSV
  document.getElementById('exportCsvBtn')?.addEventListener('click', exportCsv);

  // 备份 JSON
  document.getElementById('backupBtn')?.addEventListener('click', backupJson);

  // 恢复
  const restoreBtn = document.getElementById('restoreBtn');
  const restoreInput = document.getElementById('restoreFileInput');
  if (restoreBtn && restoreInput) {
    restoreBtn.addEventListener('click', () => restoreInput.click());
    restoreInput.addEventListener('change', restoreFromJson);
  }

  // 清除数据
  document.getElementById('clearDataBtn')?.addEventListener('click', confirmClearData);
});

function renderStats() {
  const data = getUserData(currentUser.id);
  const txs = data.transactions || [];
  const cats = (data.categories || []).filter((c) => c.is_active !== false);

  document.getElementById('statTxCount').textContent = txs.length;
  document.getElementById('statCatCount').textContent = cats.length;

  if (txs.length > 0) {
    const sorted = [...txs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    document.getElementById('statFirstDate').textContent = sorted[0].date;
  }
}

// ===== CSV 导出 =====
function exportCsv() {
  const data = getUserData(currentUser.id);
  const txs = data.transactions || [];

  if (txs.length === 0) {
    showToast('暂无数据可导出', 'error');
    return;
  }

  // CSV 表头
  const headers = ['日期', '类型', '分类', '金额', '备注'];
  const rows = txs.map((tx) => [
    tx.date,
    tx.type === 'expense' ? '支出' : '收入',
    tx.category,
    tx.amount.toFixed(2),
    tx.note || '',
  ]);

  // BOM 解决中文乱码
  const BOM = '﻿';
  const csvContent = BOM + [headers, ...rows].map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  downloadFile(csvContent, `灵记_流水记录_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
  showToast('✅ CSV 已导出');
}

// ===== JSON 备份 =====
function backupJson() {
  const data = getUserData(currentUser.id);

  const backup = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    username: currentUser.username,
    transactions: data.transactions || [],
    categories: data.categories || [],
    budget: data.budget || { total_budget: 5000, category_budgets: {} },
  };

  const json = JSON.stringify(backup, null, 2);
  downloadFile(json, `灵记_完整备份_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  showToast('✅ 备份已下载');
}

// ===== JSON 恢复 =====
function restoreFromJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const backup = JSON.parse(event.target.result);

      // 验证格式
      if (!backup.transactions || !Array.isArray(backup.transactions)) {
        showToast('备份文件格式不正确', 'error');
        return;
      }

      showConfirmDialog(
        '确认恢复',
        `将恢复 ${backup.transactions.length} 条流水记录${backup.categories ? `、${backup.categories.length} 个分类` : ''}。当前数据将被覆盖，确定继续？`,
        () => {
          const data = getUserData(currentUser.id);
          data.transactions = backup.transactions || [];
          if (backup.categories) data.categories = backup.categories;
          if (backup.budget) data.budget = backup.budget;
          saveUserData(currentUser.id, data);
          renderStats();
          showToast('✅ 数据已恢复');
        }
      );
    } catch (err) {
      showToast('备份文件解析失败', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ===== 清除数据 =====
function confirmClearData() {
  const data = getUserData(currentUser.id);
  const count = (data.transactions || []).length;

  if (count === 0) {
    showToast('暂无数据可清除');
    return;
  }

  showConfirmDialog(
    '确认清除',
    `将清除全部 ${count} 条流水记录。分类和预算设置会保留。此操作不可撤销！`,
    () => {
      const data = getUserData(currentUser.id);
      data.transactions = [];
      saveUserData(currentUser.id, data);
      renderStats();
      showToast('🗑️ 流水记录已清除');
    }
  );
}

// ===== 工具函数 =====
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showConfirmDialog(title, desc, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'data-confirm-overlay';
  overlay.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-icon">⚠️</div>
      <h3 class="modal-title">${title}</h3>
      <p class="modal-desc">${desc}</p>
      <div class="modal-actions">
        <button class="modal-btn modal-btn--cancel" id="dialogCancel">取消</button>
        <button class="modal-btn modal-btn--confirm" id="dialogConfirm">确定</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.remove();
  });
  document.getElementById('dialogCancel').addEventListener('click', () => overlay.remove());
  document.getElementById('dialogConfirm').addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
}
