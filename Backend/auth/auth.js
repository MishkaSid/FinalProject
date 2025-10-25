// Backend/auth/auth.js
const express = require("express");
const router = express.Router();
const db = require("../dbConnection");
const bcrypt = require("bcrypt"); // אם אצלך מותקן bcryptjs, החלף לשורה: const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function hasDatePassed(createdDate) {
  // Convert string (like "2025-11-17T22:00:00.000Z") to a Date object
  const targetDate = new Date(createdDate);

  // Get current date and time (UTC-based)
  const now = new Date();

  // Compare
  return now > targetDate;
}

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE Email = ?",
      [email]
    );
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "משתמש לא נמצא" });
    }

    const expired_date = user.expired_date;


    // אם הסיסמה ב־DB מוצפנת בבקריפט: השוואה עם bcrypt
    // אם אתם בשלב מעבר ויש סיסמאות גולמיות, אפשר להוסיף בדיקת fallback לטקסט פשוט
    const stored = user.Password || "";
    const isBcrypt = typeof stored === "string" && stored.startsWith("$2");
    const isMatch = isBcrypt
      ? await bcrypt.compare(password, stored)
      : password === stored;

    if (!isMatch) {
      return res.status(401).json({ message: "סיסמה לא תקינה" });
    }



   if (user.Role == 'Examinee'){
    if (hasDatePassed(expired_date)) {
      return res.status(401).json({ message: "משתמש פג תוקף" });
     }
   }

     

    const token = jwt.sign(
      { id: user.UserID, role: user.Role, name: user.Name, email: user.Email, courseId: user.CourseID },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    const userInfo = {
      id: user.UserID,
      email: user.Email,
      name: user.Name,
      role: user.Role,
      courseId: user.CourseID,
    };

    // Record site visit: maintain one record per user with visit count (days visited)
    // Only record visits for Examinee users
    if (user.Role === 'Examinee') {
      try {
        // Check if user has any visit record
        const [visitRows] = await connection.query(
          `SELECT VisitID, visit_count, DATE(VisitedAt) as lastVisitDate FROM site_visit 
           WHERE UserID = ?`,
          [user.UserID]
        );

        if (visitRows.length === 0) {
          // First visit ever: insert new record with visit_count = 1
          await connection.query(
            `INSERT INTO site_visit (UserID, VisitedAt, visit_count) VALUES (?, NOW(), 1)`,
            [user.UserID]
          );
        } else {
          // Get the last visit date as a string in YYYY-MM-DD format
          const lastVisitDate = visitRows[0].lastVisitDate; // MySQL DATE() returns YYYY-MM-DD
          const currentVisitCount = visitRows[0].visit_count || 0;
          
          // Get today's date in YYYY-MM-DD format using MySQL's CURDATE()
          const [todayRows] = await connection.query('SELECT CURDATE() as today');
          const today = todayRows[0].today; // MySQL date in YYYY-MM-DD format
          
          // Convert both dates to strings for comparison
          const lastDateStr = lastVisitDate instanceof Date 
            ? lastVisitDate.toISOString().split('T')[0] 
            : String(lastVisitDate);
          const todayStr = today instanceof Date 
            ? today.toISOString().split('T')[0] 
            : String(today);
          
          if (lastDateStr === todayStr) {
            // Already visited today: just update VisitedAt to latest time (no count increment)
            await connection.query(
              `UPDATE site_visit SET VisitedAt = NOW() WHERE VisitID = ?`,
              [visitRows[0].VisitID]
            );
          } else {
            // New day: increment visit_count and update VisitedAt
            await connection.query(
              `UPDATE site_visit SET VisitedAt = NOW(), visit_count = ? WHERE VisitID = ?`,
              [currentVisitCount + 1, visitRows[0].VisitID]
            );
          }
        }
      } catch (visitError) {
        console.error("Error recording site visit:", visitError);
        // Don't fail login if visit recording fails
      }
    }

    // שורה קריטית: החזרת token בגוף כדי שהפרונט יעבוד כפי שמצפה
    return res.json({ ok: true, token, user: userInfo });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (connection) connection.release();
  }
});

