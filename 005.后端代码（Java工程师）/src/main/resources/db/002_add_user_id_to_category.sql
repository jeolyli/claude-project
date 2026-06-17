-- ============================================================
-- 灵记（LingJi）— 数据库迁移：分类表加 user_id
-- 执行方式：mysql -u root -p lingji < 002_add_user_id_to_category.sql
-- ============================================================

USE `lingji`;

-- 给已有 category 表加 user_id 列
ALTER TABLE `category`
    ADD COLUMN `user_id` BIGINT DEFAULT NULL COMMENT '用户ID（NULL=系统预设，非NULL=用户自定义）' AFTER `id`,
    ADD INDEX `idx_user_id` (`user_id`);
