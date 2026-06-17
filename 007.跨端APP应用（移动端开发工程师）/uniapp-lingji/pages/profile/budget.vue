<template>
  <view class="app-container">
    <AppHeader title="预算设置" :showBack="true" />
    <view class="main-content budget-page">
      <text class="budget-hint">设置本月总预算和各分类预算，帮你更好控制开支 💪</text>

      <!-- Total Budget -->
      <view class="budget-total-card">
        <text class="bt-label">月度总预算</text>
        <view class="bt-input-wrapper">
          <text class="bt-currency">¥</text>
          <input class="bt-input" type="number" v-model.number="totalBudget" placeholder="5000" min="1" />
        </view>
        <text class="bt-hint">设置每月可支出的总金额</text>
      </view>

      <!-- Category Budgets -->
      <view class="budget-cat-section">
        <text class="bc-title">📂 分类预算（选填）</text>
        <text class="bc-desc">为每个支出分类设置单独的预算额度</text>

        <view class="bc-list">
          <BudgetRow v-for="cat in expenseCats" :key="cat.id" :cat="cat" v-model="catBudgets[cat.id]" />
        </view>

        <!-- Sum -->
        <view class="bc-sum-row">
          <text class="bc-sum-label">分类合计</text>
          <text class="bc-sum-value">¥{{ catSum }}</text>
        </view>
        <view class="bc-diff-row">
          <text class="bc-diff-label">{{ diffLabel }}</text>
          <text class="bc-diff-value" :class="{ 'bc-diff--over': diff < 0 }">{{ diffText }}</text>
        </view>

        <button class="bc-clear-btn" @click="clearAll">清空所有分类预算</button>
      </view>

      <button class="budget-save-btn" @click="handleSave">💾 保存预算</button>
      <view class="bottom-spacer" />
    </view>
    <LingToast />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '../../store/user.js';
import { useDataStore } from '../../store/data.js';
import { useAppStore } from '../../store/app.js';
import AppHeader from '../../components/AppHeader.vue';
import BudgetRow from '../../components/BudgetRow.vue';
import LingToast from '../../components/LingToast.vue';

const userStore = useUserStore();
const dataStore = useDataStore();
const appStore = useAppStore();

const totalBudget = ref(5000);
const catBudgets = ref({});

const expenseCats = computed(() => dataStore.expenseCategories);

const catSum = computed(() => {
  return Object.values(catBudgets.value).reduce((a, b) => a + (parseFloat(b) || 0), 0);
});

const diff = computed(() => totalBudget.value - catSum.value);
const diffLabel = computed(() => diff.value >= 0 ? '剩余可分配' : '超出总预算');
const diffText = computed(() => diff.value >= 0 ? `¥${diff.value}` : `-¥${Math.abs(diff.value)}`);

function clearAll() {
  catBudgets.value = {};
}

async function handleSave() {
  const total = parseFloat(totalBudget.value) || 0;
  if (total <= 0) {
    appStore.showToast('请设置有效的总预算金额', 'error');
    return;
  }
  if (total > 99999999) {
    appStore.showToast('预算金额超出限制', 'error');
    return;
  }

  const userId = userStore.currentUserId;
  const cb = {};
  Object.entries(catBudgets.value).forEach(([k, v]) => {
    const val = parseFloat(v) || 0;
    if (val > 0) cb[k] = val;
  });

  dataStore.updateBudget(userId, total, cb);
  await dataStore.pushToBackend(userId);

  appStore.showToast('✅ 预算已保存');
  setTimeout(() => {
    uni.navigateBack();
  }, 800);
}

onShow(() => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/auth/login' });
    return;
  }
  if (!dataStore.isLoaded) {
    dataStore.loadData(userStore.currentUserId);
  }
  totalBudget.value = dataStore.budget.total_budget || 5000;
  catBudgets.value = { ...(dataStore.budget.category_budgets || {}) };
});
</script>

<style scoped>
.budget-page { gap: 16px; }
.budget-hint { font-size: 26rpx; color: #B5A4AB; padding: 0 8rpx; line-height: 1.5; }
.budget-total-card {
  background: linear-gradient(135deg, #FF85A2, #FFB3C6);
  border-radius: 40rpx; padding: 48rpx 40rpx; color: white; text-align: center;
}
.bt-label { font-size: 26rpx; opacity: 0.85; }
.bt-input-wrapper { display: flex; align-items: center; justify-content: center; gap: 8rpx; margin: 12rpx 0; }
.bt-currency { font-size: 48rpx; font-weight: 700; opacity: 0.9; }
.bt-input {
  width: 320rpx; background: rgba(255,255,255,0.2); border: 4rpx solid rgba(255,255,255,0.4);
  border-radius: 24rpx; padding: 16rpx 24rpx; font-size: 56rpx; font-weight: 700; color: white; text-align: center;
}
.bt-hint { font-size: 22rpx; opacity: 0.7; }
.budget-cat-section { background: white; border-radius: 40rpx; padding: 40rpx; }
.bc-title { font-size: 32rpx; font-weight: 600; color: #3D2C33; }
.bc-desc { font-size: 24rpx; color: #B5A4AB; margin: 8rpx 0 24rpx; }
.bc-list { display: flex; flex-direction: column; gap: 10rpx; }
.bc-sum-row, .bc-diff-row { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; }
.bc-sum-row { border-top: 2rpx dashed #E8DCE1; margin-top: 16rpx; }
.bc-sum-label, .bc-diff-label { font-size: 26rpx; color: #B5A4AB; }
.bc-sum-value { font-size: 32rpx; font-weight: 600; color: #3D2C33; }
.bc-diff-value { font-size: 28rpx; font-weight: 600; color: #A8D8CA; }
.bc-diff--over { color: #FF7B89; }
.bc-clear-btn {
  width: 100%; padding: 20rpx; border-radius: 32rpx; margin-top: 16rpx;
  background: white; color: #6B5B63; border: 3rpx solid #E8DCE1; font-size: 26rpx;
}
.budget-save-btn {
  width: 100%; padding: 28rpx; border-radius: 48rpx; border: none;
  background: linear-gradient(135deg, #FF85A2, #FFB3C6); color: white;
  font-size: 32rpx; font-weight: 600;
}
</style>
