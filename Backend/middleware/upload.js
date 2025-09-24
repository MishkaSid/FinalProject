// בקובץ זה נמצא middleware להעלאת קבצים למערכת
// הקובץ מגדיר את הגדרות multer להעלאת קבצים לשמירה בזיכרון
// הוא משמש להעלאת קבצים כמו תמונות וקבצי אקסל במערכת
//middleware
// upload.js
const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept .xlsx and .xls
  const okMimes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (okMimes.includes(file.mimetype)) return cb(null, true);
  // Still allow if the browser sends a generic type, but you can tighten this if you want:
  if (file.originalname.endsWith(".xlsx") || file.originalname.endsWith(".xls"))
    return cb(null, true);
  cb(new Error("Only Excel files are allowed (.xlsx, .xls)"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;
