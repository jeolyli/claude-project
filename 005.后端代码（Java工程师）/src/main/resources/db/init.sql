-- ============================================================
-- 灵记（LingJi）财务管理工具 — 数据库初始化脚本
-- 版本：V1.0
-- 适用：MySQL 8.x
-- 字符集：utf8mb4 / utf8mb4_unicode_ci
-- ============================================================
-- 先判断数据库存在则删除
DROP DATABASE IF EXISTS `lingji`;

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS `lingji`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `lingji`;

-- ============================================================
-- 2. 建表
-- ============================================================

-- -----------------------------------------------------------
-- 2.1 用户表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
    `username`      VARCHAR(50)     NOT NULL                 COMMENT '用户名',
    `password`      VARCHAR(255)    NOT NULL                 COMMENT '密码（BCrypt 加密）',
    `nickname`      VARCHAR(50)     DEFAULT NULL             COMMENT '昵称',
    `avatar_url`    VARCHAR(255)    DEFAULT NULL             COMMENT '头像 URL',
    `email`         VARCHAR(100)    DEFAULT NULL             COMMENT '邮箱',
    `phone`         VARCHAR(20)     DEFAULT NULL             COMMENT '手机号',
    `status`        TINYINT         NOT NULL DEFAULT 1       COMMENT '状态：1启用 0禁用',
    `deleted`       TINYINT         NOT NULL DEFAULT 0       COMMENT '逻辑删除：0未删除 1已删除',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uk_username` (`username`),
    UNIQUE INDEX `uk_email` (`email`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------------------------
-- 2.2 分类表（支持一级分类 + 二级子分类）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `category` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
    `user_id`       BIGINT          DEFAULT NULL             COMMENT '用户ID（NULL=系统预设，非NULL=用户自定义）',
    `name`          VARCHAR(50)     NOT NULL                 COMMENT '分类名称',
    `icon`          VARCHAR(100)    DEFAULT NULL             COMMENT '图标标识（Lucide 图标名）',
    `color`         VARCHAR(20)     DEFAULT NULL             COMMENT '分类专属色（HEX格式）',
    `type`          VARCHAR(10)     NOT NULL DEFAULT 'expense' COMMENT '适用类型：expense/income/both',
    `parent_id`     BIGINT          DEFAULT NULL             COMMENT '父分类ID（NULL=一级分类）',
    `sort_order`    INT             NOT NULL DEFAULT 0       COMMENT '排序值（越小越靠前）',
    `is_preset`     TINYINT         NOT NULL DEFAULT 0       COMMENT '是否预设分类：1是 0否',
    `is_active`     TINYINT         NOT NULL DEFAULT 1       COMMENT '是否启用：1启用 0禁用',
    `deleted`       TINYINT         NOT NULL DEFAULT 0       COMMENT '逻辑删除',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_type` (`type`),
    INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- -----------------------------------------------------------
