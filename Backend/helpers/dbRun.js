// Backend/helpers/dbRun.js
// מריץ SQL מול האובייקט שמייצא getConnection בלבד

const db = require("../dbConnection"); // מייבא את getConnection

async function dbRun(sql, params = []) {
  const conn = await db.getConnection();
  try {
    const [rows, fields] = await conn.execute(sql, params);
    return [rows, fields];
  } finally {
    if (typeof conn.release === "function") conn.release();
  }
}

module.exports = { dbRun };
