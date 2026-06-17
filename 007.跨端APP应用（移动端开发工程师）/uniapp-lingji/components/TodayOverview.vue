<template>
  <view class="today-overview">
    <view class="today-cards">
      <view class="today-card today-card--expense">
        <text class="today-card-label">今日支出</text>
        <text class="today-card-amount">¥{{ formatAmount(todayExpense) }}</text>
      </view>
      <view class="today-card today-card--income">
        <text class="today-card-label">今日收入</text>
        <text class="today-card-amount">¥{{ formatAmount(todayIncome) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { useDataStore } from '../store/data.js';

const dataStore = useDataStore();
const todayExpense = computed(() => dataStore.todayExpense);
const todayIncome = computed(() => dataStore.todayIncome);

function formatAmount(val) {
  const num = parseFloat(val);
  return isNaN(num) ? '0' : num.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}
</script>

<style scoped>
.today-cards {
  display: flex;
  gap: 16rpx;
}

.today-card {
  flex: 1;
  padding: 28rpx;
  border-radius: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.today-card--expense {
  background: linear-gradient(135deg, #FF85A2, #FFB3C6);
  color: white;
}

.today-card--income {
  background: linear-gradient(135deg, #A8D8CA, #C5E8D7);
  color: white;
}

.today-card-label {
  font-size: 22rpx;
  opacity: 0.85;
}

.today-card-amount {
  font-size: 40rpx;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', 'PingFang SC', system-ui, sans-serif;
}
</style>
