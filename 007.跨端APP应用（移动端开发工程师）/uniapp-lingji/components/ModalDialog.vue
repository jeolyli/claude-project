<template>
  <view class="modal-overlay" v-if="visible" @click="onCancel">
    <view class="modal-dialog" @click.stop>
      <text class="modal-icon">{{ icon }}</text>
      <text class="modal-title">{{ title }}</text>
      <text class="modal-desc" v-if="desc">{{ desc }}</text>
      <view class="modal-actions">
        <button class="modal-btn modal-btn--cancel" @click="onCancel">{{ cancelText }}</button>
        <button class="modal-btn modal-btn--confirm" @click="onConfirm">{{ confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  desc: { type: String, default: '' },
  icon: { type: String, default: '⚠️' },
  cancelText: { type: String, default: '取消' },
  confirmText: { type: String, default: '确认' },
});

const emit = defineEmits(['cancel', 'confirm']);

function onCancel() {
  emit('cancel');
}

function onConfirm() {
  emit('confirm');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(61, 44, 51, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 40rpx;
}

.modal-dialog {
  background: white;
  border-radius: 48rpx;
  padding: 64rpx 48rpx;
  text-align: center;
  max-width: 640rpx;
  width: 100%;
  box-shadow: 0 8px 32px rgba(61, 44, 51, 0.20);
  animation: modal-in 0.25s ease-out;
}

.modal-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #3D2C33;
  margin-bottom: 16rpx;
}

.modal-desc {
  font-size: 28rpx;
  color: #6B5B63;
  margin-bottom: 40rpx;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 24rpx;
}

.modal-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 48rpx;
  font-size: 30rpx;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  background: none;
}

.modal-btn--cancel {
  background: #FFEEF2;
  color: #6B5B63;
}

.modal-btn--confirm {
  background: linear-gradient(135deg, #FF7B89, #FF85A2);
  color: white;
}
</style>
