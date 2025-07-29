const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send a simple invitation email
 * @param {string} to    – recipient’s email
 * @param {string} name  – recipient’s name (optional)
 */
async function sendInvitation(to, name = '') {
  const link = process.env.APP_URL;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Welcome to Our Platform',
    html: `
      <p>Hi ${name || 'there'},</p>
      <p>אנא היכנסו עם אימייל זה כשם משתמש ות.ז כסיסמה<a href="${link}">ברוכים הבאים לאתר שלנו</a></p>
      <p>!בהצלחה</p>
    `
  });
}

module.exports = { sendInvitation };
