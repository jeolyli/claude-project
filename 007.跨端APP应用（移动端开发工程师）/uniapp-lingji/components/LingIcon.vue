<template>
  <text class="ling-icon" :style="iconStyle">{{ emoji }}</text>
</template>

<script setup>
import { computed } from 'vue';

/**
 * 灵记图标组件
 * 使用 emoji 替代 Material Symbols SVG 图标
 * 兼容 iOS / Android / 微信小程序（无需 DOM API）
 */
const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 22 },
  filled: { type: Boolean, default: false },
  color: { type: String, default: '' },
});

// Icon name → emoji mapping (40+ icons from original icons.js)
const ICON_MAP = {
  // Navigation
  home: '🏠',
  arrow_back_ios: '◀',
  chevron_right: '▶',
  person: '👤',

  // Actions
  add: '➕',
  add_circle: '➕',
  edit: '✏️',
  delete: '🗑️',
  delete_forever: '🗑️',
  settings: '⚙️',
  search: '🔍',
  logout: '🚪',
  swap_horiz: '🔄',
  download: '📥',
  upload: '📤',
  cloud_upload: '☁️',
  cloud_sync: '🔄',

  // Finance
  account_balance_wallet: '💳',
  trending_down: '📉',
  trending_up: '📈',
  receipt: '🧾',
  receipt_long: '🧾',
  edit_note: '📝',
  leaderboard: '📊',
  analytics: '📈',

  // Calendar/Time
  calendar_month: '📅',
  date_range: '📆',

  // Category/Data
  category: '📂',
  table: '📋',
  file_export: '📤',

  // Security
  shield: '🛡️',
  lock: '🔒',
  warning: '⚠️',
  info: 'ℹ️',
  visibility: '👁️',
  visibility_off: '👁️‍🗨️',
  photo_camera: '📷',
};

const emoji = computed(() => ICON_MAP[props.name] || '•');

const iconStyle = computed(() => ({
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color || 'currentColor',
  lineHeight: 1,
}));
</script>

<style scoped>
.ling-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
