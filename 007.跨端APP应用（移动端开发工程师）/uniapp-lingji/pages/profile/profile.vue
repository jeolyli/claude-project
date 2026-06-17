<template>
  <view class="app-container">
    <AppHeader title="我的" showTabBar />
    <view class="main-content profile-page">
      <!-- User Card -->
      <view class="profile-card" @click="handleUploadAvatar">
        <view class="profile-avatar">
          <image v-if="userStore.avatarUrl" class="profile-avatar-img" :src="userStore.avatarUrl" mode="aspectFill" />
          <text v-else class="profile-avatar-emoji">🐰</text>
        </view>
        <view class="profile-info">
          <text class="profile-name">{{ userStore.username || '用户' }}</text>
          <text class="profile-hint">点击更换头像</text>
        </view>
        <text class="profile-arrow">▶</text>
      </view>

      <!-- Menu Items -->
      <view class="profile-menu">
        <view class="menu-item" @click="goBudget">
          <text class="menu-icon">💰</text>
          <text class="menu-label">预算设置</text>
          <text class="menu-arrow">▶</text>
        </view>
        <view class="menu-item" @click="goCategories">
          <text class="menu-icon">📂</text>
          <text class="menu-label">分类管理</text>
          <text class="menu-arrow">▶</text>
        </view>
        <view class="menu-item" @click="goData">
          <text class="menu-icon">💾</text>
          <text class="menu-label">数据管理</text>
          <text class="menu-arrow">▶</text>
        </view>
        <view class="menu-item" @click="goPrivacy">
          <text class="menu-icon">🔒</text>
          <text class="menu-label">隐私设置</text>
          <text class="menu-arrow">▶</text>
        </view>
      </view>

      <!-- Account Actions -->
      <view class="profile-actions">
        <button class="action-btn action-btn--switch" @click="handleSwitchAccount">切换账号</button>
        <button class="action-btn action-btn--logout" @click="showLogout = true">退出登录</button>
      </view>

      <view class="bottom-spacer" />
    </view>
    <CustomTabBar currentTab="profile" />
    <LingToast />

    <!-- Logout Modal -->
    <ModalDialog
      :visible="showLogout"
      title="退出登录"
      desc="确定要退出当前账号吗？"
      icon="👋"
      confirmText="退出"
      @cancel="showLogout = false"
      @confirm="handleLogout"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '../../store/user.js';
import { useDataStore } from '../../store/data.js';
import { useAppStore } from '../../store/app.js';
import AppHeader from '../../components/AppHeader.vue';
import CustomTabBar from '../../components/CustomTabBar.vue';
import LingToast from '../../components/LingToast.vue';
import ModalDialog from '../../components/ModalDialog.vue';

const userStore = useUserStore();
const dataStore = useDataStore();
const appStore = useAppStore();
const showLogout = ref(false);

onShow(() => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/auth/login' });
    return;
  }
  if (!dataStore.isLoaded) {
    dataStore.loadData(userStore.currentUserId);
  }
});

function handleUploadAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempPath = res.tempFilePaths[0];
      // Compress if needed
      uni.compressImage({
        src: tempPath,
        quality: 85,
        compressedWidth: 200,
        compressedHeight: 200,
        success: (compressed) => {
          // Read as base64
          uni.getFileSystemManager().readFile({
            filePath: compressed.tempFilePath,
            encoding: 'base64',
            success: (readRes) => {
              const base64 = `data:image/jpeg;base64,${readRes.data}`;
              userStore.setAvatar(userStore.currentUserId, base64);
              appStore.showToast('头像已更新');
            },
          });
        },
        fail: () => {
          // Compression failed, use original
          uni.getFileSystemManager().readFile({
            filePath: tempPath,
            encoding: 'base64',
            success: (readRes) => {
              const base64 = `data:image/jpeg;base64,${readRes.data}`;
              userStore.setAvatar(userStore.currentUserId, base64);
              appStore.showToast('头像已更新');
            },
          });
        },
      });
    },
  });
}

function handleLogout() {
  showLogout.value = false;
  userStore.logout();
  uni.reLaunch({ url: '/pages/auth/login' });
}

function handleSwitchAccount() {
  userStore.switchAccount();
}

function goBudget() { uni.navigateTo({ url: '/pages/profile/budget' }); }
function goCategories() { uni.navigateTo({ url: '/pages/profile/categories' }); }
function goData() { uni.navigateTo({ url: '/pages/profile/data' }); }
function goPrivacy() { uni.navigateTo({ url: '/pages/profile/privacy' }); }
</script>

<style scoped>
.profile-page { gap: 20rpx; }
.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: linear-gradient(135deg, #FF85A2, #FFB3C6);
  border-radius: 40rpx;
  padding: 40rpx;
  color: white;
}
.profile-avatar {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 64rpx; overflow: hidden; border: 4rpx solid rgba(255,255,255,0.5);
}
.profile-avatar-img { width: 100%; height: 100%; }
.profile-avatar-emoji { font-size: 64rpx; }
.profile-info { flex: 1; }
.profile-name { font-size: 36rpx; font-weight: 700; display: block; }
.profile-hint { font-size: 22rpx; opacity: 0.8; margin-top: 4rpx; }
.profile-arrow { font-size: 28rpx; opacity: 0.7; }
.profile-menu { background: white; border-radius: 40rpx; box-shadow: 0 2px 8px rgba(255,133,162,0.10); }
.menu-item { display: flex; align-items: center; gap: 20rpx; padding: 32rpx; border-bottom: 1px solid #FFEEF2; }
.menu-item:last-child { border-bottom: none; }
.menu-icon { font-size: 40rpx; }
.menu-label { flex: 1; font-size: 28rpx; color: #3D2C33; font-weight: 500; }
.menu-arrow { font-size: 24rpx; color: #B5A4AB; }
.profile-actions { display: flex; flex-direction: column; gap: 16rpx; margin-top: 16rpx; }
.action-btn { width: 100%; padding: 28rpx; border-radius: 48rpx; font-size: 28rpx; font-weight: 500; border: none; }
.action-btn--switch { background: white; color: #6B5B63; border: 3rpx solid #E8DCE1; }
.action-btn--logout { background: white; color: #FF7B89; border: 3rpx solid #FFD4DE; }
</style>
