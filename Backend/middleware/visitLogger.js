const db = require("../dbConnection");

async function logVisit(req, res, next) {
  try {
    if (!req.user?.id) return next();
    const connection = await db.getConnection();
    try {
      await connection.query(
        "INSERT INTO site_visit (UserID, VisitedAt, Path) VALUES (?, NOW(), ?)",
        [req.user.id, req.originalUrl.slice(0, 255)]
      );
    } finally {
      connection.release();
    }
  } catch (e) {
    // לא מפילים בקשה בגלל לוג
    console.warn("visit log failed:", e.message);
  }
  next();
}

module.exports = { logVisit };
