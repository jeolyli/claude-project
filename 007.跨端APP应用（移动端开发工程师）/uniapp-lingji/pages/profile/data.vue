<template>
  <view class="app-container">
    <AppHeader title="数据管理" :showBack="true" />
    <view class="main-content data-page">
      <!-- Stats -->
      <view class="data-stats">
        <view class="data-stat">
          <text class="data-stat-num">{{ dataStore.transactions.length }}</text>
          <text class="data-stat-label">总记录数</text>
        </view>
        <view class="data-stat">
          <text class="data-stat-num">{{ dataStore.activeCategories.length }}</text>
          <text class="data-stat-label">活跃分类</text>
        </view>
        <view class="data-stat">
          <text class="data-stat-num">{{ earliestDate }}</text>
          <text class="data-stat-label">最早记录</text>
        </view>
      </view>

      <!-- Actions -->
      <view class="data-actions">
        <button class="data-btn data-btn--primary" @click="handleBackupJSON">💾 备份数据 (JSON)</button>
        <button class="data-btn data-btn--outline" @click="handleRestore">📂 从备份恢复</button>
        <button class="data-btn data-btn--danger" @click="showClear = true">🗑️ 清除所有流水记录</button>
      </view>

      <view class="bottom-spacer" />
    </view>

    <!-- Clear Confirm -->
    <ModalDialog
      :visible="showClear"
      title="清除所有流水"
      desc="此操作不可撤销，所有交易记录将被永久删除。建议先导出备份。"
      icon="⚠️"
      confirmText="确认清除"
      @cancel="showClear = false"
      @confirm="doClear"
    />

    <!-- Restore Confirm -->
    <ModalDialog
      :visible="showRestore"
      title="恢复数据"
      desc="恢复备份将覆盖当前所有数据，确定继续？"
      icon="⚠️"
      confirmText="确认恢复"
      @cancel="showRestore = false"
      @confirm="doRestore"
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
import ModalDialog from '../../components/ModalDialog.vue';
import LingToast from '../../components/LingToast.vue';

const userStore = useUserStore();
const dataStore = useDataStore();
const appStore = useAppStore();

const showClear = ref(false);
const showRestore = ref(false);
const restoreData = ref(null);

const earliestDate = computed(() => {
  if (!dataStore.transactions.length) return '—';
  const dates = dataStore.transactions.map((t) => t.date).sort();
  return dates[0] || '—';
});

function handleBackupJSON() {
  const json = JSON.stringify(dataStore.exportJSON(), null, 2);
  const fileName = `lingji_backup_${new Date().toISOString().slice(0, 10)}.json`;
  // #ifdef APP-PLUS
  const filePath = `_downloads/${fileName}`;
  plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
    fs.root.getFile(filePath, { create: true }, (fileEntry) => {
      fileEntry.createWriter((writer) => {
        writer.write(json);
        appStore.showToast('备份已保存到 Downloads');
      });
    });
  });
  // #endif
  // #ifdef MP-WEIXIN
  const fs = wx.getFileSystemManager();
  const tempPath = `${wx.env.USER_DATA_PATH}/${fileName}`;
  fs.writeFileSync(tempPath, json, 'utf8');
  wx.shareFileMessage({ filePath: tempPath, fileName });
  // #endif
  // #ifndef APP-PLUS || MP-WEIXIN
  uni.setClipboardData({
    data: json,
    success: () => appStore.showToast('备份内容已复制'),
  });
  // #endif
}

function handleRestore() {
  // #ifdef APP-PLUS || MP-WEIXIN
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['.json'],
    success: (res) => {
      const fs = uni.getFileSystemManager();
      fs.readFile({
        filePath: res.tempFiles[0].path,
        encoding: 'utf8',
        success: (readRes) => {
          try {
            restoreData.value = JSON.parse(readRes.data);
            showRestore.value = true;
          } catch {
            appStore.showToast('文件格式不正确', 'error');
          }
        },
        fail: () => appStore.showToast('读取文件失败', 'error'),
      });
    },
  });
  // #endif
  // #ifndef APP-PLUS || MP-WEIXIN
  appStore.showToast('请使用 APP 或小程序进行恢复', 'error');
  // #endif
}

function doRestore() {
  if (restoreData.value) {
    dataStore.restoreFromBackup(userStore.currentUserId, restoreData.value);
    dataStore.pushToBackend(userStore.currentUserId);
    appStore.showToast('数据已恢复');
  }
  showRestore.value = false;
  restoreData.value = null;
}

function doClear() {
  dataStore.clearTransactions(userStore.currentUserId);
  dataStore.pushToBackend(userStore.currentUserId);
  appStore.showToast('流水记录已清除');
  showClear.value = false;
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
.data-page { gap: 20rpx; }
.data-stats { display: flex; gap: 16rpx; }
.data-stat { flex: 1; background: white; border-radius: 32rpx; padding: 32rpx 16rpx; text-align: center; }
.data-stat-num { font-size: 48rpx; font-weight: 700; color: #FF85A2; display: block; }
.data-stat-label { font-size: 22rpx; color: #B5A4AB; margin-top: 8rpx; }
.data-actions { display: flex; flex-direction: column; gap: 16rpx; }
.data-btn { width: 100%; padding: 28rpx; border-radius: 48rpx; font-size: 28rpx; font-weight: 500; border: none; background: white; }
.data-btn--primary { color: #FF85A2; }
.data-btn--outline { color: #6B5B63; border: 3rpx solid #E8DCE1; }
.data-btn--danger { color: #FF7B89; border: 3rpx solid #FFD4DE; }
</style>
