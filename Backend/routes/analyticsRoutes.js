const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// Student Analytics Endpoints
router.get("/student/:userId/grades", analyticsController.getStudentGrades);
router.get("/student/:userId/topic-accuracy", analyticsController.getStudentTopicAccuracy);
router.get("/student/:userId/exam-counters", analyticsController.getExamCounters);
router.get("/student/:userId/practice-per-day", analyticsController.getPracticePerDay);
router.get("/student/:userId/video-minutes", analyticsController.getVideoMinutes);

// Course/Manager Analytics Endpoints
router.get("/course/:courseId/topic-distribution", analyticsController.getCourseTopicDistribution);
router.get("/course/:courseId/grades-over-time", analyticsController.getCourseGradesOverTime);

module.exports = router;
