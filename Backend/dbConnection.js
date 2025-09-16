// בקובץ זה נמצאת הגדרת החיבור למסד הנתונים
// הקובץ יוצר pool של חיבורים למסד הנתונים MySQL ומנהל אותם
// הוא מספק פונקציה לקבלת חיבור מהפול ושחרורו לאחר השימוש
// dbConnection.js
const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * @function getConnection
 * @description Gets a connection from the connection pool.
 * Each call returns a new connection that can be properly released.
 * @returns {Promise<mysql.PoolConnection>} A promise that resolves to a database connection object.
 */
async function getConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Got connection from pool");
    return connection;
  } catch (error) {
    console.error("Error getting connection from pool:", error);
    throw error;
  }
}

module.exports = { getConnection };
