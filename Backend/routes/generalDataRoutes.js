// בקובץ זה נמצאים נתיבים לקבלת נתונים כלליים ממסד הנתונים
// הקובץ מגדיר endpoints לקבלת משתמשים, מנהלים, מורים ונתוני תרגול
// הוא מספק גישה לנתונים בסיסיים עבור ממשקי הניהול במערכת
//routes
// generalDataRoutes.js
const express = require('express');
const router = express.Router();
const generalDataController = require('../controllers/generalDataController');

// Route for fetching all users
router.get('/users', generalDataController.getUsers);
// Route for fetching all admins
router.get('/admins', generalDataController.getAdmins);
// Route for fetching all teachers
router.get('/teachers', generalDataController.getTeachers);
// Route for fetching all examinees
router.get('/examinees', generalDataController.getExaminees);
// Route for fetching practice data
router.get('/practice', generalDataController.getPracticeData);
// Route for fetching exam data
router.get('/exams', generalDataController.getExamData);
// Route for fetching all videos
router.get('/videos', generalDataController.getVideos);

module.exports = router; 