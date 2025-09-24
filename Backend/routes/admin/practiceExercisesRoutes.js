const express = require('express');
const router = express.Router();
const practiceExercisesController = require('../../controllers/admin/practiceExercisesController');

// Topic-scoped routes (GET only)
router.get('/topics/:topicId/practice-exercises', practiceExercisesController.listByTopic);

// CRUD routes
router.post('/practice-exercises', practiceExercisesController.create);
router.put('/practice-exercises/:exerciseId', practiceExercisesController.update);
router.delete('/practice-exercises/:exerciseId', practiceExercisesController.remove);

module.exports = router;
