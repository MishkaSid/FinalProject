const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

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
router.post('/exams/submit', studentController.submitExamAnswers);
router.get('/exams/questions/:topicId', studentController.getExamQuestionsByTopic);

// Dashboard route
router.get('/dashboard/:studentId', studentController.getStudentDashboardData);

module.exports = router; 