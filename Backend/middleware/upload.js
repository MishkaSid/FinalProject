const multer = require('multer');

// keep the uploaded file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
