// בקובץ זה נמצאות פונקציות לשליחת מיילים במערכת
// הקובץ מגדיר חיבור ל-SMTP של Gmail ומספק פונקציה לשליחת הזמנות
// הוא משמש לשליחת מיילי ברוכים הבאים למשתמשים חדשים במערכת
// Backend/utils/mailer.js
require("dotenv").config();
const nodemailer = require("nodemailer");

// Use Gmail’s default SMTP settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER, // your Gmail address
    pass: process.env.SMTP_PASS, // your Gmail App Password
  },
});

// Verify SMTP connection on startup
transporter
  .verify()
  .then(() => console.log("✅ Gmail SMTP ready"))
  .catch((err) => console.error("❌ Gmail SMTP error:", err));

/**
 * Send a simple invitation email
 * @param {string} to    – recipient’s email
 * @param {string} name  – recipient’s name (optional)
 */
async function sendInvitation(to, name = "") {
  const link = process.env.APP_URL;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM, // e.g. "My App <no-reply@mydomain.com>"
    to,
    subject: 'ברוכים הבאים ל "מוכנים ובגדול"!',
    html: `
      <p>היי ${name || "שם משתמש"},</p>
      <p>אנא היכנסו עם האימייל הזה כשם משתמש ותעודת זהות כסיסמה.</p>
      <p><a href="${link}">לחצו כאן כדי להיכנס לאתר</a></p>
      <p>בהצלחה!</p>

      <p> אין להשיב למייל זה, לפרטים נוספים ובירורים אפשר לפנות לצוות התמיכה שלנו במייל MuchanimVeBegadol@gmail.com</p>
    `,
  });
}

/**
 * Send a simple password reset email
 * @param {object} options - object with properties:
 *   to {string} - recipient’s email
 *   name {string} - recipient’s name (optional)
 *   resetUrl {string} - link to reset password page
 */
async function sendPasswordResetEmail({ to, name, resetUrl }) {
  // Simple Hebrew template. Adjust brand text as you like.
  try {
    await transporter.sendMail({
      from: `"מוכנים ובגדול" <${process.env.SMTP_USER}>`,
      to,
      subject: "איפוס סיסמה לפלטפורמה",
      html: `
      <p>היי ${name || "סטודנט"},</p>
      <p>לקביעת סיסמה חדשה, לחץ על הקישור הבא:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>הקישור זמין ל 15 דקות.</p>
      <p>אם לא ביקשת איפוס, אפשר להתעלם מהמייל.</p>
    `,
    });
  } catch (err) {
    console.error("sendPasswordResetEmail error:", err);
    throw err;
  }
}

module.exports = { sendInvitation, sendPasswordResetEmail };
