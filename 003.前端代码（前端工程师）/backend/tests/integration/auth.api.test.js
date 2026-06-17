/**
 * Auth API 集成测试
 *
 * 覆盖范围:
 * - POST /api/auth/register 正常/重复/空字段
 * - POST /api/auth/login 正常/错误密码/不存在用户
 * - GET /api/health 数据库状态
 *
 * 被测文件: server.js, routes/auth.js
 * 需要: MySQL 在 localhost:8806 运行，数据库 lingji 已初始化
 */
const request = require('supertest');
const app = require('../../server');

let server;

beforeAll((done) => {
  // 使用随机端口避免冲突
  server = app.listen(0, () => done());
});

afterAll((done) => {
  server.close(done);
});

describe('GET /api/health', () => {
  it('返回 ok 状态', async () => {
    const res = await request(server).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/auth/register', () => {
  const uniqueUser = `test_${Date.now()}`;

  it('正常注册返回 success + user + token', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({ username: uniqueUser, password: 'Test1234' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe(uniqueUser);
    expect(res.body.token).toBeDefined();
  });

  it('重复用户名返回错误', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({ username: uniqueUser, password: 'Test1234' });
    expect(res.body.success).toBe(false);
  });

  it('用户名为空返回错误', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send({ username: '', password: 'Test1234' });
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  const testUser = `login_${Date.now()}`;

  beforeAll(async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: testUser, password: 'CorrectPwd1' });
  });

  it('正确凭据登录成功', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: testUser, password: 'CorrectPwd1' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('错误密码返回错误', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: testUser, password: 'WrongPassword1' });
    expect(res.body.success).toBe(false);
  });

  it('不存在用户返回错误', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({ username: 'nonexistent_99999', password: 'Test1234' });
    expect(res.body.success).toBe(false);
  });
});
