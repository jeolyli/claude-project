<template>
  <view v-if="toast.visible" class="ling-toast" :class="`ling-toast--${toast.type}`">
    <text class="ling-toast-text">{{ toast.message }}</text>
  </view>
</template>

<script setup>
import { useAppStore } from '../store/app.js';

const appStore = useAppStore();
const toast = appStore.toast;
</script>

<style scoped>
.ling-toast {
  position: fixed;
  top: 48rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 24rpx 48rpx;
  border-radius: 48rpx;
  font-size: 28rpx;
  font-weight: 500;
  z-index: 10000;
  white-space: nowrap;
  animation: toast-in 0.3s ease-out;
  max-width: 80vw;
  text-align: center;
}

.ling-toast--success {
  background: #A8D8CA;
  color: white;
  box-shadow: 0 4px 16px rgba(168, 216, 202, 0.35);
}

.ling-toast--error {
  background: #FF7B89;
  color: white;
  box-shadow: 0 4px 16px rgba(255, 123, 137, 0.35);
}

.ling-toast-text {
  color: white;
}
</style>
