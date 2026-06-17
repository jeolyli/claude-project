<template>
  <view class="tab-bar" :class="{ 'tab-bar--safe': isPhone }">
    <view class="tab-item" :class="{ 'tab-item--active': currentTab === 'home' }" @click="switchTo('home')">
      <text class="tab-icon">🏠</text>
      <text class="tab-label">首页</text>
    </view>

    <view class="tab-item" :class="{ 'tab-item--active': currentTab === 'bills' }" @click="switchTo('bills')">
      <text class="tab-icon">🧾</text>
      <text class="tab-label">账单</text>
    </view>

    <view class="tab-item tab-item--center" @click="onFab">
      <view class="tab-fab">
        <text class="tab-fab-text">+</text>
      </view>
    </view>

    <view class="tab-item" :class="{ 'tab-item--active': currentTab === 'stats' }" @click="switchTo('stats')">
      <text class="tab-icon">📊</text>
      <text class="tab-label">统计</text>
    </view>

    <view class="tab-item" :class="{ 'tab-item--active': currentTab === 'profile' }" @click="switchTo('profile')">
      <text class="tab-icon">👤</text>
      <text class="tab-label">我的</text>
    </view>
  </view>
</template>

<script setup>
import { useAppStore } from '../store/app.js';

const props = defineProps({
  currentTab: { type: String, default: 'home' },
});

const emit = defineEmits(['fab']);
const appStore = useAppStore();

// #ifdef APP-PLUS
const isPhone = true;
// #endif
// #ifndef APP-PLUS
const isPhone = false;
// #endif

function switchTo(tab) {
  if (tab === props.currentTab) return;
  appStore.setTab(tab);
  uni.reLaunch({ url: `/pages/${tab}/${tab}` });
}

function onFab() {
  emit('fab');
  if (props.currentTab !== 'home') {
    appStore.setTab('home');
    uni.reLaunch({ url: '/pages/home/home' });
  }
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16rpx 0 40rpx;
  /* #ifndef MP-WEIXIN */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  /* #endif */
  /* #ifdef MP-WEIXIN */
  background: rgba(255, 255, 255, 0.95);
  /* #endif */
  border-top: 1px solid rgba(255, 133, 162, 0.1);
  z-index: 100;
}

.tab-bar--safe {
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  color: #B5A4AB;
  padding: 8rpx 32rpx;
  border-radius: 24rpx;
  transition: all 0.2s;
}

.tab-item--active { color: #FF85A2; }

.tab-icon { font-size: 44rpx; line-height: 1; }

.tab-label { font-size: 20rpx; font-weight: 500; }

.tab-item--center {
  position: relative;
  top: -32rpx;
}

.tab-fab {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF85A2, #FF7B89);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 133, 162, 0.35);
}

.tab-fab-text {
  font-size: 48rpx;
  color: white;
  line-height: 1;
  font-weight: 300;
}
</style>
