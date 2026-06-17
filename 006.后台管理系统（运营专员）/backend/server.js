/**
 * 灵记后台管理系统 - Express 服务
 * 端口: 3002
 * API 前缀: /api/admin
 * 静态文件: ../frontend/admin
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const adminRoutes = require('./routes/admin');
const pool = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// 管理后台 API
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/api/admin/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: { connected: true } });
  } catch (e) {
    res.json({ status: 'ok', database: { connected: false, error: e.message } });
  }
});

// 静态文件
const STATIC_DIR = path.join(__dirname, '..', 'frontend', 'admin');
app.use(express.static(STATIC_DIR));
app.get('*', (_req, res) => res.sendFile(path.join(STATIC_DIR, 'login.html'), err => {
  if (err) res.status(404).send('页面未找到');
}));

app.listen(PORT, () => {
  console.log(`🔧 灵记管理后台 → http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/admin/health`);
});
