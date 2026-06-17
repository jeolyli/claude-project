/**
 * 灵记 - 应用全局 Store
 * Toast 通知、当前 Tab 等轻量全局状态
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  // ===== Toast =====
  const toast = ref({ message: '', type: 'success', visible: false });
  let toastTimer = null;

  function showToast(message, type = 'success', duration = 2000) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.value = { message, type, visible: true };
    toastTimer = setTimeout(() => {
      toast.value.visible = false;
    }, duration);
  }

  function hideToast() {
    if (toastTimer) clearTimeout(toastTimer);
    toast.value.visible = false;
  }

  // ===== Current Tab =====
  const currentTab = ref('home');

  function setTab(tab) {
    currentTab.value = tab;
  }

  return {
    toast,
    currentTab,
    showToast,
    hideToast,
    setTab,
  };
});
