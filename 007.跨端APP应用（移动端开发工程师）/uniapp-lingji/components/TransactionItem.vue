<template>
  <view class="tx-item">
    <view class="tx-icon" :style="{ backgroundColor: iconBg, color: iconColor }">
      <text>{{ tx.categoryIcon || '📦' }}</text>
    </view>
    <view class="tx-info">
      <text class="tx-category">{{ tx.category || '其他' }}</text>
      <text class="tx-note" v-if="tx.note">{{ tx.note }}</text>
    </view>
    <view class="tx-meta">
      <text class="tx-amount" :class="{ 'tx-amount--income': tx.type === 'income' }">
        {{ tx.type === 'income' ? '+' : '-' }}¥{{ formatAmount(tx.amount) }}
      </text>
      <text class="tx-date">{{ formatDate(tx.date) }}</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  tx: { type: Object, required: true },
  index: { type: Number, default: 0 },
});

// Category colors matching original
const CAT_COLORS = [
  '#FFAB91', '#9EB7D4', '#FFB3C6', '#F0D5BE',
  '#C5A3D9', '#A8D8CA', '#F9E4B7', '#D4C5CB',
];

const iconColor = CAT_COLORS[Math.abs(props.tx.category?.length || 0) % CAT_COLORS.length];
const iconBg = `${iconColor}20`;

function formatAmount(val) {
  const num = parseFloat(val);
  return isNaN(num) ? '0.00' : num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}月${day}日`;
}
</script>

<style scoped>
.tx-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #FFF0F3;
}

.tx-item:last-child {
  border-bottom: none;
}

.tx-icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
}

.tx-info {
  flex: 1;
  min-width: 0;
}

.tx-category {
  font-size: 30rpx;
  font-weight: 500;
  color: #3D2C33;
  display: block;
}

.tx-note {
  font-size: 24rpx;
  color: #B5A4AB;
  margin-top: 4rpx;
  display: block;
}

.tx-meta {
  text-align: right;
  flex-shrink: 0;
}

.tx-amount {
  font-size: 32rpx;
  font-weight: 700;
  color: #3D2C33;
  font-family: 'Plus Jakarta Sans', 'PingFang SC', system-ui, sans-serif;
  display: block;
}

.tx-amount--income {
  color: #A8D8CA;
}

.tx-date {
  font-size: 22rpx;
  color: #B5A4AB;
  margin-top: 4rpx;
  display: block;
}
</style>
