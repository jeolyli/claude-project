<template>
  <view class="quick-record">
    <!-- 类型切换 -->
    <view class="qr-type-switch">
      <view class="qr-type-btn" :class="{ 'qr-type-btn--active': recordType === 'expense' }" @tap="setType('expense')">
        <text class="qr-type-text">支出</text>
      </view>
      <view class="qr-type-btn" :class="{ 'qr-type-btn--active': recordType === 'income' }" @tap="setType('income')">
        <text class="qr-type-text">收入</text>
      </view>
    </view>

    <!-- 金额输入 -->
    <view class="qr-amount-row">
      <text class="qr-currency">¥</text>
      <input
        class="qr-amount-input"
        type="digit"
        :value="amount"
        placeholder="0"
        @input="onAmountInput"
        adjust-position
      />
    </view>

    <!-- 分类选择 -->
    <view class="qr-cats-scroll">
      <view
        v-for="cat in currentCategories"
        :key="cat.id"
        class="qr-cat-chip"
        :class="{ 'qr-cat-chip--selected': selectedCatId === cat.id }"
        @tap="selectCat(cat.id)"
      >
        <view class="qr-cat-icon" :style="{ backgroundColor: (cat.color || '#FFAB91') + '20', color: cat.color || '#FFAB91' }">
          <text>{{ cat.icon || '📦' }}</text>
        </view>
        <text class="qr-cat-name">{{ cat.name }}</text>
      </view>
    </view>

    <!-- 备注 -->
    <input
      class="qr-note-input"
      type="text"
      v-model="note"
      placeholder="添加备注（选填）"
      maxlength="50"
      adjust-position
    />

    <!-- 保存按钮 -->
    <view class="qr-save-btn" :class="{ 'qr-save-btn--disabled': !canSave }" @tap="handleSave">
      <text class="qr-save-text">💾 保存记录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDataStore } from '../store/data.js';
import { useUserStore } from '../store/user.js';
import { useAppStore } from '../store/app.js';

const dataStore = useDataStore();
const userStore = useUserStore();
const appStore = useAppStore();

const recordType = ref('expense');
const amount = ref('');
const selectedCatId = ref('');
const note = ref('');

const currentCategories = computed(() =>
  recordType.value === 'expense' ? dataStore.expenseCategories : dataStore.incomeCategories,
);

const canSave = computed(() => {
  const amt = parseFloat(amount.value);
  const ok = amt > 0 && amt <= 99999999.99 && !!selectedCatId.value;
  return ok;
});

function setType(type) {
  recordType.value = type;
  selectedCatId.value = '';
}

function onAmountInput(e) {
  amount.value = e.detail.value || '';
}

function selectCat(id) {
  selectedCatId.value = id;
}

function handleSave() {
  if (!canSave.value) {
    if (!amount.value || parseFloat(amount.value) <= 0) {
      appStore.showToast('请输入有效金额', 'error');
    } else if (!selectedCatId.value) {
      appStore.showToast('请选择一个分类', 'error');
    }
    return;
  }

  const amt = parseFloat(amount.value);
  const cat = currentCategories.value.find((c) => c.id === selectedCatId.value);
  if (!cat) {
    appStore.showToast('请选择分类', 'error');
    return;
  }

  const userId = userStore.currentUserId;
  dataStore.addTransaction(userId, {
    type: recordType.value,
    amount: amt,
    category: cat.name,
    categoryIcon: cat.icon || '📦',
    categoryId: cat.id,
    date: new Date().toISOString().slice(0, 10),
    note: note.value,
  });

  dataStore.pushToBackend(userId);

  amount.value = '';
  note.value = '';
  // keep selectedCatId so user can quickly add more

  appStore.showToast(recordType.value === 'expense' ? '💸 支出已记录' : '💰 收入已记录');
}
</script>

<style scoped>
.quick-record { display: flex; flex-direction: column; gap: 24rpx; }

.qr-type-switch { display: flex; gap: 16rpx; }
.qr-type-btn {
  flex: 1; padding: 22rpx; border-radius: 48rpx; background: #FFEEF2;
  text-align: center; border: 2rpx solid transparent;
}
.qr-type-btn--active { background: white; border-color: #FF85A2; }
.qr-type-text { font-size: 28rpx; font-weight: 600; color: #B5A4AB; }
.qr-type-btn--active .qr-type-text { color: #FF85A2; }

.qr-amount-row { display: flex; align-items: center; }
.qr-currency { font-size: 48rpx; font-weight: 700; color: #FF85A2; margin-right: 8rpx; }
.qr-amount-input {
  flex: 1; height: 88rpx; font-size: 56rpx; font-weight: 700;
  color: #3D2C33; background: transparent;
  font-family: 'Plus Jakarta Sans', 'PingFang SC', system-ui, sans-serif;
}

.qr-cats-scroll {
  display: flex; flex-direction: row; flex-wrap: nowrap;
  overflow-x: auto; white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}
.qr-cat-chip {
  display: inline-flex; flex-direction: column; align-items: center;
  padding: 16rpx 24rpx; border-radius: 24rpx; margin-right: 16rpx;
  background: #FFF5F7; flex-shrink: 0; min-width: 100rpx;
}
.qr-cat-chip--selected { background: #FF85A2; }
.qr-cat-icon {
  width: 64rpx; height: 64rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 32rpx;
}
.qr-cat-name { font-size: 22rpx; color: #6B5B63; font-weight: 500; }
.qr-cat-chip--selected .qr-cat-name { color: white; }

.qr-note-input {
  height: 72rpx; font-size: 28rpx; color: #6B5B63;
  background: transparent; border-bottom: 2rpx solid #FFEEF2;
}

.qr-save-btn {
  width: 100%; padding: 28rpx; border-radius: 48rpx;
  background: linear-gradient(135deg, #FF85A2, #FFB3C6);
  box-shadow: 0 4rpx 16rpx rgba(255, 133, 162, 0.25);
  display: flex; align-items: center; justify-content: center;
}
.qr-save-btn--disabled { opacity: 0.4; }
.qr-save-text { color: white; font-size: 32rpx; font-weight: 600; }
</style>