-- 2.3 交易流水表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transaction` (
    `id`                BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
    `user_id`           BIGINT          NOT NULL                 COMMENT '用户ID',
    `type`              VARCHAR(10)     NOT NULL                 COMMENT '类型：expense支出/income收入',
    `amount`            DECIMAL(12, 2)  NOT NULL                 COMMENT '金额（正数）',
    `category_id`       BIGINT          NOT NULL                 COMMENT '一级分类ID',
    `sub_category_id`   BIGINT          DEFAULT NULL             COMMENT '二级子分类ID',
    `date`              DATE            NOT NULL                 COMMENT '交易日期',
    `note`              VARCHAR(200)    DEFAULT ''               COMMENT '备注（最多200字）',
    `is_recurring`      TINYINT         NOT NULL DEFAULT 0       COMMENT '是否周期账单：1是 0否',
    `recurring_id`      BIGINT          DEFAULT NULL             COMMENT '关联周期账单ID',
    `deleted`           TINYINT         NOT NULL DEFAULT 0       COMMENT '逻辑删除',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id_date` (`user_id`, `date`),
    INDEX `idx_user_id_category` (`user_id`, `category_id`),
    INDEX `idx_category_id` (`category_id`),
    INDEX `idx_sub_category_id` (`sub_category_id`),
    INDEX `idx_type` (`type`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易流水表';

-- -----------------------------------------------------------
-- 2.4 预算表（月度预算主表）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `budget` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
    `user_id`       BIGINT          NOT NULL                 COMMENT '用户ID',
    `year`          INT             NOT NULL                 COMMENT '预算年份',
    `month`         INT             NOT NULL                 COMMENT '预算月份（1-12）',
    `total_budget`  DECIMAL(12, 2)  NOT NULL                 COMMENT '月度总预算',
    `deleted`       TINYINT         NOT NULL DEFAULT 0       COMMENT '逻辑删除',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uk_user_year_month` (`user_id`, `year`, `month`),
    INDEX `idx_year_month` (`year`, `month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预算表';

-- -----------------------------------------------------------
-- 2.5 分类预算明细表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `budget_category` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
    `budget_id`     BIGINT          NOT NULL                 COMMENT '预算ID',
    `category_id`   BIGINT          NOT NULL                 COMMENT '分类ID',
    `amount`        DECIMAL(12, 2)  NOT NULL                 COMMENT '该分类的预算金额',
    `deleted`       TINYINT         NOT NULL DEFAULT 0       COMMENT '逻辑删除',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_budget_id` (`budget_id`),
    INDEX `idx_category_id` (`category_id`),
    UNIQUE INDEX `uk_budget_category` (`budget_id`, `category_id`, `deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类预算明细表';

-- -----------------------------------------------------------
-- 2.6 周期账单表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `recurring_bill` (
    `id`            BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
    `user_id`       BIGINT          NOT NULL                 COMMENT '用户ID',
    `name`          VARCHAR(100)    NOT NULL                 COMMENT '账单名称（如：房租、Netflix订阅）',
    `amount`        DECIMAL(12, 2)  NOT NULL                 COMMENT '金额',
    `category_id`   BIGINT          NOT NULL                 COMMENT '关联分类ID',
    `type`          VARCHAR(10)     NOT NULL DEFAULT 'expense' COMMENT '类型：expense/income',
    `cycle`         VARCHAR(10)     NOT NULL                 COMMENT '周期：daily/weekly/monthly/yearly',
    `cycle_day`     INT             NOT NULL DEFAULT 1       COMMENT '周期日（月=1-28，周=1-7）',
    `next_date`     DATE            NOT NULL                 COMMENT '下次到期日',
    `note`          VARCHAR(200)    DEFAULT ''               COMMENT '备注',
    `is_active`     TINYINT         NOT NULL DEFAULT 1       COMMENT '是否启用：1启用 0停用',
    `deleted`       TINYINT         NOT NULL DEFAULT 0       COMMENT '逻辑删除',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_category_id` (`category_id`),
    INDEX `idx_next_date` (`next_date`),
    INDEX `idx_cycle` (`cycle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='周期账单表';

-- ============================================================
-- 3. 种子数据：预设分类
-- ============================================================

-- 3.1 支出类一级分类（8个）
INSERT INTO `category` (`id`, `name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`) VALUES
(1,  '🍽️ 餐饮', 'UtensilsCrossed',  '#FFAB91', 'expense', NULL, 1,  1, 1),
(2,  '🚌 交通', 'Car',               '#9EB7D4', 'expense', NULL, 2,  1, 1),
(3,  '🛒 购物', 'ShoppingBag',       '#FFB3C6', 'expense', NULL, 3,  1, 1),
(4,  '🏠 居住', 'House',             '#F0D5BE', 'expense', NULL, 4,  1, 1),
(5,  '🎮 娱乐', 'Gamepad2',          '#C5A3D9', 'expense', NULL, 5,  1, 1),
(6,  '💊 医疗', 'Pill',              '#A8D8CA', 'expense', NULL, 6,  1, 1),
(7,  '📚 教育', 'BookOpen',          '#F9E4B7', 'expense', NULL, 7,  1, 1),
(8,  '📦 其他', 'MoreHorizontal',    '#D4C5CB', 'expense', NULL, 8,  1, 1);

-- 3.2 支出类二级子分类（共40个）
-- 餐饮（parent_id=1）
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`) VALUES
('🍚 早午晚餐', 'Sun',         '#FFAB91', 'expense', 1, 1, 1, 1),
('🍿 零食',     'Cookie',      '#FFAB91', 'expense', 1, 2, 1, 1),
('🥡 外卖',     'Truck',       '#FFAB91', 'expense', 1, 3, 1, 1),
('🍻 聚餐',     'Users',       '#FFAB91', 'expense', 1, 4, 1, 1),
('🥤 饮品',     'Coffee',      '#FFAB91', 'expense', 1, 5, 1, 1);

-- 交通（parent_id=2）
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`) VALUES
('🚇 公交地铁', 'Train',       '#9EB7D4', 'expense', 2, 1, 1, 1),
('🚕 打车',     'CarTaxi',     '#9EB7D4', 'expense', 2, 2, 1, 1),
('⛽ 加油',     'Fuel',        '#9EB7D4', 'expense', 2, 3, 1, 1),
('🅿️ 停车',     'ParkingSquare','#9EB7D4','expense', 2, 4, 1, 1),
('🚲 共享单车', 'Bike',        '#9EB7D4', 'expense', 2, 5, 1, 1);

-- 购物（parent_id=3）
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`) VALUES
('🧴 日用品',   'Package',     '#FFB3C6', 'expense', 3, 1, 1, 1),
('👗 衣物',     'Shirt',       '#FFB3C6', 'expense', 3, 2, 1, 1),
('📱 数码',     'Smartphone',  '#FFB3C6', 'expense', 3, 3, 1, 1),
('🪑 家居',     'Armchair',    '#FFB3C6', 'expense', 3, 4, 1, 1),
('💄 美妆',     'Sparkles',    '#FFB3C6', 'expense', 3, 5, 1, 1);

-- 居住（parent_id=4）
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`) VALUES
('🏢 房租',     'Building2',   '#F0D5BE', 'expense', 4, 1, 1, 1),
('💡 水电',     'Zap',         '#F0D5BE', 'expense', 4, 2, 1, 1),
('🔧 物业',     'Wrench',      '#F0D5BE', 'expense', 4, 3, 1, 1),
('🧹 维修',     'Hammer',      '#F0D5BE', 'expense', 4, 4, 1, 1),
('🧾 日用品',   'ScrollText',  '#F0D5BE', 'expense', 4, 5, 1, 1);

