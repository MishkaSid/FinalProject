// בקובץ זה נמצא middleware להעלאת קבצים למערכת
// הקובץ מגדיר את הגדרות multer להעלאת קבצים לשמירה בזיכרון
// הוא משמש להעלאת קבצים כמו תמונות וקבצי אקסל במערכת
//middleware
// upload.js
const multer = require('multer');

// keep the uploaded file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
