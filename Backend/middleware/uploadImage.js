// Backend/middleware/uploadImage.js
// Multer for image uploads to disk

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const destDir = path.join(__dirname, "..", "uploads", "exam-questions");
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, destDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext)
      ? ext
      : ".jpg";
    const unique = `math-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${safeExt}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
    file.mimetype
  );
  cb(ok ? null : new Error("Only image files are allowed"), ok);
};

const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = uploadImage;
