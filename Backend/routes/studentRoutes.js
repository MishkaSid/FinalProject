// Backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const examResultController = require("../controllers/examResultController");
const { authenticateToken } = require("../middleware/auth");

// ציבורי לפי הצורך
router.get("/courses", authenticateToken, studentController.getAllCourses);
router.get("/courses/:id", authenticateToken, studentController.getCourseById);
router.get("/topics", authenticateToken, studentController.getAllTopics);
router.get("/topics/course/:courseId", authenticateToken, studentController.getTopicsByCourse);
router.get("/topics/:id", authenticateToken, studentController.getTopicById);

// Practice עם אימות
router.get(
  "/practice/topic/:topicId",
  authenticateToken,
  studentController.getPracticeSessionData
);
router.get(
  "/practice/exercises/:topicId",
  authenticateToken,
  studentController.getPracticeExercisesByTopic
);
router.get(
  "/practice/videos/:topicId",
  authenticateToken,
  studentController.getPracticeVideosByTopic
);

// Exams
router.get(
  "/exams/history/:studentId",
  authenticateToken,
  studentController.getStudentExamHistory
);
router.get(
  "/exams/:examId/results",
  authenticateToken,
  studentController.getExamResults
);
router.get(
  "/exams/questions/:topicId",
  authenticateToken,
  studentController.getExamQuestionsByTopic
);

// Submit מבחן
router.post(
  "/exam/submit",
  authenticateToken,
  examResultController.submitExamResults
);

// Student dashboard - provides profile statistics (last exam, average, total exams)
router.get(
  "/dashboard/:studentId",
  authenticateToken,
  examResultController.getStudentDashboardData
);

module.exports = router;
