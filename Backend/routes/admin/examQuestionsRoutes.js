const express = require('express');
const router = express.Router();
const examQuestionsController = require('../../controllers/admin/examQuestionsController');

// Topic-scoped routes (GET only)
router.get('/topics/:topicId/exam-questions', examQuestionsController.listByTopic);

// CRUD routes
router.post('/exam-questions', examQuestionsController.create);
router.put('/exam-questions/:questionId', examQuestionsController.update);
router.delete('/exam-questions/:questionId', examQuestionsController.remove);

module.exports = router;
