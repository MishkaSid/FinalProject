const express = require('express');
const router = express.Router();
const videosController = require('../../controllers/admin/videosController');

// Topic-scoped routes (GET only)
router.get('/topics/:topicId/videos', videosController.listByTopic);

// CRUD routes
router.post('/videos', videosController.create);
router.put('/videos/:videoId', videosController.update);
router.delete('/videos/:videoId', videosController.remove);

module.exports = router;
