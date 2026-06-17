<template>
  <view class="cat-form-overlay" v-if="visible" @click="$emit('cancel')">
    <view class="cat-form" @click.stop>
      <text class="cat-form-title">{{ editing ? '编辑分类' : '添加分类' }}</text>

      <!-- Name -->
      <view class="cat-form-field">
        <text class="cat-form-label">分类名称</text>
        <view class="cat-form-input-wrap" @click="focusNameInput">
          <input
            ref="nameInputRef"
            class="cat-form-input"
            type="text"
            v-model="formName"
            placeholder="输入分类名称"
            maxlength="10"
            adjust-position
          />
        </view>
      </view>

      <!-- Type -->
      <view class="cat-form-field">
        <text class="cat-form-label">分类类型</text>
        <view class="cat-type-switch">
          <view
            class="cat-type-btn"
            :class="{ 'cat-type-btn--active': formType === 'expense' }"
            @click="formType = 'expense'"
          >
            <text>支出</text>
          </view>
          <view
            class="cat-type-btn"
            :class="{ 'cat-type-btn--active': formType === 'income' }"
            @click="formType = 'income'"
          >
            <text>收入</text>
          </view>
        </view>
      </view>

      <!-- Emoji -->
      <view class="cat-form-field">
        <text class="cat-form-label">选择图标</text>
        <EmojiPicker v-model="formIcon" />
      </view>

      <!-- Color -->
      <view class="cat-form-field">
        <text class="cat-form-label">选择颜色</text>
        <ColorPicker v-model="formColor" />
      </view>

      <!-- Actions -->
      <view class="cat-form-actions">
        <button class="cat-form-btn cat-form-btn--cancel" @click="$emit('cancel')">取消</button>
        <button class="cat-form-btn cat-form-btn--save" @click="handleSave">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';
import EmojiPicker from './EmojiPicker.vue';
import ColorPicker from './ColorPicker.vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  editing: { type: Boolean, default: false },
  category: { type: Object, default: () => null },
  existingNames: { type: Array, default: () => [] },
});

const emit = defineEmits(['save', 'cancel']);

const formName = ref('');
const nameInputRef = ref(null);

function focusNameInput() {
  if (nameInputRef.value) {
    try { nameInputRef.value.focus && nameInputRef.value.focus(); } catch (_) {}
  }
}
const formIcon = ref('🍔');
const formColor = ref('#FFAB91');
const formType = ref('expense');

watch(() => props.category, (cat) => {
  if (cat) {
    formName.value = cat.name || '';
    formIcon.value = cat.icon || '🍔';
    formColor.value = cat.color || '#FFAB91';
    formType.value = cat.type || 'expense';
  } else {
    formName.value = '';
    formIcon.value = '🍔';
    formColor.value = '#FFAB91';
    formType.value = 'expense';
  }
}, { immediate: true });

function handleSave() {
  const name = formName.value.trim();
  if (!name) {
    uni.showToast({ title: '请输入分类名称', icon: 'none' });
    return;
  }
  if (name.length > 10) {
    uni.showToast({ title: '分类名称不超过10个字符', icon: 'none' });
    return;
  }
  // Duplicate check (skip if editing and name unchanged)
  const isDuplicate = props.existingNames.some(
    (n) => n === name && (!props.editing || (props.category && n !== props.category.name)),
  );
  if (isDuplicate) {
    uni.showToast({ title: '分类名称已存在', icon: 'none' });
    return;
  }

  emit('save', {
    name,
    icon: formIcon.value,
    color: formColor.value,
    type: formType.value,
  });
}
</script>

<style scoped>
.cat-form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(61, 44, 51, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 2000;
}

.cat-form {
  background: white;
  border-radius: 48rpx 48rpx 0 0;
  padding: 40rpx 32rpx;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  max-height: 85vh;
  overflow-y: auto;
  animation: modal-in 0.25s ease-out;
}

.cat-form-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #3D2C33;
  text-align: center;
  margin-bottom: 32rpx;
  display: block;
}

.cat-form-field {
  margin-bottom: 24rpx;
}

.cat-form-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #6B5B63;
  margin-bottom: 12rpx;
  display: block;
}

.cat-form-input-wrap {
  background: #FFF5F7;
  border: 2rpx solid #E8DCE1;
  border-radius: 24rpx;
}

.cat-form-input {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 28rpx;
  font-size: 30rpx;
  color: #3D2C33;
}

.cat-type-switch {
  display: flex;
  gap: 16rpx;
}

.cat-type-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 24rpx;
  text-align: center;
  background: #FFEEF2;
  font-size: 26rpx;
  color: #B5A4AB;
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.cat-type-btn--active {
  background: white;
  border-color: #FF85A2;
  color: #FF85A2;
  font-weight: 600;
}

.cat-form-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
}

.cat-form-btn {
  flex: 1;
  padding: 28rpx;
  border-radius: 48rpx;
  font-size: 30rpx;
  font-weight: 500;
  border: none;
}

.cat-form-btn--cancel {
  background: #FFEEF2;
  color: #6B5B63;
}

.cat-form-btn--save {
  background: linear-gradient(135deg, #FF85A2, #FFB3C6);
  color: white;
}
</style>
