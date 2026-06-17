/**
 * MySQL 连接池
 * 复用与 Java 后端相同的数据库配置
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '8806'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root_123456',
  database: process.env.DB_NAME || 'lingji',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

module.exports = pool;
