<script>
import { isSessionValid, getSession } from './utils/storage.js';

export default {
  onLaunch() {
    console.log('[LingJi] App Launch');
    // 启动时检查会话有效性，后续在每个页面 onShow 中二次校验
    const valid = isSessionValid();
    if (!valid) {
      console.log('[LingJi] No valid session, will redirect to login');
    }
  },
  onShow() {
    console.log('[LingJi] App Show');
  },
  onHide() {
    console.log('[LingJi] App Hide');
  },
};
</script>

<style lang="scss">
/* ===== 全局样式 ===== */

/* 页面背景与基础重置 */
page {
  background: #FFEEF2;
  font-family: 'Be Vietnam Pro', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif;
  color: #3D2C33;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 28rpx;
  line-height: 1.5;
}

view, text, image, scroll-view, input, button {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 按钮重置 */
button {
  padding: 0;
  background: transparent;
  border: none;
  line-height: inherit;
  font-size: inherit;
}
button::after {
  border: none;
}

/* 输入框重置 */
input {
  font-family: inherit;
  font-size: inherit;
}

/* 链接重置 */
navigator {
  text-decoration: none;
  color: inherit;
}

/* ===== 应用容器（模拟手机框架） ===== */
.app-container {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #FFF5F7;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* ===== 主内容区 ===== */
.main-content {
  flex: 1;
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 底部留白（给 TabBar 让位） ===== */
.bottom-spacer {
  height: 120rpx;
}

/* ===== 分区标题 ===== */
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #3D2C33;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

/* ===== 通用工具类 ===== */
.text-primary { color: #FF85A2; }
.text-error { color: #FF7B89; }
.text-muted { color: #B5A4AB; }
.text-heading { color: #3D2C33; }
.text-body { color: #6B5B63; }

.font-heading { font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif; }
.font-body { font-family: 'Be Vietnam Pro', 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif; }

/* ===== 动画 ===== */
@keyframes float-up {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-60px) scale(1.3); }
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  15% { transform: scale(1.15); }
  30% { transform: scale(1); }
  45% { transform: scale(1.1); }
  60% { transform: scale(1); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(-24px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.animate-float-up { animation: float-up 1.5s ease-out forwards; }
.animate-heartbeat { animation: heartbeat 2s ease-in-out infinite; }
.animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
.animate-toast-in { animation: toast-in 0.3s ease-out; }
.animate-shake { animation: shake 0.3s ease-in-out; }
.animate-modal-in { animation: modal-in 0.25s ease-out; }

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
  text-align: center;
}
.empty-state-mascot {
  font-size: 112rpx;
  margin-bottom: 24rpx;
  animation: heartbeat 2s ease-in-out infinite;
}
.empty-state-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #6B5B63;
  margin-bottom: 12rpx;
}
.empty-state-desc {
  font-size: 28rpx;
  color: #B5A4AB;
  line-height: 1.6;
}

/* ===== 滚动条美化（仅 APP 端生效） ===== */
/* #ifdef APP-PLUS */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #FFD4DE; border-radius: 2px; }
/* #endif */
</style>
