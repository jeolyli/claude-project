<template>
  <view class="tx-list">
    <!-- Grouped by time -->
    <template v-if="grouped">
      <view v-for="group in groups" :key="group.label">
        <text class="tx-group-label">{{ group.label }}</text>
        <view class="tx-group-card">
          <TransactionItem v-for="(tx, idx) in group.items" :key="tx.id" :tx="tx" :index="idx" />
        </view>
      </view>
    </template>

    <!-- Flat list -->
    <template v-else>
      <view class="tx-group-card">
        <TransactionItem v-for="(tx, idx) in items" :key="tx.id" :tx="tx" :index="idx" />
      </view>
    </template>

    <EmptyState v-if="!items.length" title="暂无记录" desc="记账后这里会显示你的消费记录" />
  </view>
</template>

<script setup>
import { computed } from 'vue';
import TransactionItem from './TransactionItem.vue';
import EmptyState from './EmptyState.vue';

const props = defineProps({
  items: { type: Array, default: () => [] },
  grouped: { type: Boolean, default: true },
});

const groups = computed(() => {
  if (!props.grouped || !props.items.length) return [];
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now - 86400000).toISOString().slice(0, 10);

  // 本周日（ISO 周从周一开始）
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
  const weekStart = monday.toISOString().slice(0, 10);

  // 本月
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const buckets = {
    '今天': [],
    '昨天': [],
    '本周': [],
    '本月': [],
    '更早': [],
  };

  for (const tx of props.items) {
    const d = tx.date;
    if (d === today) buckets['今天'].push(tx);
    else if (d === yesterday) buckets['昨天'].push(tx);
    else if (d >= weekStart) buckets['本周'].push(tx);
    else if (d >= monthStart) buckets['本月'].push(tx);
    else buckets['更早'].push(tx);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
});
</script>

<style scoped>
.tx-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tx-group-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #B5A4AB;
  padding: 16rpx 8rpx 8rpx;
  display: block;
  text-transform: uppercase;
  letter-spacing: 1rpx;
}

.tx-group-card {
  background: white;
  border-radius: 40rpx;
  padding: 0 32rpx;
  box-shadow: 0 2px 8px rgba(255, 133, 162, 0.10);
}
</style>
