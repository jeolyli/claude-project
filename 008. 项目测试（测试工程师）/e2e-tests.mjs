/**
 * 灵记 — 核心业务流程 E2E 测试
 * 运行: node e2e-tests.mjs
 * 目标: Java 后端 http://localhost:8086
 * 输出: 测试报告/e2e-core-report.html
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8086/api';
const REPORT_DIR = join(__dirname, '测试报告');
const REPORT = join(REPORT_DIR, 'e2e-core-report.html');
if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });

const results = [];
let userId = null, categoryId = null, txId = null;
const isOk = (s) => s === 200 || s === 201;

function record(name, passed, detail) {
  results.push({ name, passed, detail, time: new Date().toISOString() });
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (!passed) console.log(`   └─ ${detail}`);
}

async function fetchJSON(url, opts = {}) {
  try {
    const res = await fetch(BASE + url, { headers: { 'Content-Type': 'application/json' }, ...opts });
    const text = await res.text();
    let body; try { body = JSON.parse(text); } catch { body = text; }
    return { status: res.status, body };
  } catch (e) { return { status: 0, body: { error: e.message } }; }
}

// ===================== 1. 认证 =====================
console.log('\n━━━ 1. 认证 ━━━');
const u = `e2e_${Date.now()}`;

{
  const { status, body } = await fetchJSON('/auth/register', { method: 'POST', body: JSON.stringify({ username: u, password: 'E2eTest123' }) });
  const ok = isOk(status) && body.success && !!body.token;
  record('1.1 注册新用户', ok, `status=${status} hasToken=${!!body.token}`);
  if (ok) userId = body.user.id;
}
{
  const { body } = await fetchJSON('/auth/register', { method: 'POST', body: JSON.stringify({ username: u, password: 'x' }) });
  record('1.2 重复用户名注册被拒绝', !body.success, JSON.stringify(body).slice(0, 80));
}
{
  const { status, body } = await fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify({ username: u, password: 'E2eTest123' }) });
  record('1.3 正确凭据登录', isOk(status) && body.success, `hasToken=${!!body.token}`);
}
{
  const { body } = await fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify({ username: u, password: 'wrong' }) });
  record('1.4 错误密码登录被拒绝', !body.success, JSON.stringify(body).slice(0, 80));
}
{
  const { body } = await fetchJSON('/auth/register', { method: 'POST', body: JSON.stringify({ username: '', password: 'x' }) });
  record('1.5 空用户名注册被拒绝', !body.success, JSON.stringify(body).slice(0, 80));
}
{
  const { body } = await fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify({ username: 'no_user_99999', password: 'x' }) });
  record('1.6 不存在用户登录被拒绝', !body.success, JSON.stringify(body).slice(0, 80));
}

// ===================== 2. 分类 =====================
console.log('\n━━━ 2. 分类 ━━━');
{
  const { body } = await fetchJSON('/v1/categories');
  const data = body?.data || [];
  const ok = Array.isArray(data) && data.length > 0;
  record('2.1 获取分类列表', ok, `count=${data.length}`);
  if (ok) {
    const c = data.find(x => x.type === 'expense');
    if (c) { categoryId = c.id; console.log(`   → 使用分类: id=${categoryId} name=${c.name}`); }
  }
}

// ===================== 3. 交易流水 CRUD =====================
console.log('\n━━━ 3. 交易流水 CRUD ━━━');

if (userId && categoryId) {
  {
    const { status, body } = await fetchJSON(`/v1/transactions?userId=${userId}`, {
      method: 'POST', body: JSON.stringify({ amount: 88.5, type: 'expense', categoryId, date: '2026-06-16', note: 'E2E创建' }),
    });
    const ok = isOk(status) && body.code === 200;
    record('3.1 创建交易', ok, `amount=${body?.data?.amount} id=${body?.data?.id}`);
    if (ok && body?.data?.id) txId = body.data.id;
  }
  if (txId) {
    const { body } = await fetchJSON(`/v1/transactions/${txId}?userId=${userId}`);
    record('3.2 查询交易详情', !!body?.data, `id=${txId}`);
    await fetchJSON(`/v1/transactions?userId=${userId}`, { method: 'PUT', body: JSON.stringify({ id: txId, amount: 99.99, note: 'E2E已更新' }) });
    const { body: up } = await fetchJSON(`/v1/transactions/${txId}?userId=${userId}`);
    record('3.3 更新交易金额', up?.data?.amount === 99.99, `amount=${up?.data?.amount}`);
  }
  {
    const { body } = await fetchJSON(`/v1/transactions?userId=${userId}&page=1&pageSize=10&type=expense`);
    const recs = body?.data?.records || [];
    record('3.4 分页查询 expense', recs.length > 0, `records=${recs.length}`);
  }
  {
    const { body } = await fetchJSON(`/v1/transactions/stats/category?userId=${userId}&year=2026&month=6`);
    const data = body?.data || body;
    record('3.5 分类统计', Array.isArray(data) && data.length > 0, `len=${data?.length || 0}`);
  }
  if (txId) {
    await fetchJSON(`/v1/transactions/${txId}?userId=${userId}`, { method: 'DELETE' });
    const { body } = await fetchJSON(`/v1/transactions/${txId}?userId=${userId}`);
    record('3.6 逻辑删除后查询为空', !body?.data, `hasData=${!!body?.data}`);
  }
} else {
  record('3.x 跳过: userId 或 categoryId 未获取', false, `userId=${userId} categoryId=${categoryId}`);
}

// ===================== 4. 预算 =====================
console.log('\n━━━ 4. 预算 ━━━');

if (userId) {
  {
    const cbs = categoryId ? [{ categoryId, amount: 2500 }] : [];
    const { body } = await fetchJSON('/api/v1/budgets', { method: 'POST', body: JSON.stringify({ userId, year: 2026, month: 6, totalBudget: 6000, categoryBudgets: cbs }) });
    const ok4 = isOk(body.code) || body.code === 200;
    record('4.1 REST API 设置预算', ok4 && !body.error, `code=${body.code} msg=${body.message}`);
  }
  {
    const { body } = await fetchJSON(`/v1/budgets/board?userId=${userId}&year=2026&month=6`);
    const d = body?.data || {};
    record('4.2 预算看板返回数据', d.health !== undefined, `total=${d.totalBudget} health=${d.health} cats=${d.categoryDetails?.length || 0}`);
  }
  {
    const { body } = await fetchJSON(`/v1/budgets/board?userId=${userId}&year=2026&month=12`);
    record('4.3 空预算月份 totalBudget=0', (body?.data?.totalBudget || 0) === 0, `total=${body?.data?.totalBudget}`);
  }
} else {
  record('4.x 跳过: userId 未获取', false, '');
}

// ===================== 5. 数据同步 =====================
console.log('\n━━━ 5. 数据同步 ━━━');

if (userId) {
  {
    const { body } = await fetchJSON(`/data/sync?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        transactions: [
          { id: 'tx_sync_1', type: 'expense', amount: 50, category: '餐饮', date: '2026-06-16', note: '午餐' },
          { id: 'tx_sync_2', type: 'income', amount: 1000, category: '薪资', date: '2026-06-15', note: '工资' },
        ],
        budget: { total_budget: 5000, category_budgets: { cat_1: 2000 } },
      }),
    });
    record('5.1 数据同步推送', body.success === true || !!body.message, JSON.stringify(body).slice(0, 100));
  }
  {
    const { body } = await fetchJSON(`/data?userId=${userId}`);
    const ok = body?.budget?.total_budget > 0 && body?.transactions?.length >= 2;
    record('5.2 拉取验证含 budget+txs', ok, `budget=${body?.budget?.total_budget} txs=${body?.transactions?.length}`);
  }
  {
    await fetchJSON(`/data/sync?userId=${userId}`, { method: 'POST', body: JSON.stringify({ transactions: [{ id: 'tx_sync_1', type: 'expense', amount: 50, category: '餐饮', date: '2026-06-16', note: '午餐' }] }) });
    const { body } = await fetchJSON(`/data?userId=${userId}`);
    const cnt = body?.transactions?.filter(t => t.id === 'tx_sync_1').length || 0;
    record('5.3 重复同步幂等性 (不产生重复)', cnt <= 1, `count=${cnt}`);
  }
  {
    await fetchJSON(`/data/sync?userId=${userId}`, { method: 'POST', body: JSON.stringify({ budget: { total_budget: 8000, category_budgets: { cat_1: 3000 } } }) });
    const { body } = await fetchJSON(`/data?userId=${userId}`);
    const cb = body?.budget?.category_budgets || {};
    record('5.4 预算更新 旧分类被替换', body?.budget?.total_budget === 8000 && cb['cat_1'] === 3000, `total=${body?.budget?.total_budget} cats=${JSON.stringify(cb)}`);
  }
} else {
  record('5.x 跳过: userId 未获取', false, '');
}

// ===================== 生成报告 =====================
console.log('\n━━━ 生成报告 ━━━');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
const total = results.length;
const pct = total > 0 ? Math.round(passed / total * 100) : 0;

const rows = results.map((r, i) => `
  <tr class="${r.passed ? 'pass' : 'fail'}">
    <td>${i + 1}</td><td>${r.passed ? '✅' : '❌'}</td>
    <td>${r.name}</td>
    <td class="d">${(r.detail || '').replace(/</g, '&lt;')}</td>
    <td>${r.time.slice(11, 19)}</td>
  </tr>`).join('');

const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>灵记 E2E 核心业务测试报告</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,"PingFang SC",sans-serif;padding:24px;background:#FFF5F7;color:#3D2C33;max-width:960px;margin:0 auto}
h1{font-size:24px;margin-bottom:4px}.meta{color:#B5A4AB;font-size:13px;margin-bottom:20px}
.bar{height:8px;border-radius:4px;background:#FFD4DE;margin-bottom:24px;overflow:hidden}
.bar .f{height:100%;border-radius:4px;background:${pct>=80?'#A8D8CA':pct>=50?'linear-gradient(90deg,#F9E4B7,#FFAB91)':'#FF7B89'};width:${pct}%}
.summary{display:flex;gap:16px;margin-bottom:24px}
.card{flex:1;padding:20px;border-radius:16px;text-align:center;background:#fff;box-shadow:0 2px 8px rgba(255,133,162,.1)}
.card .n{font-size:36px;font-weight:700}.card .l{font-size:13px;color:#B5A4AB;margin-top:4px}
.t .n{color:#FF85A2}.p .n{color:#A8D8CA}.f .n{color:#FF7B89}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(255,133,162,.1)}
th,td{padding:10px 14px;text-align:left;font-size:14px;border-bottom:1px solid #FFEEF2}
th{background:#FFEEF2;font-weight:600}
tr.pass td{background:rgba(168,216,202,.06)}tr.fail td{background:rgba(255,123,137,.06)}
.d{font-size:11px;color:#B5A4AB;max-width:380px;word-break:break-all;font-family:monospace}
.flow{margin-bottom:24px;padding:16px;background:#fff;border-radius:16px}
.flow h3{font-size:16px;margin-bottom:8px}
.flow ol{font-size:13px;color:#6B5B63;padding-left:20px;line-height:1.8}
.ft{margin-top:24px;font-size:12px;color:#B5A4AB;text-align:center}
</style></head><body>
<h1>🐰 灵记 · 核心业务 E2E 测试报告</h1>
<div class="meta">目标 API: http://localhost:8086 | ${new Date().toLocaleString('zh-CN')} | 共 ${total} 项 | 通过率 ${pct}%</div>
<div class="bar"><div class="f"></div></div>
<div class="summary">
  <div class="card t"><div class="n">${total}</div><div class="l">总测试项</div></div>
  <div class="card p"><div class="n">${passed}</div><div class="l">✅ 通过</div></div>
  <div class="card f"><div class="n">${failed}</div><div class="l">❌ 失败</div></div>
</div>
<div class="flow"><h3>📋 测试覆盖的核心业务流程</h3><ol>
<li><b>认证</b>: 注册 → 重复检测 → 登录成功 → 错误密码拒绝 → 空字段校验 → 不存在用户</li>
<li><b>分类</b>: 获取分类列表 → 识别支出分类用于交易</li>
<li><b>交易 CRUD</b>: 创建 → 查询单条 → 更新金额 → 分页查询 → 分类统计 → 逻辑删除 → 验证已删除</li>
<li><b>预算</b>: REST API 设置 → 看板查询 (含健康度) → 空预算月份验证</li>
<li><b>数据同步</b>: 推送 budget+transactions → 拉取验证 → 幂等性 → 预算更新 (先删后插)</li>
</ol></div>
<table><thead><tr><th>#</th><th>状态</th><th>测试项</th><th>详情</th><th>时间</th></tr></thead><tbody>${rows}</tbody></table>
<div class="ft">灵记 (LingJi) — 核心业务 E2E 测试 · 自动生成</div>
</body></html>`;

writeFileSync(REPORT, html, 'utf-8');
console.log(`\n✅ 报告: ${REPORT}`);
console.log(`   结果: ${passed}/${total} 通过 (${pct}%)${failed > 0 ? ', ' + failed + ' 失败' : ' 🎉 全部通过!'}`);