-- 娱乐（parent_id=5）
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`) VALUES
('🎬 电影',     'Film',        '#C5A3D9', 'expense', 5, 1, 1, 1),
('🎮 游戏',     'Gamepad2',    '#C5A3D9', 'expense', 5, 2, 1, 1),
('✈️ 旅行',     'Plane',       '#C5A3D9', 'expense', 5, 3, 1, 1),
('⚽ 运动',     'Trophy',      '#C5A3D9', 'expense', 5, 4, 1, 1),
('🎤 KTV',      'Music',       '#C5A3D9', 'expense', 5, 5, 1, 1);

-- 医疗（parent_id=6）
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`) VALUES
('🏥 门诊',     'Stethoscope', '#A8D8CA', 'expense', 6, 1, 1, 1),
('💊 药品',     'Pill',        '#A8D8CA', 'expense', 6, 2, 1, 1),
('🩺 体检',     'Clipboard',   '#A8D8CA', 'expense', 6, 3, 1, 1),
('🦷 牙科',     'Smile',       '#A8D8CA', 'expense', 6, 4, 1, 1);

-- 教育（parent_id=7）
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`) VALUES
('📕 课程',     'GraduationCap','#F9E4B7','expense', 7, 1, 1, 1),
('📖 书籍',     'BookOpen',    '#F9E4B7', 'expense', 7, 2, 1, 1),
('📝 考试',     'PenLine',     '#F9E4B7', 'expense', 7, 3, 1, 1),
('🎓 培训',     'Presentation','#F9E4B7', 'expense', 7, 4, 1, 1);

-- 其他（parent_id=8）
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`) VALUES
('🎁 人情',     'Gift',        '#D4C5CB', 'expense', 8, 1, 1, 1),
('📦 快递',     'Package',     '#D4C5CB', 'expense', 8, 2, 1, 1),
('🐱 宠物',     'Cat',         '#D4C5CB', 'expense', 8, 3, 1, 1),
('🔖 杂项',     'Tag',         '#D4C5CB', 'expense', 8, 4, 1, 1);

