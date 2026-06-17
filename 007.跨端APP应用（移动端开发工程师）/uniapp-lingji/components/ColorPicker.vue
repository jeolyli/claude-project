<template>
  <view class="color-picker">
    <view
      v-for="color in COLORS"
      :key="color"
      class="color-dot"
      :class="{ 'color-dot--selected': modelValue === color }"
      :style="{ backgroundColor: color }"
      @click="select(color)"
    >
      <text v-if="modelValue === color" class="color-check">✓</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '#FFAB91' },
});

const emit = defineEmits(['update:modelValue']);

const COLORS = [
  '#FFAB91', '#FFB3C6', '#E5738A', '#FF7B89',
  '#9EB7D4', '#64B5F6', '#42A5F5', '#1E88E5',
  '#A8D8CA', '#81C784', '#66BB6A', '#43A047',
  '#F0D5BE', '#FFCC80', '#FFA726', '#FB8C00',
  '#C5A3D9', '#CE93D8', '#AB47BC', '#8E24AA',
  '#F9E4B7', '#FFF176', '#FDD835', '#FBC02D',
];

function select(color) {
  emit('update:modelValue', color);
}
</script>

<style scoped>
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 16rpx 0;
}

.color-dot {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid transparent;
  transition: all 0.15s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-dot--selected {
  border-color: #3D2C33;
  transform: scale(1.15);
}

.color-check {
  font-size: 32rpx;
  color: white;
  font-weight: 700;
}
</style>
