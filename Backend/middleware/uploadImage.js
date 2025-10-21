// Backend/middleware/uploadImage.js
// שמירת תמונות מבחן לתיקייה /uploads/exam-questions עם שם קובץ ייחודי ונקי

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// ודא שהנתיב הוא ../uploads/exam-questions ביחס לקובץ זה
const uploadDir = path.join(__dirname, "..", "uploads", "exam-questions");

// יצירת התיקייה אם לא קיימת
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ניקוי והאחדת שם קובץ: מוריד רווחים, מנרמל ל-ASCII בסיסי, מוריד אותיות גדולות


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".jpg").toLowerCase();
    const uniqueId = uuidv4();
    console.log(`${uniqueId}${ext}`)
    cb(null, `${uniqueId}${ext}`);
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
