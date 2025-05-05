const mysql = require("mysql2/promise");
require("dotenv").config();

let connection;

async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });
  }
  return connection;
}

module.exports = { getConnection };
