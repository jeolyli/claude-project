/**
 * auth.js 中间件单元测试
 *
 * 覆盖范围:
 * - signToken 生成 JWT 含 id 和 username
 * - authMiddleware 验证有效 token 并挂载 req.user
 * - authMiddleware 拒绝: 无token / 过期token / 篡改token / 错误密钥
 *
 * 被测文件: middleware/auth.js
 */
const jwt = require('jsonwebtoken');
const { signToken, authMiddleware, JWT_SECRET } = require('../../middleware/auth');

describe('signToken', () => {
  it('生成含 id 和 username 的 JWT', () => {
    const token = signToken({ id: 1, username: 'testuser' });
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.id).toBe(1);
    expect(decoded.username).toBe('testuser');
  });

  it('JWT 7天后过期', () => {
    const token = signToken({ id: 1, username: 'test' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    expect(expiresIn).toBeCloseTo(7 * 24 * 3600, -2); // ~7天，误差2分钟
  });
});

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('有效 token 挂载 req.user 并调用 next', () => {
    const token = signToken({ id: 1, username: 'test' });
    req.headers.authorization = `Bearer ${token}`;
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
    expect(req.user.username).toBe('test');
  });

  it('无 Authorization header 返回 401', () => {
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: '未提供认证令牌' });
  });

  it('非 Bearer 格式返回 401', () => {
    req.headers.authorization = 'Basic abc123';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: '未提供认证令牌' });
  });

  it('过期 token 返回 401', () => {
    const expiredToken = jwt.sign({ id: '1', username: 'test' }, JWT_SECRET, { expiresIn: '0s' });
    req.headers.authorization = `Bearer ${expiredToken}`;
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: '认证令牌无效或已过期' });
  });

  it('篡改 token 返回 401', () => {
    const fakeToken = jwt.sign({ id: '1', username: 'test' }, 'wrong-secret-key');
    req.headers.authorization = `Bearer ${fakeToken}`;
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: '认证令牌无效或已过期' });
  });
});
