<template>
  <view class="app-header" :class="{ 'app-header--tab': showTabBar }">
    <view class="header-left">
      <view v-if="showBack" class="header-back" @click="onBack">
        <text class="header-back-icon">◀</text>
      </view>
      <text class="header-mascot">🐰</text>
      <text class="header-title">{{ title }}</text>
    </view>
    <view class="header-right" v-if="showUser">
      <view class="header-user-info">
        <view class="header-avatar">
          <image v-if="userStore.avatarUrl" class="avatar-img" :src="userStore.avatarUrl" mode="aspectFill" />
          <text v-else>🐰</text>
        </view>
        <text class="header-username">{{ userStore.username || '用户' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useUserStore } from '../store/user.js';

const props = defineProps({
  title: { type: String, default: '灵记' },
  showBack: { type: Boolean, default: false },
  showUser: { type: Boolean, default: false },
  showTabBar: { type: Boolean, default: false },
  backPath: { type: String, default: '' },
});

const emit = defineEmits(['back']);

const userStore = useUserStore();

function onBack() {
  if (props.backPath) {
    uni.redirectTo({ url: props.backPath });
  } else {
    uni.navigateBack({ delta: 1 });
  }
  emit('back');
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 40rpx;
  background: rgba(255, 255, 255, 0.7);
  /* #ifndef MP-WEIXIN */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  /* #endif */
  /* #ifdef MP-WEIXIN */
  background: rgba(255, 255, 255, 0.92);
  /* #endif */
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 133, 162, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.header-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
}

.header-back-icon {
  font-size: 36rpx;
  color: #6B5B63;
}

.header-mascot {
  font-size: 52rpx;
  animation: heartbeat 2s ease-in-out infinite;
}

.header-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #FF85A2;
  font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif;
  letter-spacing: 1rpx;
}

.header-right {
  display: flex;
  gap: 16rpx;
}

.header-user-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.header-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #FFD4DE;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  overflow: hidden;
  border: 4rpx solid #FFB3C6;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.header-username {
  font-size: 26rpx;
  color: #6B5B63;
  font-weight: 500;
  padding: 8rpx 24rpx;
  background: #FFEEF2;
  border-radius: 48rpx;
}
</style>
