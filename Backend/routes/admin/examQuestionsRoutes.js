const express = require("express");
const router = express.Router();
const examQuestionsController = require("../../controllers/admin/examQuestionsController");
const uploadImage = require("../../middleware/uploadImage");

// Topic-scoped routes (GET only)
router.get(
  "/topics/:topicId/exam-questions",
  examQuestionsController.listByTopic
);

// New: create with image upload in one request (multipart/form-data)
router.post(
  "/exam-questions/upload",
  uploadImage.single("image"),
  examQuestionsController.createWithUpload
);

// CRUD routes
router.post("/exam-questions", examQuestionsController.create);
router.put("/exam-questions/:questionId", examQuestionsController.update);
router.delete("/exam-questions/:questionId", examQuestionsController.remove);

module.exports = router;
