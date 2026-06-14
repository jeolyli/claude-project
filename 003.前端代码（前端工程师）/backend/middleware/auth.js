/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer Token
 * 用于未来需要登录态保护的 API（如获取用户数据、记账等）
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lingji_jwt_secret_change_me_in_production';

/**
 * 签发 JWT Token
 * @param {object} user - { id, username }
 * @returns {string} JWT token
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Express 中间件：验证 JWT
 * 将解析出的 user 信息挂载到 req.user
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: '认证令牌无效或已过期' });
  }
}

module.exports = { signToken, authMiddleware, JWT_SECRET };
