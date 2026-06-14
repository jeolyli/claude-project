/**
 * 灵记 - 隐私设置逻辑
 * 修改密码
 */

import { initPage, renderHeaderUser, showToast } from './app.js';
import { hashPassword, generateSalt } from './crypto.js';
import { getUsers, saveUser, saveSession, getSession } from './storage.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  currentUser = initPage();
  if (!currentUser) return;

  renderHeaderUser('#headerRight');

  // 密码可见切换
  bindPasswordToggle('toggleOld', 'oldPass');
  bindPasswordToggle('toggleNew', 'newPass');
  bindPasswordToggle('toggleConfirm', 'confirmNewPass');

  // 修改密码
  document.getElementById('changePwdBtn')?.addEventListener('click', handleChangePassword);
});

function bindPasswordToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const icon = btn.querySelector('.material-symbols-outlined');
    if (input.type === 'password') {
      input.type = 'text';
      if (icon) icon.textContent = 'visibility_off';
    } else {
      input.type = 'password';
      if (icon) icon.textContent = 'visibility';
    }
  });
}

function showPwdError(msg) {
  const el = document.getElementById('changePwdError');
  const successEl = document.getElementById('changePwdSuccess');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  if (successEl) successEl.style.display = 'none';
}

function showPwdSuccess(msg) {
  const el = document.getElementById('changePwdError');
  const successEl = document.getElementById('changePwdSuccess');
  if (el) el.style.display = 'none';
  if (successEl) { successEl.textContent = msg; successEl.style.display = 'block'; }
}

async function handleChangePassword() {
  const oldPass = document.getElementById('oldPass')?.value || '';
  const newPass = document.getElementById('newPass')?.value || '';
  const confirmPass = document.getElementById('confirmNewPass')?.value || '';

  // 隐藏之前的提示
  document.getElementById('changePwdError').style.display = 'none';
  document.getElementById('changePwdSuccess').style.display = 'none';

  // 验证
  if (!oldPass) { showPwdError('请输入当前密码'); return; }
  if (!newPass) { showPwdError('请输入新密码'); return; }
  if (newPass.length < 6 || newPass.length > 20) { showPwdError('新密码应为6-20个字符'); return; }
  if (!/[a-zA-Z]/.test(newPass)) { showPwdError('新密码需包含字母'); return; }
  if (!/\d/.test(newPass)) { showPwdError('新密码需包含数字'); return; }
  if (newPass !== confirmPass) { showPwdError('两次密码输入不一致'); return; }
  if (newPass === oldPass) { showPwdError('新密码不能与当前密码相同'); return; }

  // 验证旧密码
  const users = getUsers();
  const user = users[currentUser.id];
  if (!user) { showPwdError('用户信息异常，请重新登录'); return; }

  const oldHash = await hashPassword(oldPass, user.salt);
  if (oldHash !== user.password_hash) {
    showPwdError('当前密码不正确');
    return;
  }

  // 更新密码
  const newSalt = generateSalt();
  const newHash = await hashPassword(newPass, newSalt);
  user.password_hash = newHash;
  user.salt = newSalt;
  saveUser(user);

  // 刷新 session（7天过期重新计算）
  saveSession({ id: user.id, username: user.username, avatar: user.avatar });

  // 清空输入
  document.getElementById('oldPass').value = '';
  document.getElementById('newPass').value = '';
  document.getElementById('confirmNewPass').value = '';

  showPwdSuccess('✅ 密码已更新，下次登录请使用新密码');
}
