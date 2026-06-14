/**
 * 灵记 - 我的页面逻辑
 * 用户信息 + 菜单 + 切换/退出
 */

import { initPage, renderTabBar, handleLogout } from './app.js';
import { getSession, clearSession, updateAvatar, getAvatar } from './storage.js';
import { showToast, renderHeaderUser } from './app.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  currentUser = initPage();
  if (!currentUser) return;

  // 渲染用户信息
  if (currentUser) {
    document.getElementById('profileUsername').textContent = currentUser.username;
    // 加载头像
    const avatar = currentUser.avatar || getAvatar(currentUser.id);
    if (avatar) {
      showAvatarImage(avatar);
    }
    // 加载 header
    renderHeaderUser('#headerRight');
  }

  // 头像上传点击
  const avatarEl = document.getElementById('profileAvatar');
  const fileInput = document.getElementById('avatarFileInput');
  if (avatarEl && fileInput) {
    avatarEl.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleAvatarUpload);
  }

  // 渲染 TabBar
  const tabBar = document.getElementById('tabBar');
  if (tabBar) renderTabBar('profile', tabBar);

  // 退出登录
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      document.getElementById('logoutModal').style.display = 'flex';
    });
  }

  // 弹窗操作
  const modalOverlay = document.getElementById('logoutModal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  }

  document.getElementById('cancelLogout')?.addEventListener('click', () => {
    document.getElementById('logoutModal').style.display = 'none';
  });

  document.getElementById('confirmLogout')?.addEventListener('click', () => {
    handleLogout();
  });

  // 切换账号
  document.getElementById('switchAccountBtn')?.addEventListener('click', () => {
    clearSession();
    window.location.href = 'login.html';
  });
});

// ===== 头像处理 =====

function showAvatarImage(base64) {
  const emoji = document.getElementById('profileAvatarEmoji');
  const img = document.getElementById('profileAvatarImg');
  if (emoji) emoji.style.display = 'none';
  if (img) {
    img.src = base64;
    img.style.display = 'block';
  }
}

function showAvatarEmoji() {
  const emoji = document.getElementById('profileAvatarEmoji');
  const img = document.getElementById('profileAvatarImg');
  if (emoji) emoji.style.display = 'block';
  if (img) {
    img.src = '';
    img.style.display = 'none';
  }
}

async function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file || !currentUser) return;

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件', 'error');
    return;
  }

  // 验证文件大小（最大 2MB）
  if (file.size > 2 * 1024 * 1024) {
    showToast('图片大小不能超过 2MB', 'error');
    return;
  }

  // 读取为 base64
  const reader = new FileReader();
  reader.onload = async function (event) {
    const base64 = event.target.result;

    // 压缩大图（> 500KB）
    let finalImage = base64;
    if (base64.length > 500 * 1024) {
      finalImage = await compressImage(base64, 200, 200);
    }

    // 保存到 localStorage
    updateAvatar(currentUser.id, finalImage);

    // 更新页面显示
    showAvatarImage(finalImage);
    renderHeaderUser('#headerRight');

    showToast('✅ 头像已更新');
  };
  reader.readAsDataURL(file);

  // 清除 input，允许重复选择同一文件
  e.target.value = '';
}

/**
 * 压缩图片到指定宽高
 */
function compressImage(base64, maxWidth, maxHeight) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = base64;
  });
}
