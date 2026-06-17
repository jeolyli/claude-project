<template>
  <view class="search-bar">
    <text class="search-icon">🔍</text>
    <input
      class="search-input"
      type="text"
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
      confirm-type="search"
      adjust-position
    />
    <text v-if="modelValue" class="search-clear" @click="onClear">✕</text>
  </view>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索金额、分类、备注...' },
});

const emit = defineEmits(['update:modelValue', 'search']);

function onInput(e) {
  emit('update:modelValue', e.detail.value);
  emit('search', e.detail.value);
}

function onClear() {
  emit('update:modelValue', '');
  emit('search', '');
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #FFEEF2;
  border-radius: 48rpx;
  padding: 18rpx 28rpx;
  border: 2rpx solid #FFD4DE;
}

.search-icon {
  font-size: 32rpx;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 56rpx;
  line-height: 56rpx;
  font-size: 28rpx;
  color: #3D2C33;
  background: transparent;
  border: none;
}

.search-input::placeholder {
  color: #B5A4AB;
}

.search-clear {
  font-size: 28rpx;
  color: #B5A4AB;
  padding: 4rpx;
}
</style>
