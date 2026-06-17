<template>
  <view class="empty-state">
    <text class="empty-state-mascot">🐰</text>
    <text class="empty-state-title">{{ title }}</text>
    <text class="empty-state-desc" v-if="desc">{{ desc }}</text>
  </view>
</template>

<script setup>
defineProps({
  title: { type: String, default: '暂无数据' },
  desc: { type: String, default: '' },
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-state-mascot {
  font-size: 112rpx;
  margin-bottom: 24rpx;
  animation: heartbeat 2s ease-in-out infinite;
}

.empty-state-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #6B5B63;
  margin-bottom: 12rpx;
}

.empty-state-desc {
  font-size: 28rpx;
  color: #B5A4AB;
  line-height: 1.6;
}
</style>
