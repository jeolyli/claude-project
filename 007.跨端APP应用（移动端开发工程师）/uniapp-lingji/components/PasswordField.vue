<template>
  <view class="pwd-field">
    <input
      class="pwd-input"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      :value="modelValue"
      :maxlength="maxlength"
      @input="onInput"
    />
    <view class="pwd-toggle" @click="toggle">
      <text class="pwd-toggle-icon">{{ visible ? '👁️' : '👁️‍🗨️' }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '请输入密码' },
  maxlength: { type: Number, default: 20 },
});

const emit = defineEmits(['update:modelValue']);
const visible = ref(false);

function toggle() {
  visible.value = !visible.value;
}

function onInput(e) {
  emit('update:modelValue', e.detail.value);
}
</script>

<style scoped>
.pwd-field {
  display: flex;
  align-items: center;
  background: #FFF5F7;
  border: 2rpx solid #E8DCE1;
  border-radius: 24rpx;
  padding: 0 28rpx;
  transition: border-color 0.2s;
}

.pwd-field:focus-within {
  border-color: #FF85A2;
}

.pwd-input {
  flex: 1;
  padding: 28rpx 0;
  font-size: 30rpx;
  color: #3D2C33;
  background: transparent;
  border: none;
}

.pwd-toggle {
  padding: 16rpx;
  display: flex;
  align-items: center;
}

.pwd-toggle-icon {
  font-size: 36rpx;
}
</style>
