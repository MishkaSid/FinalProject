// בקובץ זה נמצאת הגדרת החיבור למסד הנתונים
// הקובץ יוצר pool של חיבורים למסד הנתונים MySQL ומנהל אותם
// הוא מספק פונקציה לקבלת חיבור מהפול ושחרורו לאחר השימוש
// dbConnection.js
const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a connection pool with improved configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 20, // ✅ Increased from 10 to 20
  maxIdle: 10, // ✅ Maximum idle connections to keep
  idleTimeout: 60000, // ✅ Close idle connections after 60 seconds
  queueLimit: 0,
  enableKeepAlive: true, // ✅ Keep connections alive
  keepAliveInitialDelay: 0
});

// Connection pool monitoring
let connectionWarningShown = false;

/**
 * @function logPoolStatus
 * @description Logs the current status of the connection pool.
 * Helps identify connection leaks and pool exhaustion.
 */
function logPoolStatus() {
  const poolInfo = pool.pool;
  const activeConnections = poolInfo._allConnections.length - poolInfo._freeConnections.length;
  const freeConnections = poolInfo._freeConnections.length;
  const totalConnections = poolInfo._allConnections.length;
  
  console.log('📊 Pool Status:', {
    active: activeConnections,
    free: freeConnections,
    total: totalConnections,
    limit: 20
  });

  // Warning if pool is running low
  if (freeConnections === 0 && !connectionWarningShown) {
    console.warn('⚠️ WARNING: Connection pool exhausted! All connections in use.');
    connectionWarningShown = true;
  } else if (freeConnections > 5) {
    connectionWarningShown = false;
  }
}

// Log pool status every 30 seconds
setInterval(logPoolStatus, 30000);

/**
 * @function getConnection
 * @description Gets a connection from the connection pool.
 * Each call returns a new connection that can be properly released.
 * Monitors connection acquisition time and warns if slow.
 * @returns {Promise<mysql.PoolConnection>} A promise that resolves to a database connection object.
 */
async function getConnection() {
  const startTime = Date.now();
  
  try {
    const connection = await pool.getConnection();
    const elapsed = Date.now() - startTime;
    
    // Warn if connection acquisition took too long
    if (elapsed > 1000) {
      console.warn(`⚠️ Slow connection acquisition: ${elapsed}ms - Pool may be exhausted`);
      logPoolStatus();
    } else if (elapsed > 100) {
      console.log(`⏱️ Connection acquired in ${elapsed}ms`);
    }
    
    return connection;
  } catch (error) {
    console.error("❌ Error getting connection from pool:", error);
    logPoolStatus();
    throw error;
  }
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('\n🔴 Shutting down gracefully...');
  logPoolStatus();
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

module.exports = { getConnection, logPoolStatus };
