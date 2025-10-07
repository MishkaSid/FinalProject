// Backend/middleware/uploadImage.js
// שמירת תמונות מבחן לתיקייה /uploads/exam-questions עם שם קובץ ייחודי ונקי

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ודא שהנתיב הוא ../uploads/exam-questions ביחס לקובץ זה
const uploadDir = path.join(__dirname, "..", "uploads", "exam-questions");

// יצירת התיקייה אם לא קיימת
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ניקוי והאחדת שם קובץ: מוריד רווחים, מנרמל ל-ASCII בסיסי, מוריד אותיות גדולות
function sanitizeBaseName(str) {
  return String(str || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w.-]+/g, "") // אותיות, ספרות, קו תחתון, נקודה ומקף
    .toLowerCase();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".jpg").toLowerCase();
    const base =
      sanitizeBaseName(path.basename(file.originalname, ext)) || "math";
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid image type"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // עד 8MB
});

module.exports = upload;
