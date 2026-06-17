<template>
  <view class="emoji-picker">
    <view class="emoji-grid">
      <view
        v-for="(emoji, idx) in EMOJIS"
        :key="idx"
        class="emoji-item"
        :class="{ 'emoji-item--selected': modelValue === emoji }"
        @click="select(emoji)"
      >
        <text class="emoji-text">{{ emoji }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '🍔' },
});

const emit = defineEmits(['update:modelValue']);

const EMOJIS = [
  '🍔', '🍕', '🍿', '🥤', '🍻', '🍚', '🥡', '☕',
  '🚌', '🚕', '⛽', '🚲', '✈️', '🚗', '🚇', '🅿️',
  '🛒', '👗', '📱', '🪑', '💄', '🧴', '📦', '🎁',
  '🏠', '💡', '🔧', '🏢', '📺', '🧹', '💧', '🔥',
  '🎮', '🎬', '⚽', '🎤', '🎵', '📚', '🎓', '🏆',
  '💊', '🏥', '🩺', '💉', '🦷', '👁️', '💪', '🧘',
  '💰', '💵', '💳', '📈', '📊', '💹', '🏦', '💎',
  '🐱', '🐶', '🌸', '⭐', '❤️', '🎉', '🔖', '📝',
];

function select(emoji) {
  emit('update:modelValue', emoji);
}
</script>

<style scoped>
.emoji-picker {
  padding: 16rpx 0;
}

.emoji-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.emoji-item {
  width: calc((100% - 7 * 16rpx) / 8);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  background: #FFF5F7;
  border: 3rpx solid transparent;
  transition: all 0.15s;
}

.emoji-item--selected {
  border-color: #FF85A2;
  background: #FFEEF2;
}

.emoji-text {
  font-size: 44rpx;
}
</style>
