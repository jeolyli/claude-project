-- ============================================================================
-- 灵记 (LingJi) — 个人财务管理工具
-- 数据库初始化脚本（MySQL 8.0+）
-- ============================================================================
-- 版本:     V1.0
-- 创建日期: 2026-06-14
-- 基于:     PRD V1.0.1（含用户认证）+ 前端实现（localStorage 迁移）
-- 目标 DB:  MySQL 8.0+
-- 字符集:   utf8mb4（支持 emoji 图标）
-- ============================================================================
--
-- 使用方式:
--   mysql -u root -p < 001_init_database.sql
--   或登录后执行: source 001_init_database.sql
--
-- 设计原则:
--   1. 主键使用 VARCHAR(36) 存 UUID，便于云同步时无冲突合并
--   2. 业务日期使用 DATE 类型（YYYY-MM-DD）
--   3. 审计时间戳使用 DATETIME(3)（精确到毫秒）
--   4. 金额使用 DECIMAL(12,2)，确保小数精度
--   5. 布尔值使用 TINYINT(1)
--   6. 软删除: 非核心表通过 is_active 字段控制
--   7. 引擎: InnoDB，字符集: utf8mb4
--
-- 与 SQLite 原版主要差异:
--   - PRAGMA → 移除，改为 SET NAMES + 建库语句
--   - TEXT PRIMARY KEY → VARCHAR(36) PRIMARY KEY
--   - REAL → DECIMAL(12,2)
--   - datetime('now') → CURRENT_TIMESTAMP(3)
--   - CHECK(IN)  → ENUM 类型
--   - CREATE INDEX IF NOT EXISTS → CREATE INDEX
--   - updated_at 增加 ON UPDATE CURRENT_TIMESTAMP(3)
--   - 调整建表顺序确保外键依赖正确
--
-- 表清单（按依赖顺序）:
--   users             用户账户
--   categories        收支分类（含预设 + 用户自定义）
--   budgets           月度预算
--   category_budgets  分类预算明细
--   recurring_bills   周期账单（V2 前瞻）
--   transactions      流水记录（支出/收入）
--   login_attempts    登录失败记录
--
-- ============================================================================

-- 如果不存在则创建数据库
CREATE DATABASE IF NOT EXISTS lingji
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE lingji;


-- ============================================================================
-- 1. users — 用户账户表
-- ============================================================================
-- 存储注册用户的基本信息与认证凭据。
-- 密码存储方案: SHA-256(password + salt)，salt 为每用户独立的 32 字符随机串。
-- 未来版本升级为 bcrypt / PBKDF2。
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(36)  NOT NULL PRIMARY KEY  COMMENT 'UUID，如 u_lx4g8_k2m9n1',
    username        VARCHAR(20)  NOT NULL              COMMENT '用户名，2-20 字符',
    password_hash   VARCHAR(64)  NOT NULL              COMMENT 'SHA-256(password + salt)',
    salt            VARCHAR(32)  NOT NULL              COMMENT '密码盐值，32 字符随机串',
    avatar          MEDIUMTEXT                         COMMENT '头像 Base64 数据或 URL',
    is_active       TINYINT(1)   NOT NULL DEFAULT 1    COMMENT '账户启用 1/停用 0',
    created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '注册时间',
    last_login_at   DATETIME(3)                        COMMENT '最近一次登录时间',

    UNIQUE INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户账户表';


-- ============================================================================
-- 2. categories — 收支分类表
-- ============================================================================
-- 包含系统预设分类（user_id IS NULL）和用户自定义分类。
-- 支持两级结构: parent_id IS NULL = 一级分类，非空 = 子分类。
-- 预设分类不可物理删除，通过 is_active 控制启停。
-- type 使用 ENUM 类型代替 CHECK 约束，MySQL 原生支持。
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id          VARCHAR(36)   NOT NULL PRIMARY KEY    COMMENT 'UUID',
    user_id     VARCHAR(36)                           COMMENT '所属用户（NULL = 系统预设）',
    parent_id   VARCHAR(36)                           COMMENT '父分类 ID（NULL = 一级分类）',
    name        VARCHAR(20)   NOT NULL                COMMENT '分类名称，如 餐饮',
    icon        VARCHAR(10)   NOT NULL DEFAULT '📦'   COMMENT '图标（emoji）',
    color       VARCHAR(7)    NOT NULL DEFAULT '#D4C5CB' COMMENT '分类颜色 HEX，如 #FFAB91',
    type        ENUM('expense','income','both') NOT NULL DEFAULT 'both' COMMENT '适用收支类型',
    sort_order  INT           NOT NULL DEFAULT 0      COMMENT '排序序号',
    is_preset   TINYINT(1)    NOT NULL DEFAULT 0      COMMENT '是否系统预设（不可删除）',
    is_active   TINYINT(1)    NOT NULL DEFAULT 1      COMMENT '启用 1/禁用 0',
    created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX idx_categories_user_id (user_id),
    INDEX idx_categories_parent  (parent_id),
    INDEX idx_categories_active  (is_active),

    CONSTRAINT fk_cat_user   FOREIGN KEY (user_id)   REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收支分类表';


