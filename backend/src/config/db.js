const mysql = require('mysql2/promise');
require('dotenv').config();

const dbSsl = ['1', 'true', 'yes', 'require', 'verify-full'].includes(
  String(process.env.DB_SSL || '').toLowerCase()
);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'connectly',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  ...(dbSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL connected successfully');
    conn.release();
    return true;
  } catch (err) {
    console.error(
      `MySQL connection failed (${err.message}). ` +
        'Server will keep running; database endpoints return errors until MySQL is reachable.'
    );
    return false;
  }
}

module.exports = { pool, testConnection };
