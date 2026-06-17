/**
 * 管理员认证中间件
 * JWT 签发 + 验证 Bearer Token
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'lingji_admin_jwt_secret_2026';

function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
}

function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: '未提供认证令牌' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: '无管理员权限' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: '令牌无效或已过期' });
  }
}

module.exports = { signToken, adminMiddleware, JWT_SECRET };
