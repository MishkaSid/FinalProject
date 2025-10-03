// Backend/auth/auth.js
const express = require("express");
const router = express.Router();
const db = require("../dbConnection");
const bcrypt = require("bcrypt"); // אם אצלך מותקן bcryptjs, החלף לשורה: const bcrypt = require("bcryptjs");
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

module.exports = router;
