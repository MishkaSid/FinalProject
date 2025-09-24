// בקובץ זה נמצאים נתיבים לניהול משתמשים במערכת
// הקובץ מגדיר endpoints ליצירה, עדכון ומחיקה של משתמשים והעלאת משתמשים מקובץ אקסל
// הוא מספק גישה מלאה לניהול משתמשים עבור המנהלים
// Backend/routes/userRoutes.js
// Routes for user management: create, update, delete, and bulk upload from Excel

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/upload"); // must export a Multer instance

// Add a new user
router.post("/addUser", userController.createUser);

// Bulk upload from Excel
// POST /api/user/upload
// field name: file
router.post("/upload", upload.single("file"), userController.bulkUploadUsers);

// Update a user
router.put("/updateUser/:id", userController.updateUser);

// Delete a user
router.delete("/deleteUser/:id", userController.deleteUser);

module.exports = router;
