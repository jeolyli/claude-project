<template>
  <scroll-view class="filter-scroll" scroll-x enable-flex :show-scrollbar="false">
    <view class="filter-pills">
      <view
        v-for="item in items"
        :key="item.key"
        class="filter-pill"
        :class="{ 'filter-pill--active': modelValue === item.key }"
        @click="select(item.key)"
      >
        <text class="filter-pill-text">{{ item.label }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  modelValue: { type: String, default: 'all' },
});

const emit = defineEmits(['update:modelValue']);

function select(key) {
  emit('update:modelValue', key);
}
</script>

<style scoped>
.filter-scroll {
  width: 100%;
}

.filter-pills {
  display: flex;
  gap: 16rpx;
  padding: 8rpx 0;
  white-space: nowrap;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  padding: 14rpx 28rpx;
  border-radius: 48rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: #6B5B63;
  background: #FFEEF2;
  border: 2rpx solid #FFD4DE;
  transition: all 0.2s;
  flex-shrink: 0;
}

.filter-pill--active {
  background: #FF85A2;
  color: white;
  border-color: #FF85A2;
}

.filter-pill-text {
  color: inherit;
}
</style>
