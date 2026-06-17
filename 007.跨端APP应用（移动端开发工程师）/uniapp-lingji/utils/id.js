/**
 * 灵记 - ID 生成工具
 * 与原始前端 storage.js 中的逻辑保持一致
 */

/** 生成交易流水 ID */
export function generateId() {
  return 'tx_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

/** 生成用户 ID */
export function generateUserId() {
  return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}
