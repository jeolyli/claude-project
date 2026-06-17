# 灵记 (LingJi) — 后台管理系统 PRD

> 版本: V1.0 | 日期: 2026-06-17 | 阶段: 规划  
> 前提约束: **禁止修改数据库及表结构，仅可新增 API 和前端页面**

---

## 一、项目背景

灵记当前拥有 Web 端、APP 端、微信小程序三个客户端，注册用户通过 Java 后端进行数据同步。目前缺少一个后台管理界面，用于查看系统运营数据、用户概况、交易流水等。

## 二、目标

为管理员提供一个轻量级 Web 后台，实现以下核心能力：

1. 查看系统全局运营数据（用户数、交易量、交易金额）
2. 查看所有注册用户及其消费概况
3. 查看全平台交易流水，支持筛选和搜索
4. 查看各用户的预算设置与执行情况
5. 不修改现有数据库表结构

## 三、用户角色

| 角色 | 描述 |
|------|------|
| **管理员** | 唯一角色。通过预设账号密码登录后台，查看所有用户数据。不区分权限等级。 |

> 管理员账号方案: 在 `application.yml` 中配置管理员用户名/密码（或读取 `user` 表中 `status=9` 的超级管理员标记），不作为常规注册用户。

## 四、功能模块列表

### 模块 1: 管理后台登录

**优先级:** P0  
**数据来源:** `user` 表（利用现有 `status` 字段，`status=9` 标识管理员）

| 功能点 | 说明 |
|--------|------|
| 1.1 管理员登录 | 独立登录页面，与用户端登录隔离。通过预设的 admin 账号或 `status=9` 的用户登录 |
| 1.2 会话管理 | 登录后保持会话（JWT Token），超时自动退出 |
| 1.3 退出登录 | 清除 Token，返回登录页 |

> **实现方案:** 利用 `user` 表现有的 `status` 字段（TINYINT），约定 `status=9` 为管理员。不改表结构。

---

### 模块 2: 运营概览仪表盘

**优先级:** P0  
**数据来源:** `user`、`transaction`、`budget` 表（聚合查询）

| 功能点 | 说明 |
|--------|------|
| 2.1 核心指标卡片 | 展示: 注册用户总数、本月新增用户、本月交易总笔数、本月交易总金额（支出+收入） |
| 2.2 交易趋势图 | 近 30 天每日交易笔数和金额折线图（支出/收入两条线） |
| 2.3 分类消费排行 | 全平台支出分类 Top 8 柱状图（按金额排序） |
| 2.4 活跃用户排行 | 本月记账笔数最多的 Top 10 用户 |
| 2.5 最近注册用户 | 最新注册的 10 个用户列表 |

> **实现方案:** 新增 Admin API 端点，通过聚合 SQL 查询（SUM/COUNT/GROUP BY）现有表。

---

### 模块 3: 用户管理

**优先级:** P0  
**数据来源:** `user` 表 + `transaction` 表关联查询

| 功能点 | 说明 |
|--------|------|
| 3.1 用户列表 | 分页展示所有注册用户。列表字段: ID、用户名、昵称、注册时间、状态、交易总笔数、最近交易时间 |
| 3.2 用户搜索 | 按用户名/昵称模糊搜索 |
| 3.3 用户筛选 | 按状态（启用/禁用）、注册时间范围筛选 |
| 3.4 用户详情 | 点击用户查看: 基本信息、交易总数/总金额（支出/收入）、预算设置情况、最近 20 条交易记录 |
| 3.5 用户状态管理 | 启用/禁用用户账号（修改 `user.status` 字段: 1=启用, 0=禁用） |
| 3.6 用户消费画像 | 展示该用户的: 消费分类占比饼图、月均支出趋势、预算使用率 |

> **实现方案:** 读取 `user` 表。关联 `transaction` 表做 COUNT/SUM 聚合。复用现有 `GET /api/v1/transactions/stats/category` 的分组逻辑。

---

### 模块 4: 交易流水管理

**优先级:** P0  
**数据来源:** `transaction` 表 + `category` 表关联

| 功能点 | 说明 |
|--------|------|
| 4.1 交易列表 | 分页展示全平台交易记录。列表字段: ID、用户ID、用户名、类型、金额、分类名、日期、备注 |
| 4.2 交易搜索 | 按金额、备注、用户名、分类名模糊搜索 |
| 4.3 交易筛选 | 按类型（支出/收入）、日期范围、分类、用户ID 筛选 |
| 4.4 交易详情 | 查看单条交易的完整信息 |
| 4.5 交易导出 | 将筛选结果导出为 CSV 文件（带 UTF-8 BOM） |

> **实现方案:** 复用并扩展 `GET /api/v1/transactions` 分页查询。新增 `userId` 可选参数（管理员视角不传 userId 则查全部）。

---

### 模块 5: 预算监管

**优先级:** P1  
**数据来源:** `budget` + `budget_category` + `transaction` 表

