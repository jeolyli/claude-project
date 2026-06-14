/**
 * 密码加密工具
 * 使用 bcryptjs（纯 JS 实现，无原生依赖）
 */
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * 对明文密码进行哈希
 * @param {string} plainPassword - 明文密码
 * @returns {Promise<string>} bcrypt 哈希值
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * 验证密码是否匹配
 * @param {string} plainPassword - 用户输入的明文密码
 * @param {string} hashedPassword - 数据库中存储的哈希值
 * @returns {Promise<boolean>}
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { hashPassword, verifyPassword };
