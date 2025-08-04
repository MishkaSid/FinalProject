const express = require('express');
const router = express.Router();
const examResultController = require('../controllers/examResultController');

// Get student dashboard data (profile + statistics)
router.get('/dashboard/:studentId', examResultController.getStudentDashboardData);

// Get student exam results
router.get('/exam-results/:studentId', examResultController.getStudentExamResults);

// Get student exam statistics
router.get('/exam-stats/:studentId', examResultController.getStudentExamStats);

module.exports = router; 