const db = require("../dbConnection");

async function logVisit(req, res, next) {
  try {
    if (!req.user?.id) return next();
    const connection = await db.getConnection();
    try {
      // If VisitedAt is DATE with PK(UserID, VisitedAt):
      await connection.query(
        "INSERT IGNORE INTO site_visit (UserID, VisitedAt) VALUES (?, CURDATE())",
        [req.user.id]
      );

      // If you kept DATETIME plus uniq(UserID, VisitDate) generated column, use:
      // await connection.query(
      //   "INSERT INTO site_visit (UserID, VisitedAt) VALUES (?, NOW()) ON DUPLICATE KEY UPDATE VisitedAt = VALUES(VisitedAt)",
      //   [req.user.id]
      // );
    } finally {
      connection.release();
    }
  } catch (e) {
    console.warn("visit log failed:", e.message);
  }
  next();
}

module.exports = { logVisit };