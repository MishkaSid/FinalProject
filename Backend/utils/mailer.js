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

module.exports = { sendInvitation };
