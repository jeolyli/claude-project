# 灵记 (LingJi) — 数据库设计文档

## 文件清单

| 文件 | 说明 |
|------|------|
| `001_init_database.sql` | 数据库初始化脚本（建表 + 索引 + 种子数据） |

## 数据库选型

- **开发/测试**: SQLite 3.x（前端本地存储 → SQLite 迁移）
- **生产环境（V2）**: PostgreSQL 15+ 或 MySQL 8.0+（待定）
- **字符集**: UTF-8
- **兼容性**: 脚本使用 SQLite 语法，迁移至其他数据库需微调（见迁移注意事项）

## 表结构一览

```
┌─────────────────────────────────────────────────────────────────┐
│                        灵记 数据库 Schema                         │
├───────────────┬───────────────┬───────────────┬─────────────────┤
│    users      │  categories   │ transactions  │    budgets      │
│   (用户)      │   (分类)       │   (流水)       │    (预算)        │
├───────────────┤               │               ├─────────────────┤
│  id (PK)      │  id (PK)      │  id (PK)      │  id (PK)        │
│  username     │  user_id (FK) │  user_id (FK) │  user_id (FK)   │
│  password_hash│  parent_id    │  type         │  year           │
│  salt         │  name         │  amount       │  month          │
│  avatar       │  icon         │  category_id  │  total_budget   │
│  is_active    │  color        │  date         │  is_active      │
│  created_at   │  type         │  note         │  created_at     │
│  last_login_at│  sort_order   │  created_at   │  updated_at     │
│               │  is_preset    │  updated_at   │                 │
│               │  is_active    │               │                 │
├───────────────┴───────────────┴───────────────┴─────────────────┤
│  category_budgets   │  recurring_bills   │  login_attempts     │
│  (分类预算)          │  (周期账单 V2)      │  (登录记录)          │
├─────────────────────┼────────────────────┼─────────────────────┤
│  id (PK)            │  id (PK)           │  id (PK)            │
│  budget_id (FK)     │  user_id (FK)      │  username           │
│  category_id (FK)   │  name              │  ip_address         │
│  amount             │  amount            │  success            │
│                     │  cycle             │  locked_until       │
│                     │  cycle_day         │  created_at         │
│                     │  next_date         │                     │
└─────────────────────┴────────────────────┴─────────────────────┘
```

## 实体关系图（文字版）

```
users (1) ──────< transactions (N)  一个用户有多笔流水
users (1) ──────< budgets (N)       一个用户每月一条预算
users (1) ──────< categories (N)    一个用户可自定义分类
users (1) ──────< recurring_bills (N)

categories (1) ──< transactions (N)  一笔流水属于一个分类
categories (1) ──< category_budgets (N)
categories (1) ──< categories (N)    父子分类自引用

budgets (1) ─────< category_budgets (N)  一个预算包含多个分类预算
```

## 核心查询场景索引覆盖

| 查询场景 | 使用索引 | 页面 |
|---------|---------|------|
| 本月总支出 | `idx_tx_user_date` + `idx_tx_user_type` | 首页看板 |
| 分类消费占比 | `idx_tx_user_category` | 统计饼图 |
| 近 7 天趋势 | `idx_tx_user_date` | 统计折线图 |
| 账单列表搜索 | `idx_tx_user_date` | 账单页 |
| 登录验证 | `idx_users_username` | 登录页 |
| 预算查询 | `idx_budget_user_ym` (UNIQUE) | 预算看板 |

## 种子数据

- **8 个一级分类**: 餐饮、交通、购物、居住、娱乐、医疗、教育、其他
- **30 个二级子分类**: 每个一级分类下设 3-5 个典型子分类
- 所有预设分类 `user_id = NULL`，不被任何用户独有
- 颜色值与前端 `global.css` 和 PRD 第 5.3 节完全一致

## 迁移注意事项

### SQLite → PostgreSQL

```sql
-- 数据类型变更
TEXT PRIMARY KEY → UUID PRIMARY KEY DEFAULT gen_random_uuid()
TEXT (ISO 8601)  → TIMESTAMPTZ
REAL             → NUMERIC(12,2)
INTEGER (0/1)    → BOOLEAN

-- 日期函数
datetime('now')  → NOW()
```

### SQLite → MySQL

```sql
-- 数据类型变更
TEXT PRIMARY KEY → VARCHAR(36) PRIMARY KEY
TEXT (ISO 8601)  → DATETIME(3)
REAL             → DECIMAL(12,2)
INTEGER (0/1)    → TINYINT(1)

-- 日期函数
datetime('now')  → NOW(3)

-- 引擎
ENGINE = InnoDB, DEFAULT CHARSET = utf8mb4
```

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| V1.0 | 2026-06-14 | 初始版本: 7 张表 + 38 条种子数据 |