-- 3.3 收入类一级分类（4个）
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`) VALUES
('💰 薪资', 'Briefcase',   '#FFAB91', 'income', NULL, 1, 1, 1),
('📈 理财', 'TrendingUp',  '#A8D8CA', 'income', NULL, 2, 1, 1),
('🎁 红包', 'Gift',        '#FFB3C6', 'income', NULL, 3, 1, 1),
('📦 其他', 'MoreHorizontal','#D4C5CB','income', NULL, 4, 1, 1);

-- 3.4 收入类二级子分类
-- 薪资（parent_id=最后插入的薪资ID，通过查询获取）
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`)
SELECT '💵 工资', 'Banknote',   '#FFAB91', 'income', id, 1, 1, 1 FROM `category` WHERE `name` = '💰 薪资' AND `type` = 'income';

INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`)
SELECT '📋 兼职', 'Clipboard',  '#FFAB91', 'income', id, 2, 1, 1 FROM `category` WHERE `name` = '💰 薪资' AND `type` = 'income';

INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`)
SELECT '🏆 奖金', 'Trophy',     '#FFAB91', 'income', id, 3, 1, 1 FROM `category` WHERE `name` = '💰 薪资' AND `type` = 'income';

-- 理财
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`)
SELECT '📊 基金', 'ChartBar',   '#A8D8CA', 'income', id, 1, 1, 1 FROM `category` WHERE `name` = '📈 理财' AND `type` = 'income';

INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`)
SELECT '🏠 房租收入', 'House',  '#A8D8CA', 'income', id, 2, 1, 1 FROM `category` WHERE `name` = '📈 理财' AND `type` = 'income';

INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`)
SELECT '💹 股票', 'TrendingUp','#A8D8CA', 'income', id, 3, 1, 1 FROM `category` WHERE `name` = '📈 理财' AND `type` = 'income';

-- 红包
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`)
SELECT '🧧 微信红包', 'MessageCircle','#FFB3C6', 'income', id, 1, 1, 1 FROM `category` WHERE `name` = '🎁 红包' AND `type` = 'income';

INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`)
SELECT '🎉 礼金', 'PartyPopper','#FFB3C6', 'income', id, 2, 1, 1 FROM `category` WHERE `name` = '🎁 红包' AND `type` = 'income';

-- 其他收入
INSERT INTO `category` (`name`, `icon`, `color`, `type`, `parent_id`, `sort_order`, `is_preset`, `is_active`)
SELECT '🔖 杂项', 'Tag',        '#D4C5CB', 'income', id, 1, 1, 1 FROM `category` WHERE `name` = '📦 其他' AND `type` = 'income';

-- ============================================================
-- 4. 验证
-- ============================================================
SELECT '========== 数据库初始化完成 ==========' AS '';
SELECT CONCAT('user: ', COUNT(*), ' 条') FROM `user`;
SELECT CONCAT('category: ', COUNT(*), ' 条（含 ', (SELECT COUNT(*) FROM `category` WHERE `parent_id` IS NULL), ' 个一级分类）') FROM `category`;
SELECT CONCAT('transaction: ', COUNT(*), ' 条') FROM `transaction`;
SELECT CONCAT('budget: ', COUNT(*), ' 条') FROM `budget`;
SELECT CONCAT('budget_category: ', COUNT(*), ' 条') FROM `budget_category`;
SELECT CONCAT('recurring_bill: ', COUNT(*), ' 条') FROM `recurring_bill`;
