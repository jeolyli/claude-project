<template>
  <view class="app-container">
    <AppHeader title="账单" showTabBar />
    <view class="main-content bills-page">
      <!-- Search -->
      <SearchBar v-model="searchQuery" />

      <!-- Type Filter -->
      <FilterPills :items="typeFilters" v-model="activeType" />

      <!-- Time Filter -->
      <FilterPills :items="timeFilters" v-model="activeTime" />

      <!-- Category Filter -->
      <FilterPills :items="categoryFilters" v-model="activeCategory" />

      <!-- Result count -->
      <view class="bills-count" v-if="filteredTx.length">
        <text>共 {{ filteredTx.length }} 条记录</text>
      </view>

      <!-- Transaction List -->
      <TransactionList :items="filteredTx" :grouped="true" />

      <view class="bottom-spacer" />
    </view>
    <CustomTabBar currentTab="bills" />
    <LingToast />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '../../store/user.js';
import { useDataStore } from '../../store/data.js';
import AppHeader from '../../components/AppHeader.vue';
import SearchBar from '../../components/SearchBar.vue';
import FilterPills from '../../components/FilterPills.vue';
import TransactionList from '../../components/TransactionList.vue';
import CustomTabBar from '../../components/CustomTabBar.vue';
import LingToast from '../../components/LingToast.vue';
import EmptyState from '../../components/EmptyState.vue';

const userStore = useUserStore();
const dataStore = useDataStore();

const searchQuery = ref('');
const activeType = ref('all');
const activeTime = ref('all');
const activeCategory = ref('all');

const typeFilters = [
  { key: 'all', label: '全部' },
  { key: 'expense', label: '支出' },
  { key: 'income', label: '收入' },
];

const timeFilters = [
  { key: 'all', label: '全部时间' },
  { key: 'today', label: '今天' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: '3month', label: '3个月' },
  { key: '6month', label: '6个月' },
  { key: 'year', label: '今年' },
];

const categoryFilters = computed(() => {
  const cats = dataStore.activeCategories;
  const filters = [{ key: 'all', label: '全部分类' }];
  cats.forEach((c) => {
    filters.push({ key: c.id, label: `${c.icon || ''} ${c.name}` });
  });
  return filters;
});

function getTimeRange(key) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (key) {
    case 'today': return { start: toDateStr(today), end: toDateStr(now) };
    case 'week': {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
      return { start: toDateStr(monday), end: toDateStr(now) };
    }
    case 'month': return { start: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, end: toDateStr(now) };
    case '3month': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return { start: toDateStr(d), end: toDateStr(now) };
    }
    case '6month': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      return { start: toDateStr(d), end: toDateStr(now) };
    }
    case 'year': return { start: `${now.getFullYear()}-01-01`, end: toDateStr(now) };
    default: return null;
  }
}

function toDateStr(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function pad(n) { return String(n).padStart(2, '0'); }

const filteredTx = computed(() => {
  let items = [...dataStore.transactions];

  // Type filter
  if (activeType.value !== 'all') {
    items = items.filter((t) => t.type === activeType.value);
  }

  // Time filter
  const range = getTimeRange(activeTime.value);
  if (range) {
    items = items.filter((t) => t.date >= range.start && t.date <= range.end);
  }

  // Category filter
  if (activeCategory.value !== 'all') {
    items = items.filter((t) => t.categoryId === activeCategory.value);
  }

  // Search
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    items = items.filter((t) => {
      const amt = String(t.amount || '');
      const cat = (t.category || '').toLowerCase();
      const note = (t.note || '').toLowerCase();
      return amt.includes(q) || cat.includes(q) || note.includes(q);
    });
  }

  // Sort by date desc
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  return items;
});

onShow(() => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/auth/login' });
    return;
  }
  if (!dataStore.isLoaded) {
    dataStore.loadData(userStore.currentUserId);
  }
});
</script>

<style scoped>
.bills-page { gap: 20rpx; }
.bills-count { padding: 8rpx 0; font-size: 24rpx; color: #B5A4AB; }
</style>
