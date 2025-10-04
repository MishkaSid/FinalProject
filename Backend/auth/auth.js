// Backend/auth/auth.js
const express = require("express");
const router = express.Router();
const db = require("../dbConnection");
const bcrypt = require("bcrypt"); // אם אצלך מותקן bcryptjs, החלף לשורה: const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

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

    const token = jwt.sign(
      { id: user.UserID, role: user.Role, name: user.Name, email: user.Email },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // אופציונלי: אם תרצה גם קוקי HttpOnly בנוסף ל־token בגוף
    // res.cookie("accessToken", token, {
    //   httpOnly: true,
    //   sameSite: "Lax",
    //   secure: false,
    //   path: "/",
    //   maxAge: 1000 * 60 * 60 * 8
    // });

    const userInfo = {
      id: user.UserID,
      email: user.Email,
      name: user.Name,
      role: user.Role,
    };

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
  const genericMsg = { message: "אם הכתובת קיימת, נשלח מייל עם קישור לאיפוס" };

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

    // Generate token and store hash in password_resets
    const tokenPlain = crypto.randomBytes(32).toString("hex");
    const bcrypt = require("bcrypt"); // keep same lib as login
    const tokenHash = await bcrypt.hash(tokenPlain, 12);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await connection.query(
      "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [user.UserID, tokenHash, expiresAt]
    );

    const resetUrl = `${process.env.APP_URL}/reset-password?token=${tokenPlain}&uid=${user.UserID}`;


    await sendPasswordResetEmail({
      to: user.Email,
      name: user.Name,
      resetUrl,
    });

    return res.json(genericMsg);
  } catch (err) {
    console.error("forgot-password error:", err);
    return res.json(genericMsg);
  } finally {
    if (connection) connection.release();
  }
});

// GET /api/auth/reset-password/validate?token=...&uid=...
router.get("/reset-password/validate", async (req, res) => {
  const { token, uid } = req.query;
  if (!token || !uid) {
    return res.status(400).json({ error: "Missing token or uid" });
  }

  let connection;
  try {
    connection = await db.getConnection();

    // Get all active unused tokens for this user, newest first
    const [rows] = await connection.query(
      "SELECT id, token_hash, expires_at, used FROM password_resets WHERE user_id = ? AND used = 0 ORDER BY id DESC",
      [uid]
    );

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "Invalid or used token" });
    }

    const bcrypt = require("bcrypt");
    // Find a matching token by comparing hash
    const now = new Date();
    let match = null;
    for (const r of rows) {
      const ok = await bcrypt.compare(token, r.token_hash || "");
      if (ok) {
        if (new Date(r.expires_at) > now && r.used === 0) {
          match = r;
        }
        break;
      }
    }

    if (!match) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("validate token error:", err);
    return res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
});

// POST /api/auth/reset-password
// body: { token, uid, newPassword }
router.post("/reset-password", async (req, res) => {
  const { token, uid, newPassword } = req.body;
  if (!token || !uid || !newPassword) {
    return res.status(400).json({ error: "Missing fields" });
  }

  let connection;
  try {
    connection = await db.getConnection();

    // Load active resets for user
    const [rows] = await connection.query(
      "SELECT id, token_hash, expires_at, used FROM password_resets WHERE user_id = ? AND used = 0 ORDER BY id DESC",
      [uid]
    );
    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "Invalid or used token" });
    }

    const bcrypt = require("bcrypt");
    const now = new Date();
    let match = null;
    for (const r of rows) {
      const ok = await bcrypt.compare(token, r.token_hash || "");
      if (ok) {
        if (new Date(r.expires_at) > now && r.used === 0) {
          match = r;
        }
        break;
      }
    }
    if (!match) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update user password
    const newHash = await bcrypt.hash(newPassword, 12);
    await connection.query(
      "UPDATE users SET Password = ? WHERE UserID = ?",
      [newHash, uid]
    );

    // Mark token as used and optionally invalidate all other tokens for this user
    await connection.query(
      "UPDATE password_resets SET used = 1 WHERE id = ?",
      [match.id]
    );

    return res.json({ message: "Password updated. You can login now." });
  } catch (err) {
    console.error("reset-password error:", err);
    return res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
});


module.exports = router;
