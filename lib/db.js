const mysql = require('mysql2/promise');
const { db } = require('../config/config');

const pool = mysql.createPool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
  waitForConnections: true,
  connectionLimit: 10
});

/**
 * Placeholder-bound query. Values are bound by the driver.
 */
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Executes a statement that has already been assembled by the caller.
 * Used where the shape of the statement varies (sorting, aggregates).
 */
async function raw(sql) {
  const [rows] = await pool.query(sql);
  return rows;
}

module.exports = { pool, query, raw };
