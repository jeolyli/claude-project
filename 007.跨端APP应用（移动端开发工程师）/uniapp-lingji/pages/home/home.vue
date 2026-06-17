<template>
  <view class="app-container">
    <AppHeader title="灵记" :showUser="true" showTabBar />
    <view class="main-content home-page">
      <!-- Budget Card -->
      <BudgetCard />
      <!-- Today Overview -->
      <TodayOverview />
      <!-- Quick Record -->
      <view class="home-section">
        <text class="section-title">⚡ 快速记账</text>
        <QuickRecord :autoFocus="false" />
      </view>
      <!-- Recent Records -->
      <view class="home-section">
        <view class="home-section-header">
          <text class="section-title">📋 最近记录</text>
          <text class="home-view-all" @click="goBills">查看全部 ▶</text>
        </view>
        <TransactionList :items="recentTx" :grouped="false" />
      </view>
      <view class="bottom-spacer" />
    </view>
    <CustomTabBar currentTab="home" />
    <LingToast />
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '../../store/user.js';
import { useDataStore } from '../../store/data.js';
import AppHeader from '../../components/AppHeader.vue';
import BudgetCard from '../../components/BudgetCard.vue';
import TodayOverview from '../../components/TodayOverview.vue';
import QuickRecord from '../../components/QuickRecord.vue';
import TransactionList from '../../components/TransactionList.vue';
import CustomTabBar from '../../components/CustomTabBar.vue';
import LingToast from '../../components/LingToast.vue';

const userStore = useUserStore();
const dataStore = useDataStore();
const recentTx = computed(() => dataStore.recentTransactions(3));

onShow(() => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/auth/login' });
    return;
  }
  const userId = userStore.currentUserId;
  if (!dataStore.isLoaded) {
    dataStore.loadData(userId);
  }
});

function goBills() {
  uni.reLaunch({ url: '/pages/bills/bills' });
}
</script>

<style scoped>
.home-page {
  gap: 20rpx;
}
.home-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.home-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.home-view-all {
  font-size: 24rpx;
  color: #FF85A2;
  font-weight: 500;
}
</style>
