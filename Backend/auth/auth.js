// בקובץ זה נמצאות פונקציות האותנטיקציה וההרשאות במערכת
// הקובץ מטפל בתהליך התחברות המשתמשים, בדיקת סיסמאות ויצירת טוקן JWT
// הוא מספק אבטחה למערכת ומאפשר גישה מוגבלת למשאבים לפי תפקיד המשתמש
// auth.js - login router
const express = require("express");
const router = express.Router();
const db = require("../dbConnection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "סיסמה לא תקינה" });
    }

    const token = jwt.sign(
      { id: user.UserID, role: user.Role, name: user.Name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // קבע קוקי HttpOnly כדי שהדפדפן ישלח אותו אוטומטית בבקשות הבאות
    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: "Lax", // בפרודקשן בין דומיינים השתמש "None" ו-secure: true
      secure: false, // true רק על HTTPS
      path: "/",
      maxAge: 1000 * 60 * 60 * 2,
    });

    const userInfo = {
      id: user.UserID,
      email: user.Email,
      name: user.Name,
      role: user.Role,
    };

    // מחזירים גם פרטים מינימליים לממשק
    return res.json({ ok: true, user: userInfo });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
