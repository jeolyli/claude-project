/**
 * 认证路由 — 注册 & 登录
 *
 * POST /api/auth/register  用户注册
 * POST /api/auth/login     用户登录
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/connection');
const { hashPassword, verifyPassword } = require('../utils/crypto');
const { signToken } = require('../middleware/auth');

const router = express.Router();

// ===== 注册 =====
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // --- 参数校验 ---
    if (!username || !password) {
      return res.status(400).json({ success: false, error: '用户名和密码不能为空' });
    }
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ success: false, error: '用户名应为 2-20 个字符' });
    }
    if (/^\d+$/.test(username)) {
      return res.status(400).json({ success: false, error: '用户名不能为纯数字' });
    }
    if (password.length < 6 || password.length > 20) {
      return res.status(400).json({ success: false, error: '密码应为 6-20 个字符' });
    }
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ success: false, error: '密码需包含字母和数字' });
    }

    // --- 检查用户名唯一性 ---
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: '用户名已被注册' });
    }

    // --- 哈希密码 + 入库 ---
    const hashed = await hashPassword(password);
    const userId = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await pool.query(
      `INSERT INTO users (id, username, password_hash, salt, avatar, is_active, created_at, last_login_at)
       VALUES (?, ?, ?, ?, NULL, 1, ?, ?)`,
      [userId, username, hashed, '', now, now]
    );

    // --- 签发 Token ---
    const token = signToken({ id: userId, username });

    return res.status(201).json({
      success: true,
      user: {
        id: userId,
        username,
        avatar: null,
        created_at: now,
      },
      token,
    });
  } catch (err) {
    console.error('[register] 错误:', err.code || err.message);
    const msg = dbErrorMessage(err);
    return res.status(500).json({ success: false, error: msg });
  }
});

// ===== 登录 =====
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // --- 参数校验 ---
    if (!username || !password) {
      return res.status(400).json({ success: false, error: '用户名和密码不能为空' });
    }

    // --- 查找用户 ---
    const [rows] = await pool.query(
      'SELECT id, username, password_hash, avatar, is_active FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: '用户名或密码错误' });
    }

    const user = rows[0];

    // --- 检查账户状态 ---
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: '账户已被禁用，请联系管理员' });
    }

    // --- 验证密码 ---
    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: '用户名或密码错误' });
    }

    // --- 更新最后登录时间 ---
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await pool.query(
      'UPDATE users SET last_login_at = ? WHERE id = ?',
      [now, user.id]
    );

    // --- 签发 Token ---
    const token = signToken({ id: user.id, username: user.username });

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      token,
    });
  } catch (err) {
    console.error('[login] 错误:', err.code || err.message);
    const msg = dbErrorMessage(err);
    return res.status(500).json({ success: false, error: msg });
  }
});

/**
 * 将数据库错误码翻译为人类可读的提示
 */
function dbErrorMessage(err) {
  switch (err.code) {
    case 'ECONNREFUSED':
      return '数据库未连接，请先启动 MySQL';
    case 'ER_BAD_DB_ERROR':
      return '数据库 lingji 不存在，请先执行建库脚本';
    case 'ER_NO_SUCH_TABLE':
      return '数据表不存在，请先执行 001_init_database.sql';
    case 'ER_ACCESS_DENIED_ERROR':
      return '数据库登录失败，请检查 backend/.env 中的用户名密码';
    default:
      return '服务器内部错误，请稍后重试';
  }
}

module.exports = router;