-- ============================================================================
-- 3. budgets — 月度预算表
-- ============================================================================
-- 每个用户每月最多一条预算记录（由唯一索引保证）。
-- 各分类的预算分配存储在 category_budgets 表中。
-- ============================================================================
CREATE TABLE IF NOT EXISTS budgets (
    id           VARCHAR(36)    NOT NULL PRIMARY KEY  COMMENT 'UUID',
    user_id      VARCHAR(36)    NOT NULL              COMMENT '所属用户',
    year         SMALLINT       NOT NULL              COMMENT '预算年份，如 2026',
    month        TINYINT        NOT NULL              COMMENT '预算月份 1-12',
    total_budget DECIMAL(12,2)  NOT NULL DEFAULT 5000.00 COMMENT '月度总预算',
    is_active    TINYINT(1)     NOT NULL DEFAULT 1    COMMENT '启用 1/停用 0',
    created_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX idx_budget_user_ym (user_id, year, month),

    CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT chk_budget_month CHECK (month BETWEEN 1 AND 12),
    CONSTRAINT chk_budget_total CHECK (total_budget >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='月度预算表';


-- ============================================================================
-- 4. category_budgets — 分类预算明细表
-- ============================================================================
-- 属于某条月度预算的子表，记录每个分类的预算分配金额。
-- ============================================================================
CREATE TABLE IF NOT EXISTS category_budgets (
    id          VARCHAR(36)    NOT NULL PRIMARY KEY   COMMENT 'UUID',
    budget_id   VARCHAR(36)    NOT NULL               COMMENT '所属预算 ID',
    category_id VARCHAR(36)    NOT NULL               COMMENT '分类 ID',
    amount      DECIMAL(12,2)  NOT NULL DEFAULT 0.00  COMMENT '该分类的预算金额',
    created_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX idx_catbudget_budget_cat (budget_id, category_id),

    CONSTRAINT fk_catbudget_budget   FOREIGN KEY (budget_id)   REFERENCES budgets(id)    ON DELETE CASCADE,
    CONSTRAINT fk_catbudget_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,

    CONSTRAINT chk_catbudget_amount CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类预算明细表';


-- ============================================================================
-- 5. recurring_bills — 周期账单表（V2 前瞻）
-- ============================================================================
-- 管理定期发生的账单（房租、订阅费、贷款等）。
-- cycle 定义重复周期，cycle_day 指定该周期内的触发日。
-- 当前 MVP 不启用，表结构预留供 V2 使用。
--
-- 注意: 此表必须在 transactions 之前创建，因为 transactions 有外键引用它。
-- ============================================================================
CREATE TABLE IF NOT EXISTS recurring_bills (
    id          VARCHAR(36)    NOT NULL PRIMARY KEY   COMMENT 'UUID',
    user_id     VARCHAR(36)    NOT NULL               COMMENT '所属用户',
    name        VARCHAR(50)    NOT NULL               COMMENT '账单名称，如 房租',
    amount      DECIMAL(12,2)  NOT NULL               COMMENT '金额',
    category_id VARCHAR(36)    NOT NULL               COMMENT '关联分类',
    cycle       ENUM('daily','weekly','monthly','yearly') NOT NULL DEFAULT 'monthly' COMMENT '重复周期',
    cycle_day   TINYINT        NOT NULL DEFAULT 1     COMMENT '触发日（月 1-31，周 0-6 周日=0）',
    next_date   DATE           NOT NULL               COMMENT '下次到期日',
    note        VARCHAR(200)                          COMMENT '备注说明',
    is_active   TINYINT(1)     NOT NULL DEFAULT 1     COMMENT '启用 1/停用 0',
    created_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX idx_recurring_user (user_id),
    INDEX idx_recurring_next (next_date),

    CONSTRAINT fk_recurring_user     FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_recurring_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='周期账单表（V2 前瞻）';


-- ============================================================================
-- 6. transactions — 流水记录表
-- ============================================================================
-- 核心业务表，记录每一笔支出或收入。
-- 金额范围: 0.01 ~ 99999999.99（由应用层校验）。
-- 备注最多 200 字（应用层限制）。
-- 业务日期使用 DATE 类型，索引覆盖高频查询场景。
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id              VARCHAR(36)    NOT NULL PRIMARY KEY   COMMENT 'UUID，如 tx_lx4g8_k2m9n1',
    user_id         VARCHAR(36)    NOT NULL               COMMENT '所属用户',
    type            ENUM('expense','income') NOT NULL DEFAULT 'expense' COMMENT '收支类型',
    amount          DECIMAL(12,2)  NOT NULL               COMMENT '金额',
    category_id     VARCHAR(36)    NOT NULL               COMMENT '关联分类',
    sub_category_id VARCHAR(36)                           COMMENT '关联子分类（可空）',
    date            DATE           NOT NULL               COMMENT '业务日期',
    note            VARCHAR(200)                          COMMENT '备注，最多 200 字',
    is_recurring    TINYINT(1)     NOT NULL DEFAULT 0     COMMENT '是否周期账单生成',
    recurring_id    VARCHAR(36)                           COMMENT '来源周期账单 ID（可空）',
    created_at      DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    -- 高频复合索引: 用户+日期（首页看板、账单列表）
    INDEX idx_tx_user_date (user_id, date),
    -- 用户+分类（统计饼图汇总）
    INDEX idx_tx_user_category (user_id, category_id),
    -- 用户+类型（收支筛选）
    INDEX idx_tx_user_type (user_id, type),
    -- 按创建时间排序
    INDEX idx_tx_created_at (created_at),

    CONSTRAINT fk_tx_user         FOREIGN KEY (user_id)         REFERENCES users(id)           ON DELETE CASCADE,
    CONSTRAINT fk_tx_category     FOREIGN KEY (category_id)     REFERENCES categories(id)      ON DELETE RESTRICT,
    CONSTRAINT fk_tx_sub_category FOREIGN KEY (sub_category_id) REFERENCES categories(id)      ON DELETE SET NULL,
    CONSTRAINT fk_tx_recurring    FOREIGN KEY (recurring_id)    REFERENCES recurring_bills(id) ON DELETE SET NULL,

    CONSTRAINT chk_tx_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='流水记录表';


-- ============================================================================
-- 7. login_attempts — 登录失败记录表
-- ============================================================================
-- 防暴力破解: 连续 5 次失败后锁定 15 分钟。
-- 锁定状态由应用层根据此表的最近记录判定。
-- 注意: username 不加外键约束，因为暴力破解可能尝试不存在的用户名。
-- ============================================================================
CREATE TABLE IF NOT EXISTS login_attempts (
    id           VARCHAR(36)   NOT NULL PRIMARY KEY    COMMENT 'UUID',
    username     VARCHAR(20)   NOT NULL                COMMENT '尝试登录的用户名',
    ip_address   VARCHAR(45)                           COMMENT '客户端 IP（IPv4/IPv6）',
    success      TINYINT(1)    NOT NULL DEFAULT 0      COMMENT '登录成功 1/失败 0',
    locked_until DATETIME(3)                           COMMENT '锁定截止时间',
    created_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX idx_attempts_username (username, created_at),
    INDEX idx_attempts_ip (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录失败记录表';


-- ============================================================================
-- 种子数据 — 系统预设分类
-- ============================================================================
-- 8 个一级分类 + 36 个典型子分类，PRD 第 3.2.1 节定义。
-- user_id = NULL 标识为系统预设，所有用户共享可见但不可修改/删除。
-- 颜色值与 PRD 第 5.3 节 / global.css 中保持一致。
--
-- 使用 IGNORE 防止重复执行时报主键冲突。
-- ============================================================================

-- 一级分类 (8 条)
INSERT IGNORE INTO categories (id, user_id, parent_id, name, icon, color, type, sort_order, is_preset, is_active) VALUES
('cat_food',          NULL, NULL, '餐饮', '🍽️', '#FFAB91', 'both', 1, 1, 1),
('cat_transport',     NULL, NULL, '交通', '🚌', '#9EB7D4', 'both', 2, 1, 1),
('cat_shopping',      NULL, NULL, '购物', '🛒', '#FFB3C6', 'both', 3, 1, 1),
('cat_housing',       NULL, NULL, '居住', '🏠', '#F0D5BE', 'both', 4, 1, 1),
('cat_entertainment', NULL, NULL, '娱乐', '🎮', '#C5A3D9', 'both', 5, 1, 1),
('cat_medical',       NULL, NULL, '医疗', '💊', '#A8D8CA', 'both', 6, 1, 1),
('cat_education',     NULL, NULL, '教育', '📚', '#F9E4B7', 'both', 7, 1, 1),
('cat_other',         NULL, NULL, '其他', '📦', '#D4C5CB', 'both', 8, 1, 1);

-- 二级子分类: 餐饮 (5 条)
INSERT IGNORE INTO categories (id, user_id, parent_id, name, icon, color, type, sort_order, is_preset, is_active) VALUES
('cat_food_breakfast', NULL, 'cat_food', '早午晚餐', '🍚', '#FFAB91', 'expense', 1, 1, 1),
('cat_food_snack',     NULL, 'cat_food', '零食',     '🍿', '#FFAB91', 'expense', 2, 1, 1),
('cat_food_takeout',   NULL, 'cat_food', '外卖',     '🥡', '#FFAB91', 'expense', 3, 1, 1),
('cat_food_party',     NULL, 'cat_food', '聚餐',     '🍻', '#FFAB91', 'expense', 4, 1, 1),
('cat_food_drink',     NULL, 'cat_food', '饮品',     '🧋', '#FFAB91', 'expense', 5, 1, 1);

-- 二级子分类: 交通 (5 条)
INSERT IGNORE INTO categories (id, user_id, parent_id, name, icon, color, type, sort_order, is_preset, is_active) VALUES
('cat_transport_bus',  NULL, 'cat_transport', '公交地铁',  '🚇', '#9EB7D4', 'expense', 1, 1, 1),
('cat_transport_taxi', NULL, 'cat_transport', '打车',      '🚕', '#9EB7D4', 'expense', 2, 1, 1),
('cat_transport_fuel', NULL, 'cat_transport', '加油',      '⛽', '#9EB7D4', 'expense', 3, 1, 1),
('cat_transport_park', NULL, 'cat_transport', '停车',      '🅿️', '#9EB7D4', 'expense', 4, 1, 1),
('cat_transport_bike', NULL, 'cat_transport', '共享单车',  '🚲', '#9EB7D4', 'expense', 5, 1, 1);

-- 二级子分类: 购物 (5 条)
INSERT IGNORE INTO categories (id, user_id, parent_id, name, icon, color, type, sort_order, is_preset, is_active) VALUES
('cat_shopping_daily',    NULL, 'cat_shopping', '日用品', '🧴', '#FFB3C6', 'expense', 1, 1, 1),
('cat_shopping_clothes',  NULL, 'cat_shopping', '衣物',   '👗', '#FFB3C6', 'expense', 2, 1, 1),
('cat_shopping_digital',  NULL, 'cat_shopping', '数码',   '📱', '#FFB3C6', 'expense', 3, 1, 1),
('cat_shopping_home',     NULL, 'cat_shopping', '家居',   '🛋️', '#FFB3C6', 'expense', 4, 1, 1),
('cat_shopping_beauty',   NULL, 'cat_shopping', '美妆',   '💄', '#FFB3C6', 'expense', 5, 1, 1);

-- 二级子分类: 居住 (4 条)
INSERT IGNORE INTO categories (id, user_id, parent_id, name, icon, color, type, sort_order, is_preset, is_active) VALUES
('cat_housing_rent',     NULL, 'cat_housing', '房租',   '🏡', '#F0D5BE', 'expense', 1, 1, 1),
('cat_housing_utility',  NULL, 'cat_housing', '水电',   '💡', '#F0D5BE', 'expense', 2, 1, 1),
('cat_housing_property', NULL, 'cat_housing', '物业',   '📋', '#F0D5BE', 'expense', 3, 1, 1),
('cat_housing_repair',   NULL, 'cat_housing', '维修',   '🔧', '#F0D5BE', 'expense', 4, 1, 1);

-- 二级子分类: 娱乐 (5 条)
INSERT IGNORE INTO categories (id, user_id, parent_id, name, icon, color, type, sort_order, is_preset, is_active) VALUES
('cat_entertainment_movie',  NULL, 'cat_entertainment', '电影',  '🎬', '#C5A3D9', 'expense', 1, 1, 1),
('cat_entertainment_game',   NULL, 'cat_entertainment', '游戏',  '🎮', '#C5A3D9', 'expense', 2, 1, 1),
('cat_entertainment_travel', NULL, 'cat_entertainment', '旅行',  '✈️', '#C5A3D9', 'expense', 3, 1, 1),
('cat_entertainment_sport',  NULL, 'cat_entertainment', '运动',  '⚽', '#C5A3D9', 'expense', 4, 1, 1),
('cat_entertainment_ktv',    NULL, 'cat_entertainment', 'KTV',   '🎤', '#C5A3D9', 'expense', 5, 1, 1);

-- 二级子分类: 医疗 (4 条)
INSERT IGNORE INTO categories (id, user_id, parent_id, name, icon, color, type, sort_order, is_preset, is_active) VALUES
('cat_medical_clinic',   NULL, 'cat_medical', '门诊', '🏥', '#A8D8CA', 'expense', 1, 1, 1),
('cat_medical_medicine', NULL, 'cat_medical', '药品', '💊', '#A8D8CA', 'expense', 2, 1, 1),
('cat_medical_checkup',  NULL, 'cat_medical', '体检', '🩺', '#A8D8CA', 'expense', 3, 1, 1),
('cat_medical_dental',   NULL, 'cat_medical', '牙科', '🦷', '#A8D8CA', 'expense', 4, 1, 1);

-- 二级子分类: 教育 (4 条)
INSERT IGNORE INTO categories (id, user_id, parent_id, name, icon, color, type, sort_order, is_preset, is_active) VALUES
('cat_education_course',   NULL, 'cat_education', '课程', '📖', '#F9E4B7', 'expense', 1, 1, 1),
('cat_education_books',    NULL, 'cat_education', '书籍', '📚', '#F9E4B7', 'expense', 2, 1, 1),
('cat_education_exam',     NULL, 'cat_education', '考试', '📝', '#F9E4B7', 'expense', 3, 1, 1),
('cat_education_training', NULL, 'cat_education', '培训', '🎓', '#F9E4B7', 'expense', 4, 1, 1);

-- 二级子分类: 其他 (4 条)
INSERT IGNORE INTO categories (id, user_id, parent_id, name, icon, color, type, sort_order, is_preset, is_active) VALUES
('cat_other_gift',    NULL, 'cat_other', '人情', '🎁', '#D4C5CB', 'expense', 1, 1, 1),
('cat_other_express', NULL, 'cat_other', '快递', '📦', '#D4C5CB', 'expense', 2, 1, 1),
('cat_other_pet',     NULL, 'cat_other', '宠物', '🐾', '#D4C5CB', 'expense', 3, 1, 1),
('cat_other_misc',    NULL, 'cat_other', '杂项', '📌', '#D4C5CB', 'expense', 4, 1, 1);


-- ============================================================================
-- 验证查询（开发环境可选执行）
-- ============================================================================

-- 查看所有表:
--   SHOW TABLES;

-- 查看表结构:
--   DESCRIBE users;
--   DESCRIBE transactions;

-- 查看预设分类:
--   SELECT id, parent_id, name, icon, color
--   FROM categories
--   WHERE is_preset = 1
--   ORDER BY sort_order;

-- 查看分类树（含子分类）:
--   SELECT
--     p.name AS 一级分类,
--     c.name AS 二级分类,
--     c.icon,
--     c.color
--   FROM categories p
--   LEFT JOIN categories c ON c.parent_id = p.id
--   WHERE p.is_preset = 1 AND p.parent_id IS NULL
--   ORDER BY p.sort_order, c.sort_order;

-- 查询某用户本月流水:
--   SELECT t.date, c.name AS category, t.type, t.amount, t.note
--   FROM transactions t
--   JOIN categories c ON c.id = t.category_id
--   WHERE t.user_id = '<user_uuid>'
--     AND t.date BETWEEN '2026-06-01' AND '2026-06-30'
--   ORDER BY t.date DESC, t.created_at DESC;

-- 查询某用户本月预算及消费进度:
--   SELECT
--     b.total_budget,
--     IFNULL(SUM(t.amount), 0) AS spent,
--     ROUND(IFNULL(SUM(t.amount), 0) * 100.0 / b.total_budget, 1) AS usage_pct
--   FROM budgets b
--   LEFT JOIN transactions t
--     ON t.user_id = b.user_id
--     AND t.type = 'expense'
--     AND t.date BETWEEN MAKEDATE(b.year, 1) + INTERVAL (b.month - 1) MONTH
--                    AND LAST_DAY(MAKEDATE(b.year, 1) + INTERVAL (b.month - 1) MONTH)
--   WHERE b.user_id = '<user_uuid>' AND b.year = 2026 AND b.month = 6
--   GROUP BY b.id;
-- ============================================================================
