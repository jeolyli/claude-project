/**
 * 管理后台 API 路由
 * 路径前缀: /api/admin
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/connection');
const { signToken, adminMiddleware } = require('../middleware/adminAuth');

// ==================== 登录 ====================

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({ success: false, error: '用户名和密码不能为空' });
    }

    // 管理员通过 user 表的 status=9 标识（不改表结构）
    const [rows] = await pool.query(
      'SELECT id, username, password, nickname FROM user WHERE username = ? AND status = 9 AND deleted = 0',
      [username]
    );

    if (rows.length === 0) {
      // 兼容 env 中配置的管理员账号
      const adminUser = process.env.ADMIN_USERNAME || 'admin';
      const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
      if (username === adminUser && password === adminPass) {
        const token = signToken({ id: 0, username: adminUser });
        return res.json({ success: true, token, user: { id: 0, username: adminUser, nickname: '超级管理员' } });
      }
      return res.json({ success: false, error: '用户名或密码错误' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.json({ success: false, error: '用户名或密码错误' });
    }

    const token = signToken({ id: user.id, username: user.username });
    res.json({ success: true, token, user: { id: user.id, username: user.username, nickname: user.nickname } });
  } catch (e) {
    console.error('[admin] login error:', e);
    res.json({ success: false, error: '服务器错误' });
  }
});

// ==================== 运营概览 ====================

router.get('/dashboard/overview', adminMiddleware, async (_req, res) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) AS total FROM user WHERE deleted = 0');
    const [newUsers] = await pool.query(
      'SELECT COUNT(*) AS total FROM user WHERE deleted = 0 AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())'
    );
    const [txCount] = await pool.query('SELECT COUNT(*) AS total FROM transaction WHERE deleted = 0');
    const [monthTx] = await pool.query(
      'SELECT COUNT(*) AS total FROM transaction WHERE deleted = 0 AND YEAR(date) = YEAR(NOW()) AND MONTH(date) = MONTH(NOW())'
    );
    const [expense] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transaction WHERE deleted = 0 AND type = 'expense'"
    );
    const [income] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transaction WHERE deleted = 0 AND type = 'income'"
    );
    const [monthExpense] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transaction WHERE deleted = 0 AND type = 'expense' AND YEAR(date) = YEAR(NOW()) AND MONTH(date) = MONTH(NOW())"
    );
    const [monthIncome] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transaction WHERE deleted = 0 AND type = 'income' AND YEAR(date) = YEAR(NOW()) AND MONTH(date) = MONTH(NOW())"
    );
    const [activeUsers] = await pool.query(
      'SELECT COUNT(DISTINCT user_id) AS total FROM transaction WHERE deleted = 0 AND YEAR(date) = YEAR(NOW()) AND MONTH(date) = MONTH(NOW())'
    );

    res.json({
      success: true,
      data: {
        totalUsers: userCount[0].total,
        newUsersThisMonth: newUsers[0].total,
        totalTransactions: txCount[0].total,
        monthTransactions: monthTx[0].total,
        totalExpense: expense[0].total,
        totalIncome: income[0].total,
        monthExpense: monthExpense[0].total,
        monthIncome: monthIncome[0].total,
        activeUsers: activeUsers[0].total,
      },
    });
  } catch (e) {
    console.error('[admin] overview error:', e);
    res.json({ success: false, error: '查询失败' });
  }
});

router.get('/dashboard/trends', adminMiddleware, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT date,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS expense,
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) AS income,
        COUNT(*) AS count
       FROM transaction WHERE deleted = 0 AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY date ORDER BY date ASC`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error('[admin] trends error:', e);
    res.json({ success: false, error: '查询失败' });
  }
});

router.get('/dashboard/top-categories', adminMiddleware, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.icon, c.color, COUNT(t.id) AS count, COALESCE(SUM(t.amount), 0) AS total
       FROM transaction t JOIN category c ON t.category_id = c.id
       WHERE t.deleted = 0 AND t.type = 'expense'
       GROUP BY c.id, c.name, c.icon, c.color
       ORDER BY total DESC LIMIT 10`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error('[admin] categories error:', e);
    res.json({ success: false, error: '查询失败' });
  }
});

router.get('/dashboard/top-users', adminMiddleware, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.nickname, COUNT(t.id) AS count, COALESCE(SUM(t.amount), 0) AS total
       FROM transaction t JOIN user u ON t.user_id = u.id
       WHERE t.deleted = 0 AND YEAR(t.date) = YEAR(NOW()) AND MONTH(t.date) = MONTH(NOW())
       GROUP BY u.id, u.username, u.nickname
       ORDER BY count DESC LIMIT 10`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error('[admin] top-users error:', e);
    res.json({ success: false, error: '查询失败' });
  }
});

router.get('/dashboard/recent-users', adminMiddleware, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, avatar_url, created_at FROM user WHERE deleted = 0 AND status != 9 ORDER BY created_at DESC LIMIT 10'
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error('[admin] recent-users error:', e);
    res.json({ success: false, error: '查询失败' });
  }
});

// ==================== 用户管理 ====================

router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const keyword = req.query.keyword || '';
    const status = req.query.status;

    let where = 'WHERE u.deleted = 0 AND u.status != 9';
    const params = [];

    if (keyword) {
      where += ' AND (u.username LIKE ? OR u.nickname LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (status !== undefined && status !== '') {
      where += ' AND u.status = ?';
      params.push(parseInt(status));
    }

    const [countResult] = await pool.query(`SELECT COUNT(*) AS total FROM user u ${where}`, params);
    const total = countResult[0].total;

    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.nickname, u.avatar_url, u.email, u.status, u.created_at,
        (SELECT COUNT(*) FROM transaction WHERE user_id = u.id AND deleted = 0) AS tx_count,
        (SELECT MAX(date) FROM transaction WHERE user_id = u.id AND deleted = 0) AS last_tx_date
       FROM user u ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({ success: true, data: { records: rows, total, page, pageSize } });
  } catch (e) {
    console.error('[admin] users error:', e);
    res.json({ success: false, error: '查询失败' });
  }
});

router.get('/users/:id', adminMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM user WHERE id = ? AND deleted = 0', [req.params.id]);
    if (!users.length) return res.json({ success: false, error: '用户不存在' });

    const user = users[0];
    delete user.password;

    // 交易统计
    const [txStats] = await pool.query(
      `SELECT type, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
       FROM transaction WHERE user_id = ? AND deleted = 0 GROUP BY type`,
      [user.id]
    );
    const [recentTx] = await pool.query(
      `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transaction t LEFT JOIN category c ON t.category_id = c.id
       WHERE t.user_id = ? AND t.deleted = 0 ORDER BY t.date DESC LIMIT 20`,
      [user.id]
    );

    // 预算情况
    const [budget] = await pool.query(
      'SELECT * FROM budget WHERE user_id = ? AND deleted = 0 ORDER BY year DESC, month DESC LIMIT 3',
      [user.id]
    );

    res.json({ success: true, data: { user, txStats, recentTx, budget } });
  } catch (e) {
    console.error('[admin] user detail error:', e);
    res.json({ success: false, error: '查询失败' });
  }
});

router.put('/users/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (![0, 1].includes(status)) {
      return res.json({ success: false, error: '无效的状态值' });
    }
    await pool.query('UPDATE user SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: '状态已更新' });
  } catch (e) {
    console.error('[admin] user status error:', e);
    res.json({ success: false, error: '更新失败' });
  }
});

// ==================== 交易管理 ====================

router.get('/transactions', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const { type, userId, startDate, endDate, keyword } = req.query;

    let where = 'WHERE t.deleted = 0';
    const params = [];

    if (type) { where += ' AND t.type = ?'; params.push(type); }
    if (userId) { where += ' AND t.user_id = ?'; params.push(parseInt(userId)); }
    if (startDate) { where += ' AND t.date >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND t.date <= ?'; params.push(endDate); }
    if (keyword) {
      where += ' AND (t.note LIKE ? OR t.amount LIKE ? OR c.name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM transaction t LEFT JOIN category c ON t.category_id = c.id ${where}`, params
    );
    const total = countResult[0].total;

    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT t.*, u.username, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transaction t
       LEFT JOIN user u ON t.user_id = u.id
       LEFT JOIN category c ON t.category_id = c.id
       ${where} ORDER BY t.date DESC, t.id DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({ success: true, data: { records: rows, total, page, pageSize } });
  } catch (e) {
    console.error('[admin] transactions error:', e);
    res.json({ success: false, error: '查询失败' });
  }
});

router.get('/transactions/export', adminMiddleware, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    let where = 'WHERE t.deleted = 0';
    const params = [];
    if (type) { where += ' AND t.type = ?'; params.push(type); }
    if (startDate) { where += ' AND t.date >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND t.date <= ?'; params.push(endDate); }

    const [rows] = await pool.query(
      `SELECT t.date, t.type, t.amount, c.name AS category, u.username, t.note
       FROM transaction t
       LEFT JOIN category c ON t.category_id = c.id
       LEFT JOIN user u ON t.user_id = u.id
       ${where} ORDER BY t.date DESC, t.id DESC`,
      params
    );

    const BOM = '﻿';
    let csv = BOM + '日期,类型,分类,金额,用户,备注\n';
    rows.forEach(r => {
      const type = r.type === 'income' ? '收入' : '支出';
      csv += `${r.date},${type},"${r.category || ''}",${r.amount},"${r.username || ''}","${(r.note || '').replace(/"/g, '""')}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (e) {
    console.error('[admin] export error:', e);
    res.json({ success: false, error: '导出失败' });
  }
});

// ==================== 预算管理 ====================

router.get('/budgets', adminMiddleware, async (req, res) => {
  try {
    const { year, month, health } = req.query;
    let where = 'WHERE b.deleted = 0';
    const params = [];
    if (year) { where += ' AND b.year = ?'; params.push(parseInt(year)); }
    if (month) { where += ' AND b.month = ?'; params.push(parseInt(month)); }

    const [rows] = await pool.query(
      `SELECT b.*, u.username, u.nickname,
        COALESCE((SELECT SUM(amount) FROM transaction WHERE user_id = b.user_id AND type = 'expense'
          AND YEAR(date) = b.year AND MONTH(date) = b.month AND deleted = 0), 0) AS actual_expense
       FROM budget b JOIN user u ON b.user_id = u.id ${where} ORDER BY b.year DESC, b.month DESC, actual_expense DESC`,
      params
    );

    // 计算健康度
    const data = rows.map(r => {
      const pct = r.total_budget > 0 ? (r.actual_expense / r.total_budget) * 100 : 0;
      let h = 'green';
      if (pct >= 100) h = 'red';
      else if (pct >= 85) h = 'orange';
      else if (pct >= 60) h = 'yellow';
      return { ...r, usagePercent: Math.round(pct * 100) / 100, health: h, remaining: Math.max(0, r.total_budget - r.actual_expense) };
    });

    if (health) {
      res.json({ success: true, data: data.filter(r => r.health === health) });
    } else {
      res.json({ success: true, data });
    }
  } catch (e) {
    console.error('[admin] budgets error:', e);
    res.json({ success: false, error: '查询失败' });
  }
});

// ==================== 分类统计 ====================

router.get('/categories/stats', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.icon, c.color, c.type, c.is_preset,
        COUNT(t.id) AS tx_count, COALESCE(SUM(t.amount), 0) AS total_amount
       FROM category c LEFT JOIN transaction t ON c.id = t.category_id AND t.deleted = 0
       WHERE c.deleted = 0 AND c.is_active = 1
       GROUP BY c.id, c.name, c.icon, c.color, c.type, c.is_preset
       ORDER BY total_amount DESC`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error('[admin] cat stats error:', e);
    res.json({ success: false, error: '查询失败' });
  }
});

module.exports = router;