| 功能点 | 说明 |
|--------|------|
| 5.1 预算列表 | 按用户+月份展示所有预算记录。字段: 用户ID、用户名、年月、总预算、实际支出、使用率、健康度 |
| 5.2 预算筛选 | 按年月、健康度状态（green/yellow/orange/red）筛选 |
| 5.3 预算详情 | 点击查看某用户的分类预算明细: 各分类预算额、实际支出、剩余、使用率 |
| 5.4 预算异常预警 | 标记使用率 >=100%（红色）的用户，按超支金额排序 |

> **实现方案:** 复用 `GET /api/v1/budgets/board` 逻辑，传入 userId 参数。新增全量查询支持。

---

### 模块 6: 分类使用统计

**优先级:** P1  
**数据来源:** `category` 表（预设+用户自定义） + `transaction` 表

| 功能点 | 说明 |
|--------|------|
| 6.1 分类使用排行 | 全平台各分类的使用次数和总金额排行（支出+收入分开） |
| 6.2 自定义分类统计 | 用户创建的自定义分类数量统计 |
| 6.3 分类趋势 | 某个分类近 6 个月的使用金额变化趋势 |

> **实现方案:** 基于 `transaction` 表按 `category_id` GROUP BY 聚合。

---

### 模块 7: 系统日志（可选，V1.1）

**优先级:** P2  
**数据来源:** 应用层日志（非数据库）

| 功能点 | 说明 |
|--------|------|
| 7.1 登录日志 | 管理员登录记录（IP、时间） |
| 7.2 操作日志 | 管理员操作记录（启用/禁用用户等） |

---

## 五、技术方案

### 5.1 后端新增 API

在现有 Java 后端新增 `AdminController`，路径前缀 `/api/admin`。

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/admin/login` | POST | 管理员登录 |
| `/api/admin/dashboard/overview` | GET | 运营概览核心指标 |
| `/api/admin/dashboard/trends` | GET | 近30天交易趋势 |
| `/api/admin/dashboard/top-categories` | GET | 全平台分类排行 |
| `/api/admin/dashboard/top-users` | GET | 活跃用户排行 |
| `/api/admin/users` | GET | 用户列表（分页+搜索） |
| `/api/admin/users/{id}` | GET | 用户详情 |
| `/api/admin/users/{id}/profile` | GET | 用户消费画像 |
| `/api/admin/users/{id}/status` | PUT | 启用/禁用用户 |
| `/api/admin/transactions` | GET | 全平台交易列表 |
| `/api/admin/transactions/export` | GET | 导出 CSV |
| `/api/admin/budgets` | GET | 预算列表 |
| `/api/admin/budgets/{userId}` | GET | 用户预算详情 |
| `/api/admin/categories/stats` | GET | 分类使用统计 |

所有 `/api/admin/*` 端点需验证管理员 Token。

### 5.2 前端方案

**独立的管理后台前端**，与用户端隔离：

- **技术:** 复用现有 `003.前端代码（前端工程师）/frontend/` 的技术栈（Vanilla JS MPA + 灵记设计令牌）
- **新增目录:** `frontend/admin/`
- **页面:** login.html、dashboard.html、users.html、transactions.html、budgets.html
- **共用组件:** CSS 设计令牌、Toast、Modal 等可复用

### 5.3 数据聚合方案

所有数据来自现有 6 张表的查询聚合，不新增表：

```sql
-- 示例: 运营概览核心指标
SELECT 
  (SELECT COUNT(*) FROM user WHERE deleted=0) AS total_users,
  (SELECT COUNT(*) FROM user WHERE deleted=0 AND YEAR(created_at)=2026 AND MONTH(created_at)=6) AS new_users_this_month,
  (SELECT COUNT(*) FROM transaction WHERE deleted=0) AS total_transactions,
  (SELECT COALESCE(SUM(amount),0) FROM transaction WHERE deleted=0 AND type='expense') AS total_expense,
  (SELECT COALESCE(SUM(amount),0) FROM transaction WHERE deleted=0 AND type='income') AS total_income;
```

## 六、功能优先级汇总

| 优先级 | 模块 | 核心价值 |
|--------|------|---------|
| **P0** | 管理后台登录 | 入口，无此功能则全部不可用 |
| **P0** | 运营概览仪表盘 | 一眼看清系统全局状态 |
| **P0** | 用户管理 | 用户数据查看与状态管理 |
| **P0** | 交易流水管理 | 全平台交易数据查询与导出 |
| **P1** | 预算监管 | 预算设置与执行情况监控 |
| **P1** | 分类使用统计 | 分类流行度分析 |
| **P2** | 系统日志 | 操作审计（V1.1） |

## 七、不做的功能

以下功能在 V1.0 阶段明确不做：

- 管理员角色分权（多级管理员）
- 数据修改/删除（管理员不可修改用户交易数据——只读）
- 消息推送/公告管理
- 数据库表结构变更
- 用户密码重置（操作风险高，V1.1 评估）
