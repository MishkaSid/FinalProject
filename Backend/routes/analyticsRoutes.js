// Backend/routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analyticsController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// ספירת כניסות לפי טווח
router.get(
  "/visits/count",
  authenticateToken,
  analyticsController.getSiteVisitsCount
);

// שאר נתיבי האנליטיקה הקיימים אצלך
router.get(
  "/course/:courseId/grades-over-time",
  authenticateToken,
  analyticsController.getCourseGradesOverTime
);
router.get(
  "/student/:userId/grades",
  authenticateToken,
  analyticsController.getStudentGrades
);
router.get(
  "/student/:userId/topic-accuracy",
  authenticateToken,
  analyticsController.getStudentTopicAccuracy
);
router.get(
  "/student/:userId/exam-counters",
  authenticateToken,
  analyticsController.getExamCounters
);
router.get(
  "/student/:userId/practice-per-day",
  authenticateToken,
  analyticsController.getPracticePerDay
);
router.get(
  "/student/:userId/video-minutes",
  authenticateToken,
  analyticsController.getVideoMinutes
);
router.get(
  "/course/:courseId/topic-distribution",
  authenticateToken,
  analyticsController.getCourseTopicDistribution
);
router.get(
  "/student/:userId/avg-last",
  authenticateToken,
  analyticsController.getStudentAvgLastExams
);

router.get(
  "/report/students",
  authenticateToken,
  analyticsController.getStudentsReport
);

router.get(
  "/course/:courseId/topic-failures",
  authenticateToken,
  analyticsController.getTopicFailureRates
);

router.get(
  "/visits/stats",
  authenticateToken,
  analyticsController.getSiteVisitStats
);

router.get(
  "/grade-distribution",
  authenticateToken,
  analyticsController.getGradeDistribution
);

module.exports = router;
