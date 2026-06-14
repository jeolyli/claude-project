/**
 * 灵记 (LingJi) — Express 后端入口
 *
 * 职责:
 *   1. 提供 REST API（/api/auth/*）
 *   2. 托管前端静态文件（复用已有原生页面）
 *
 * 启动方式:
 *   npm run dev    → 开发模式（文件变更自动重启）
 *   npm start      → 生产模式
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const pool = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 3001;
const STATIC_DIR = path.resolve(__dirname, process.env.STATIC_DIR || '../frontend');

// --- 数据库连接状态 ---
let dbStatus = { connected: false, error: null };

async function checkDatabase() {
  try {
    await pool.query('SELECT 1');
    dbStatus = { connected: true, error: null };
    console.log('✅ 数据库连接成功');
  } catch (err) {
    dbStatus = { connected: false, error: err.code || err.message };
    console.warn('⚠️  数据库连接失败:', dbStatus.error);
    console.warn('   → 登录/注册 API 暂不可用');
    console.warn('   → 其他页面（首页、账单、统计等）不受影响');
  }
}

// --- 中间件 ---
app.use(cors());
app.use(express.json());

// --- API 路由 ---
app.use('/api/auth', authRoutes);

// 健康检查（含数据库状态）
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// --- 前端静态文件 ---
// 所有非 /api 的请求走静态文件服务
app.use(express.static(STATIC_DIR));

// SPA fallback: 未匹配的路径返回 index.html
app.get('*', (req, res, next) => {
  // 跳过 API 路径
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(STATIC_DIR, 'index.html'), (err) => {
    if (err) res.status(404).send('页面未找到');
  });
});

// --- 全局错误处理 ---
app.use((err, _req, res, _next) => {
  console.error('[server] 未捕获错误:', err);
  res.status(500).json({ success: false, error: '服务器内部错误' });
});

// --- 启动 ---
app.listen(PORT, async () => {
  console.log(`🐰 灵记后端已启动 → http://localhost:${PORT}`);
  console.log(`📁 静态文件目录: ${STATIC_DIR}`);
  console.log(`🔑 API 端点: http://localhost:${PORT}/api/auth/login`);
  console.log(`🔑 API 端点: http://localhost:${PORT}/api/auth/register`);
  await checkDatabase();
});
