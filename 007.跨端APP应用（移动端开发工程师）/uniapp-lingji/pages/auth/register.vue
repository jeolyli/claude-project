<template>
  <view class="auth-page">
    <view class="auth-card">
      <text class="auth-mascot">🐰</text>
      <text class="auth-title">加入灵记</text>
      <text class="auth-subtitle">开始你的理财小生活</text>

      <view v-if="error" class="auth-error animate-shake">
        <text class="auth-error-text">{{ error }}</text>
      </view>

      <!-- Username -->
      <view class="auth-field" @click="focusInput('usernameInput')">
        <text class="auth-field-icon">👤</text>
        <input ref="usernameInput" class="auth-input" type="text" v-model="username" placeholder="请输入用户名（2-20字符）" maxlength="20" adjust-position @focus="error = ''" />
      </view>

      <!-- Password -->
      <view class="auth-field" @click="focusInput('passwordInput')">
        <text class="auth-field-icon">🔒</text>
        <input ref="passwordInput" class="auth-input" :type="showPass1 ? 'text' : 'password'" v-model="password" placeholder="请输入密码" maxlength="20" adjust-position @focus="error = ''" />
        <view class="auth-field-toggle" @click.stop="showPass1 = !showPass1">
          <text>{{ showPass1 ? '👁️' : '👁️‍🗨️' }}</text>
        </view>
      </view>

      <!-- Confirm Password -->
      <view class="auth-field" @click="focusInput('confirmInput')">
        <text class="auth-field-icon">🔒</text>
        <input ref="confirmInput" class="auth-input" :type="showPass2 ? 'text' : 'password'" v-model="confirmPass" placeholder="请确认密码" maxlength="20" adjust-position @focus="error = ''" />
        <view class="auth-field-toggle" @click.stop="showPass2 = !showPass2">
          <text>{{ showPass2 ? '👁️' : '👁️‍🗨️' }}</text>
        </view>
      </view>

      <view class="auth-hint">
        <text>密码需包含字母和数字，至少8位</text>
      </view>

      <button class="auth-submit" @click="handleRegister" :loading="userStore.loginLoading" :disabled="userStore.loginLoading">
        注册
      </button>

      <view class="auth-switch">
        <text class="auth-switch-text">已有账号？</text>
        <text class="auth-switch-link" @click="goLogin">去登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../../store/user.js';
import { useAppStore } from '../../store/app.js';

const userStore = useUserStore();
const appStore = useAppStore();

const username = ref('');
const password = ref('');
const confirmPass = ref('');
const showPass1 = ref(false);
const showPass2 = ref(false);
const error = ref('');
const usernameInput = ref(null);
const passwordInput = ref(null);
const confirmInput = ref(null);

function focusInput(refName) {
  const map = { usernameInput, passwordInput, confirmInput };
  const el = map[refName]?.value;
  if (el) { try { el.focus && el.focus(); } catch (_) {} }
}

function validate() {
  const u = username.value.trim();
  if (!u) return '请输入用户名';
  if (u.length < 2 || u.length > 20) return '用户名应为2-20个字符';
  const p = password.value;
  if (!p) return '请输入密码';
  if (p.length < 8) return '密码长度至少8位';
  if (!/[a-zA-Z]/.test(p)) return '密码需包含字母';
  if (!/[0-9]/.test(p)) return '密码需包含数字';
  if (p !== confirmPass.value) return '两次密码不一致';
  return null;
}

async function handleRegister() {
  error.value = '';
  const msg = validate();
  if (msg) { error.value = msg; return; }
  try {
    await userStore.register(username.value.trim(), password.value);
    appStore.showToast('🎉 注册成功！');
    setTimeout(() => { uni.reLaunch({ url: '/pages/home/home' }); }, 600);
  } catch (e) {
    error.value = e.message || '注册失败，请检查后端服务';
  }
}

function goLogin() {
  uni.redirectTo({ url: '/pages/auth/login' });
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #FFEEF2 0%, #FFF5F7 50%, white 100%);
  padding: 40rpx;
}

.auth-card {
  background: white;
  border-radius: 48rpx;
  padding: 60rpx 48rpx 48rpx;
  width: 100%;
  max-width: 600rpx;
  box-shadow: 0 8px 32px rgba(255, 133, 162, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-mascot { font-size: 100rpx; animation: heartbeat 2s ease-in-out infinite; margin-bottom: 16rpx; }
.auth-title { font-size: 40rpx; font-weight: 700; color: #3D2C33; font-family: 'Plus Jakarta Sans', 'PingFang SC', system-ui, sans-serif; }
.auth-subtitle { font-size: 26rpx; color: #B5A4AB; margin-top: 8rpx; margin-bottom: 40rpx; }

.auth-error { background: #FFF0F0; border-radius: 24rpx; padding: 20rpx 28rpx; width: 100%; margin-bottom: 16rpx; }
.auth-error-text { font-size: 26rpx; color: #FF7B89; }

.auth-field {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  min-height: 96rpx;
  background: #FFF5F7;
  border: 2rpx solid #E8DCE1;
  border-radius: 32rpx;
  padding-left: 28rpx;
  padding-right: 28rpx;
  margin-bottom: 20rpx;
}

.auth-field-icon { font-size: 36rpx; margin-right: 16rpx; flex-shrink: 0; }

.auth-input {
  flex: 1;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 30rpx;
  color: #3D2C33;
  background: transparent;
}

.auth-field-toggle { padding-left: 16rpx; font-size: 32rpx; flex-shrink: 0; }

.auth-hint { width: 100%; margin-bottom: 16rpx; padding: 0 16rpx; }
.auth-hint text { font-size: 22rpx; color: #B5A4AB; }

.auth-submit {
  width: 100%;
  padding: 30rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #FF85A2, #FFB3C6);
  color: white;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  margin-top: 8rpx;
  box-shadow: 0 4px 12px rgba(255, 133, 162, 0.25);
}

.auth-submit[disabled] { opacity: 0.6; }

.auth-switch { display: flex; flex-direction: row; margin-top: 32rpx; }
.auth-switch-text { font-size: 26rpx; color: #B5A4AB; margin-right: 8rpx; }
.auth-switch-link { font-size: 26rpx; color: #FF85A2; font-weight: 600; }
</style>