// POST /api/auth/forgot-password
// body: { email }
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const genericMsg = { message: "אם הכתובת קיימת, נשלח מייל עם קוד לאיפוס" };

  let connection;
  try {
    connection = await db.getConnection();

    // Find user by Email
    const [rows] = await connection.query(
      "SELECT UserID, Name, Email FROM users WHERE Email = ?",
      [email]
    );

    // Always return generic message to avoid user enumeration
    if (!rows || rows.length === 0) {
      return res.json(genericMsg);
    }

    const user = rows[0];

    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code in user's session/memory (or you could use a simple in-memory store)
    // For now, we'll store it in a global object (in production, use Redis or similar)
    if (!global.resetCodes) global.resetCodes = {};
    global.resetCodes[user.UserID] = {
      code: resetCode,
      email: user.Email,
      expiresAt: expiresAt,
    };

    // Clean up expired codes
    Object.keys(global.resetCodes).forEach((uid) => {
      if (new Date(global.resetCodes[uid].expiresAt) < new Date()) {
        delete global.resetCodes[uid];
      }
    });

    // Send email with verification code
    await sendPasswordResetEmail({
      to: user.Email,
      name: user.Name,
      resetCode: resetCode,
      resetUrl: null, // No URL needed for code-based reset
    });

    return res.json(genericMsg);
  } catch (err) {
    console.error("forgot-password error:", err);
    return res.json(genericMsg);
  } finally {
    if (connection) connection.release();
  }
});

// POST /api/auth/verify-reset-code
// body: { code }
router.post("/verify-reset-code", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }

  try {
    // Check if any stored code matches
    if (!global.resetCodes) {
      return res.status(400).json({ error: "No reset code found" });
    }

    let foundUserID = null;
    let storedData = null;

    // Search through all stored codes to find a match
    for (const [userID, data] of Object.entries(global.resetCodes)) {
      if (data.code === code) {
        // Check if code has expired
        if (new Date(data.expiresAt) < new Date()) {
          delete global.resetCodes[userID];
          continue;
        }
        foundUserID = userID;
        storedData = data;
        break;
      }
    }

    if (!foundUserID || !storedData) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    // Code is valid - return success
    return res.json({ ok: true, message: "Code verified successfully" });
  } catch (err) {
    console.error("verify reset code error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/reset-password
// body: { code, newPassword }
router.post("/reset-password", async (req, res) => {
  const { code, newPassword } = req.body;
  if (!code || !newPassword) {
    return res.status(400).json({ error: "Missing code or new password" });
  }

  let connection;
  try {
    // Check if any stored code matches
    if (!global.resetCodes) {
      return res.status(400).json({ error: "No reset code found" });
    }

    let foundUserID = null;
    let storedData = null;

    // Search through all stored codes to find a match
    for (const [userID, data] of Object.entries(global.resetCodes)) {
      if (data.code === code) {
        // Check if code has expired
        if (new Date(data.expiresAt) < new Date()) {
          delete global.resetCodes[userID];
          continue;
        }
        foundUserID = userID;
        storedData = data;
        break;
      }
    }

    if (!foundUserID || !storedData) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    // Update user password
    const bcrypt = require("bcrypt");
    const newHash = await bcrypt.hash(newPassword, 12);

    connection = await db.getConnection();
    await connection.query("UPDATE users SET Password = ? WHERE UserID = ?", [
      newHash,
      foundUserID,
    ]);

    // Remove the used code
    delete global.resetCodes[foundUserID];

    return res.json({
      message: "Password updated successfully. You can login now.",
    });
  } catch (err) {
    console.error("reset-password error:", err);
    return res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
