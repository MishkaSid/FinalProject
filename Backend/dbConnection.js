const mysql = require("mysql2/promise");
require("dotenv").config();

let connection;

/**
 * @function getConnection
 * @description Establishes a connection to the database if one does not already exist,
 * and returns the existing connection if it does. This function uses a singleton pattern
 * to ensure that only one database connection is created and used throughout the application.
 * The connection details are read from environment variables.
 * @returns {Promise<mysql.Connection>} A promise that resolves to the database connection object.
 */
async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
    });
    console.log("Connected to database");
  }
  return connection;
}

module.exports = { getConnection };
