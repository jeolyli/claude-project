<template>
  <view class="budget-row">
    <view class="br-left">
      <view class="br-icon" :style="{ backgroundColor: cat.color + '20', color: cat.color }">
        <text>{{ cat.icon || '📦' }}</text>
      </view>
      <text class="br-name">{{ cat.name }}</text>
    </view>
    <view class="br-input-wrapper">
      <text class="br-currency">¥</text>
      <input
        class="br-input"
        type="number"
        :placeholder="placeholder"
        :value="displayValue"
        @input="onInput"
        adjust-position
      />
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  cat: { type: Object, required: true },
  modelValue: { type: [Number, String], default: '' },
  placeholder: { type: String, default: '0' },
});

const emit = defineEmits(['update:modelValue']);
const displayValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  displayValue.value = val;
});

function onInput(e) {
  const val = e.detail.value;
  displayValue.value = val;
  emit('update:modelValue', parseFloat(val) || 0);
}
</script>

<style scoped>
.budget-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #FFF0F3;
}

.budget-row:last-child {
  border-bottom: none;
}

.br-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.br-icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
}

.br-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #3D2C33;
}

.br-input-wrapper {
  display: flex;
  align-items: center;
  gap: 4rpx;
  background: #FFF5F7;
  border-radius: 24rpx;
  padding: 12rpx 20rpx;
  border: 3rpx solid #E8DCE1;
  transition: border-color 0.2s;
}

.br-input-wrapper:focus-within {
  border-color: #FF85A2;
}

.br-currency {
  font-size: 26rpx;
  color: #FF85A2;
  font-weight: 600;
}

.br-input {
  width: 140rpx;
  height: 64rpx;
  line-height: 64rpx;
  border: none;
  background: transparent;
  font-size: 28rpx;
  font-weight: 600;
  color: #3D2C33;
  text-align: right;
  font-family: 'Plus Jakarta Sans', 'PingFang SC', system-ui, sans-serif;
}

.br-input::placeholder {
  color: #B5A4AB;
}
</style>
