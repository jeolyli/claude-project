<template>
  <view class="splash">
    <text class="splash-mascot">🐰</text>
    <text class="splash-title">灵记</text>
    <text class="splash-subtitle">你的软萌贴身财务管家</text>
  </view>
</template>

<script setup>
import { onMounted } from 'vue';
import { isSessionValid } from '../../utils/storage.js';

onMounted(() => {
  setTimeout(() => {
    if (isSessionValid()) {
      uni.reLaunch({ url: '/pages/home/home' });
    } else {
      uni.reLaunch({ url: '/pages/auth/login' });
    }
  }, 1200);
});
</script>

<style scoped>
.splash {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFEEF2 0%, #FFF5F7 50%, white 100%);
}
.splash-mascot { font-size: 160rpx; animation: heartbeat 1.5s ease-in-out infinite; }
.splash-title { font-size: 64rpx; font-weight: 700; color: #FF85A2; margin-top: 24rpx; }
.splash-subtitle { font-size: 28rpx; color: #B5A4AB; margin-top: 12rpx; }
</style>
