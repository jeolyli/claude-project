<template>
  <view class="budget-card">
    <view class="budget-card-top">
      <view class="budget-metric">
        <text class="budget-metric-label">本月已支出</text>
        <text class="budget-metric-value budget-metric-value--expense">¥{{ formatAmount(monthlyExpense) }}</text>
      </view>
      <view class="budget-metric budget-metric--center">
        <text class="budget-metric-label">剩余可用</text>
        <text class="budget-metric-value">{{ remaining > 0 ? `¥${formatAmount(remaining)}` : '已超支' }}</text>
      </view>
      <view class="budget-metric budget-metric--right">
        <text class="budget-metric-label">本月收入</text>
        <text class="budget-metric-value budget-metric-value--income">¥{{ formatAmount(monthlyIncome) }}</text>
      </view>
    </view>

    <!-- Progress bar -->
    <view class="budget-progress-section">
      <view class="budget-progress-bar">
        <view
          class="budget-progress-fill"
          :class="`budget-progress-fill--${health}`"
          :style="{ width: Math.min(usagePercent, 100) + '%' }"
        />
      </view>
      <view class="budget-progress-info">
        <text class="budget-progress-text">已使用 {{ usagePercent.toFixed(0) }}%</text>
        <text class="budget-status-tag" :class="`budget-status--${health}`">{{ statusText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { useDataStore } from '../store/data.js';

const dataStore = useDataStore();

const totalBudget = computed(() => dataStore.budget.total_budget || 5000);
const monthlyExpense = computed(() => dataStore.monthlyExpense);
const monthlyIncome = computed(() => dataStore.monthlyIncome);

const remaining = computed(() => {
  const val = totalBudget.value - monthlyExpense.value;
  return Math.max(0, val);
});

const usagePercent = computed(() => {
  if (totalBudget.value <= 0) return 0;
  return (monthlyExpense.value / totalBudget.value) * 100;
});

const health = computed(() => {
  const p = usagePercent.value;
  if (p < 60) return 'green';
  if (p < 85) return 'yellow';
  if (p < 100) return 'orange';
  return 'red';
});

const statusText = computed(() => {
  const map = { green: '健康 👌', yellow: '关注 👀', orange: '警告 ⚠️', red: '超支 🚨' };
  return map[health.value] || '未知';
});

function formatAmount(val) {
  const num = parseFloat(val);
  return isNaN(num) ? '0' : num.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}
</script>

<style scoped>
.budget-card {
  background: linear-gradient(135deg, #FF85A2, #FFB3C6);
  border-radius: 40rpx;
  padding: 40rpx;
  color: white;
  box-shadow: 0 4px 16px rgba(255, 133, 162, 0.15);
}

.budget-card-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.budget-metric {
  display: flex;
  flex-direction: column;
}

.budget-metric--center {
  text-align: center;
  align-items: center;
}

.budget-metric--right {
  text-align: right;
  align-items: flex-end;
}

.budget-metric-label {
  font-size: 24rpx;
  opacity: 0.85;
  margin-bottom: 8rpx;
}

.budget-metric-value {
  font-size: 40rpx;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', 'PingFang SC', system-ui, sans-serif;
}

.budget-metric-value--expense {
  color: rgba(255, 255, 255, 0.95);
}

.budget-metric-value--income {
  color: #A8D8CA;
}

.budget-progress-section {
  margin-top: 8rpx;
}

.budget-progress-bar {
  height: 16rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.budget-progress-fill {
  height: 100%;
  border-radius: 8rpx;
  transition: width 0.5s ease;
}

.budget-progress-fill--green { background: #A8D8CA; }
.budget-progress-fill--yellow { background: #F9E4B7; }
.budget-progress-fill--orange { background: #FFAB91; }
.budget-progress-fill--red { background: #FF7B89; }

.budget-progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-progress-text {
  font-size: 24rpx;
  opacity: 0.8;
}

.budget-status-tag {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.2);
}

.budget-status--green { color: #A8D8CA; }
.budget-status--yellow { color: #FFF; }
.budget-status--orange { color: #FFF; }
.budget-status--red { color: #FFF; }
</style>
