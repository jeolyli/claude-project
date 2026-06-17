<template>
  <view class="app-container">
    <AppHeader title="隐私设置" :showBack="true" />
    <view class="main-content privacy-page">
      <view class="privacy-card">
        <text class="privacy-title">🔒 修改密码</text>
        <text class="privacy-desc">请输入当前密码并设置新密码</text>

        <!-- Error / Success -->
        <view v-if="statusMsg" class="privacy-status" :class="{ 'privacy-status--error': statusType === 'error', 'privacy-status--success': statusType === 'success' }">
          <text>{{ statusMsg }}</text>
        </view>

        <!-- Old Password -->
        <view class="privacy-field">
          <text class="privacy-label">当前密码</text>
          <PasswordField v-model="oldPassword" placeholder="请输入当前密码" />
        </view>

        <!-- New Password -->
        <view class="privacy-field">
          <text class="privacy-label">新密码</text>
          <PasswordField v-model="newPassword" placeholder="请输入新密码（至少8位，含字母和数字）" />
        </view>

        <!-- Confirm -->
        <view class="privacy-field">
          <text class="privacy-label">确认密码</text>
          <PasswordField v-model="confirmPassword" placeholder="请再次输入新密码" />
        </view>

        <button class="privacy-save-btn" @click="handleChangePassword" :disabled="saving">
          {{ saving ? '保存中...' : '保存修改' }}
        </button>

        <view class="privacy-info">
          <text>💡 密码采用 SHA-256 加密存储，请放心使用</text>
        </view>
      </view>
      <view class="bottom-spacer" />
    </view>
    <LingToast />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '../../store/user.js';
import { useAppStore } from '../../store/app.js';
import { getUsers } from '../../utils/storage.js';
import { sha256, generateSalt, hashPassword } from '../../utils/crypto.js';
import AppHeader from '../../components/AppHeader.vue';
import PasswordField from '../../components/PasswordField.vue';
import LingToast from '../../components/LingToast.vue';

const userStore = useUserStore();
const appStore = useAppStore();

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const statusMsg = ref('');
const statusType = ref('error');
const saving = ref(false);

function validate() {
  if (!oldPassword.value) return '请输入当前密码';
  const np = newPassword.value;
  if (!np) return '请输入新密码';
  if (np.length < 8) return '新密码长度至少8位';
  if (!/[a-zA-Z]/.test(np)) return '新密码需包含字母';
  if (!/[0-9]/.test(np)) return '新密码需包含数字';
  if (np !== confirmPassword.value) return '两次密码不一致';
  return null;
}

async function handleChangePassword() {
  statusMsg.value = '';

  const error = validate();
  if (error) {
    statusMsg.value = error;
    statusType.value = 'error';
    return;
  }

  saving.value = true;
  try {
    const userId = userStore.currentUserId;
    const users = getUsers();
    const user = users[userId];

    if (!user) {
      statusMsg.value = '用户信息异常';
      statusType.value = 'error';
      saving.value = false;
      return;
    }

    // Verify old password
    if (user.password_hash) {
      const oldHash = hashPassword(oldPassword.value, user.salt || '');
      if (oldHash !== user.password_hash) {
        statusMsg.value = '当前密码错误';
        statusType.value = 'error';
        saving.value = false;
        return;
      }
    }

    // Hash new password
    const salt = generateSalt();
    const newHash = hashPassword(newPassword.value, salt);

    // Save
    await userStore.changePassword(userId, newHash, salt);

    statusMsg.value = '✅ 密码修改成功';
    statusType.value = 'success';
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';

    appStore.showToast('密码修改成功');
  } catch (e) {
    statusMsg.value = e.message || '修改失败';
    statusType.value = 'error';
  } finally {
    saving.value = false;
  }
}

onShow(() => {
  if (!userStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/auth/login' });
    return;
  }
});
</script>

<style scoped>
.privacy-page { gap: 20rpx; }
.privacy-card { background: white; border-radius: 40rpx; padding: 40rpx; }
.privacy-title { font-size: 32rpx; font-weight: 600; color: #3D2C33; display: block; margin-bottom: 8rpx; }
.privacy-desc { font-size: 26rpx; color: #B5A4AB; margin-bottom: 24rpx; display: block; }
.privacy-status { padding: 20rpx 24rpx; border-radius: 24rpx; margin-bottom: 20rpx; font-size: 26rpx; }
.privacy-status--error { background: #FFF0F0; color: #FF7B89; }
.privacy-status--success { background: #F0FFF5; color: #A8D8CA; }
.privacy-field { margin-bottom: 24rpx; }
.privacy-label { font-size: 26rpx; color: #6B5B63; margin-bottom: 12rpx; display: block; font-weight: 500; }
.privacy-save-btn {
  width: 100%; padding: 28rpx; border-radius: 48rpx; margin-top: 8rpx;
  background: linear-gradient(135deg, #FF85A2, #FFB3C6); color: white;
  font-size: 30rpx; font-weight: 600; border: none;
}
.privacy-save-btn[disabled] { opacity: 0.6; }
.privacy-info { margin-top: 24rpx; padding: 24rpx; background: #FFF5F7; border-radius: 24rpx; font-size: 24rpx; color: #B5A4AB; text-align: center; }
</style>
