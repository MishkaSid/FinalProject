// בקובץ זה נמצאים נתיבים ללוח הבקרה של התרגול
// הקובץ מגדיר endpoints לקבלת נתונים על נושאים, סרטונים ותרגילים
// הוא מספק את הנתונים הנדרשים עבור ממשק התרגול של הסטודנטים
//routes
// practiceDashboardRoutes.js
const express = require('express');
const router = express.Router();
const practiceDashboardController = require('../controllers/practiceDashboardController');

// Get all available topics
router.get('/topics', practiceDashboardController.getAllTopics);

// Get topic information
router.get('/topic/:topicId', practiceDashboardController.getTopicInfo);

// Get practice videos by topic
router.get('/videos/:topicId', practiceDashboardController.getPracticeVideos);

// Get practice exercises by topic
router.get('/exercises/:topicId', practiceDashboardController.getPracticeExercises);

module.exports = router; 