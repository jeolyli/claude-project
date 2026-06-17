<template>
  <view class="app-container">
    <AppHeader title="分类管理" :showBack="true" />
    <view class="main-content cat-page">
      <!-- Type Tabs -->
      <view class="cat-tabs">
        <view class="cat-tab" :class="{ 'cat-tab--active': activeType === 'expense' }" @click="activeType = 'expense'">
          <text>支出</text>
        </view>
        <view class="cat-tab" :class="{ 'cat-tab--active': activeType === 'income' }" @click="activeType = 'income'">
          <text>收入</text>
        </view>
      </view>

      <!-- Category List -->
      <view class="cat-list">
        <view v-for="cat in filteredCats" :key="cat.id" class="cat-item">
          <view class="cat-item-icon" :style="{ backgroundColor: cat.color + '20', color: cat.color }">
            <text>{{ cat.icon || '📦' }}</text>
          </view>
          <view class="cat-item-info">
            <text class="cat-item-name">{{ cat.name }}</text>
            <text class="cat-item-meta">{{ cat.is_preset ? '预设' : '自定义' }} · 排序 {{ cat.sort_order }}</text>
          </view>
          <view class="cat-item-actions">
            <view class="cat-action cat-action--edit" @click="openEdit(cat)">
              <text>✏️</text>
            </view>
            <view class="cat-action cat-action--delete" @click="confirmDelete(cat)">
              <text>🗑️</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Add Button -->
      <button class="cat-add-btn" @click="openAdd">+ 添加分类</button>

      <empty-state v-if="!filteredCats.length" title="暂无分类" desc="点击下方按钮添加分类吧" />
      <view class="bottom-spacer" />
    </view>

    <!-- Category Form -->
    <CategoryForm
      :visible="showForm"
      :editing="!!editingCat"
      :category="editingCat"
      :existingNames="existingNames"
      @save="handleFormSave"
      @cancel="showForm = false"
    />

    <!-- Delete Confirm -->
    <ModalDialog
      :visible="showDelete"
      title="删除分类"
      :desc="'确定要删除' + (deleteTarget ? deleteTarget.name : '') + '分类吗？删除后不可恢复'"
      icon="⚠️"
      confirmText="删除"
      @cancel="showDelete = false"
      @confirm="doDelete"
    />
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
import CategoryForm from '../../components/CategoryForm.vue';
import ModalDialog from '../../components/ModalDialog.vue';
import EmptyState from '../../components/EmptyState.vue';
import LingToast from '../../components/LingToast.vue';

const userStore = useUserStore();
const dataStore = useDataStore();
const appStore = useAppStore();

const activeType = ref('expense');
const showForm = ref(false);
const editingCat = ref(null);
const showDelete = ref(false);
const deleteTarget = ref(null);

const filteredCats = computed(() =>
  dataStore.activeCategories.filter((c) => c.type === activeType.value),
);

const existingNames = computed(() =>
  dataStore.categories.map((c) => c.name),
);

function openAdd() {
  editingCat.value = null;
  showForm.value = true;
}

function openEdit(cat) {
  editingCat.value = cat;
  showForm.value = true;
}

function handleFormSave(formData) {
  const userId = userStore.currentUserId;
  if (editingCat.value) {
    dataStore.updateCategory(userId, editingCat.value.id, formData);
    appStore.showToast('分类已更新');
  } else {
    dataStore.addCategory(userId, formData);
    appStore.showToast('分类已添加');
  }
  dataStore.saveData(userId);
  dataStore.pushToBackend(userId);
  showForm.value = false;
}

function confirmDelete(cat) {
  deleteTarget.value = cat;
  showDelete.value = true;
}

function doDelete() {
  if (deleteTarget.value) {
    dataStore.softDeleteCategory(userStore.currentUserId, deleteTarget.value.id);
    dataStore.pushToBackend(userStore.currentUserId);
    appStore.showToast('分类已删除');
  }
  showDelete.value = false;
  deleteTarget.value = null;
}

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
.cat-page { gap: 20rpx; }
.cat-tabs { display: flex; gap: 12rpx; }
.cat-tab { flex: 1; padding: 24rpx; border-radius: 48rpx; text-align: center; background: #FFEEF2; font-size: 28rpx; color: #B5A4AB; }
.cat-tab--active { background: white; color: #FF85A2; font-weight: 600; box-shadow: 0 2px 8px rgba(255,133,162,0.10); }
.cat-list { background: white; border-radius: 40rpx; overflow: hidden; }
.cat-item { display: flex; align-items: center; gap: 20rpx; padding: 28rpx 32rpx; border-bottom: 1px solid #FFEEF2; }
.cat-item:last-child { border-bottom: none; }
.cat-item-icon { width: 80rpx; height: 80rpx; border-radius: 24rpx; display: flex; align-items: center; justify-content: center; font-size: 36rpx; }
.cat-item-info { flex: 1; }
.cat-item-name { font-size: 28rpx; font-weight: 500; color: #3D2C33; display: block; }
.cat-item-meta { font-size: 22rpx; color: #B5A4AB; margin-top: 4rpx; }
.cat-item-actions { display: flex; gap: 16rpx; }
.cat-action { width: 56rpx; height: 56rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28rpx; }
.cat-action--edit { background: #FFF5F7; }
.cat-action--delete { background: #FFF0F0; }
.cat-add-btn { width: 100%; padding: 28rpx; border-radius: 48rpx; background: white; color: #FF85A2; border: 4rpx dashed #FFD4DE; font-size: 28rpx; font-weight: 500; }
</style>
