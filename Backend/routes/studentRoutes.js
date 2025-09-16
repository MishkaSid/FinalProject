// בקובץ זה נמצאים נתיבים עבור ממשק הסטודנט במערכת
// הקובץ מגדיר endpoints לקורסים, נושאים, תרגול ובחינות עבור סטודנטים
// הוא מספק את כל הפונקציונליות הנדרשת עבור ממשק הסטודנט
//routes
// studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const examResultController = require('../controllers/examResultController');

// Course routes
router.get('/courses', studentController.getAllCourses);
router.get('/courses/:id', studentController.getCourseById);

// Topic routes
router.get('/topics', studentController.getAllTopics);
router.get('/topics/course/:courseId', studentController.getTopicsByCourse);
router.get('/topics/:id', studentController.getTopicById);

// Practice routes
router.get('/practice/topic/:topicId', studentController.getPracticeSessionData);
router.get('/practice/exercises/:topicId', studentController.getPracticeExercisesByTopic);
router.get('/practice/videos/:topicId', studentController.getPracticeVideosByTopic);

// Exam routes
router.get('/exams/history/:studentId', studentController.getStudentExamHistory);
router.get('/exams/:examId/results', studentController.getExamResults);
router.get('/exams/questions/:topicId', studentController.getExamQuestionsByTopic);

// New exam result routes
router.post('/exam/submit', examResultController.submitExamResults);
router.get('/exam/last/:userId', examResultController.getLastExam);
router.get('/exam/test-table', examResultController.testExamTable);
router.post('/exam/migrate-grades', examResultController.migrateExamGrades);
router.get('/metrics/:userId', examResultController.getStudentMetrics);

// Dashboard route - now handled by examResultController
router.get('/dashboard/:studentId', examResultController.getStudentDashboardData);

module.exports = router; 