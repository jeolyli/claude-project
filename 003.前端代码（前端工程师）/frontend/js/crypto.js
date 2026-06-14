/**
 * 灵记 - 密码加密工具
 * SHA-256 哈希 + 加盐（Web Crypto API）
 */

/**
 * SHA-256 哈希
 */
export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 生成 16 字节随机盐
 */
export function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 密码加盐哈希：SHA-256(password + salt)
 */
export async function hashPassword(password, salt) {
  return sha256(password + salt);
}
